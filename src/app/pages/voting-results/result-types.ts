class ResultTypes {
    name!: string;

    // checklist
    //  wether already checked in filter
    checked?: boolean = false;
    //  priorty in filter
    priority?: number = 0;

    // other data when necessary
}

export const resultTypes: Array<ResultTypes> = [
    {
        name: "Amendement",
        checked: true,
        priority: 95,
    },
    { name: "Artikelen/onderdelen (wetsvoorstel)" },
    {
        name: "Begroting",
        checked: true,
        priority: 90,
    },
    {
        name: "Brief Europese Commissie",
    },
    {
        name: "Brief Kamer",
    },
    {
        name: "Brief commissie",
    },
    {
        name: "Brief derden",
    },
    {
        name: "Brief regering",
    },
    {
        name: "Brief van lid/fractie/commissie",
    },
    {
        name: "EU-voorstel",
    },
    {
        name: "Initiatiefnota",
    },
    {
        name: "Initiatiefwetgeving",
    },
    {
        name: "Interpellatie",
    },
    {
        name: "Lijst met EU-voorstellen",
    },
    {
        name: "Mondelinge vragen",
    },
    {
        name: "Motie",
        checked: true,
        priority: 90,
    },
    {
        name: "Nationale ombudsman",
    },
    {
        name: "Netwerkverkenning",
    },
    {
        name: "Nota naar aanleiding van het (nader) verslag",
    },
    {
        name: "Nota van wijziging",
    },
    {
        name: "Overig",
    },
    {
        name: "PKB/Structuurvisie",
    },
    {
        name: "Parlementair onderzoeksrapport",
    },
    {
        name: "Position paper",
    },
    {
        name: "Rapport/brief Algemene Rekenkamer",
    },
    {
        name: "Rondvraagpunt procedurevergadering",
    },
    {
        name: "Schriftelijke vragen",
    },
    {
        name: "Stafnotitie",
    },
    {
        name: "Verdrag",
        checked: true,
        priority: 90,
    },
    {
        name: "Verzoek bij commissie-regeling van werkzaamheden",
    },
    {
        name: "Verzoek bij regeling van werkzaamheden",
    },
    {
        name: "Verzoekschrift",
    },
    {
        name: "Voordrachten en benoemingen",
    },
    {
        name: "Wetenschappelijke factsheet",
    },
    {
        name: "Wetenschapstoets",
    },
    {
        name: "Wetgeving",
        checked: true,
        priority: 90,
    },
    {
        name: "Wijziging RvO",
    },
    {
        name: "Wijzigingen voorgesteld door de regering",
    },
];
