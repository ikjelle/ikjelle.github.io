import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { ControversialComponent } from 'src/app/components/controversial/controversial.component';
import { CaseSubject, Party, Decision } from 'src/app/services/OData/models/models';
import { ODataResponse } from 'src/app/services/OData/models/response';
import { resultTypes } from 'src/app/services/OData/models/result-types';
import { ResultService } from 'src/app/services/result.service';
import { SearchParty } from './search-party';
import { AndFilter, Filter } from 'src/app/services/OData/query-generator/filters';

@Component({
  selector: 'app-voting-results',
  templateUrl: './voting-results.component.html',
  styleUrls: ['./voting-results.component.css']
})
export class VotingResultsComponent implements OnInit {

  @ViewChild(ControversialComponent) child!: ControversialComponent;
  @ViewChild('disclaimerButton') disclaimerButton!: ElementRef;
  @ViewChildren('result', { read: ElementRef }) resultComponents: any;

  extendedFiltersEnabled = true;
  pages: Page[] = []
  parties: SearchParty[] = []
  periodStart?: string = new Date(2021, 2, 32).toISOString().slice(0, 10);
  periodEnd?: string = undefined

  textSearch = "";

  filter: any = null
  lastLoadedPage: number = 0
  searchterms: string[] = []
  highLighted: string[] = [];
  spinner: boolean = false;
  resultTypes = resultTypes.filter(rt => rt.enabled)
  nextPageUrl: string | null = null;
  filterCount: number | null = null;
  subjects: CaseSubject[] = [];
  firstTimeLoaded = false;

  constructor(private resultsService: ResultService, private http: HttpClient) {
  }

  ngOnInit(): void {
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
      subscribe((response) => {
        let tempParties: SearchParty[] = [];
        const parties = response.value
          .forEach((p: Party) => {
            let party = new SearchParty(p.Id, p.NaamNL, p.Afkorting, p.DatumActief, p.DatumInactief)
            party.og = p
            if (p["Stemming@odata.count"] > 0)
              tempParties.push(party)
          });
        let allParties = [...this.parties, ...this.child.box1, ...this.child.box2]
        // Only change the parties that are new or removed. as otherways filters get cleaned
        let newParties = tempParties.filter((p) => !allParties.some(tp => tp.name == p.name))
        let removedParties = allParties.filter((p) => tempParties.every(tp => tp.name != p.name))
        for (let p of removedParties) {
          const partyIndex = this.parties.indexOf(p);
          if (partyIndex !== -1) {
            this.parties.splice(partyIndex, 1);
          }
        }
        this.parties.push(...newParties);
        this.firstTimeLoaded = true;
      })
  }

  getResults(results: Decision[]) {
    return results
    // Hoofdelijke Stemmingen zullen alleen werken zonder dat er partijen zijn ingevoerd
  }

  filterResults() {
    this.filterCount = null
    this.startSpinner()
    let p1 = this.child.box1
    let p1Ids = p1.map(p => p.id)
    let p2 = this.child.box2
    let p2Ids = p2.map(p => p.id)
    let url = ""

    let tableBetween = this.resultsService.getDecisionsBetweenDatesAndParties(this.periodStart, this.periodEnd, [...p1.map(p => p.og), ...p2.map(p => p.og)])
    let tableCaseTypes = this.resultsService.getDecisionsByCaseType(this.resultTypes)
    let tableTextSearch = this.resultsService.getDecisionsContainingText(this.textSearch)
    let tableGroupSearch = null
    if (p1.length == 0 && p2.length == 0) {

    } else if (p1.length > 0 && p2.length > 0) { // vs
      tableGroupSearch = this.resultsService.getDecisionsByDifferentVote(p1Ids, p2Ids)
    } else if (p2.length == 0) { // together
      tableGroupSearch = this.resultsService.getDecisionsByTogetherness(p1Ids)
    } else if (p1.length == 0) { // alone
      tableGroupSearch = this.resultsService.getDecisionsByOpposingAll(p2Ids)
    }

    let table = tableBetween
    let filters: Filter[] = []
    for (let f of [tableBetween.filter, tableCaseTypes.filter, tableTextSearch.filter, tableGroupSearch?.filter]) {
      if (f != null) {
        filters.push(f)
      }
    }

    table.filter = new AndFilter(filters)

    url = table.generateUrl();
    this.pages = [];

    this.highLighted = []
    for (const p of [...p1, ...p2]) {
      this.highLighted.push(p.searchTerm)
    }
    this.getResultsFromUrl(url).add(
      () => setTimeout(() => {
        // need to wait before the native element is created in the page
        // this.resultComponents.first.nativeElement.scrollIntoView({ behavior: "auto", block: "end" })
      }, 1000
      )
    )
  }

  getNextPage() {
    if (this.nextPageUrl) {
      this.startSpinner()
      this.getResultsFromUrl(this.nextPageUrl)
    }
  }

  getResultsFromUrl(url: string) {
    this.nextPageUrl = null
    // TODO: catch CORS
    return this.http.get<ODataResponse<Decision>>(url).subscribe((response) => {
      let page = new Page()
      page.results = response.value
      this.filterCount = response["@odata.count"]
      this.pages.push(page)
      this.nextPageUrl = response["@odata.nextLink"]
      this.stopSpinner()
    })
  }

  startSpinner() {
    this.spinner = true;
  }
  stopSpinner() {
    this.spinner = false;
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
}

class Page {
  results: Decision[] = []
}