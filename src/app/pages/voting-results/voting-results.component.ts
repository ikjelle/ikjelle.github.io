import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ControversialComponent } from './controversial/controversial.component';
import { Result } from './result';
import { ResultService } from './result.service';

@Component({
  selector: 'app-voting-results',
  templateUrl: './voting-results.component.html',
  styleUrls: ['./voting-results.component.css']
})
export class VotingResultsComponent implements OnInit {

  @ViewChild(ControversialComponent) child!: ControversialComponent;
  pages: Page[] = []
  parties: Party[] = []

  filter: any = null
  lastLoadedPage: number = 0
  searchterms: string[] = []
  highLighted: string[] = [];
  spinner: boolean = false;
  firstLoad: boolean = false;

  constructor(private resultsService: ResultService, private http: HttpClient) { }

  ngOnInit(): void {
    this.getParties()
  }
  ngAfterViewInit() {
    this.filterResults()
  }
  getParties() {
    this.http.get("https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0/Fractie?$filter=DatumInactief%20eq%20null%20and%20Afkorting%20ne%20null").
      subscribe((response: any) => {
        this.firstLoad = true
        response['value'].forEach((p: any) => {
          let party = new Party(p["NaamNL"], p["Afkorting"])
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
          this.searchterms.push(party.searchTerm)
          this.parties.push(party)
        });
      })
  }

  getResults(results: Result[]) {
    let filtered = results.filter((r) => r.StemmingsSoort != "Hoofdelijk")
    return filtered
  }

  filterResults() {
    this.startSpinner()
    let p1 = this.child.box1
    let p2 = this.child.box2
    let url = ""
    if (p1.length == 0 && p2.length == 0) {
      // show error or display just the latest results
      url = this.resultsService.getLatest()
    } else if (p1.length == 0 || p2.length == 0) {
      url = this.resultsService.getSide([...p1, ...p2])
    } else {
      url = this.resultsService.getOpposites(p1, p2)
    }

    this.http.get(url).subscribe((r: any) => {
      this.pages = [];
      let page = new Page()
      page.results = r["value"]
      this.pages.push(page)
      this.highLighted = [...p1, ...p2]
      this.stopSpinner()
    })
  }
  startSpinner() {
    this.spinner = true;
  }
  stopSpinner() {
    this.spinner = false;
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

class Party {
  name: string;
  abbreviation: string;
  searchTerm: string;
  constructor(name: string, abbreviation: string) {
    this.name = name;
    this.abbreviation = abbreviation
    this.searchTerm = abbreviation
  }
}