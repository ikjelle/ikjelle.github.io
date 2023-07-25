import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CaseTypeCheckBox, AllCaseTypes } from 'src/app/services/OData/models/result-types';

@Component({
  selector: 'app-case-type-picker',
  templateUrl: './case-type-picker.component.html',
  styleUrls: ['./case-type-picker.component.css']
})
export class CaseTypePickerComponent implements OnInit {

  @Input() caseTypes!: CaseTypeCheckBox[]
  @Output() caseTypesChange = new EventEmitter<CaseTypeCheckBox[]>();
  constructor() { }

  ngOnInit(): void {
    this.caseTypes = AllCaseTypes.filter(rt => rt.enabled)
    this.caseTypesChange.emit(this.caseTypes)
  }

  checkAllTypes(event: any) {
    if (event.target.checked) {
      for (const resultType of this.caseTypes) {
        resultType.checked = true
      }
    } else {
      for (const resultType of this.caseTypes) {
        resultType.checked = false
      }
    }
    this.caseTypesChange.emit(this.caseTypes)
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
    type.checked = !type.checked
    this.caseTypesChange.emit(this.caseTypes)
  }

}
