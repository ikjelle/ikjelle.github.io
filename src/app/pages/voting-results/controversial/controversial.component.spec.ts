import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControversialComponent } from './controversial.component';

describe('ControversialComponent', () => {
  let component: ControversialComponent;
  let fixture: ComponentFixture<ControversialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ControversialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControversialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
