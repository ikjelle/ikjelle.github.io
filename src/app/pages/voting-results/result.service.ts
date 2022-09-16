import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class ResultService {


  constructor() { }

  // generates the tables and selects the application needs
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

  getCheckedTypes(resultTypes: Array<any>) {
    return resultTypes.filter(t => t.checked == true)
  }

  getUncheckedTypes(resultTypes: Array<any>) {
    return resultTypes.filter(t => t.checked == false)
  }

  // get all results with the current information
  getUrl(p1: string[], p2: string[], resultTypes: any[]): string {
    // the base
    var request = this.generateDecisionRequest()
    var filters = new AndFilter();

    //    add filters per crit
    let types = this.getCheckedTypes(resultTypes)
    // if its smaller check on type, if they are equal all types will already be there
    if (types.length < resultTypes.length) {
      let typesListString = "("
      types.forEach(tp => {
        typesListString += this.formatString("'${}',", tp.name)
      })
      typesListString = typesListString.substring(0, typesListString.length - 1)
      typesListString += ")"
      // The in clause uses less nodes, so its way better than multiple eq
      let line = this.formatString("a/Soort in ${}", typesListString)

      let crit = this.formatString(
        "Zaak/all(a:" +
        line +
        ")"
      )

      filters.addFilter(new FilterCriteria(crit))
    }
    // todo: maybe make an inverse query so we can have the smallest url.

    if (p1.length == 0 && p2.length == 0) {
      // show error or display just the latest results

    } else if (p1.length == 0 || p2.length == 0) {
      let parties = [...p1, ...p2]
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
      filters.addFilter(new OrFilter(
        [
          critContra,
          critPro
        ]
      ))
    } else {
      var p1EqOr = this.generateComparePartyString(p1, "eq", false);

      var p2EqOr = this.generateComparePartyString(p2, "eq", false);

      var allPartiesEqOr = this.generateComparePartyString(p1.concat(p2), "eq", false);

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
      filters.addFilter(new OrFilter([p1For, p2For]))
    }

    // Hoofdelijk (per head) is not interesting for my query
    filters.addFilters([
      // new FilterCriteria("not contains(BesluitTekst, 'Hoofdelijk')"), "./node_modules/@angular/material/prebuilt-themes/pink-bluegrey.css",

      new FilterCriteria("Stemming/any(a:a/Id ne null)")
    ])

    // set the filters
    request.filter = filters
    // create the request url and return it
    return request.generateUrl()
  }


  formatString(stringToFormat: string, ...args: string[]) {
    args.forEach(arg => {
      stringToFormat = stringToFormat.replace("${}", arg)
    });
    return stringToFormat
  }

  // TODO: change this in more generic criteria string for var
  // as checking if certain var is in list could be usefull
  // use if in list as multiple eq use loads of nodes
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

    // should be an option
    url += "$orderby=GewijzigdOp desc"

    return this.apiBase + url
  }
}

abstract class Filter {
  abstract toText(): string;
}

abstract class CompositeFilter {
  filters: Filter[] = [];
  public constructor(filters: Filter[] = []) {
    this.filters = filters
  }
  addFilter(filter: Filter) {
    this.filters.push(filter)
  }
  addFilters(filters: Filter[]) {
    this.filters.push(...filters)
  }
}

class OrFilter extends CompositeFilter {
  public constructor(filters: Filter[] = []) {
    super(filters);
  }
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

class AndFilter extends CompositeFilter {
  public constructor(filters: Filter[] = []) {
    super(filters);
  }
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