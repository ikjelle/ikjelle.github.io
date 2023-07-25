import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchNumberResultComponent } from './search-number-result.component';

describe('SearchNumberResultComponent', () => {
  let component: SearchNumberResultComponent;
  let fixture: ComponentFixture<SearchNumberResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchNumberResultComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchNumberResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
