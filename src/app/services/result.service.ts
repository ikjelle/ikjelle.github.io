import { Injectable } from '@angular/core';
import { Activity, AgendaItem, Case, CaseSubject, Document, Party, Decision, Vote, CaseActor } from './OData/models/models';
import { AllCriteria, AndFilter, AnyCriteria, c, CompareCriterica, Filter, InCriterica, NotCriterica, OrFilter, TextCriteria, TF } from './OData/query-generator/filters';
import { Table } from './OData/query-generator/Table';
import { CaseTypeCheckBox } from './OData/models/result-types';

@Injectable({
  providedIn: 'root'
})
export class ResultService {

  // Helpers
  formatDateString(dateString?: string): string | undefined {
    if (dateString) {
      let date = new Date(dateString)
      return this.formatDate(date)
    }
    return undefined;
  }
  formatDate(date: Date) {
    return date.toISOString()
  }

  getLatestStartDate(dates: string[]) {
    let latestDate = null
    for (let ds of dates) {
      let date = new Date(ds)
      if (latestDate == null || date > latestDate) {
        latestDate = date
      }
    }
    return latestDate ? this.formatDate(latestDate) : undefined
  }
  getEarliestEndDate(dates: string[]) {
    let earliestDate = null
    for (let ds of dates) {
      let date = new Date(ds)
      if (earliestDate == null || date < earliestDate) {
        earliestDate = date
      }
    }
    return earliestDate ? this.formatDate(earliestDate) : undefined
  }

  getYay(pro: boolean) {
    return pro ? "'Voor'" : "'Tegen'"
  }

  getTableOfDecisions() {
    // add options so this builds up the table
    return new Table(new Decision(), {
      expansions: [
        new Table(new Case(), {
          expansions: [new Table(new Document())]
        }),
        new Table(new Vote(), {
          expansions: [new Table(new Party(), {
            select: ["Afkorting", "NaamEN", "NaamNL"]
          })]
        }),
        // get date
        new Table(new AgendaItem(), { expansions: [new Table(new Activity(), {})] })
      ],
      filter: new AnyCriteria("Stemming", new CompareCriterica("Id", c.ne, "null")),
      count: true,
      orderBy: true,
      orderByProp: "Agendapunt/Activiteit/Datum"
    })
  }
  getTableOfDecisionsWithSubjectNumber() {
    // add options so this builds up the table
    return new Table(new Decision(), {
      expansions: [
        new Table(new Case(), {
          expansions: [new Table(new CaseSubject()), new Table(new Document())]
        }),
        new Table(new Vote(), {
          expansions: [new Table(new Party(), {
            select: ["Afkorting", "NaamEN", "NaamNL"]
          })]
        }),
        // get date
        new Table(new AgendaItem(), { expansions: [new Table(new Activity(), {})] })
      ],
      filter: new AnyCriteria("Stemming", new CompareCriterica("Id", c.ne, "null")),
      count: true,
      orderBy: true,
      orderByProp: "Agendapunt/Activiteit/Datum"
    })
  }
  getTableOfDecisionsWithActor(): Table {
    // minimal select for result component
    return new Table(new Decision(), {
      expansions: [
        new Table(new Case(), {
          expansions: [
            new Table(new CaseActor()),
            new Table(new Document())
          ]
        }),
        new Table(new Vote(), {
          expansions: [new Table(new Party(), {
            select: ["Afkorting", "NaamEN", "NaamNL"]
          })]
        }),
        new Table(new AgendaItem(), { expansions: [new Table(new Activity(), {})] })
      ],
      filter: new AnyCriteria("Stemming", new CompareCriterica("Id", c.ne, "null")),

      count: true,
      orderBy: true,
      orderByProp: "Agendapunt/Activiteit/Datum",
    })
  }

  // Requests, returning table so data can be modified

  getParties(start: string | undefined, end: string | undefined): Table {
    // TODO: change GewijzigdOp into a real date
    // by looking at vote count you can atleast check if they have votes

    let filters = []
    if (end != null) {
      filters.push(new CompareCriterica("DatumActief", c.le, this.formatDateString(end)));
    }
    if (start != null) {
      filters.push(new OrFilter([
        new CompareCriterica("DatumInactief", c.ge, this.formatDateString(start)),
        new CompareCriterica("DatumInactief", c.eq, "null")
      ]))
    }

    let table = new Table(new Party(), {
      expansions: [new Table(new Vote(), { count: true })],
      filter: new AndFilter([
        ...filters,
        new CompareCriterica("Afkorting", c.ne, "null")
      ]),
      orderBy: true,
      orderByProp: "NaamNL",
      orderByAscending: true
    })

    return table
  }

  getPartiesByIds(ids: string[]): Table {
    let table = new Table(new Party())
    table.filter = new InCriterica("Id", ids)
    return table;
  }

  getDecisionByGuid(id: string): Table {
    let table = this.getTableOfDecisions()
    table.filter = new AndFilter([table.filter!, new AnyCriteria("Zaak", new CompareCriterica("Id", c.eq, id))])

    return table;
  }

  getDecisionByNumber(number: string): Table {
    let table = this.getTableOfDecisions()
    table.filter = new AndFilter([table.filter!,
    new AndFilter([
      new AnyCriteria("Zaak", new CompareCriterica("Nummer", c.eq, "'" + number + "'")),
      new CompareCriterica("StemmingsSoort", c.ne, "null")
    ])
    ]);
    return table;
  }

