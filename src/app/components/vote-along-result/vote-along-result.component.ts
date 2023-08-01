import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Case, Party } from 'src/app/services/OData/models/models';
import { PartyService } from 'src/app/services/party.service';

@Component({
  selector: 'app-vote-along-result',
  templateUrl: './vote-along-result.component.html',
  styleUrls: ['./vote-along-result.component.css']
})
export class VoteAlongResultComponent implements OnInit {
  getAmount(va: VoteAlonger, tp: number) {
    return va.caseVotes.filter(cv => cv.agreed == tp).length
  }

  @Input() data!: PartyVoteAlongers;
  @Input() option: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

  getOrderedDataSet(): VoteAlonger[] {
    // sort list based on input property
    let orderby = () => this.data.votes.sort((a, b) => {
      return (
        b.caseVotes.filter(v => v.agreed == 1).length -
        b.caseVotes.filter(v => v.agreed == -1).length
      ) - (
          a.caseVotes.filter(v => v.agreed == 1).length -
          a.caseVotes.filter(v => v.agreed == -1).length
        )
    })

    switch (this.option) {
      case 1:
        return orderby().reverse()
      case 0: // ordered by 
      default:
        return orderby()
    }
  }
}

export interface PartyVoteAlongers {
  partyId: string;
  party$: BehaviorSubject<Party | null>

  petitioned: number;
  votes: VoteAlonger[];
}

interface VoteAlonger {
  partyId: string;
  party$: BehaviorSubject<Party | null>
  caseVotes: CaseVote[]
}

export interface CaseVote {
  // case: Case
  caseId: string

  // derived
  agreed: number; // -1 no, 0 not voted, 1 yes
  mistake: boolean

  helper: boolean;

}