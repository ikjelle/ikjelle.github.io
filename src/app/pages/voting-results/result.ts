export interface Result {
    StemmingsSoort: string;
    BesluitSoort: string;
    GewijzigdOp: string;
    Stemming: Stemming[]
    Zaak: Zaak[]
}

export interface Stemming {
    Soort: string;
    FractieGrootte: number;
    ActorNaam: string;
    ActorFractie: string;
}

export interface Zaak {
    Kabinetsappreciatie: string;
    Nummer: string;
    Onderwerp: string;
    Soort: string;
    Titel: string;
    Volgnummer: number;
}