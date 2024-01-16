import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CaseTypeCheckBox, AllCaseTypes } from 'src/app/services/OData/models/result-types';
import { StateService } from 'src/app/services/state.service';

@Component({
  selector: 'app-case-type-picker',
  templateUrl: './case-type-picker.component.html',
  styleUrls: ['./case-type-picker.component.css']
})
export class CaseTypePickerComponent implements OnInit {

  @Input() caseTypes!: CaseTypeCheckBox[]
  @Output() caseTypesChange = new EventEmitter<CaseTypeCheckBox[]>();

  state: any;
  constructor(private stateService: StateService) { }

  ngOnInit(): void {
    this.state = this.stateService.periodState$.getValue() || {};
    this.caseTypes = this.state.caseTypes ?? AllCaseTypes.filter(rt => rt.enabled)
    this.emitCaseTypeChange()
  }

  checkAllTypes(event: any) {
    // make all on or off
    for (const resultType of this.caseTypes) {
      resultType.checked = event.target.checked
    }
    this.emitCaseTypeChange()
  }

  allTypesChecked() {
    for (const resultType of this.caseTypes) {
      if (!resultType.checked) {
        return false;
      }
    }
    return true
  }

  changeTypeChecked(type: any) {
    type.checked = !type.checked // toggle
    this.emitCaseTypeChange()
  }

  emitCaseTypeChange() {
    this.caseTypesChange.emit(this.caseTypes)
    this.state.caseTypes = this.caseTypes
    this.stateService.caseTypesState$.next(this.state)
  }

}
