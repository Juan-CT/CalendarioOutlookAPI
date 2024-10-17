import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { SyncOutlookComponent } from './sync-outlook/sync-outlook.component';
import { FormCitaComponent } from './form-cita/form-cita.component';
import { TablaCitasComponent } from './tabla-citas/tabla-citas.component';
import { AuthService } from './auth.service';

import { AuthInterceptor } from './auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    SyncOutlookComponent,
    FormCitaComponent,
    TablaCitasComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true // Permite múltiples interceptores
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
