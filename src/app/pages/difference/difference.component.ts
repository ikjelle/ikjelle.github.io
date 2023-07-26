import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CaseTypePickerComponent } from 'src/app/components/case-type-picker/case-type-picker.component';
import { CaseSubject, Decision, Party } from 'src/app/services/OData/models/models';
import { ODataResponse } from 'src/app/services/OData/models/response';
import { CaseTypeCheckBox, AllCaseTypes } from 'src/app/services/OData/models/result-types';
import { AndFilter, Filter } from 'src/app/services/OData/query-generator/filters';
import { ResultService } from 'src/app/services/result.service';

@Component({
  selector: 'app-difference',
  templateUrl: './difference.component.html',
  styleUrls: ['./difference.component.css']
})
export class DifferenceComponent implements OnInit {
  getSubjectTitle(decisionSubject: { caseSubject: CaseSubject, decisions: Decision[] }): string {
    return decisionSubject.caseSubject.Titel + " (" + decisionSubject.decisions.length + ")<br>" +
      "Aantal Voor stemmen: " + this.getPartyName(this.usedPartyAId) + " " +
      this.getNumberOfSided(true, this.usedPartyAId, decisionSubject.decisions) + " " +
      "-" +
      this.getNumberOfSided(false, this.usedPartyAId, decisionSubject.decisions) + " " +
      this.getPartyName(this.usedPartyBId)

  }
  polling: boolean = false;
  @ViewChild(CaseTypePickerComponent) caseTypePickerComp!: CaseTypePickerComponent
  usedPartyAId: string | undefined;
  usedPartyBId: string | undefined;
  getNumberOfSided(pro: boolean, partyId: string | undefined, decisions: Decision[]) {
    return decisions.filter(d =>
      d.Stemming.find(p =>
        p.Fractie_Id == partyId)?.Soort == (pro ? "Voor" : "Tegen")
    ).length
  }
  getPartyName(partyId: string | undefined) {
    return this.parties.find(p => p.Id == partyId)?.NaamNL;
  }
  getHighLighted(): string[] {
    return this.parties.filter(p => p.Id == this.usedPartyAId || p.Id == this.usedPartyBId).map(p => p.Afkorting)
  }
  getTitle(d: Decision): string {
    return d.Zaak[0].Onderwerp + ':<br>' +
      d.Stemming.find(p => p.Fractie_Id == this.usedPartyAId)?.ActorFractie + "(" +
      d.Stemming.find(p => p.Fractie_Id == this.usedPartyAId)?.Soort + (d.Stemming.find(p => p.Fractie_Id == this.usedPartyAId)?.Vergissing ? '*' : '') + ") - " +
      d.Stemming.find(p => p.Fractie_Id == this.usedPartyBId)?.ActorFractie + "(" +
      d.Stemming.find(p => p.Fractie_Id == this.usedPartyBId)?.Soort + (d.Stemming.find(p => p.Fractie_Id == this.usedPartyBId)?.Vergissing ? '*' : '') + ")";
  }
  periodStart?: string = new Date(2021, 2, 32).toISOString().slice(0, 10);
  periodEnd?: string = undefined;
  parties: Party[] = [];
  partyAId?: string;
  partyBId?: string;
  totalCount?: number
  retrievedCount: number = 0
  totalCasesNoDifference?: number = 0

  constructor(private resultsService: ResultService, private http: HttpClient) { }

  ngOnInit(): void {
    this.updateAvailableParties()
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

  getDifferences() {
    this.data = {}
    this.retrievedCount = 0
    this.totalCasesNoDifference = undefined
    this.totalCount = undefined
    this.usedPartyAId = this.partyAId;
    this.usedPartyBId = this.partyBId;

    let f1 = this.resultsService.getDecisionsByDifferentVote([this.partyAId!], [this.partyBId!]).filter
    let f2 = this.resultsService.getDecisionsBetweenDatesAndParties(this.periodStart, this.periodEnd, this.parties.filter(p => p.Id == this.partyAId || p.Id == this.partyBId)).filter
    let f3 = this.resultsService.getDecisionsByCaseType(this.caseTypePickerComp.caseTypes).filter;

    let table = this.resultsService.getTableOfDecisionsWithSubjectNumber();
    let filters: Filter[] = []
    for (let f of [f1, f2, f3]) {
      if (f != null) {
        filters.push(f)
      }
    }
    table.filter = new AndFilter(filters)
    let url = table.generateUrl()

    let filtersC: Filter[] = []
    for (let f of [f2, f3]) {
      if (f != null) {
        filtersC.push(f)
      }
    }
    table.filter = new AndFilter(filtersC)
    table.expansions = []
    table.select = ["Id"]
    let urlC = table.generateUrl()
    this.http.get<ODataResponse<Decision>>(urlC).subscribe((response) => {
      this.totalCasesNoDifference = response["@odata.count"]!
    })

    let getCases = (url: string) => {
      return this.http.get<ODataResponse<Decision>>(url).subscribe((response) => {
        let nextLink = response["@odata.nextLink"]
        this.totalCount = response["@odata.count"]!
        this.retrievedCount += response.value.length
        if (nextLink) getCases(nextLink);
        else this.polling = false
        this.setResults(response.value);
      })
    }
    this.polling = true;
    getCases(url)
  }
  data: { [id: number]: { caseSubject: CaseSubject, decisions: Decision[] } } = {}
  setResults(decisions: Decision[]) {
    for (let d of decisions) {
      let id = d.Zaak[0].Kamerstukdossier[0].Nummer
      if (!(id in this.data)) {
        this.data[id] = { caseSubject: d.Zaak[0].Kamerstukdossier[0], decisions: [] }
      }
      this.data[id].decisions.push(d)
    }
  }
}
