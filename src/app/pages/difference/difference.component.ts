import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Party } from 'src/app/services/OData/models/models';
import { ODataResponse } from 'src/app/services/OData/models/response';
import { resultTypes } from 'src/app/services/OData/models/result-types';
import { AndFilter, Filter } from 'src/app/services/OData/query-generator/filters';
import { ResultService } from 'src/app/services/result.service';

@Component({
  selector: 'app-difference',
  templateUrl: './difference.component.html',
  styleUrls: ['./difference.component.css']
})
export class DifferenceComponent implements OnInit {
  periodStart?: string = new Date(2021, 2, 32).toISOString().slice(0, 10);
  periodEnd?: string = undefined;
  parties: Party[] = [];

  partyAId?: string;
  partyBId?: string;
  resultTypes = resultTypes.filter(rt => rt.enabled)

  constructor(private resultsService: ResultService, private http: HttpClient) { }

  ngOnInit(): void {
  }

  setA(event: any) {
    this.partyAId = event.target.value
  }
  setB(event: any) {
    this.partyBId = event.target.value
  }

  updateAvailableParties() {
    let url = this.resultsService.getParties(this.periodStart, this.periodEnd).generateUrl()

    // TODO: catch CORS
    this.http.get<ODataResponse<Party>>(url).
      subscribe((response) => {
        this.parties = response.value;
      })
  }

  checkAllTypes(event: any) {
    if (event.target.checked) {
      for (const resultType of this.resultTypes) {
        resultType.checked = true
      }
    } else {
      for (const resultType of this.resultTypes) {
        resultType.checked = false
      }
    }
  }

  allTypesChecked() {
    for (const resultType of this.resultTypes) {
      if (!resultType.checked) {
        return false;
      }
    }
    return true
  }

  changeTypeChecked(type: any) {
    type.checked = !type.checked
  }

  getDifferences() {
    let table = this.resultsService.getDecisionsByDifferentVote([this.partyAId!], [this.partyBId!])
    let f2 = this.resultsService.getDecisionsBetweenDatesAndParties(this.periodStart, this.periodEnd, this.parties.filter(p => p.Id == this.partyAId || p.Id == this.partyBId)).filter
    let f3 = this.resultsService.getDecisionsByCaseType(this.resultTypes).filter;

    let filters: Filter[] = []

    for (let f of [table.filter, f2, f3]) {
      if (f != null) {
        filters.push(f)
      }
    }
    table.filter = new AndFilter(filters)
    let url = table.generateUrl()
    console.log(url)
  }
}
