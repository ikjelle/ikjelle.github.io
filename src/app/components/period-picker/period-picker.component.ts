import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-period-picker',
  templateUrl: './period-picker.component.html',
  styleUrls: ['./period-picker.component.css']
})
export class PeriodPickerComponent implements OnInit {

  @Input() start?: string = new Date(2021, 2, 32).toISOString().slice(0, 10);
  @Input() end?: string = undefined;
  @Output() startChange = new EventEmitter<string | undefined>();
  @Output() endChange = new EventEmitter<string | undefined>();
  @Output() update = new EventEmitter();

  presets = [
    // Verkiezingen
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
  ]

  selectedSet = null;

  constructor() { }

  ngOnInit(): void {
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
  }
  setEnd(end: any) {
    this.end = end;
    this.endChange.emit(this.end);
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
