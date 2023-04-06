import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Result, Vote } from 'src/app/services/OData/models/models';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit, AfterViewInit {
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
  yays: Vote[] = []
  nays: Vote[] = []

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
    return new Date(this.result.GewijzigdOp).toLocaleDateString('nl-NL', options)
  }

  maxSize: number = 420;
  collapsable: boolean = false;
  collapsed: boolean = false;
  @ViewChild('votes')
  votesElement!: ElementRef;
  ngAfterViewInit() {
    var height = this.votesElement.nativeElement.offsetHeight;

    if (height > 400) {
      this.collapsable = true;
    }
  }
  toggleCollapse() {
    this.collapsed = !this.collapsed
  }
}
