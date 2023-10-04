import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartyPickerComponent } from './party-picker.component';

describe('PartyPickerComponent', () => {
  let component: PartyPickerComponent;
  let fixture: ComponentFixture<PartyPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartyPickerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartyPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
