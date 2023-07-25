export class CaseTypeCheckBox {
    name!: string;

    public constructor(init?: Partial<CaseTypeCheckBox>) {
        Object.assign(this, init);
    }

    // checklist
    enabled: boolean = true
    checked: boolean = false;
    //  priorty in filter
    priority: number = 0;

    // other data when necessary
}

// Keeping this kinda seperate, so its easier to copy
const datalist: Array<any> = [
    {
        name: "Amendement",
        priority: 94,
    },
    {
        name: "Artikelen/onderdelen (wetsvoorstel)",
        enabled: false, // Not a result, also very old data so not sure if this means anything
    },
    {
        name: "Begroting",
        priority: 93,
    },
    {
        name: "Brief Europese Commissie",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Brief Kamer",
    },
    {
        name: "Brief commissie",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Brief derden",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Brief regering",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Brief van lid/fractie/commissie",
    },
    {
        name: "EU-voorstel",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Initiatiefnota",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Initiatiefwetgeving",
        priority: 92,
    },
    {
        name: "Interpellatie",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Lijst met EU-voorstellen",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Mondelinge vragen",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Motie",
        checked: true,
        priority: 99,
    },
    {
        name: "Nationale ombudsman",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Netwerkverkenning",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Nota naar aanleiding van het (nader) verslag",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Nota van wijziging",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Overig",
        priority: -10,
    },
    {
        name: "PKB/Structuurvisie",
        priority: -9,
    },
    {
        name: "Parlementair onderzoeksrapport",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Position paper",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Rapport/brief Algemene Rekenkamer",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Rondvraagpunt procedurevergadering",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Schriftelijke vragen",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Stafnotitie",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Verdrag",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Verzoek bij commissie-regeling van werkzaamheden",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Verzoek bij regeling van werkzaamheden",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Verzoekschrift",
    },
    {
        name: "Voordrachten en benoemingen",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Wetenschappelijke factsheet",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Wetenschapstoets",
        enabled: false, // empty results as of 20/03/2023
    },
    {
        name: "Wetgeving",
        priority: 95,
    },
    {
        name: "Wijziging RvO",
        priority: 93,
    },
    {
        name: "Wijzigingen voorgesteld door de regering",
        priority: 93,
    },
];

export const AllCaseTypes: Array<CaseTypeCheckBox> = datalist.map(part => { return new CaseTypeCheckBox(part) })