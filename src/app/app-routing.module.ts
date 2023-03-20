import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './pages/about/about.component';
import { DisclaimerComponent } from './pages/disclaimer/disclaimer.component';
import { SingleResultComponent } from './pages/single-result/single-result.component';
import { VotingResultsComponent } from './pages/voting-results/voting-results.component';


const routes: Routes = [
  { path: 'resultaat/:id', component: SingleResultComponent },
  { path: 'disclaimer', component: DisclaimerComponent },
  { path: 'over', component: AboutComponent },
  { path: '**', component: VotingResultsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
