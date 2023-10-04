import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './pages/about/about.component';
import { DisclaimerComponent } from './pages/disclaimer/disclaimer.component';
import { SingleResultComponent } from './pages/single-result/single-result.component';
import { VotingResultsComponent } from './pages/voting-results/voting-results.component';
import { SearchNumberResultComponent } from './pages/search-number-result/search-number-result.component';
import { VoteAlongComponent } from './pages/vote-along/vote-along.component';
import { DifferenceComponent } from './pages/difference/difference.component';
import { DeciderComponent } from './pages/decider/decider.component';


const routes: Routes = [
  { path: 'resultaat/:id', component: SingleResultComponent },
  { path: 'filter', component: VotingResultsComponent },
  { path: 'beslisser', component: DeciderComponent },
  { path: 'zoek', component: SearchNumberResultComponent },
  { path: 'mee-stemmers', component: VoteAlongComponent },
  { path: 'verschillen', component: DifferenceComponent },
  { path: 'disclaimer', component: DisclaimerComponent },
  { path: 'over', component: AboutComponent },
  { path: '**', component: DifferenceComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
