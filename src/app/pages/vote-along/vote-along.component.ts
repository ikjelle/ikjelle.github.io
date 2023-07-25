import { KeyValue } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { filter } from 'rxjs';
import { Party, Decision, Vote } from 'src/app/services/OData/models/models';
import { ODataResponse } from 'src/app/services/OData/models/response';
import { resultTypes } from 'src/app/services/OData/models/result-types';
import { AndFilter } from 'src/app/services/OData/query-generator/filters';
import { ResultService } from 'src/app/services/result.service';

interface PartyData {
  [party_id: string]: {
    [party_id: string]: {
      agreed: number;
      disagreed: number;
      mistakeAgreed: number;
      mistakeDisagreed: number;
      notVoted: number;

      helped: number; // is 1 of the actors
      helpedAgreed: number; // wether it agreed with the main actor
      helpedDisagreed: number;
    };
  };
};

@Component({
  selector: 'app-vote-along',
  templateUrl: './vote-along.component.html',
  styleUrls: ['./vote-along.component.css']
})
export class VoteAlongComponent implements OnInit {
  polling: boolean = false;
  getAllSignedCasedOf(signer: any, fraction: string) {
    if (false) {
      return 0; // return 0 if x turned off.
    }
    return signer[fraction].helped
  }

  periodStart?: string = new Date(2021, 2, 32).toISOString().slice(0, 10);
  periodEnd?: string = undefined
  resultTypes = resultTypes.filter(rt => rt.enabled)
  ready: boolean = false;
  constructor(private resultsService: ResultService, private http: HttpClient) { }

  ngOnInit(): void {
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

  search() {
    this.data = {}
    this.ready = false;
    this.polling = true;
    let url = ""

    let table = this.resultsService.getTableOfDecisionsWithActor()

    let f = this.resultsService.getDecisionsByCaseType(this.resultTypes).filter
    let f2 = this.resultsService.getDecisionsBetween(this.periodStart, this.periodEnd).filter

    let andFilter = new AndFilter()
    for (let filter of [f, f2]) {
      if (filter != null) {
        andFilter.addFilter(filter)
      }
    }
    table.filter = andFilter

    url = table.generateUrl()

    let getCases = (url: string) => {
      return this.http.get<ODataResponse<Decision>>(url).subscribe((response) => {
        let nextLink = response["@odata.nextLink"]
        if (nextLink) getCases(nextLink);
        else this.polling = false
        this.setResults(response.value);
      })
    }
    getCases(url)
  }

  data: PartyData = {};

  setResults(results: Decision[]) {
    // foreach case
    //    foreach actor that signed case
    //        foreach vote
    // so every actor will have a list of that case with who voted what.

    let parties: string[] = []
    for (let res of results) {
      let petitioners = res.Zaak[0].ZaakActor.map(a => a.Fractie_Id)
      if (res.StemmingsSoort == "Hoofdelijk") continue;
      if (petitioners.find(p => res.Stemming.find(v => v.Fractie_Id == p && v.Soort == "Voor") != undefined) == undefined) {
        // console.log("Someone did put one in but did not vote YAY")
        // console.log(res)
      }
      for (let actor of res.Zaak[0].ZaakActor) {
        if (!(actor.Fractie_Id)) continue
        if (!(actor.Fractie_Id in this.data)) this.data[actor.Fractie_Id] = {}
        for (let vote of res.Stemming) {
          if (!parties.find(v => v == vote.Fractie_Id)) {
            parties.push(vote.Fractie_Id)
          }
          if (!(vote.Fractie_Id in this.data[actor.Fractie_Id])) this.data[actor.Fractie_Id][vote.Fractie_Id] = {
            agreed: 0,
            disagreed: 0,
            mistakeAgreed: 0,
            mistakeDisagreed: 0,
            notVoted: 0,
            helped: 0,
            helpedAgreed: 0,
            helpedDisagreed: 0,
          }
          let votedWith = false;
          if (petitioners.find(p => p == vote.Fractie_Id)) {
            votedWith = true;
            this.data[actor.Fractie_Id][vote.Fractie_Id].helped += 1
          }
          if (vote.Soort == "Voor") {
            this.data[actor.Fractie_Id][vote.Fractie_Id].agreed += 1
            if (votedWith)
              this.data[actor.Fractie_Id][vote.Fractie_Id].helpedAgreed += 1
            if (vote.Vergissing)
              this.data[actor.Fractie_Id][vote.Fractie_Id].mistakeAgreed += 1
          } else if (vote.Soort == "Tegen") {
            this.data[actor.Fractie_Id][vote.Fractie_Id].disagreed += 1

            if (votedWith)
              this.data[actor.Fractie_Id][vote.Fractie_Id].helpedDisagreed += 1
            if (vote.Vergissing)
              this.data[actor.Fractie_Id][vote.Fractie_Id].mistakeDisagreed += 1
          } else {
            this.data[actor.Fractie_Id][vote.Fractie_Id].notVoted += 1
          }
        }
      }
    }
    this.setParties(parties);
    // get all fractions so fraction can be matched
  }

  setParties(partyIds: string[]) {
    let ids = [];
    for (let id of partyIds) {
      if (!(this.parties[id]) && id.length > 10)
        ids.push(id)
    }
    if (ids.length == 0) return;
    this.ready = false;
    let url = this.resultsService.getPartiesByIds(ids).generateUrl()

    this.http.get<ODataResponse<Party>>(url).subscribe((response) => {
      for (let p of response.value) {
        this.parties[p.Id] = p
      }
      this.ready = true;
    })
  }
  parties: { [id: string]: Party } = {}

  getFractionName(id: string) {
    if (!(this.parties[id])) {
      console.log(id)
    }
    return this.parties[id].Afkorting ?? this.parties[id].NaamNL;
  }
}
