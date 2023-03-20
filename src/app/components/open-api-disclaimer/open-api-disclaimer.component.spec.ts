import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenApiDisclaimerComponent } from './open-api-disclaimer.component';

describe('OpenApiDisclaimerComponent', () => {
  let component: OpenApiDisclaimerComponent;
  let fixture: ComponentFixture<OpenApiDisclaimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenApiDisclaimerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenApiDisclaimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
