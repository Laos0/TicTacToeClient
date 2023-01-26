import { Injectable } from '@angular/core';
import * as io from 'socket.io-client'; // this is how you use socket

@Injectable({
  providedIn: 'root'
})
export class SocketIoService {

  // connecting to our socket in server
  public socket: io.Socket;

  // server status
  public isServerLive: boolean;

  constructor() 
  {
    // checking if the server is live first
    fetch('http://localhost:8080').then(res => {
      if(res.ok){
        this.socket = io.connect('http://localhost:8080');
        this.isServerLive = true;
      }else{
        console.error('Server is not live');
      }
    })
    .catch(error => {
      console.error('Error checking server status: ', error);
    });
  }

  userDisconnect(userRole: string): void {
    this.socket.on('disconnect', (userRole) => {
      this.socket.emit('userRoleReturned', userRole);
    })
  }
}
