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

  // Método que comprueba si hay un token almacenado, para renoverlo y seguir logueado
  async estaLogueado(): Promise<boolean> {
    const token = localStorage.getItem('accessToken');

    if (token) {
      const tokenRenovado = await this.renovarToken();
      // Si el token no se puede renovar, se elimina el existente en cache
      if (!tokenRenovado) {
        localStorage.removeItem('accessToken');
        return false;
      }
      return true;
    }
    return false;
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

  // Método que va a intentar renovar el token de acceso
  async renovarToken(): Promise<string | null> {
    await this.msalInstance!.initialize();
    const cuenta = this.msalInstance.getAllAccounts()[0];

    if (!cuenta) {
      console.error("No existe una cuenta para renovar el token");
      return null;
    }

    try {
      const tokenResponse = await this.msalInstance.acquireTokenSilent({
        scopes: ["User.Read", "Calendars.ReadWrite"],
        account: cuenta
      });
      localStorage.setItem('accessToken', tokenResponse.accessToken);
      // Se envía el nuevo token al backend
      this.sendToken(tokenResponse.accessToken).subscribe(
        (respuesta) => {
          console.log('Token renovado enviado al backend', respuesta);
        },
        (error) => {
          console.error('Error al enviar el token renovado al backend', error);
        }
      );

      return tokenResponse.accessToken;
    } catch {
      console.error("Error al renovar el token");
      return null;
    }
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
