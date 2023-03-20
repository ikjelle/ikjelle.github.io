import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Result } from 'src/app/services/classes/result';
import { ResultService } from 'src/app/services/result.service';

@Component({
  selector: 'app-single-result',
  templateUrl: './single-result.component.html',
  styleUrls: ['./single-result.component.css']
})
export class SingleResultComponent implements OnInit {

  constructor(private http: HttpClient, private route: ActivatedRoute, private resultsService: ResultService,) { }

  caseResult?: Result;
  highLighted?: string[];

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.highLighted = params.getAll('highlighted');
    });
    this.route.params.subscribe(params => {
      let id = params['id'];
      let url = this.resultsService.getResultById(id)
      return this.http.get(url).subscribe((r: any) => {
        let results: Result[] = r["value"]
        this.caseResult = results[0]
      })
    });
  }

}
