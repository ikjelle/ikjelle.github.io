import { AndFilter, CompareCriterica, Filter, c } from "./filters";
import { MetaDataModelKey, MetaDataSelectKey } from "../models/models";
import 'reflect-metadata';

export class Table {
    apiBase: string = "https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0/";
    select?: string[];
    expansions?: Table[];
    // maybe auto add filter so that removed entities will not be in results
    filter?: Filter;
    table = "";
    count = false;

    orderBy = false;
    orderByProp: string = "";
    orderByAscending = false;
    removeDeleted = true;

    public constructor(model: any, init?: Partial<Table>) {
        this.select = Reflect.getMetadata(MetaDataSelectKey, model);
        // overwrite select for custom select
        // I would love for this model to be generics, but thats not possible in typescript
        Object.assign(this, init);
        this.table = Reflect.getOwnMetadata(MetaDataModelKey, model.constructor)
    }

    getSelect() {
        if (this.select && this.select.length > 0) {
            return "$select=" + this.select.join(",");
        }
        return "";
    }

    getExpansions() {
        if (this.expansions && this.expansions.length > 0) {
            var expand = "$expand=";

            var expansionCount = this.expansions.length;
            var text = "";

            for (let n = 0; n < expansionCount; n++) {
                text += this.expansions[n].generateExpansion();
                if (n + 1 < expansionCount) {
                    text += ",";
                }
            }
            expand += text;
            return expand;
        }
        return "";
    }

    getFilter() {
        if (this.removeDeleted) {
            // make sure deleted rows are not in results
            let existFilter = new CompareCriterica("Verwijderd", c.eq, false)
            if (this.filter) {
                this.filter = new AndFilter([this.filter, existFilter]);
            } else {
                this.filter = existFilter;
            }
        }
        if (this.filter) {
            return "$filter=" + this.filter.toText();
        }
        return "";
    }

    getCount() {
        if (this.count) {
            return "$count=true"
        }
        return "";
    }

    generateTable(delimter: string) {
        let parts = []

        parts.push(this.getSelect());
        parts.push(this.getExpansions()!);
        parts.push(this.getFilter()!);
        parts.push(this.getCount()!);
        parts.push(this.generateOrderBy()!);

        parts = parts.filter(p => p.length > 0)

        return parts.join(delimter)
    }

    generateExpansion() {
        var navigation = "(";

        navigation += this.generateTable(";")

        navigation += ")";
        return this.table + (navigation.length > 2 ? navigation : "");
    }

    generateOrderBy(): string {
        if (!this.orderBy) return "";
        let orderByStatement = "$orderby="
        orderByStatement += this.orderByProp + " "
        orderByStatement += this.orderByAscending ? "asc" : "desc"
        return orderByStatement;
    }

    generateUrl(): string {
        var url = "";
        url += this.table;
        url += "?";

        url += this.generateTable("&")

        return this.apiBase + url;
    }
}