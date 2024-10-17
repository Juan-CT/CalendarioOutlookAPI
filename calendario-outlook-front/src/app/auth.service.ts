import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { config } from './config';
import * as msal from '@azure/msal-browser';
import { environment } from '../environments/environment';
import { Cita, CitaCreacion } from './cita';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private apiURL = environment.apiEndpoint;

  // Necesario instanciar msal e inicializarla en los métodos correspondientes.
  private msalInstance: msal.PublicClientApplication = new msal.PublicClientApplication({
    auth: {
      clientId: config.clientId,
      authority: `https://login.microsoftonline.com/common`,
      redirectUri: config.redirectUri,
    }
  });

  constructor(private http: HttpClient) { }

  // Método para iniciar sesión y obtener el token
  async login() {

    await this.msalInstance!.initialize();

    if (!this.msalInstance) {
      console.error('MSAL no ha sido inicializado correctamente');
      return null;
    }

    try {
      const response = await this.msalInstance!.loginPopup({
        scopes: config.scopes,
      });

      // Obtención del token
      const tokenResponse = await this.msalInstance.acquireTokenSilent({
        scopes: ["User.Read", "Calendars.ReadWrite"],
        account: response.account
      });

      localStorage.setItem('accessToken', tokenResponse.accessToken);
      return tokenResponse.accessToken;

    } catch (error) {
      console.error('Error durante el login', error);
      return null;
    }
  }

  // Método para cerrar la sesión del usuario
  async logout() {
    await this.msalInstance!.initialize();
    if (this.msalInstance) {
      this.msalInstance.logoutPopup();
      localStorage.removeItem('accessToken');
    }
  }

  estaLogueado():boolean {
    return !!localStorage.getItem('accessToken');
  }

  // Método que es llamado tras hacer login, para enviar el token al backend
  sendToken(accessToken: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<string>(`${this.apiURL}outlook/token`, ({ AccessToken: accessToken }), { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error:', error.message);
          return throwError(error);
        }));
  }

  // Método que envía la cita creada al backend
  crearCita(cita: CitaCreacion): Observable<any> {
    return this.http.post<any>(`${this.apiURL}calendario/crearcita`, cita);
  }

  // Método que recibe las citas del usuario
  obtenerCitas(): Observable<Cita[]> {
    const citas = this.http.get<Cita[]>(`${this.apiURL}calendario/citas`);
    return citas;
  }

  // Método que elimina la cita mediante su ID
  eliminarCita(idCita: string): Observable<string> {
    return this.http.delete<string>(`${this.apiURL}calendario/eliminarevento/${idCita}`);
  }

  editarCita(idCita: string, cita: Cita): Observable<string> {
    return this.http.put<string>(`${this.apiURL}calendario/editarevento/${idCita}`, cita);
  }
}
