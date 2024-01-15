import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CaseTypePickerComponent } from 'src/app/components/case-type-picker/case-type-picker.component';
import { PeriodPickerComponent } from 'src/app/components/period-picker/period-picker.component';
import { Decision, Party } from 'src/app/services/OData/models/models';
import { ODataResponse } from 'src/app/services/OData/models/response';
import { ResultService } from 'src/app/services/result.service';
import { StateService } from 'src/app/services/state.service';

@Component({
  selector: 'app-decider',
  templateUrl: './decider.component.html',
  styleUrls: ['./decider.component.css']
})
export class DeciderComponent implements OnDestroy {

  @ViewChild(CaseTypePickerComponent) caseTypePickerComp!: CaseTypePickerComponent
  @ViewChild(PeriodPickerComponent) periodPickerComp!: PeriodPickerComponent;

  get periodStart(): string | undefined {
    return this.periodPickerComp.start;
  }
  get periodEnd(): string | undefined {
    return this.periodPickerComp.end;
  }
  parties: Party[] = [];
  partyId?: string;
  selectedPartyId?: string;

  baseUrl: string | null = null;
  currentIndex: number = 1;

  totalCount?: number;
  not: any;

  pollingThreads: any;
  data: { [index: number]: Decision[] } = {}

  subs: Subscription[] = [];

  constructor(private stateService: StateService, private resultsService: ResultService, private http: HttpClient) { }

