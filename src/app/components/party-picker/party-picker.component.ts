import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Party } from 'src/app/services/OData/models/models';

@Component({
  selector: 'app-party-picker',
  templateUrl: './party-picker.component.html',
  styleUrls: ['./party-picker.component.css']
})
export class PartyPickerComponent implements OnInit {
  getNaming(party: Party) {
    if (this.parties.filter(p => p.Afkorting == party.Afkorting).length >= 2) {
      let running = ""
      const startDate = new Date(party.DatumActief);
      // Check if the date is valid
      const year = startDate.getFullYear();
      const month = startDate.getMonth() + 1; // Months are zero-based, so add 1
      const day = startDate.getDate();
      running = `${day}/${month}/${year}`
      if (party.DatumInactief) {
        const endDate = new Date(party.DatumInactief);
        // Check if the date is valid
        const endYear = endDate.getFullYear();
        const endMonth = endDate.getMonth() + 1; // Months are zero-based, so add 1
        const endDay = endDate.getDate();
        running += `-${endDay}/${endMonth}/${endYear}`
      }

      return `${party.Afkorting} - ${running}`
    }
    return party.Afkorting;
  }

  @Input() parties!: Party[];
  @Input() selectedParty: string | null = null;
  @Output() change = new EventEmitter();

  @Input() disabledIds: string[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  setParty($event: object) {
    this.change.emit($event);
  }

  isDisabled(partyId: string) {
    return this.disabledIds.find(p => p == partyId) != null;
  }
}
