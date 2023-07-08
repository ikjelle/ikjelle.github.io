import { Injectable, Type } from '@angular/core';
import { Case, Document, Party, Result, Vote } from './OData/models/models';
import { SearchParty } from "../pages/voting-results/search-party";
import { AllCriteria, AndFilter, AnyCriteria, c, CompareCriterica, CustomCriteria, Filter, InCriterica, NotCriterica, OrFilter, TextCriteria, TF } from './OData/query-generator/filters';
import { Table } from './OData/query-generator/Table';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ResultService {

  constructor() { }

  // generates the tables and selects the application needs
  generateResultTable() {
    return new Table(new Result(), {
      expansions: [
        new Table(new Case(), {
          expansions: [
            new Table(new Document())
          ]
        }),
        new Table(new Vote())
      ],
      count: true,
    })
  }

  getYay(pro: boolean) {
    return pro ? "'Voor'" : "'Tegen'"
  }

  getCheckedTypes(resultTypes: Array<any>) {
    return resultTypes.filter(t => t.checked == true)
  }

  getUncheckedTypes(resultTypes: Array<any>) {
    return resultTypes.filter(t => t.checked == false)
  }

  getUrlOfParties(startDateString: string | null, endDateString: string | null) {
    let table = new Table(new Party)

    // Not doing this.
    // Its impossible to know which party was there or not.
    // the data of the party only shows when it first got added and when it ended. You can't really know anything else and it fucks up the results anyway.
    // But here is the implementation anyway, replace the first filter with datinactivefilter.
    let startDate = startDateString ? new Date(startDateString) : null;
    let endDate = endDateString ? new Date(endDateString) : new Date();
    // if period is a scale of numbers like 0 - 9 We should see it like this:
    // period I search for is 3 - 7
    // party a = 0 - 9 (null)  MATCH
    // party b = 1 - 5  MATCH
    // party c = 5 - 9  MATCH
    // party d = 1 - 2  No Match
    // party d = 8 - 9 (null)  No Match
    let filters = []
    if (endDate != null) {
      filters.push(new CompareCriterica("DatumActief", c.le, endDate.toISOString()));
    }
    if (startDate != null) {
      filters.push(
        new OrFilter([
          new CompareCriterica("DatumInactief", c.ge, startDate.toISOString()),
          new CompareCriterica("DatumInactief", c.eq, "null")
        ]))
    }

    table.filter = new AndFilter(
      [
        ...filters,
        new CompareCriterica("Afkorting", c.ne, "null")
      ]
    )

    return table.generateUrl()
  }

  getUrlOfResultById(caseId: string) {
    const request = this.generateResultTable()
    const filters = new AndFilter();

    filters.addFilter(new AnyCriteria("Zaak", new CompareCriterica("Id", c.eq, caseId)))
    filters.addFilter(new AnyCriteria("Stemming", new CompareCriterica("Id", c.ne, "null")))
    // set the filters
    request.filter = filters
    // create the request url and return it
    return request.generateUrl()
  }

  // get all results with the current information
  getUrlOfResultsByGroupedParties(parties1: SearchParty[], parties2: SearchParty[], resultTypes: any[], startDateString: string | null, endDateString: string | null, searchTerm: string | null): string {
    // get party names
    let p1 = []
    let p2 = []
    for (const pa1 of parties1) {
      p1.push(pa1.searchTerm)
    }
    for (const pa2 of parties2) {
      p2.push(pa2.searchTerm)
    }
    let startDate = startDateString ? new Date(startDateString) : null;
    let endDate = endDateString ? new Date(endDateString) : new Date();

    // the base
    const request = this.generateResultTable()
    const filters = new AndFilter();

    //    add filters per crit
    let types = this.getCheckedTypes(resultTypes)
    // if its smaller check on type, if they are equal all types will already be there
    if (types.length < resultTypes.length) {
      const typeNames = types.map(t => t.name)
      // The in clause uses less nodes, so its way better than multiple eq
      filters.addFilter(new AllCriteria("Zaak", new InCriterica("Soort", typeNames)))
    }

    // todo: maybe make an inverse query so we can have the smallest url.
    let dateFilters = [];
    if (startDate) {
      dateFilters.push(
        new CompareCriterica("GewijzigdOp", c.ge, startDate.toISOString()))
    }
    dateFilters.push(new CompareCriterica("GewijzigdOp", c.le, endDate.toISOString()))
    filters.addFilter(new AndFilter(dateFilters))
    if (searchTerm != null || searchTerm == "") {
      filters.addFilter(new AllCriteria("Zaak", new OrFilter([new TextCriteria(TF.CO, "Onderwerp", searchTerm), new TextCriteria(TF.CO, "Titel", searchTerm)])));
    }
    if (p1.length == 0 && p2.length == 0) {
      // show error or display just the latest results
    } else {
      // so the somewhat realistic option without a second query is to count from the start of the newest party
      // DISCLAIMER: the party, most of the time, gets created days before the actor actually goes to vote.
      // let joinDate = '1900-01-01T00:00:00+01:00'
      // for (const p of [...parties1, ...parties2]) {
      //   if (p.dateActive > joinDate) {
      //     joinDate = p.dateActive
      //   }
      // }

      // do logic based on if 1 or 2 boxes are used
      if (p1.length == 0 || p2.length == 0) {

        let voteOnly = p1.length == 0

        let parties = [...p1, ...p2]

        const partiesEqOr = new InCriterica("ActorFractie", parties)
        const partiesNeAnd = new AndFilter(
          parties.map(p => new CompareCriterica("ActorFractie", c.ne, "'" + p + "'"))
        )

        // set the method on the variable so it can be called twice
        let getCriteriaString = null
        if (voteOnly) {
          getCriteriaString = (pro: boolean) => {
            // possibly clone the parties criteria, but filters are data objects they won't change
            return new AllCriteria("Stemming",
              new OrFilter([
                new AndFilter([partiesEqOr, new CompareCriterica("Soort", c.eq, this.getYay(pro))]),
                new AndFilter([partiesNeAnd, new CompareCriterica("Soort", c.eq, this.getYay(!pro))])
              ]))
          }
        } else {
          getCriteriaString = (pro: boolean) => {
            return new AllCriteria("Stemming",
              new OrFilter([
                new AndFilter([partiesEqOr, new CompareCriterica("Soort", c.eq, this.getYay(pro))]),
                partiesNeAnd
              ]))
          }
        }

        let critContra = getCriteriaString(false)
        let critPro = getCriteriaString(true)

        filters.addFilter(new OrFilter(
          [
            critContra,
            critPro
          ]
        ))
      } else {
        const p1EqOr = new InCriterica("ActorFractie", p1)
        const p2EqOr = new InCriterica("ActorFractie", p2)
        const allPartiesEqOr = new InCriterica("ActorFractie", p1.concat(p2))

        const getCriteriaString = (pro: boolean) => {
          let firstPro = this.getYay(pro)
          let secPro = this.getYay(!pro)
          return new AllCriteria("Stemming", new OrFilter([
            new AndFilter([p1EqOr, new CompareCriterica("Soort", c.eq, firstPro)]),
            new AndFilter([p2EqOr, new CompareCriterica("Soort", c.eq, secPro)]),
            new NotCriterica(allPartiesEqOr)
          ]))
        }

        let p1For = getCriteriaString(true)
        let p2For = getCriteriaString(false)
        filters.addFilter(new OrFilter([p1For, p2For]))
      }
    }

    // Hoofdelijk (per head) is not interesting for my query
    filters.addFilter(new AnyCriteria("Stemming", new CompareCriterica("Id", c.ne, "null")))

    // set the filters
    request.filter = filters
    // create the request url and return it
    return request.generateUrl()
  }
}
