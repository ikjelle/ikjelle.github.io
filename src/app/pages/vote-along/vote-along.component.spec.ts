import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteAlongComponent } from './vote-along.component';

describe('VoteAlongComponent', () => {
  let component: VoteAlongComponent;
  let fixture: ComponentFixture<VoteAlongComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VoteAlongComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoteAlongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
