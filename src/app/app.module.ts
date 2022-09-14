import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VotingResultsComponent } from './pages/voting-results/voting-results.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ControversialComponent } from './pages/voting-results/controversial/controversial.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { ResultComponent } from './pages/voting-results/result/result.component';
import { SpinnerComponent } from './shared/spinner/spinner.component';

@NgModule({
  declarations: [
    AppComponent,
    VotingResultsComponent,
    ControversialComponent,
    ResultComponent,
    SpinnerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    DragDropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
