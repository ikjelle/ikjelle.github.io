import { Component, OnInit } from '@angular/core';
import { StateService } from 'src/app/services/state.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  get corsError(): boolean {
    return this.stateService.corsError
  }
  state: any;

  constructor(private stateService: StateService) { }

  ngOnInit() {
  }

}
