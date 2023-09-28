import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Party } from 'src/app/services/OData/models/models';
import { ODataResponse } from 'src/app/services/OData/models/response';
import { ResultService } from 'src/app/services/result.service';

@Component({
  selector: 'app-decider',
  templateUrl: './decider.component.html',
  styleUrls: ['./decider.component.css']
})
export class DeciderComponent implements OnInit {

  periodStart?: string = new Date(2021, 2, 32).toISOString().slice(0, 10);
  periodEnd?: string = undefined;
  parties: Party[] = [];
  partyId?: string;
  polling: boolean = false;


  totalCount?: number
  retrievedCount: number = 0
  totalCasesNoDifference?: number = 0

  constructor(private resultsService: ResultService, private http: HttpClient) { }

  ngOnInit(): void {
    this.updateAvailableParties();
  }

  setParty(event: any) {
    this.partyId = event.target.value
  }

  updateAvailableParties() {
    let url = this.resultsService.getParties(this.periodStart, this.periodEnd).generateUrl()

    // TODO: catch CORS
    this.http.get<ODataResponse<Party>>(url).
      subscribe((response) => {
        this.parties = response.value;
      })
  }

  getDeciderDecisions() {
    // haal grootste partije groote op in die periode,
    // pak deze and ge 76-partijGrootte le 75+partijGrootte
    // maar als veel mensen niet gestemd hebben kan het dus anders zijn.
    // haal data op
    // op frontend kijk of wanneer de inverse van die partije het resultaat veranderd van de stemming\
    // wanneer 0 verschillen haal op voor volgenda pagina.
    // anders, activeer knop met meer resultaten.
    let party = this.parties.find(p => p.Id == this.partyId)!
    let start = this.resultsService.getLatestStartDate([this.periodStart!, party.DatumActief])
    let end = this.resultsService.getEarliestEndDate([this.periodEnd!, party.DatumInactief!, this.resultsService.formatDate(new Date())])
    let x = ""
    x = `https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0/Stemming?$apply=` +
      `filter(Besluit/Agendapunt/Activiteit/Datum%20ge%20${start} and Besluit/Agendapunt/Activiteit/Datum%20le%20${end} and Soort eq 'Voor')` +
      `/groupby((Besluit/Id, Besluit/Agendapunt/Activiteit/Datum),aggregate(FractieGrootte%20with%20sum%20as%20Votes))` +
      `&$orderby=Besluit/Agendapunt/Activiteit/Datum&$count=true`
    console.log(x)
    x = `https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0/Stemming?$apply=` +
      `filter(Besluit/Agendapunt/Activiteit/Datum%20ge%20${start} and Besluit/Agendapunt/Activiteit/Datum%20le%20${end} and Soort eq 'Tegen')` +
      `/groupby((Besluit/Id, Besluit/Agendapunt/Activiteit/Datum),aggregate(FractieGrootte%20with%20sum%20as%20Votes))&$orderby=Besluit/Agendapunt/Activiteit/Datum&$count=true`
    console.log(x)
    x = `https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0/Stemming?$apply=` +
      `filter(Besluit/Agendapunt/Activiteit/Datum%20ge%20${start} and Besluit/Agendapunt/Activiteit/Datum%20le%20${end} and Fractie/Id eq ${this.partyId})` +
      `/groupby((Besluit/Id, Besluit/Agendapunt/Activiteit/Datum),aggregate(FractieGrootte%20with%20sum%20as%20Votes))&$orderby=Besluit/Agendapunt/Activiteit/Datum&$count=true`
    console.log(x)
    // maybe do 3 queries, based on time it should only give back the cases with that id
    // 1 with all yay votes
    // 1 with all nay votes
    // then one that gives back the amount of votes it had

    // so then it should have an ordered dict orso, so that values are set to 0 when no against votes.
  }

}
