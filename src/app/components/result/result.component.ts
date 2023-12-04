import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Decision, Party, Vote } from 'src/app/services/OData/models/models';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {
  getOrderedVotes(): any {

    return this.result.Stemming.sort((v1: Vote, v2: Vote) => {
      if (v1.ActorFractie > v2.ActorFractie) { return 1 }
      else {
        return -1;
      }
    })
  }
  getHOrder(vote: Vote): any {
    let order = 0
    switch (vote.Soort) {
      case "Voor":
        order = 10
        break
      case "Tegen":
        order = 20
        break
      default:
        order = 30
    }
    if (this.isHighLighted(vote.Fractie))
      order -= 1
    return order
  }
  getCaseNumber() {
    let number = ""
    number += this.result.Zaak[0].Kamerstukdossier[0].Nummer
    if (this.result.Zaak[0].Kamerstukdossier[0].Toevoeging) number += "-" + this.result.Zaak[0].Kamerstukdossier[0].Toevoeging
    let followNumber = this.result.Zaak[0].Volgnummer;
    if (followNumber == 0) followNumber = this.result.Zaak[0].Document[0].Volgnummer;
    number += "-" + followNumber;
    return number
  }

  isHighLighted(party: Party) {
    return this.highLighted.indexOf(party.Afkorting) > -1 ||
      this.highLighted.indexOf(party.Id) > -1
  }
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

  @Input() result!: Decision;
  @Input() highLighted: string[] = []
  @Input() vertical: boolean = false;
  yays: Vote[] = []
  nays: Vote[] = []
  parties: Vote[] = []

  votesYay: number = 0;
  votesNay: number = 0;
  votingResult!: string;

  constructor() { }

  ngOnInit(): void { }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['result']) {
      this.newParty()
    }
  }
  getClass(vote: Vote) {
    switch (vote.Soort) {
      case "Voor":
        return "yays"
      case "Tegen":
        return "nays"
      default:
        return "neutral"
    }
  }

  newParty() {
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

    let listSorter = (list: Vote[]) => {
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
    return new Date(this.result.Agendapunt.Activiteit.Datum).toLocaleDateString('nl-NL', options)
  }

  maxSize: number = 420;
  collapsable: boolean = false;
  collapsed: boolean = false;
  @ViewChild('votes')
  votesElement!: ElementRef;

  toggleCollapse() {
    this.collapsed = !this.collapsed
  }
}
