import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  UrlSucceed() {
    this.corsError = false;
  }
  periodState$ = new BehaviorSubject<any>(null);
  caseTypesState$ = new BehaviorSubject<any>(null);
  corsError = true;
}
