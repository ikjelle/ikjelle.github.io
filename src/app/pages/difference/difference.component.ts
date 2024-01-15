import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CaseTypePickerComponent } from 'src/app/components/case-type-picker/case-type-picker.component';
import { PeriodPickerComponent } from 'src/app/components/period-picker/period-picker.component';
import { CaseSubject, Decision, Party } from 'src/app/services/OData/models/models';
import { ODataResponse } from 'src/app/services/OData/models/response';
import { AndFilter, Filter } from 'src/app/services/OData/query-generator/filters';
import { ResultService } from 'src/app/services/result.service';

@Component({
  selector: 'app-difference',
  templateUrl: './difference.component.html',
  styleUrls: ['./difference.component.css']
})
export class DifferenceComponent implements OnDestroy {

  sub?: Subscription;
  @ViewChild(CaseTypePickerComponent) caseTypePickerComp!: CaseTypePickerComponent

  @ViewChild(PeriodPickerComponent) periodPickerComp!: PeriodPickerComponent;

  get periodStart(): string | undefined {
    return this.periodPickerComp.start;
  }
  get periodEnd(): string | undefined {
    return this.periodPickerComp.end;
  }
  parties: Party[] = [];
  partyAId?: string;
  partyBId?: string;

  usedPartyAId: string | undefined;
  usedPartyBId: string | undefined;

  polling: boolean = false;


  totalCount?: number
  retrievedCount: number = 0
  totalCasesNoDifference?: number = 0

  data: { [id: number]: { caseSubject: CaseSubject, decisions: Decision[] } } = {}

  constructor(private resultsService: ResultService, private http: HttpClient) { }

  ngAfterViewInit(): void {
    this.updateAvailableParties()
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
  setA(event: any) {
    this.partyAId = event.target.value
  }

  getDisabledB(): string[] {
    if (!this.partyAId) return [];
    let partyA = this.parties.find(p => p.Id == this.partyAId)!;
    return [this.partyAId, ...this.parties.filter(p => {
      // if party was not active while party a was. return true
      if (p.DatumActief > partyA.DatumActief) {
        if (partyA.DatumInactief != null && p.DatumActief >= partyA.DatumInactief) {
          return true;
        }
      }
      if (p.DatumInactief != null && p.DatumInactief <= partyA.DatumActief) {
        return true;
      }
      return false;
    }
    ).map(p => p.Id)];
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

    let f1 = this.resultsService.getDecisionsByDifferentVote([this.parties.find(p => p.Id == this.partyAId!)!], [this.parties.find(p => p.Id == this.partyBId!)!]).filter
    let f2 = this.resultsService.getDecisionsBetweenDatesAndParties(this.periodStart, this.periodEnd, this.parties.filter(p => p.Id == this.partyAId || p.Id == this.partyBId)).filter
    let f3 = this.resultsService.getDecisionsByCaseType(this.caseTypePickerComp.caseTypes).filter;

    let table = this.resultsService.getTableOfDecisionsWithSubjectNumber();
    let filters: Filter[] = []
    for (let f of [table.filter, f1, f2, f3]) {
      if (f != null) {
        filters.push(f)
      }
    }
    table.filter = new AndFilter(filters)
    let url = table.generateUrl()

    table = this.resultsService.getTableOfDecisionsWithSubjectNumber();
    let filtersC: Filter[] = []
    for (let f of [table.filter, f2, f3]) {
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

    if (this.sub) this.sub.unsubscribe()
    let getCases = (url: string) => {
      this.sub = this.http.get<ODataResponse<Decision>>(url).subscribe((response) => {
        let nextLink = response["@odata.nextLink"]
        this.totalCount = response["@odata.count"]!
        this.retrievedCount += response.value.length
        if (nextLink) getCases(nextLink);
        else this.polling = false
        this.setResults(response.value);
      })
      return this.sub;
    }
    this.polling = true;
    getCases(url)
  }

  setResults(decisions: Decision[]) {
    for (let d of decisions) {
      let id = d.Zaak[0].Kamerstukdossier[0].Nummer
      if (!(id in this.data)) {
        this.data[id] = { caseSubject: d.Zaak[0].Kamerstukdossier[0], decisions: [] }
      }
      this.data[id].decisions.push(d)
    }
  }

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
    return d.Stemming.find(p => p.Fractie_Id == this.usedPartyAId)?.ActorFractie + "(" +
      d.Stemming.find(p => p.Fractie_Id == this.usedPartyAId)?.Soort + (d.Stemming.find(p => p.Fractie_Id == this.usedPartyAId)?.Vergissing ? '*' : '') + ") - " +
      d.Stemming.find(p => p.Fractie_Id == this.usedPartyBId)?.ActorFractie + "(" +
      d.Stemming.find(p => p.Fractie_Id == this.usedPartyBId)?.Soort + (d.Stemming.find(p => p.Fractie_Id == this.usedPartyBId)?.Vergissing ? '*' : '') + ")";
  }
}
