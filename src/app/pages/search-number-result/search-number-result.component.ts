import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Case, Decision } from 'src/app/services/OData/models/models';
import { ODataResponse } from 'src/app/services/OData/models/response';
import { Table } from 'src/app/services/OData/query-generator/Table';
import { ResultService } from 'src/app/services/result.service';

@Component({
  selector: 'app-search-number-result',
  templateUrl: './search-number-result.component.html',
  styleUrls: ['./search-number-result.component.css']
})
export class SearchNumberResultComponent implements OnInit {
  result?: Decision;
  number = "";
  constructor(private resultService: ResultService, private http: HttpClient) { }

  ngOnInit(): void {
  }

  searchResult() {
    let parts = this.number.split("-");
    let url: string = "";
    this.result = undefined;
    let number = "";

    if (parts.length == 1) {
      // number = parts[0]
      number = parts[0]
      this.getResultByNumber(number)
    } else {
      let table: Table;
      if (parts.length == 2) {
        // subject_number, follownumber
        table = this.resultService.getCaseBySubject(parts[0] as unknown as number, parts[1] as unknown as number)
      } else if (parts.length == 3) {
        // subject_number, addition, follownumber
        table = this.resultService.getCaseBySubject(parts[0] as unknown as number, parts[2] as unknown as number, parts[1])
      }
      url = table!.generateUrl()
      this.http.get<ODataResponse<Case>>(url).subscribe((response) => {
        number = response.value[0].Nummer
        this.getResultByNumber(number)
      })
    }

  }
  getResultByNumber(number: string) {
    let url = this.resultService.getDecisionByNumber(number).generateUrl()
    this.result = undefined;
    this.http.get<ODataResponse<Decision>>(url).subscribe((response) => {
      let data = response.value;
      this.result = data[0]
    })
  }

  numberInputChanged(event: any) {
    this.number = event.target.value
  }
}
