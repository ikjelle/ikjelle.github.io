import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteAlongResultComponent } from './vote-along-result.component';

describe('VoteAlongResultComponent', () => {
  let component: VoteAlongResultComponent;
  let fixture: ComponentFixture<VoteAlongResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VoteAlongResultComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoteAlongResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
