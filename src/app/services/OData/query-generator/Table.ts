import { Filter } from "./filters";
import { MetaDataModelKey, MetaDataSelectKey } from "../models/models";
import 'reflect-metadata';

export class Table {
    apiBase: string = "https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0/";
    select?: string[];
    expansions?: Table[];
    filter?: Filter;
    table = "";

    public constructor(model: any, init?: Partial<Table>) {
        this.select = Reflect.getMetadata(MetaDataSelectKey, model);
        // overwrite select for custom select
        Object.assign(this, init);
        this.table = Reflect.getOwnMetadata(MetaDataModelKey, model.constructor)
    }

    getClass<T extends { new(...args: any[]): {} }>(constructor: T) {
        return class extends constructor {
        }
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

    generateExpansion() {
        var navigation = "(";

        var s = this.getSelect();
        if (s != "") {
            navigation += s;
            navigation += ";";
        }
        var s = this.getFilter();
        if (s != "") {
            navigation += s;
            navigation += ";";
        }
        var s = this.getExpansions();
        if (s != "") {
            navigation += s;
            navigation += ";";
        }

        navigation = navigation.slice(0, navigation.length - 1);
        navigation += ")";
        return this.table + (navigation.length > 2 ? navigation : "");
    }

    generateUrl(): string {
        var url = "";
        url += this.table;
        url += "?";

        var s = this.getSelect();
        if (s != "") {
            url += s;
            url += "&";
        }
        var s = this.getExpansions();
        if (s != "") {
            url += s;
            url += "&";
        }
        var s = this.getFilter();
        if (s != "") {
            url += s;
            url += "&";
        }

        // should be an option
        url += "$orderby=GewijzigdOp desc&$count=true";

        return this.apiBase + url;
    }
}
