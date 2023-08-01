import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Case, Decision } from 'src/app/services/OData/models/models';
import { ODataResponse } from 'src/app/services/OData/models/response';
import { Table } from 'src/app/services/OData/query-generator/Table';
import { AndFilter } from 'src/app/services/OData/query-generator/filters';
import { ResultService } from 'src/app/services/result.service';

@Component({
  selector: 'app-search-number-result',
  templateUrl: './search-number-result.component.html',
  styleUrls: ['./search-number-result.component.css']
})
export class SearchNumberResultComponent implements OnDestroy {
  sub?: Subscription;
  getOptions(): { name: string, val: number, orderby: (a: Decision, b: Decision) => number }[] {
    let options = [
      {
        name: "Datum (aflopend)", val: 1,
        orderby: (a: Decision, b: Decision) => {
          if (a.Agendapunt.Activiteit.Datum == b.Agendapunt.Activiteit.Datum) {
            return 0;
          } else if (a.Agendapunt.Activiteit.Datum < b.Agendapunt.Activiteit.Datum) {
            return 1
          } else {
            return -1
          }
        }
      },
      {
        name: "Datum(oplopend)", val: 2,
        orderby: (a: Decision, b: Decision) => {
          if (a.Agendapunt.Activiteit.Datum == b.Agendapunt.Activiteit.Datum) {
            return 0;
          } else if (a.Agendapunt.Activiteit.Datum > b.Agendapunt.Activiteit.Datum) {
            return 1
          } else {
            return -1
          }
        }
      },
      {
        name: "Op volgnummer(aflopend)", val: 3,
        orderby: (a: Decision, b: Decision) => {
          if (a.Zaak[0].Volgnummer == b.Zaak[0].Volgnummer) {
            return 0;
          } else if (a.Zaak[0].Volgnummer < b.Zaak[0].Volgnummer) {
            return 1
          } else {
            return -1
          }
        }
      },
      {
        name: "Op volgnummer(oplopend)", val: 4,
        orderby: (a: Decision, b: Decision) => {
          if (a.Zaak[0].Volgnummer == b.Zaak[0].Volgnummer) {
            return 0;
          } else if (a.Zaak[0].Volgnummer > b.Zaak[0].Volgnummer) {
            return 1
          } else {
            return -1
          }
        }
      },
    ]
    if (this.testFollowNumber) options.push({
      name: "In de buurt van Volgnummer", val: 5,
      orderby: (a: Decision, b: Decision) => {
        if (Math.abs(a.Zaak[0].Volgnummer - this.testFollowNumber!) == Math.abs(b.Zaak[0].Volgnummer - this.testFollowNumber!)) {
          return 0;
        } else if (Math.abs(a.Zaak[0].Volgnummer - this.testFollowNumber!) > Math.abs(b.Zaak[0].Volgnummer - this.testFollowNumber!)) {
          return 1
        } else {
          return -1
        }
      }
    },)
    return options
  }
  results?: Decision[];
  number = "";
  notFound = false;
  orderby: number = 1;
  testFollowNumber?: number;
  constructor(private resultService: ResultService, private http: HttpClient) { }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  setOrderedResults() {
    this.results = this.results?.sort(
      this.getOptions().find(o => o.val == this.orderby)!.orderby
    )
  }

  setOrderBy(event: any) {
    this.orderby = event.target.value
    this.setOrderedResults()
  }

  searchResult() {
    this.results = undefined
    this.testFollowNumber = undefined
    this.orderby = 1
    this.notFound = false
    let parts = this.number.split("-");
    let url: string = "";
    let number = "";
    let table: Table;

    if (parts.length == 1) {
      // number = parts[0]
      number = parts[0]
      let isnum = /^\d+$/.test(number);
      if (isnum) {
        table = this.resultService.getCaseBySubject(number as unknown as number)
      } else {
        return this.getResultByNumber([number])
      }
    } else {
      if (parts.length == 2) {
        // subject_number, follownumber
        let isnum = /^\d+$/.test(parts[1]);
        if (isnum)
          table = this.resultService.getCaseBySubject(parts[0] as unknown as number, parts[1] as unknown as number)
        else
          table = this.resultService.getCaseBySubject(parts[0] as unknown as number, undefined, parts[1])
      } else if (parts.length == 3) {
        // subject_number, addition, follownumber
        table = this.resultService.getCaseBySubject(parts[0] as unknown as number, parts[2] as unknown as number, parts[1])
      }
    }
    url = table!.generateUrl()

    let onError = () => {
      if (parts.length == 2) table = this.resultService.getCaseBySubject(parts[0] as unknown as number)
      if (parts.length == 3) table = this.resultService.getCaseBySubject(parts[0] as unknown as number, undefined, parts[1])
      this.orderby = 5
      this.notFound = true;
      this.http.get<ODataResponse<Case>>(table.generateUrl()).subscribe({
        next: (response) => {
          let numbers = response.value.map(v => v.Nummer)
          this.testFollowNumber = parts[1] as unknown as number
          this.getResultByNumber(numbers)
        },
        error: (err) => { }
      })
    };
    this.http.get<ODataResponse<Case>>(url).subscribe({
      next: (response) => {
        if (parts.length > 1 && response.value.length == 0) {
          onError()
        } else {
          let numbers = response.value.map(v => v.Nummer)
          this.getResultByNumber(numbers)
        }
      },
      error: (err) => { onError() }
    })
  }
  toMuch = false;

  getResultByNumber(numbers: string[]) {
    if (numbers.length == 0) {
      this.notFound = true;
      return
    }
    this.toMuch = false;
    let max = 50
    if (numbers.length > max) {
      this.toMuch = true;
    }
    let table = this.resultService.getTableOfDecisions(true)
    table.filter = new AndFilter([
      table.filter!,
      this.resultService.getDecisionByNumbers(numbers.splice(0, max)).filter!
    ])
    let url = table.generateUrl()

    this.sub?.unsubscribe();
    this.sub = this.http.get<ODataResponse<Decision>>(url).subscribe({
      next:
        (response) => {
          let data = response.value;
          this.results = data
          this.setOrderedResults()
        },
      error: (err) => {
      }
    })
  }

  numberInputChanged(event: any) {
    this.number = event.target.value
  }
}
