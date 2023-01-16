import { Component, OnInit } from '@angular/core';
import * as io from 'socket.io-client'; // this is how you use socket

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  // basic board game, 2d array
  boardGame: string[][] = [['','',''], ['','',''], ['','','']];

  // check whos turn it is
  currentPlayer: string = 'X';

  // check if game is over
  isGameOver: boolean


  constructor() 
  { 
    
  }

  ngOnInit(): void {

    this.boardGame[0][0] = 'X';
    console.log(this.boardGame)
  }

}
