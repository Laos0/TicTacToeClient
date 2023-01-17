import { Component, OnInit } from '@angular/core';
import * as io from 'socket.io-client'; // this is how you use socket
import { SocketIoService } from 'src/app/services/socket-io-service/socket-io.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  // connecting to our socket in server
  //private socket = io.connect('http://localhost:8080');

  // basic board game, 2d array
  boardGame: string[][] = [['','',''], ['','',''], ['','','']];

  // check whos turn it is
  currentPlayer: string = 'X';

  // the role of the player
  player: string; 

  // check if game is over
  isGameOver: boolean


  constructor(private socketService: SocketIoService) 
  {
    this.socketService.socket.on('disconnect', (data) => {
      // Send data to Node.js server here
      this.socketService.socket.emit('data', 'the fk');
    })
  } 

  ngOnInit(): void {
    this.boardGame[0][0] = 'X';
    console.log(this.boardGame)
    
    // when user start up the website they are assign X or O player
    // retreiving playerRole data on server side
    this.socketService.socket.on('userRole', (data) => {
      this.player = data;
      console.log("We are " + this.player);
    })
  }


  topLeftSelect(){
    
    this.socketService.socket.emit('clientMgs', "Hello from angular");
    console.log("click")
  }
}
