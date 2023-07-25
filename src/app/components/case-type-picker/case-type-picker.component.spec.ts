import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseTypePickerComponent } from './case-type-picker.component';

describe('CaseTypePickerComponent', () => {
  let component: CaseTypePickerComponent;
  let fixture: ComponentFixture<CaseTypePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaseTypePickerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaseTypePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
