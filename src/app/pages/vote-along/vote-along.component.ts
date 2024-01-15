import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CaseTypePickerComponent } from 'src/app/components/case-type-picker/case-type-picker.component';
import { PeriodPickerComponent } from 'src/app/components/period-picker/period-picker.component';
import { CaseVote, PartyVoteAlongers } from 'src/app/components/vote-along-result/vote-along-result.component';
import { Decision } from 'src/app/services/OData/models/models';
import { ODataResponse } from 'src/app/services/OData/models/response';
import { AndFilter } from 'src/app/services/OData/query-generator/filters';
import { PartyService } from 'src/app/services/party.service';
import { ResultService } from 'src/app/services/result.service';

@Component({
  selector: 'app-vote-along',
  templateUrl: './vote-along.component.html',
  styleUrls: ['./vote-along.component.css']
})
export class VoteAlongComponent implements OnDestroy {
  polling: boolean = false;
  @ViewChild(CaseTypePickerComponent) caseTypePickerComp!: CaseTypePickerComponent
  sub?: Subscription;

  @ViewChild(PeriodPickerComponent) periodPickerComp!: PeriodPickerComponent;

  get periodStart(): string | undefined {
    return this.periodPickerComp.start;
  }
  get periodEnd(): string | undefined {
    return this.periodPickerComp.end;
  }

  totalCount?: number = undefined
  amountPolled: number = 0
  constructor(private resultsService: ResultService, private http: HttpClient, private partyService: PartyService) { }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  search() {
    this.data = []
    this.polling = true;
    this.totalCount = undefined
    this.amountPolled = 0

    let url = ""

    let table = this.resultsService.getTableOfDecisionsWithActor()

    let f = this.resultsService.getDecisionsByCaseType(this.caseTypePickerComp.caseTypes).filter
    let f2 = this.resultsService.getDecisionsBetween(this.periodStart, this.periodEnd).filter

    let andFilter = new AndFilter()
    for (let filter of [table.filter, f, f2]) {
      if (filter != null) {
        andFilter.addFilter(filter)
      }
    }
    table.filter = andFilter

    url = table.generateUrl()

    if (this.sub) this.sub.unsubscribe()

    let getCases = (url: string) => {
      this.sub = this.http.get<ODataResponse<Decision>>(url).subscribe({
        next: (response) => {
          let nextLink = response["@odata.nextLink"]
          this.totalCount = response["@odata.count"]!
          this.amountPolled += response.value.length
          if (nextLink) getCases(nextLink);
          else this.polling = false
          this.setResults(response.value);
        },
        error: err => { }
      })
      return this.sub;
    }
    getCases(url)
  }

  data?: PartyVoteAlongers[];

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
        // Someone did put one in but did not vote YAY
      }
      for (let actor of res.Zaak[0].ZaakActor) {
        if (!(actor.Fractie_Id)) continue
        let partyVA = this.data?.find(p => p.partyId == actor.Fractie_Id)
        if (!partyVA) {
          partyVA = {
            partyId: actor.Fractie_Id,
            votes: [],
            petitioned: 0,
            party$: this.partyService.getPartyById(actor.Fractie_Id)
          }
          this.data?.push(partyVA)
        }
        partyVA.petitioned++;

        for (let vote of res.Stemming) {
          if (!parties.find(v => v == vote.Fractie_Id)) {
            parties.push(vote.Fractie_Id)
          }

          let actorVote = partyVA.votes.find(p => p.partyId == vote.Fractie_Id)
          if (!actorVote) {
            actorVote = {
              partyId: vote.Fractie_Id, caseVotes: [],
              party$: this.partyService.getPartyById(vote.Fractie_Id)
            }
            partyVA.votes.push(actorVote)
          }

          let cv: CaseVote = {
            agreed: 0,
            // case: res.Zaak[0],
            caseId: res.Zaak[0].Id,
            helper: res.Zaak[0].ZaakActor.find(zk => zk.Fractie_Id == vote.Fractie_Id) != null,
            mistake: vote.Vergissing
          }

          if (vote.Soort == "Voor") {
            cv.agreed = 1
          } else if (vote.Soort == "Tegen") {
            cv.agreed = -1
          }
          actorVote.caseVotes.push(cv)
        }
      }
    }
    // get all fractions so fraction can be matched
  }
}