import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppRoutes } from 'src/app/AppRoutes';
import { SocketIoService } from 'src/app/services/socket-io-service/socket-io.service';

@Component({
  selector: 'app-max-clients',
  templateUrl: './max-clients.component.html',
  styleUrls: ['./max-clients.component.scss']
})
export class MaxClientsComponent implements OnInit {

  constructor(private socket: SocketIoService, private router: Router) { }

  ngOnInit(): void {
    console.log(this.socket.clients);
    if(this.socket.clients < 4){
      this.router.navigate([AppRoutes.HOME]);
    }
  }

}
