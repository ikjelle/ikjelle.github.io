import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-controversial',
  templateUrl: './controversial.component.html',
  styleUrls: ['./controversial.component.css']
})
export class ControversialComponent implements OnInit {

  @Input() parties: string[] = ["VVD", "D66", "PvdA", "GroenLinks", "FvD", "PVV", "SP", "ChristenUnie"]
  box1: string[] = []
  box2: string[]=[]

  constructor() { }

  ngOnInit(): void {
  }

  drop(event: CdkDragDrop<string[]>|any) {
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

  createFilter() {
    // returns the filter to use for the list
  }

}
