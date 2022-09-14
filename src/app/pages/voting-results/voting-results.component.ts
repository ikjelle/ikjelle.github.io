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
  spinner: boolean = true;
  firstLoad: boolean = false;

  resultTypes: Array<any> = [
    { name: "Amendement", checked: true, priority: 95 },
    { name: "Artikelen/onderdelen (wetsvoorstel)", checked: false, priority: 0 },
    { name: "Begroting", checked: true, priority: 90 },
    { name: "Brief Europese Commissie", checked: false, priority: 0 },
    { name: "Brief Kamer", checked: false, priority: 0 },
    { name: "Brief commissie", checked: false, priority: 0 },
    { name: "Brief derden", checked: false, priority: 0 },
    { name: "Brief regering", checked: false, priority: 0 },
    { name: "Brief van lid/fractie/commissie", checked: false, priority: 0 },
    { name: "EU-voorstel", checked: false, priority: 0 },
    { name: "Initiatiefnota", checked: false, priority: 0 },
    { name: "Initiatiefwetgeving", checked: false, priority: 0 },
    { name: "Interpellatie", checked: false, priority: 0 },
    { name: "Lijst met EU-voorstellen", checked: false, priority: 0 },
    { name: "Mondelinge vragen", checked: false, priority: 0 },
    { name: "Motie", checked: true, priority: 90 },
    { name: "Nationale ombudsman", checked: false, priority: 0 },
    { name: "Netwerkverkenning", checked: false, priority: 0 },
    { name: "Nota naar aanleiding van het (nader) verslag", checked: false, priority: 0 },
    { name: "Nota van wijziging", checked: false, priority: 0 },
    { name: "Overig", checked: false, priority: 0 },
    { name: "PKB/Structuurvisie", checked: false, priority: 0 },
    { name: "Parlementair onderzoeksrapport", checked: false, priority: 0 },
    { name: "Position paper", checked: false, priority: 0 },
    { name: "Rapport/brief Algemene Rekenkamer", checked: false, priority: 0 },
    { name: "Rondvraagpunt procedurevergadering", checked: false, priority: 0 },
    { name: "Schriftelijke vragen", checked: false, priority: 0 },
    { name: "Stafnotitie", checked: false, priority: 0 },
    { name: "Verdrag", checked: true, priority: 90 },
    { name: "Verzoek bij commissie-regeling van werkzaamheden", checked: false, priority: 0 },
    { name: "Verzoek bij regeling van werkzaamheden", checked: false, priority: 0 },
    { name: "Verzoekschrift", checked: false, priority: 0 },
    { name: "Voordrachten en benoemingen", checked: false, priority: 0 },
    { name: "Wetenschappelijke factsheet", checked: false, priority: 0 },
    { name: "Wetenschapstoets", checked: false, priority: 0 },
    { name: "Wetgeving", checked: true, priority: 90 },
    { name: "Wijziging RvO", checked: false, priority: 0 },
    { name: "Wijzigingen voorgesteld door de regering", checked: false, priority: 0 },
  ]

  constructor(private resultsService: ResultService, private http: HttpClient) {
  }

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
    console.log(this.resultTypes)
    this.startSpinner()
    let p1 = this.child.box1
    let p2 = this.child.box2
    let url = ""

    url = this.resultsService.getUrl(p1, p2, this.resultTypes)
    
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