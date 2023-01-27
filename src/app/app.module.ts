import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './views/game/game.component';
import { HttpClientModule } from '@angular/common/http';
import { MaxClientsComponent } from './views/max-clients/max-clients.component';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    MaxClientsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
