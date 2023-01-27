import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaxClientsComponent } from './views/max-clients/max-clients.component';
import { GameComponent } from './views/game/game.component';



const routes: Routes = [
  {path: '', component: GameComponent},
  {path: 'max', component: MaxClientsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
