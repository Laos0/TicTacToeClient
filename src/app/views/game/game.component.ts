import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as io from 'socket.io-client'; // this is how you use socket
import { SocketIoService } from 'src/app/services/socket-io-service/socket-io.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameComponent implements OnInit {

  // connecting to our socket in server
  //private socket = io.connect('http://localhost:8080');

  // basic board game, 2d array
  boardGame: string[][] = [['','',''], ['','',''], ['','','']];

  // check whos turn it is
  currentPlayer: string = 'X';

  isPlayerX: boolean = true;

  // the role of the player
  player: string; 

  // check if game is over
  isGameOver: boolean;

  // the winner
  winner: string;

  // if there is a tie game
  isTieGame: boolean = false;


  constructor(private socketService: SocketIoService, private changeRef: ChangeDetectorRef) 
  {
    this.socketService.socket.on('disconnect', (data) => {
      // Send data to Node.js server here
      this.socketService.socket.emit('data', 'the fk');
    })
  } 

  ngOnInit(): void {
    
    // when user start up the website they are assign X or O player
    // retreiving playerRole data on server side
    this.socketService.socket.on('userRole', (data) => {
      this.player = data;
      console.log("We are " + this.player);
    })

    // this is confirmation from server-side go ahead and insert player on board
    this.socketService.socket.on('insertionSuccessful', (player, gameBoard) => {
      console.log("Successful inserted " + player);

      this.boardGame = gameBoard;

      this.changeRef.detectChanges();
    })
    
    // listens to when game is over and a winner is declared
    // the gameOverData is a json with data: message, isGameOver, and winner
    this.socketService.socket.on('gameOver', (gameOverData) => {
      this.isGameOver = gameOverData.isGameOver;
      this.winner = gameOverData.winner;

      console.log(gameOverData.message + " The winner is: " + gameOverData.winner + " Is it gameover? " + this.isGameOver);
      if(gameOverData.winner === 'TIE'){
        this.isTieGame = true;
      }
      this.changeRef.detectChanges();
    })

  }

  // Drawing line when there is a winner
  drawWinningLine(){
    //const canvas = document.
  }

  restart(){
    this.socketService.socket.emit('restart', true);
  }

  topLeftSelect(){
    this.socketService.socket.emit('selectedTile', this.player, 0, 0);
    console.log(this.boardGame);
  }

  topRightSelect(){
    this.socketService.socket.emit('selectedTile', this.player, 0, 2);
    console.log(this.boardGame);
  }

  topMidSelect(){
    this.socketService.socket.emit('selectedTile', this.player, 0, 1);
  }

  midLeftSelect(){
    this.socketService.socket.emit('selectedTile', this.player, 1, 0);
  }

  midMidSelect(){
    this.socketService.socket.emit('selectedTile', this.player, 1, 1);
  }

  midRightSelect(){
    this.socketService.socket.emit('selectedTile', this.player, 1, 2);
  }

  botLeftSelect(){
    this.socketService.socket.emit('selectedTile', this.player, 2, 0);
  }

  botMidSelect(){
    this.socketService.socket.emit('selectedTile', this.player, 2, 1);
  }

  botRightSelect(){
    this.socketService.socket.emit('selectedTile', this.player, 2, 2);
  }
}
