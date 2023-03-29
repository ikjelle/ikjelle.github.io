import 'reflect-metadata';
export const MetaDataModelKey = 'model'
export const MetaDataSelectKey = 'select'

function model(table: string) {
    return function (target: any) {
        Reflect.defineMetadata(MetaDataModelKey, table, target);
    }
}
// s for select
function s(target: any, propertyKey: string) {
    const metadataList = Reflect.getOwnMetadata(MetaDataSelectKey, target) || [];
    metadataList.push(propertyKey);
    Reflect.defineMetadata(MetaDataSelectKey, metadataList, target);
}

@model('Besluit')
export class Result {
    @s
    StemmingsSoort!: string;
    @s
    BesluitSoort!: string;
    @s
    GewijzigdOp!: string;

    Stemming!: Vote[];
    Zaak!: Case[];
}

@model("Stemming")
export class Vote {
    @s
    Soort!: string;
    @s
    FractieGrootte!: number;
    @s
    ActorNaam!: string;
    @s
    ActorFractie!: string;
}

@model("Zaak")
export class Case {
    @s
    Id!: string;
    @s
    Kabinetsappreciatie!: string;
    @s
    Nummer!: string;
    @s
    Onderwerp!: string;
    @s
    Soort!: string;
    @s
    Titel!: string;
    @s
    Volgnummer!: number;

    Document!: Document[];
}

@model("Document")
export class Document {
    @s
    DocumentNummer!: string;
}

@model("Fractie")
export class Party {
    @s
    AantalZetels!: number;
    @s
    Afkorting!: string;
    @s
    ApiGewijzigdOp!: string;
    @s
    DatumActief!: string;
    @s
    DatumInactief!: string | null;
    @s
    GewijzigdOp!: string;
    @s
    Id!: string;
    @s
    NaamEN!: string;
    @s
    NaamNL!: string;
}