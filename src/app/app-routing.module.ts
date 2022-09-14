import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VotingResultsComponent } from './pages/voting-results/voting-results.component';


const routes: Routes = [
  { path: '', component: VotingResultsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
