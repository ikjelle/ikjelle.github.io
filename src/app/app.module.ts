import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ResultComponent } from './components/result/result.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SingleResultComponent } from './pages/single-result/single-result.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { ControversialComponent } from './components/controversial/controversial.component';
import { VotingResultsComponent } from './pages/voting-results/voting-results.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CorsErrorComponent } from './components/cors-error/cors-error.component';
import { DisclaimerComponent } from './pages/disclaimer/disclaimer.component';
import { AboutComponent } from './pages/about/about.component';
import { OpenApiDisclaimerComponent } from './components/open-api-disclaimer/open-api-disclaimer.component';
import { ContentComponent } from './components/content/content.component';
import { LogoComponent } from './svg-assets/logo/logo.component';

@NgModule({
  declarations: [
    AppComponent,
    VotingResultsComponent,
    ControversialComponent,
    ResultComponent,
    SingleResultComponent,
    MainLayoutComponent,
    HeaderComponent,
    FooterComponent,
    CorsErrorComponent,
    DisclaimerComponent,
    AboutComponent,
    OpenApiDisclaimerComponent,
    ContentComponent,
    LogoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    DragDropModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
