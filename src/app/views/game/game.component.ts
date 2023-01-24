import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { first } from 'rxjs';
import * as io from 'socket.io-client'; // this is how you use socket
import { SocketIoService } from 'src/app/services/socket-io-service/socket-io.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameComponent implements OnInit {

  @ViewChild('myCanvas') canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('topLeft') topLeft: ElementRef<HTMLElement>;
  @ViewChild('topMid') topMid: ElementRef<HTMLElement>;
  @ViewChild('topRight') topRight: ElementRef<HTMLElement>;
  @ViewChild('midLeft') midLeft: ElementRef<HTMLElement>;
  @ViewChild('midMid') midMid: ElementRef<HTMLElement>;
  @ViewChild('midRight') midRight: ElementRef<HTMLElement>;
  @ViewChild('botLeft') botLeft: ElementRef<HTMLElement>;
  @ViewChild('botMid') botMid: ElementRef<HTMLElement>;
  @ViewChild('botRight') botRight: ElementRef<HTMLElement>;

  // connecting to our socket in server
  //private socket = io.connect('http://localhost:8080');

  // basic board game, 2d array
  boardGame: string[][] = [['','',''], ['','',''], ['','','']];

  // hashmap to bind boardGame tiles to ElementRef
  boardTilesHashMap: Map<number, ElementRef> = new Map<number, ElementRef>();

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

  // the winning tiles
  winningTiles: number[];


  constructor(private socketService: SocketIoService, private changeRef: ChangeDetectorRef, private eleRef: ElementRef,
    private renderer: Renderer2) 
  {
    
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
    // the gameOverData is a json with data: message, isGameOver, winner, and winTiles array
    this.socketService.socket.on('gameOver', (gameOverData) => {
      this.isGameOver = gameOverData.isGameOver;
      this.winner = gameOverData.winner; 

      console.log(gameOverData.message + " The winner is: " + gameOverData.winner + " Is it gameover? " + this.isGameOver);
      this.winningTiles = gameOverData.winTiles; // storing the winning tiles
      console.log("The winning tiles are: " + this.winningTiles);

      if(gameOverData.winner === 'TIE'){
        this.isTieGame = true;
      }else{
        // TODO: The error happens here
        this.drawWinningLine();
      }
      this.changeRef.detectChanges(); // update the views manually after changes
    })

  }

  ngAfterViewInit(){

    this.updateCanvasWidthHeight();

    // set up the hashmap in ngAfterViewInit so that the elementRef are rendered
    this.boardTilesHashMap.set(0o0, this.topLeft); // 00, 01, 02 are octal number we would have to convert to decimal
    this.boardTilesHashMap.set(0o1, this.topMid); // this is easier
    this.boardTilesHashMap.set(0o2, this.topRight);

    this.boardTilesHashMap.set(10, this.midLeft);
    this.boardTilesHashMap.set(11, this.midMid);
    this.boardTilesHashMap.set(12, this.midRight);

    this.boardTilesHashMap.set(20, this.botLeft);
    this.boardTilesHashMap.set(21, this.botMid);
    this.boardTilesHashMap.set(22, this.botRight);
  }

  // Drawing line when there is a winner
  drawWinningLine(){
    this.changeRef.detectChanges();

    // TODO: These are just testers 
    // NOTE: top = y-positon, left = x-position
    const startingPointRef = this.getStartingPoint();
    const endingPointRef = this.getEndingPoint();
    let startingPoint;
    let endingPoint;

    // null checks
    if(startingPointRef && endingPointRef){
      startingPoint = startingPointRef.nativeElement.getBoundingClientRect();
      endingPoint = endingPointRef.nativeElement.getBoundingClientRect();
      
      if(startingPoint && endingPoint){
        
        const ctx = this.canvas.nativeElement.getContext('2d');
        ctx.fillStyle = "red";
        ctx.beginPath(); // starting 
        ctx.moveTo(startingPoint.left, startingPoint.top); // this is our starting point x and y coordinate
        ctx.lineTo(endingPoint.left, endingPoint.top); // this is our ending point of x and y ccoordinate
        ctx.stroke(); // draw
      }else{
        console.error('startingPoint or endingPoint is null', startingPoint, endingPoint)
      }
    }else{
      console.error('startingPointRef or endingPointRef is null', startingPointRef, endingPointRef);
    }

    this.changeRef.detectChanges();
  }


  // returns ElementRef so we can do elementRef.nativeElement.getBoundingClientRect
  getStartingPoint(): ElementRef{
    // This will return the correct ElementRef such as topLeft, botMid, midRight etc...
    if(this.winningTiles[0] === 0){ // winning tiles ex: [0,0,0,1,0,2] or [1,0,1,1,1,2]
      let stringNum: string = this.winningTiles[0].toString() + this.winningTiles[1].toString();
      let firstNum: number = parseInt(stringNum.slice(0,1)); // returns first index
      let secNum: number = parseInt(stringNum.slice(stringNum.length - 1, stringNum.length)); // returns last index
      if(firstNum === 0 && secNum === 0){
        console.log("This is a topLeft " + firstNum + secNum);

        return this.topLeft;

      }else if(firstNum === 0 && secNum === 1){
        console.log("This is a topMid " + firstNum + secNum);

        return this.topMid;

      }else if(firstNum === 0 && secNum === 2){
        console.log("This is a topRight " + firstNum + secNum);
        return this.topRight;
      } 
    }

    let rowNumStr = this.winningTiles[0].toString();
    let colNumStr = this.winningTiles[1].toString();
    let rowColNumStr = rowNumStr + colNumStr;
    let rowColNum = parseInt(rowColNumStr);
    
    // the first two index will always be our starting point
    return this.boardTilesHashMap.get(rowColNum);
    
  }

  // TODO: Something about this is not right
  getEndingPoint(): ElementRef{
    // This will return the correct ElementRef such as topLeft, botMid, midRight etc...
    if(this.winningTiles[4] === 0){ // winning tiles ex: [0,0,1,0,2,0]
      let stringNum: string = this.winningTiles[4].toString() + this.winningTiles[5].toString();
      let firstNum: number = parseInt(stringNum.slice(0,1)); // returns first index
      let secNum: number = parseInt(stringNum.slice(stringNum.length - 1, stringNum.length)); // returns last index
      if(firstNum === 0 && secNum === 0){
        console.log("This is a topLeft " + firstNum + secNum);
        // TODO: return the approiate ElementRef, and dont forget to include it in the signature
        return this.topLeft;

      }else if(firstNum === 0 && secNum === 1){
        console.log("This is a topMid " + firstNum + secNum);
        // TODO: Return approiate ElementRef
        return this.topMid;

      }else if(firstNum === 0 && secNum === 2){
        console.log("This is a topRight " + firstNum + secNum);
        return this.topRight;
      } 
    }

    let rowNumStr = this.winningTiles[4].toString();
    let colNumStr = this.winningTiles[5].toString();
    let rowColNumStr = rowNumStr + colNumStr;
    let rowColNum = parseInt(rowColNumStr);

    // the last two index will always be our ending point
    return this.boardTilesHashMap.get(rowColNum); // what we got was topRightTile
  }

  restart(){
    this.socketService.socket.emit('restart', true);
  }

  private updateCanvasWidthHeight(): void {
    const element = this.eleRef.nativeElement;
    const width = element.clientWidth;
    const height = element.clientHeight;

    console.log('Width: ' + width + " " + "Height: " + height);

    this.renderer.setAttribute(this.canvas.nativeElement, 'width', '500');
    this.renderer.setAttribute(this.canvas.nativeElement, 'height', '500');
  }

  topLeftSelect(): void{
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
