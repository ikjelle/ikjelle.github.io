import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-collapse',
  templateUrl: './collapse.component.html',
  styleUrls: ['./collapse.component.css']
})
export class CollapseComponent implements OnInit {

  @Input() title!: string;
  collapsed = true;

  constructor() { }

  ngOnInit(): void {
  }

  collapseComponent() {
    this.collapsed = !this.collapsed
  }

}
