import { TestBed } from '@angular/core/testing';

import { ResultService } from './result.service';

describe('ResultService', () => {
  let service: ResultService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Opposite party should create', () => {
    let p1 = ["VVD"]
    let p2 = ["D66"]
    let url = service.getOpposites(p1, p2);
    
    expect(url).toBe("https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0/Besluit?$select=BesluitSoort,GewijzigdOp&$expand=Zaak($select=Nummer,Soort,Titel,Onderwerp,Volgnummer,Kabinetsappreciatie;),Stemming($select=Soort,FractieGrootte,ActorNaam;)&$filter=((Stemming/all(a:( (a/ActorNaam eq 'VVD') and a/Soort eq 'Voor') or ( (a/ActorNaam eq 'D66') and a/Soort eq 'Tegen') or not (a/ActorNaam eq 'VVD' or a/ActorNaam eq 'D66')) or Stemming/all(a:( (a/ActorNaam eq 'VVD') and a/Soort eq 'Tegen') or ( (a/ActorNaam eq 'D66') and a/Soort eq 'Voor') or not (a/ActorNaam eq 'VVD' or a/ActorNaam eq 'D66'))) and not contains(BesluitTekst, 'Hoofdelijk') and Stemming/any(a:a/Id ne null))&$orderby=GewijzigdOp desc")
  })

  it('One side should create', () => {
    let coalition = [
      "VVD",
      "D66",
      "CDA",
      "ChristenUnie"
    ]
    let url = service.getSide(coalition);

    expect(url).toBe("https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0/Besluit?$select=BesluitSoort,GewijzigdOp&$expand=Zaak($select=Nummer,Soort,Titel,Onderwerp,Volgnummer,Kabinetsappreciatie;),Stemming($select=Soort,FractieGrootte,ActorNaam;)&$filter=((Stemming/all(a:( (a/ActorNaam eq 'VVD' or a/ActorNaam eq 'D66' or a/ActorNaam eq 'CDA' or a/ActorNaam eq 'ChristenUnie') and a/Soort eq 'Tegen' ) or (a/ActorNaam ne 'VVD' and a/ActorNaam ne 'D66' and a/ActorNaam ne 'CDA' and a/ActorNaam ne 'ChristenUnie' and a/Soort eq 'Voor'))) and Stemming/any(a:a/Id ne null))&$orderby=GewijzigdOp desc")
  })
});
