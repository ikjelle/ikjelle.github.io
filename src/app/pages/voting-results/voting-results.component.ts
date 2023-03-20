import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ControversialComponent } from './controversial/controversial.component';
import { IParty, Party } from './party';
import { Result } from './result';
import { resultTypes } from './result-types';
import { ResultService } from './result.service';

@Component({
  selector: 'app-voting-results',
  templateUrl: './voting-results.component.html',
  styleUrls: ['./voting-results.component.css']
})
export class VotingResultsComponent implements OnInit {

  @ViewChild(ControversialComponent) child!: ControversialComponent;
  @ViewChild('disclaimerButton') disclaimerButton!: ElementRef;

  pages: Page[] = []
  parties: Party[] = []

  filter: any = null
  lastLoadedPage: number = 0
  searchterms: string[] = []
  highLighted: string[] = [];
  spinner: boolean = true;
  firstLoad: boolean = false;
  resultTypes = resultTypes
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
    this.filterResults()
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
    this.http.get("https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0/Fractie?$filter=DatumInactief%20eq%20null%20and%20Afkorting%20ne%20null").
      subscribe((response: any) => {
        this.firstLoad = true
        const parties = <IParty>response['value']
          .forEach((p: any) => {
            let party = new Party(p.NaamNL, p.Afkorting, p.DatumActief)
            // Some parties use their full name
            switch (party.abbreviation) {
              case "GL":
              case "CU":
                party.searchTerm = party.name
                break
              case "Gündoğan": // inconsistency in the data
                party.searchTerm = "Gündogan"
                break
            }
            // this.searchterms.push(party.searchTerm)
            this.parties.push(party)
          });
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

    url = this.resultsService.getUrl(p1, p2, this.resultTypes)
    this.pages = [];

    this.highLighted = []
    for (const p of [...p1, ...p2]) {
      this.highLighted.push(p.searchTerm)
    }
    this.getResultsFromUrl(url)
    // TODO: maybe apply filters of the API on the returned results as I can't do all of them on the API
    // atleast not in 1 query
  }

  getNextPage() {
    if (this.nextPageUrl) {
      this.startSpinner()
      this.getResultsFromUrl(this.nextPageUrl)
    }
  }

  getResultsFromUrl(url: string) {
    this.nextPageUrl = null
    return this.http.get(url).subscribe((r: any) => {
      let page = new Page()
      page.results = r["value"]
      this.filterCount = r["@odata.count"]
      this.pages.push(page)
      if ("@odata.nextLink" in r) {
        this.nextPageUrl = r["@odata.nextLink"]
      }
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