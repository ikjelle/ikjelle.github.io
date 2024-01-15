import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StateService } from 'src/app/services/state.service';

interface IPreset {
  name: string;
  start?: string;
  end?: string;
}

@Component({
  selector: 'app-period-picker',
  templateUrl: './period-picker.component.html',
  styleUrls: ['./period-picker.component.css']
})
export class PeriodPickerComponent implements OnInit {

  @Input() start?: string = undefined;
  @Input() end?: string = undefined;

  @Output() startChange = new EventEmitter<string | undefined>();
  @Output() endChange = new EventEmitter<string | undefined>();
  @Output() update = new EventEmitter();

  elections: IPreset[] = [
    // Verkiezingen
    {
      name: "Verkiezing 2023",
      start: new Date(2023, 11, 7).toISOString().slice(0, 10),
      end: undefined,
    },
    {
      name: "Verkiezing 2021",
      start: new Date(2021, 2, 32).toISOString().slice(0, 10),
      end: new Date(2023, 11, 6).toISOString().slice(0, 10),
    },
    {
      name: "Verkiezing 2017",
      start: new Date(2017, 2, 24).toISOString().slice(0, 10),
      end: new Date(2021, 2, 31).toISOString().slice(0, 10),
    },
    // Formaties
  ];

  presets: IPreset[] = [...this.elections];

  selectedSet = null;
  hasInitialized: boolean = false;
  state: any;

  constructor(private stateService: StateService) { }

  ngOnInit() {
    this.state = this.stateService.periodState$.getValue() || {};
    // set start to the lastest known election
    this.start = this.start ?? this.state.periodStart
    this.end = this.end ?? this.state.periodEnd
    if (Object.keys(this.state).length == 0) {
      let now = new Date().toISOString().slice(0, 10);
      for (let e of this.elections) {
        if ((e.start != undefined && e.start < now) && (e.end == undefined || e.end > now)) {
          this.setStart(e.start);
        }
      }
    }
  }

  setSelected(set: any) {
    this.selectedSet = set;
    this.setStart(set.start);
    this.setEnd(set.end);
    this.update.emit();
  }
  setStart(start: any) {
    this.start = start;
    this.startChange.emit(this.start);
    this.state.periodStart = this.start;
    this.stateService.periodState$.next(this.state);
  }
  setEnd(end: any) {
    this.end = end;
    this.endChange.emit(this.end);
    this.state.periodEnd = this.end;
    this.stateService.periodState$.next(this.state);
  }

  periodStartDateChange(event: any) {
    this.setStart(event.target.value);
    this.update.emit();
    this.selectedSet = null;
  }
  periodEndDateChange(event: any) {
    this.setEnd(event.target.value);
    this.update.emit();
    this.selectedSet = null;
  }
}
