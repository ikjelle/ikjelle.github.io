import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { ControversialComponent } from 'src/app/components/controversial/controversial.component';
import { Party, Decision } from 'src/app/services/OData/models/models';
import { ODataResponse } from 'src/app/services/OData/models/response';
import { ResultService } from 'src/app/services/result.service';

import { AndFilter, Filter } from 'src/app/services/OData/query-generator/filters';
import { CaseTypePickerComponent } from 'src/app/components/case-type-picker/case-type-picker.component';

@Component({
  selector: 'app-voting-results',
  templateUrl: './voting-results.component.html',
  styleUrls: ['./voting-results.component.css']
})
export class VotingResultsComponent implements OnInit {
  @ViewChild(ControversialComponent) child!: ControversialComponent;
  @ViewChild('disclaimerButton') disclaimerButton!: ElementRef;
  @ViewChildren('result', { read: ElementRef }) resultComponents: any;
  @ViewChild(CaseTypePickerComponent) caseTypePickerComp!: CaseTypePickerComponent

  extendedFiltersEnabled = true;

  parties: Party[] = []

  periodStart?: string = new Date(2021, 2, 32).toISOString().slice(0, 10);
  periodEnd?: string = undefined

  textSearch = "";


  lastLoadedPage: number = 0

  highLighted: string[] = [];

  loading: boolean = false;
  firstTimeLoaded = false;

  constructor(private resultsService: ResultService, private http: HttpClient) {
  }

  ngOnInit(): void {
    this.resetData()
    this.getParties()
  }

  ngAfterViewInit() {
    let disclaimerStatus = sessionStorage.getItem("disclaimer-open")
    if (disclaimerStatus == "closed") {
      // closeDisclaimer
      this.disclaimerButton.nativeElement.click()
    }
  }

  periodStartDateChange(event: any) {
    this.periodStart = event.target.value;
    this.getParties();
  }
  periodEndDateChange(event: any) {
    this.periodStart = event.target.value;
    this.getParties();
  }
  updateDate() {
    this.getParties();
  }

  searchInputChange(event: any) {
    this.textSearch = event.target.value;
  }

  disclaimerButtonToggle() {
    let ariaExpanded = this.disclaimerButton.nativeElement.getAttribute('aria-expanded')
    if (ariaExpanded == "true") {
      sessionStorage.setItem("disclaimer-open", 'opened')
    } else {
      sessionStorage.setItem("disclaimer-open", 'closed')
    }
  }

  getParties() {
    // TODO: catch CORS
    this.http.get<ODataResponse<Party>>(this.resultsService.getParties(this.periodStart, this.periodEnd).generateUrl()).
      subscribe({
        next: (response) => {
          let tempParties = response.value;
          let allParties = [...this.parties, ...this.child.box1, ...this.child.box2]
          // Only change the parties that are new or removed. as otherways filters get cleaned
          let newParties = tempParties.filter((p) => !allParties.some(tp => tp.Afkorting == p.Afkorting))
          let removedParties = allParties.filter((p) => tempParties.every(tp => tp.Afkorting != p.Afkorting))
          for (let p of removedParties) {
            const partyIndex = this.parties.indexOf(p);
            if (partyIndex !== -1) {
              this.parties.splice(partyIndex, 1);
            }
          }
          this.parties.push(...newParties);
          this.firstTimeLoaded = true;
        },
        error: err => {
        }
      })
  }

  getResults(results: Decision[]) {
    return results
    // Hoofdelijke Stemmingen zullen alleen werken zonder dat er partijen zijn ingevoerd
  }

  filterResults() {
    this.resetData()

    let p1 = this.child.box1
    let p2 = this.child.box2
    let url = ""
    let table = this.resultsService.getTableOfDecisions(true)
    let tableBetween = this.resultsService.getDecisionsBetweenDatesAndParties(this.periodStart, this.periodEnd, [...p1, ...p2])
    let tableCaseTypes = this.resultsService.getDecisionsByCaseType(this.caseTypePickerComp.caseTypes)
    let tableTextSearch = this.resultsService.getDecisionsContainingText(this.textSearch)
    let tableGroupSearch = null

    if (p1.length == 0 && p2.length == 0) {
      // do request without group logic
    } else if (p1.length > 0 && p2.length > 0) { // vs
      tableGroupSearch = this.resultsService.getDecisionsByDifferentVote(p1, p2)
    } else if (p2.length == 0) { // together
      tableGroupSearch = this.resultsService.getDecisionsByTogetherness(p1)
    } else if (p1.length == 0) { // alone
      tableGroupSearch = this.resultsService.getDecisionsByOpposingAll(p2)
    }

    let filters: Filter[] = []
    for (let f of [table.filter, tableBetween.filter, tableCaseTypes.filter, tableTextSearch.filter, tableGroupSearch?.filter]) {
      if (f != null) {
        filters.push(f)
      }
    }

    table.filter = new AndFilter(filters)

    url = table.generateUrl();


    this.highLighted = []
    for (const p of [...p1, ...p2]) {
      this.highLighted.push(p.Afkorting)
    }
    this.currentUrl = url
    this.getDecisionsByIndex(1)
  }


  getResultsOfActivePage(): any {
    let index = this.currentIndex
    if (index in this.data) {
      return this.data[index]
    } else {
      this.getDecisionsByIndex(index)
      return []
    }
  }

  resetData() {
    this.data = {}
    this.currentIndex = 1
    this.currentUrl = ""
    this.decisionAmount = undefined
  }

  currentUrl!: string;
  currentIndex = 1
  data: { [index: number]: Decision[] } = {}
  decisionAmount?: number;

  getIndexes() {
    if (this.decisionAmount == 0) return []
    return Array.from({ length: (Math.ceil(this.decisionAmount! / 250)) }, (_, i) => i + 1)
  }

  getDecisionsByIndex(index: number) {
    this.currentIndex = index
    if (index in this.data) {
      return;
    } else {
      this.data[index] = []
      this.startLoading(index)
    }
    // TODO: catch CORS
    let url = this.currentUrl;
    if (index > 1) {
      url += "&$skip=" + (250 * (index - 1))
    }
    return this.http.get<ODataResponse<Decision>>(url).subscribe({
      next: (response) => {
        this.decisionAmount = response["@odata.count"]!
        this.data[index] = response.value
        this.endLoading(index)
      },
      error: err => { }
    })
  }

  lastLoadingIndex = 1
  startLoading(index: number) {
    this.lastLoadingIndex = index;
    this.loading = true;
  }
  endLoading(index: number) {
    if (index == this.lastLoadingIndex) this.loading = false;
  }
}
