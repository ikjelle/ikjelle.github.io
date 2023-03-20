import { Component, Input, OnInit } from '@angular/core';
import { Result, Stemming } from 'src/app/services/classes/result';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {
  getQueryParams() {
    let s = ""
    this.highLighted.forEach(h => {
      s += "highlighted=" + h + '&'
    });
    return s
  }
  getTKUrl() {
    let link = ""
    let docs = this.result.Zaak[0].Document
    if (docs.length > 0) {
      let id = this.result.Zaak[0].Nummer
      let did = docs[0].DocumentNummer
      // result type is not necessary for the result data. Its used for the bread crumb
      // so add the corresponding part in resultTypes if you would also like that to
      let resultType = this.result.Zaak[0].Soort.
        replace("/", "-") // replacing extra slashes as those will lead to errors

      link = "https://www.tweedekamer.nl/kamerstukken/" + resultType + "/detail?id=" + id + "&did=" + did
    } else {
      link = 'https://www.tweedekamer.nl/zoeken?fld_tk_categorie=Kamerstukken&qry=' + this.result.Zaak[0].Nummer
    }
    return link
  }

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
