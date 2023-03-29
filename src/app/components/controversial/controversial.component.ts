import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { SearchParty } from 'src/app/pages/voting-results/search-party';

@Component({
  selector: 'app-controversial',
  templateUrl: './controversial.component.html',
  styleUrls: ['./controversial.component.css']
})
export class ControversialComponent implements OnInit {

  @Input() parties: SearchParty[] = []
  box1: SearchParty[] = []
  box2: SearchParty[] = []
  helperOpen: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
  }

  drop(event: CdkDragDrop<SearchParty[]> | any) {
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
