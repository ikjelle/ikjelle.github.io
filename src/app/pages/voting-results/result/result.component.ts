import { Component, Input, OnInit } from '@angular/core';
import { Result, Stemming } from '../result';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {

  @Input() result!: Result;
  @Input() highLighted: string[] = []
  yays: Stemming[] = []
  nays: Stemming[] = []

  votesYay: number = 0;
  votesNay: number = 0;
  votingResult!: string;

  constructor() { }

  ngOnInit(): void {
    this.result.Stemming.forEach(party => {
      let voteAmount = 1
      if (this.result.StemmingsSoort != "Hoofdelijk") {
        voteAmount = party.FractieGrootte
      }
      if (party.Soort == "Voor") {
        this.votesYay += voteAmount
        this.yays.push(party)
      } else if (party.Soort == "Tegen") {
        this.votesNay += voteAmount
        this.nays.push(party)
      }
    });

    let listSorter = (list: Stemming[]) => {
      list.sort((a, b) => {
        let partyNameA = a.ActorFractie, partyNameB = b.ActorFractie
        if (a.FractieGrootte > b.FractieGrootte || (a.FractieGrootte == b.FractieGrootte && partyNameA > partyNameB)) {
          return -1
        } else {
          return 1
        }
      })
    }

    listSorter(this.yays)
    listSorter(this.nays)

    if (this.votesNay > this.votesYay) {
      this.votingResult = "Verworpen"
    } else {
      this.votingResult = "Aangenomen"
    }
  }

  getLocalDate() {
    const options: any = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(this.result.GewijzigdOp).toLocaleDateString('nl-NL', options)
  }

}
