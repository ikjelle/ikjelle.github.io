import { Party } from "src/app/services/OData/models/models";

export class SearchParty {
    id: string;
    name: string;
    abbreviation: string;
    searchTerm: string;
    dateActive: string;
    dateInactive?: string | null;
    og!: Party
    constructor(id: string, name: string, abbreviation: string, dateActive: string, dateInactive?: string | null) {
        this.id = id;
        this.name = name;
        this.abbreviation = abbreviation;
        this.searchTerm = abbreviation;
        this.dateActive = dateActive;
        this.dateInactive = dateInactive;
        this.setCorrectSearchTerm();
    }

    // Searchterms are mostly the abbreviation but not always, so here are the exceptions
    setCorrectSearchTerm() {
        // ActorFractie does not always use abbreviation, so below are the exceptions
        switch (this.abbreviation) {
            case "GL":
            case "CU":
                this.searchTerm = this.name;
                break;
            case "Gündoğan": // inconsistency in the data
                this.searchTerm = "Gündogan";
                break;
        }
    }
}
