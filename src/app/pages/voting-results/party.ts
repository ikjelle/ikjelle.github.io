export interface IParty {
    AantalZetels: number
    Afkorting: string
    ApiGewijzigdOp: string
    DatumActief: string
    DatumInactief: string | null
    GewijzigdOp: string
    Id: string
    NaamEN: string
    NaamNL: string
}

export class Party {
    name: string;
    abbreviation: string;
    searchTerm: string;
    dateActive: string;
    constructor(name: string, abbreviation: string, dateActive: string) {
        this.name = name
        this.abbreviation = abbreviation
        this.searchTerm = abbreviation
        this.dateActive = dateActive
    }
}