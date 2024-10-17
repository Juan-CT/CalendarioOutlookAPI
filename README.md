# Calendario Outlook

Este proyecto es una aplicación web para gestionar citas utilizando la API de Outlook. 
Está dividido en dos partes: un frontend desarrollado con Angular12 y un backend en .NET6.

La aplicación permite, mediante un login previo a la cuenta Microsoft del usuario, ver,
crear, modificar o eliminar eventos en el calendario de Outlook.

El diseño es muy básico, ya que el objetivo de este proyecto es hacer pruebas para
implementarlo en el proyecto real de una aplicación de gimnasios.

En la cuenta del usuario se crea un nuevo calendario llamado 'Instructor', en el cual
se aplicarán los cambios generados mediante la aplicación.

## Requisitos Para Su Uso

Es necesario tener en Microsoft Entra ID una aplicación registrada con la siguiente configuración:

-Tipos de cuentas compatibles: Cuentas en cualquier directorio organizacional (cualquier inquilino 
del id. de Microsoft Entra - multiinquilino) y cuentas personales de Microsoft (por ejemplo, Skype, Xbox).

-URI de redirección: Aplicación de página única - 'url local que ejecute Angular ej: http: //localhost:4200.

-Permisos de API: Calendars.ReadWrite, de tipo delegada, con permisos concedidos.

-Autenticación: Permitir tokens de acceso e id.

Se necesitará más adelante la ID de cliente e ID de inquilino, además del dominio principal del usuario.  

Antes de ejecutar la aplicación, asegúrate de tener instalados los siguientes programas:

- [Node.js](https://nodejs.org/) (incluye npm) - Versión 12.18.4
- [.NET 6 SDK](https://dotnet.microsoft.com/download/dotnet/6.0)
- [Angular CLI](https://angular.io/cli) - Versión 12.0.0

### En el frontend
```bash
cd calendario-outlook-frontend
npm install
```

### En el backend
```bash
cd calendario-outlook-backend
dotnet restore
```

## Estructura del Proyecto

Es necesario crear el archivo calendario-outlook-backend/appsettings.json con la siguiente configuración:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  },
  "AllowedHosts": "*",
  "AzureAd": {
    "Instance": "https://login.microsoftonline.com/",
    "Domain": "'Tu dominio principal'",
    "TenantId": "'La ID de inquilino'",
    "ClientId": "'La ID de cliente'",
    "CallbackPath": "/signin-oidc"
  }
}
```
Notas:
Reemplaza 'Tu dominio principal', 'La ID de inquilino' y 'La ID de cliente' con la información correspondiente 
de tu registro de aplicación en Microsoft Entra.

Otro archivo a crear es calendario-outlook-front/src/environments/environment.ts con lo siguiente:
```ts
export const environment = {
  production: false,
  clientId: ''La ID de cliente'',
  tenantId: ''La ID de inquilino'',
  redirectUri: 'http://localhost:4200', //Modificar puerto acorde al servidor de escucha de Angular
  apiEndpoint: 'https://localhost:7144/api/' //Modificar puerto acorde al servidor de escucha de .NET
};
```
Notas:
Asegúrate de modificar los valores de clientId, tenantId, redirectUri, y apiEndpoint para que coincidan con tu 
configuración específica.
Recuerda que el archivo environment.ts es utilizado solo durante el desarrollo. Para producción, deberías tener otro 
archivo de entorno (por ejemplo, environment.prod.ts) con la configuración correspondiente.
