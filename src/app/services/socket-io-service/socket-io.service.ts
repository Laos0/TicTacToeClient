import { Injectable } from '@angular/core';
import * as io from 'socket.io-client'; // this is how you use socket

@Injectable({
  providedIn: 'root'
})
export class SocketIoService {

  // connecting to our socket in server
  public socket: io.Socket = io.connect('http://localhost:8080');

  constructor() 
  {
  }

  userDisconnect(userRole: string): void {
    this.socket.on('disconnect', (userRole) => {
      this.socket.emit('userRoleReturned', userRole);
    })
  }
}
