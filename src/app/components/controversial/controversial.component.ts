import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { Party } from 'src/app/services/OData/models/models';

@Component({
  selector: 'app-controversial',
  templateUrl: './controversial.component.html',
  styleUrls: ['./controversial.component.css']
})
export class ControversialComponent implements OnInit {

  @Input() parties: Party[] = []
  box1: Party[] = []
  box2: Party[] = []
  helperOpen: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
  }

  drop(event: CdkDragDrop<Party[]> | any) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  resetLists() {
    this.parties.push(...this.box1)
    this.box1 = []
    this.parties.push(...this.box2)
    this.box2 = []
  }
}