  ngAfterViewInit(): void {
    this.updateAvailableParties();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  setParty(event: any) {
    this.selectedPartyId = event.target.value
  }

  updateAvailableParties() {
    let url = this.resultsService.getParties(this.periodStart, this.periodEnd).generateUrl()

    // TODO: catch CORS
    this.http.get<ODataResponse<Party>>(url).
      subscribe((response) => {
        this.stateService.UrlSucceed();
        this.parties = response.value;
      })
  }

  getDeciderDecisions() {
    this.subs.forEach(s => s.unsubscribe());
    this.subs = []
    // haal grootste partije groote op in die periode,
    // pak deze and ge 76-partijGrootte le 75+partijGrootte
    // maar als veel mensen niet gestemd hebben kan het dus anders zijn.
    // haal data op
    // op frontend kijk of wanneer de inverse van die partije het resultaat veranderd van de stemming\
    // wanneer 0 verschillen haal op voor volgenda pagina.
    // anders, activeer knop met meer resultaten.
    let party = this.parties.find(p => p.Id == this.selectedPartyId)!
    this.partyId = party.Id;
    let start = this.resultsService.getLatestStartDate([this.periodStart!, party.DatumActief])
    let end = this.resultsService.getEarliestEndDate([this.periodEnd!, party.DatumInactief!, this.resultsService.formatDate(new Date())])

    let filters = [];
    // add cases filter
    let caseFilterText = ""
    let caseFilter = this.resultsService.getDecisionsByCaseType(this.caseTypePickerComp.caseTypes).filter
    if (caseFilter) {
      caseFilterText = `filter(${"Besluit/" + caseFilter?.toText()})/`;
    }

    if (start) filters.push(`Besluit/Agendapunt/Activiteit/Datum ge ${start}`);
    if (end) filters.push(`Besluit/Agendapunt/Activiteit/Datum le ${end}`);
    filters.push(`(Soort eq 'Tegen' or Soort eq 'Voor' or selected eq true)`);

    let getUrl = ""
    // compute the party that is selected with bool
    // filter by dates, this also only shows elections where the party voted. Otherways logic fails
    // groupby case, vote type and party selected
    // this way i have the different votes and party vote isolated
    // groupby case, party selectes
    // now i know 2 values on each case. 1 high and 1 lower. (or if the same it doesn't matter) and the party vote that has both the same as it never joined with other data
    // groupby case
    // add the pvote to the object. the pvote is the lowest of the highest of the votes and the selected party vote. This will work until we have a party with around 50 seats, or a little less if alot of votes are not used.
    getUrl = `https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0/Stemming?$apply=` +
      `${caseFilterText}` +
      `compute((Fractie_Id eq ${this.partyId}) as selected)` +
      `/filter(` + `${filters.join(" and ")}` + `)` +
      `/groupby((Besluit_Id, Besluit/Agendapunt/Activiteit/Datum, Soort, selected), aggregate(FractieGrootte with sum as Total))` +
      `/groupby((Besluit_Id,Besluit/Agendapunt/Activiteit/Datum, selected), aggregate(Total with min as lvote, Total with max as  hvote))` +
      `/groupby((Besluit_Id,Besluit/Agendapunt/Activiteit/Datum), aggregate( hvote with min as pvote, lvote with max as lvote, hvote with max as hvote))` +
      `&$filter=hvote sub lvote le pvote and hvote add lvote le 150&$orderby=Besluit/Agendapunt/Activiteit/Datum DESC&$count=true`
    // filter out all entries that still did not meet requirements, like a vote wont pass if value is == so those cases are in the data

    // ideally join this set of data with the decisions ids, but idk if thats possible rn

    this.currentIndex = 1;
    this.data = {};
    this.totalCount = undefined;
    this.baseUrl = getUrl;
    this.getDecisionIds(getUrl, this.currentIndex);
  }
  getDecisionIds(url: string, index: number) {
    this.pollingThreads = 1;
    this.not = 0;
    interface data {
      Besluit_Id: string;
      pvote: number;
      hvote: number;
      lvote: number;
    }
    if (index > 1) {
      url += "&$skip=" + (250 * (index - 1))
    }
    this.http.get<ODataResponse<data>>(url).subscribe((response) => {
      var ids = response.value.flatMap(s => s.Besluit_Id);
      // this.ids.push(...response.value.flatMap(s => s.Besluit_Id));
      this.totalCount = response['@odata.count'] ?? 0;

      this.getCasesFromIds(ids, index);
      this.pollingThreads--;
    });
  }

  getIndexes() {
    if (this.totalCount == 0) return []
    return Array.from({ length: (Math.ceil(this.totalCount! / 250)) }, (_, i) => i + 1)
  }
  getResultsOfActivePage(): Decision[] {
    return this.data[this.currentIndex];
  }
  getNextPage(index: number) {
    this.currentIndex = index;
    this.getDecisionIds(this.baseUrl!, index);
  }

  getCasesFromIds(ids: string[], index: number) {
    // for every x in ids
    const chunkSize = 30;

    var dec = (localIndex: number) => {
      const i = localIndex * chunkSize;
      const chunkIds = ids.slice(i, i + chunkSize);
      let table = this.resultsService.getDecisionByDecisionIds(chunkIds)
      let url = table.generateUrl();
      let sub = this.http.get<ODataResponse<Decision>>(url).subscribe({
        next: (response) => {
          let data: Decision[] = [];
          response.value.forEach(d => {
            let yayVotes = d.Stemming.filter(s => s.Soort == "Voor" && s.Fractie_Id != this.partyId).reduce((sum, v) => sum + v.FractieGrootte, 0);
            let nayVotes = d.Stemming.filter(s => s.Soort == "Tegen" && s.Fractie_Id != this.partyId).reduce((sum, v) => sum + v.FractieGrootte, 0);
            let partyVotes = d.Stemming.find(s => s.Fractie_Id == this.partyId)?.FractieGrootte!;
            if (
              yayVotes + partyVotes > nayVotes &&
              nayVotes + partyVotes >= yayVotes
            ) data.push(d);
            else this.not++;
          });
          if (!this.data[index]) this.data[index] = []
          this.data[index].push(...data);
          this.pollingThreads--;
        },
        error: err => {
        }
      })
      this.subs.push(sub)
    }
    let j = 0;
    for (let i = 0; i < ids.length; i += chunkSize) {
      dec(j++);
      this.pollingThreads++;
    }
  }

}
