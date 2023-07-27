import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Decision } from 'src/app/services/OData/models/models';
import { ODataResponse } from 'src/app/services/OData/models/response';
import { AndFilter } from 'src/app/services/OData/query-generator/filters';
import { ResultService } from 'src/app/services/result.service';

@Component({
  selector: 'app-single-result',
  templateUrl: './single-result.component.html',
  styleUrls: ['./single-result.component.css']
})
export class SingleResultComponent implements OnInit {

  constructor(private http: HttpClient, private route: ActivatedRoute, private resultsService: ResultService,) { }

  caseResult?: Decision;
  highLighted?: string[];

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.highLighted = params.getAll('highlighted');
    });
    this.route.params.subscribe({
      next: params => {
        let id = params['id'];
        let table = this.resultsService.getTableOfDecisions(true)
        table.filter = new AndFilter([
          table.filter!,
          this.resultsService.getDecisionByGuid(id).filter!
        ])
        let url = table.generateUrl()
        return this.http.get<ODataResponse<Decision>>(url).subscribe((r) => {
          let results = r.value
          this.caseResult = results[0]
        })
      },
      error: err => { }
    });
  }

}
