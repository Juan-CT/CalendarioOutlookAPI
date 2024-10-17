import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-sync-outlook',
  templateUrl: './sync-outlook.component.html',
  styles: [
  ]
})

export class SyncOutlookComponent implements OnInit {

  logueado: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.logueado = this.authService.estaLogueado();
  }

  async login() {
    const token = await this.authService.login();

    if (token) {
      this.authService.sendToken(token).subscribe((respuesta) => {
        console.log("Token enviado al backend", respuesta);
        this.logueado = true;
      },
        (error) => {
          console.error("Error al enviar el token", error);
        });
    }
  };


  logout() {
    this.authService.logout();
    this.logueado = false;
  }

}
