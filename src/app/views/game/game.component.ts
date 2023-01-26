import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { SocketIoService } from 'src/app/services/socket-io-service/socket-io.service';
import { HttpClient } from '@angular/common/http'

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

  @ViewChild('rocket') rocket: ElementRef<HTMLElement>;

  // TODO: TESTING the canvas OKAY TO DELETE
  ctx: CanvasRenderingContext2D;

  // basic board game, 2d array
  boardGame: string[][] = [['','',''], ['','',''], ['','','']];

  // array of booleans to draw a certain winning line
  winningLines: boolean[] = [false, false, false, false, false, false, false, false];

  // hashmap to bind boardGame tiles to ElementRef
  private boardTilesHashMap: Map<number, ElementRef> = new Map<number, ElementRef>();

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

  isThereWinner: boolean = false;

  // X and O score
  xScore: number = 0;
  oScore: number = 0;

  // animations
  isAnimating = false;

  // private renderer can be deleted, purpose was to use it for drawing a line on canvas
  constructor(private socketService: SocketIoService, private changeRef: ChangeDetectorRef, private eleRef: ElementRef,
    private renderer: Renderer2, private http: HttpClient) 
  {
    
  } 

  ngOnInit(): void {

    if(this.socketService.isServerLive){

      // when user start up the website they are assign X or O player
      // retreiving playerRole data on server side
      this.socketService.socket.on('userRole', (data) => {
        this.player = data;
        if(this.player === 'X'){
          this.isAnimating = true;
        }
        this.changeRef.detectChanges();
        console.log("We are " + this.player);
      })
  
      // this is confirmation from server-side that the player's insertion is successful -> update the boardGame
      this.socketService.socket.on('insertionSuccessful', (player, gameBoard) => {
        console.log("Successful inserted " + player);
  
        this.boardGame = gameBoard;
        if(this.currentPlayer === 'X'){
          this.currentPlayer = 'O';
        }else{
          this.currentPlayer = 'X';
        }
  
        this.changeRef.detectChanges();
      });
  
      // when a user selects a tile, we turn off their animations
      this.socketService.socket.on('animationOff', (data) => {
        console.log("the animation status on/off?: ", data);
        this.isAnimating = data;
        this.changeRef.detectChanges();
      });
  
      this.socketService.socket.on('animationOn', (data) => {
        console.log('The current player is: ', data.curPlayer, " and ", this.currentPlayer);
        if(this.player === data.curPlayer){
          console.log("this is the correct player")
          this.isAnimating = data.turnAnimationOn;
        }
        this.changeRef.detectChanges();
      })
      
      
      // listens to when game is over and a winner is declared
      // the gameOverData is a json with data: message, isGameOver, winner, winTiles array, curPlayer, playerXScore, and playerOScore
      this.socketService.socket.on('gameOver', (gameOverData) => {
        this.isGameOver = gameOverData.isGameOver; // setting it to be true
        this.winner = gameOverData.winner; // the winner
  
        console.log(gameOverData.message + " The winner is: " + gameOverData.winner + " Is it gameover? " + this.isGameOver);
        this.winningTiles = gameOverData.winTiles; // storing the winning tiles
        console.log("The winning tiles are: " + this.winningTiles);
  
        if(gameOverData.winner === 'TIE'){
          this.isTieGame = true;
          this.isThereWinner = false;
          this.restart();
          
        }else{
          //this.isTieGame = false;
          // if there is no tie, then draw winning line
          //this.drawWinningLine();
          
          // update both playes' score
          this.xScore = gameOverData.playerXScore;
          this.oScore = gameOverData.playerOScore;
  
          this.isThereWinner = true;
  
          this.showWinningLine(this.winningTiles);
  
          this.restart();
          console.log("This is the winning Tiles after restart: ", this.winningLines);
          
        }
        this.changeRef.detectChanges(); // update the views manually after changes
      });
  
      this.socketService.socket.on('restartComplete', (data) => {
        this.boardGame = data.gameBoard; // set boardGame to be empty again = ''
  
        // clearing the canvas
        //this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  
        this.isGameOver = false; // deflagging isGameOVer
        
        // letting player 0 goes first now
        this.currentPlayer = data.curPlayer;
      
        this.changeRef.detectChanges();
      });
    }

  }

  ngAfterViewInit(){

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

  // TODO: This was for drawing on a canvas: OKAY TO DELETE
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
        console.log("The x and y pos of starting point: " + startingPoint.left + ", " + startingPoint.top);
        console.log("The x and y pos of ending point: " + endingPoint.left + ", " + endingPoint.top);
      
      }else{
        console.error('startingPoint or endingPoint is null', startingPoint, endingPoint)
      }
    }else{
      console.error('startingPointRef or endingPointRef is null', startingPointRef, endingPointRef);
    }

    this.changeRef.detectChanges();
  }


  // TODO: This was for drawing on a canvas: OKAY TO DELETE
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

  // TODO: This was for drawing on a canvas: OKAY TO DELETE
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

  // after each gameover, after 5 seconds all the followings are executed
  restart(){
    setTimeout(() => {
      this.socketService.socket.emit('restart', true);
      this.isTieGame = false;
      this.isThereWinner = false;
      this.winningTiles = [];
      this.resetWinningLine();    
    }, 3000);
  }

  // NOTE: This was the canvas approach for drawing line TODO: OKAY TO DELETE
  private updateCanvasWidthHeight(): void {
    const element = this.eleRef.nativeElement;
    const width = element.clientWidth; // ignore for now
    const height = element.clientHeight; // ignore for now

    console.log('Width: ' + width + " " + "Height: " + height);

    //this.renderer.setAttribute(this.canvas.nativeElement, 'width', '500');
    //this.renderer.setAttribute(this.canvas.nativeElement, 'height', '500');
  }

  // when the player selects a tile
  selectTile(row, col){
    this.socketService.socket.emit('selectedTile', this.player, row, col, this.isAnimating);
    console.log(this.boardGame);
  }


  // resetting the winningLines array after every game over
  resetWinningLine(){
    for(let i = 0; i < this.winningLines.length; i++){
      this.winningLines[i] = false;
    }
    console.log('The winningLines: ', this.winningLines)
  }

  // this.winningLines = [row1, row2, row3, col1, col2, col3, dia1, dia2]
  showWinningLine(winTiles: number[]){
    // this is the win condition for row1
    if(winTiles[0] === 0 && winTiles[1] === 0 && 
      winTiles[2] === 0 && winTiles[3] === 1 && 
      winTiles[4] === 0 && winTiles[5] === 2){
        this.winningLines[0] = true;
    }else if(winTiles[0] === 1 && winTiles[1] === 0 && // row2
      winTiles[2] === 1 && winTiles[3] === 1 && 
      winTiles[4] === 1 && winTiles[5] === 2){
        this.winningLines[1] = true;
    }else if(winTiles[0] === 2 && winTiles[1] === 0 && // row3
      winTiles[2] === 2 && winTiles[3] === 1 && 
      winTiles[4] === 2 && winTiles[5] === 2){
        this.winningLines[2] = true;
    }else if(winTiles[0] === 0 && winTiles[1] === 0 && // col1
      winTiles[2] === 1 && winTiles[3] === 0 && 
      winTiles[4] === 2 && winTiles[5] === 0){
        this.winningLines[3] = true;
    }else if(winTiles[0] === 0 && winTiles[1] === 1 && // col2
      winTiles[2] === 1 && winTiles[3] === 1 && 
      winTiles[4] === 2 && winTiles[5] === 1){
        this.winningLines[4] = true;
    }else if(winTiles[0] === 0 && winTiles[1] === 2 && // col3
      winTiles[2] === 1 && winTiles[3] === 2 && 
      winTiles[4] === 2 && winTiles[5] === 2){
        this.winningLines[5] = true;
    }else if(winTiles[0] === 0 && winTiles[1] === 0 && // dia1
      winTiles[2] === 1 && winTiles[3] === 1 && 
      winTiles[4] === 2 && winTiles[5] === 2){
        this.winningLines[6] = true;
    }else if(winTiles[0] === 0 && winTiles[1] === 2 && // dia2 
      winTiles[2] === 1 && winTiles[3] === 1 && 
      winTiles[4] === 2 && winTiles[5] === 0){
        this.winningLines[7] = true;
    }
  }

}
