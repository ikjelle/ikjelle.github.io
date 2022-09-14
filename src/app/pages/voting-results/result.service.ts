import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class ResultService {
  getLatest(): string {
    var request = this.generateDecisionRequest()
    request.filter = new AndFilter([new FilterCriteria("not contains(BesluitTekst, 'Hoofdelijk')"), new FilterCriteria("Stemming/any(a:a/Id ne null)")])

    return request.generateUrl()
  }

  constructor() { }

  formatString(stringToFormat: string, ...args: string[]) {
    args.forEach(arg => {
      stringToFormat = stringToFormat.replace("${}", arg)
    });
    return stringToFormat
  }

  generateComparePartyString(parties: string[], operand: string, andOr: boolean) {
    var line = ""
    let andOrOperand = andOr ? "and" : "or"

    if (!andOr && operand == "eq") {
      let partiesString = "("
      parties.forEach(p => {
        partiesString += this.formatString("'${}',", p)
      })
      partiesString = partiesString.substring(0, partiesString.length - 1)
      partiesString += ")"
      // The in clause uses less nodes, so its way better than multiple eq
      line += this.formatString("a/ActorNaam in ${}", partiesString)
    } else {
      parties.forEach(p => {
        line += this.formatString("a/ActorNaam ${} '${}' ${} ", operand, p, andOrOperand)
      });
      // remove and or part
      line = line.substring(0, line.length - 2 - andOrOperand.length)
    }

    return line
  }



  // Get results where the parties had opposing votes
  getOpposites(parties1: string[], parties2: string[]) {
    var p1EqOr = this.generateComparePartyString(parties1, "eq", false);

    var p2EqOr = this.generateComparePartyString(parties2, "eq", false);

    var allPartiesEqOr = this.generateComparePartyString(parties1.concat(parties2), "eq", false);

    var getCriteriaString = (pro: boolean) => {
      let firstPro = (pro ? "Voor" : "Tegen")
      let secPro = (!pro ? "Voor" : "Tegen")
      return this.formatString("Stemming/all(a:" +
        "( (${}) and a/Soort eq '${}') or " +
        "( (${}) and a/Soort eq '${}') or not (${})" +
        ")",
        p1EqOr, firstPro, p2EqOr, secPro, allPartiesEqOr)
    }

    let p1For = new FilterCriteria(getCriteriaString(true))
    let p2For = new FilterCriteria(getCriteriaString(false))
    var filters = new OrFilter([p1For, p2For])

    var request = this.generateDecisionRequest()
    request.filter = new AndFilter([filters, new FilterCriteria("not contains(BesluitTekst, 'Hoofdelijk')"), new FilterCriteria("Stemming/any(a:a/Id ne null)")])

    return request.generateUrl()
  }

  generateDecisionRequest() {
    return new Table("Besluit", {
      select: [
        "BesluitSoort",
        "GewijzigdOp",
        "StemmingsSoort"
      ],
      expansions: [
        new Table("Zaak", {
          select: [
            "Nummer",
            "Soort",
            "Titel",
            "Onderwerp",
            "Volgnummer", // Would be usefull if I also knew what its following
            "Kabinetsappreciatie"
          ]
        }),
        new Table("Stemming", {
          select: [
            "Soort",
            "FractieGrootte",
            "ActorNaam"
          ]
        })
      ]
    }
    )
  }

  // Get results where the parties where at either side of the result
  getSide(parties: string[]) {
    var partiesEqOr = this.generateComparePartyString(parties, "eq", false);
    var partiesNeAnd = this.generateComparePartyString(parties, "ne", true);

    var getCriteriaString = (pro: boolean) => {
      return this.formatString(
        "Stemming/all(a:" +
        "( (${}) and a/Soort eq '${}' ) or " +
        "(${} and a/Soort eq '${}')" +
        ")",
        partiesEqOr, (pro ? "Voor" : "Tegen"), partiesNeAnd, (!pro ? "Voor" : "Tegen"))
    }

    let critStringContra = getCriteriaString(false)
    let critStringPro = getCriteriaString(true)

    var critPro = new FilterCriteria(critStringPro);
    var critContra = new FilterCriteria(critStringContra);

    // I can only use 1 filter as 2 will overflow the nodes
    // so It should do 2 requests and have both data and use offsets for next requests
    let filters = new OrFilter(
      [
        critContra,
        critPro
      ]
    )

    var request = this.generateDecisionRequest()
    request.filter = new AndFilter([filters, new FilterCriteria("Stemming/any(a:a/Id ne null)")])

    return request.generateUrl()
  }
}

class Table {
  apiBase: string = "https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0/"
  table: string;
  select?: string[];
  expansions?: Table[];
  filter?: Filter;

  public constructor(table: string, init?: Partial<Table>) {
    this.table = table;
    Object.assign(this, init);
  }

  getSelect() {
    if (this.select) {
      return "$select=" + this.select.join(",")
    }
    return ""
  }

  getExpansions() {
    if (this.expansions) {
      var expand = "$expand="

      var expansionCount = this.expansions.length
      var text = ""

      for (let n = 0; n < expansionCount; n++) {
        text += this.expansions[n].generateExpansion()
        if (n + 1 < expansionCount) {
          text += ","
        }
      }
      expand += text
      return expand
    }
    return ""
  }

  getFilter() {
    if (this.filter) {
      return "$filter=" + this.filter.toText()
    }
    return ""
  }

  generateExpansion() {
    var navigation = "("

    var s = this.getSelect()
    if (s != "") {
      navigation += s
      navigation += ";"
    }
    var s = this.getFilter()
    if (s != "") {
      navigation += s
      navigation += ";"
    }
    var s = this.getExpansions()
    if (s != "") {
      navigation += s
      navigation += ";"
    }

    navigation = navigation.slice(0, navigation.length - 1)
    navigation += ")"
    return this.table + (navigation.length > 2 ? navigation : "")
  }

  generateUrl(): string {
    var url = ""
    url += this.table
    url += "?"

    var s = this.getSelect()
    if (s != "") {
      url += s
      url += "&"
    }
    var s = this.getExpansions()
    if (s != "") {
      url += s
      url += "&"
    }
    var s = this.getFilter()
    if (s != "") {
      url += s
      url += "&"
    }

    url += "$orderby=GewijzigdOp desc"

    return this.apiBase + url
  }
}

abstract class Filter {
  abstract toText(): string;
}

class OrFilter extends Filter {
  public constructor(filters: Filter[]) {
    super();
    this.filters = filters
  }
  filters: Filter[] = [];
  toText(): string {
    var text = "("

    var filterCount = this.filters.length
    for (let n = 0; n < filterCount; n++) {
      text += this.filters[n].toText()
      if (n + 1 < filterCount) {
        text += " or "
      }
    }

    text += ")"

    return text;
  }
}

class AndFilter extends Filter {
  public constructor(filters: Filter[]) {
    super();
    this.filters = filters
  }
  filters: Filter[] = [];
  toText(): string {
    var text = "("

    var filterCount = this.filters.length
    for (let n = 0; n < filterCount; n++) {
      text += this.filters[n].toText()
      if (n + 1 < filterCount) {
        text += " and "
      }
    }

    text += ")"

    return text;
  }
}

class FilterCriteria extends Filter {
  public constructor(criteria: string) {
    super();
    this.criteria = criteria
  }
  criteria: string = "";
  toText(): string {
    return this.criteria
  }
}