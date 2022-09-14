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
      if (party.Soort == "Voor") {
        this.votesYay += party.FractieGrootte
        this.yays.push(party)
      } else if (party.Soort == "Tegen") {
        this.votesNay += party.FractieGrootte
        this.nays.push(party)
      }
    });
    if (this.votesNay > this.votesYay) {
      this.votingResult = "Verworpen"
    } else {
      this.votingResult = "Aangenomen"
    }
  }


}
