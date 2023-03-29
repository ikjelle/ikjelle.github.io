import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { ControversialComponent } from 'src/app/components/controversial/controversial.component';
import { Party, Result } from 'src/app/services/OData/models/models';
import { ODataResponse } from 'src/app/services/OData/models/response';
import { resultTypes } from 'src/app/services/OData/models/result-types';
import { ResultService } from 'src/app/services/result.service';
import { SearchParty } from './search-party';

@Component({
  selector: 'app-voting-results',
  templateUrl: './voting-results.component.html',
  styleUrls: ['./voting-results.component.css']
})
export class VotingResultsComponent implements OnInit {

  @ViewChild(ControversialComponent) child!: ControversialComponent;
  @ViewChild('disclaimerButton') disclaimerButton!: ElementRef;
  @ViewChildren('result', { read: ElementRef }) resultComponents: any;

  pages: Page[] = []
  parties: SearchParty[] = []

  filter: any = null
  lastLoadedPage: number = 0
  searchterms: string[] = []
  highLighted: string[] = [];
  spinner: boolean = true;
  firstLoad: boolean = false;
  resultTypes = resultTypes.filter(rt => rt.enabled)
  nextPageUrl: string | null = null;
  filterCount: number | null = null;

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
    this.http.get<ODataResponse<Party>>(this.resultsService.getUrlOfParties()).
      subscribe((response) => {
        this.firstLoad = true
        const parties = response.value
          .forEach((p: any) => {
            let party = new SearchParty(p.NaamNL, p.Afkorting, p.DatumActief)
            this.parties.push(party)
          });
        this.child.box1.push(...this.child.parties.splice(Math.floor(Math.random() * this.child.parties.length), 1))
        this.child.box2.push(...this.child.parties.splice(Math.floor(Math.random() * this.child.parties.length), 1))

        this.filterResults()
      })
  }

  getResults(results: Result[]) {
    return results
    // Hoofdelijke Stemmingen zullen alleen werken zonder dat er partijen zijn ingevoerd
  }

  filterResults() {
    this.filterCount = null
    this.startSpinner()
    let p1 = this.child.box1
    let p2 = this.child.box2
    let url = ""

    url = this.resultsService.getUrlOfResultsByGroupedParties(p1, p2, this.resultTypes)
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
    return this.http.get<ODataResponse<Result>>(url).subscribe((response) => {
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

  // TODO: Add pagination, but don't think its interesting enough
  // nextPage() {
  //   // create filter for next results
  //   this.lastLoadedPage += 1
  // }
}

class Page {
  results: Result[] = []
}