  getCaseBySubject(subjectNumber: number, followNumber: number, addition?: string): Table {
    let table = new Table(new Case(), {
      expansions: [
        new Table(new CaseSubject())
      ]
    });

    let subjectCriteria: Filter = new CompareCriterica("Nummer", c.eq, subjectNumber)
    if (addition != undefined) {
      subjectCriteria = new AndFilter([
        subjectCriteria,
        new CompareCriterica("Toevoeging", c.eq, "'" + addition + "'")
      ])
    }

    table.filter = new AndFilter([
      new AnyCriteria("Kamerstukdossier", subjectCriteria),
      new CompareCriterica("Volgnummer", c.eq, followNumber)
    ])
    return table;
  }

  getDecisionsBetween(start?: string, end?: string): Table {
    let table = this.getTableOfDecisions()
    let dateFilters = []
    if (start!) {
      dateFilters.push(
        new CompareCriterica("Agendapunt/Activiteit/Datum", c.ge, this.formatDateString(start)))
    }
    if (end!) {
      dateFilters.push(new CompareCriterica("Agendapunt/Activiteit/Datum", c.le, this.formatDateString(end)))
    }
    table.filter = new AndFilter([table.filter!, new AndFilter(dateFilters)])
    return table;
  }

  // get smalles period of time with given date and parties that matter
  getDecisionsBetweenDatesAndParties(start?: string, end?: string, parties?: Party[]) {
    let starts = [start, ...parties?.map(p => p.DatumActief)!]
    let ends = [end, ...parties?.map(p => p.DatumInactief)!]
    return this.getDecisionsBetween(
      this.getLatestStartDate(starts.filter(e => e != null) as string[]),
      this.getEarliestEndDate(ends.filter(e => e != null) as string[]),
    )
  }

  getDecisionsByCaseType(resultTypes: CaseTypeCheckBox[]): Table {
    let table = this.getTableOfDecisions()

    let checkedTypes = resultTypes.filter(rt => rt.checked)
    // if its smaller check on type, if they are equal all types will already be there
    if (checkedTypes.length < resultTypes.length) {
      const typeNames = checkedTypes.map(t => t.name)
      // The in clause uses less nodes, so its way better than multiple eq
      new AndFilter([table.filter!, table.filter = new AllCriteria("Zaak", new InCriterica("Soort", typeNames))])
    }

    return table;
  }

  getDecisionsContainingText(searchText: string): Table {
    let table = this.getTableOfDecisions();

    if (searchText != "") {
      // check in subject or title, all the data I got.
      table.filter = new AndFilter([table.filter!, new AllCriteria("Zaak",
        new OrFilter([
          new TextCriteria(TF.CO, "Onderwerp", searchText),
          new TextCriteria(TF.CO, "Titel", searchText)])
      )]);
    }

    return table
  }

  getDecisionsByDifferentVote(partyIdsA: string[], partyIdsB: string[]): Table {
    let table = this.getTableOfDecisions()

    const p1EqOr = new InCriterica("Fractie_Id", partyIdsA)
    const p2EqOr = new InCriterica("Fractie_Id", partyIdsB)
    const allPartiesEqOr = new InCriterica("Fractie_Id", partyIdsA.concat(partyIdsB))

    const getCriteriaString = (pro: boolean) => {
      let firstPro = this.getYay(pro)
      let secPro = this.getYay(!pro)
      return new AllCriteria("Stemming", new OrFilter([
        new AndFilter([p1EqOr, new CompareCriterica("Soort", c.eq, firstPro)]),
        new AndFilter([p2EqOr, new CompareCriterica("Soort", c.eq, secPro)]),
        new NotCriterica(allPartiesEqOr)
      ]))
    }

    // if all party either: in group a and yay, or in group b and nay, or not in all parties
    // or all party either: in group a and nay, or in group b and yay, or not in all parties

    // not in all parties so when party is in a but did not vote it will be excluded,
    // or if in a and said no it will fail and also be excluded
    let p1For = getCriteriaString(true)
    let p2For = getCriteriaString(false)
    table.filter = new AndFilter([table.filter!, new OrFilter([p1For, p2For])])
    return table;
  }

  getDecisionsByOpposingAll(partyIds: string[]): Table {
    let table = this.getTableOfDecisions()

    const partiesIn = new InCriterica("Fractie_Id", partyIds)
    const partiesNotIn = new NotCriterica(partiesIn)

    // all in and yay/nay or all not in and nay/yay
    let getCriteriaString = (pro: boolean) => {
      return new AllCriteria("Stemming",
        new OrFilter([
          new AndFilter([partiesIn, new CompareCriterica("Soort", c.eq, this.getYay(pro))]),
          new AndFilter([partiesNotIn, new CompareCriterica("Soort", c.eq, this.getYay(!pro))])
        ]))
    }

    let critContra = getCriteriaString(false)
    let critPro = getCriteriaString(true)

    table.filter = new AndFilter([table.filter!,
    new OrFilter([
      critContra,
      critPro
    ])])
    return table;
  }

  getDecisionsByTogetherness(partyIds: string[]): Table {
    let table = this.getTableOfDecisions()

    const partiesIn = new InCriterica("Fractie_Id", partyIds)
    const partiesNotIn = new NotCriterica(partiesIn)

    // all parties in goup and same vote yay/nay or not in the group
    let getCriteriaString = (pro: boolean) => {
      return new AllCriteria("Stemming",
        new OrFilter([
          new AndFilter([partiesIn, new CompareCriterica("Soort", c.eq, this.getYay(pro))]),
          partiesNotIn
        ]))
    }

    let critContra = getCriteriaString(false)
    let critPro = getCriteriaString(true)

    table.filter = new AndFilter([table.filter!, new OrFilter([
      critContra,
      critPro
    ])])

    return table;
  }
}
