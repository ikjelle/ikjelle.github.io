import { Filter } from "./filters";
import { MetaDataModelKey, MetaDataSelectKey } from "../models/models";
import 'reflect-metadata';

export class Table {
    apiBase: string = "https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0/";
    select?: string[];
    expansions?: Table[];
    filter?: Filter;
    table = "";
    count = false;

    public constructor(model: any, init?: Partial<Table>) {
        this.select = Reflect.getMetadata(MetaDataSelectKey, model);
        // overwrite select for custom select
        // I would love for this model to be generics, but thats not possible in typescript
        Object.assign(this, init);
        this.table = Reflect.getOwnMetadata(MetaDataModelKey, model.constructor)
    }

    getClass<T extends { new(...args: any[]): {} }>(constructor: T) {
        return class extends constructor { }
    }

    getSelect() {
        if (this.select) {
            return "$select=" + this.select.join(",");
        }
        return "";
    }

    getExpansions() {
        if (this.expansions) {
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

        parts = parts.filter(p => p.length > 0)

        return parts.join(delimter)
    }

    generateExpansion() {
        var navigation = "(";

        navigation += this.generateTable(";")

        navigation += ")";
        return this.table + (navigation.length > 2 ? navigation : "");
    }

    generateUrl(orderByDesc = true): string {
        var url = "";
        url += this.table;
        url += "?";
        
        let statements = []
        statements.push(this.generateTable("&"))
        if (orderByDesc) {
            statements.push("$orderby=GewijzigdOp desc");
        }
        url += statements.join("&")

        return this.apiBase + url;
    }
}
