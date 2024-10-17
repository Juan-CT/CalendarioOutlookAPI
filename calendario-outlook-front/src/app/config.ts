import { environment } from '../environments/environment';

export const config = {
  clientId: environment.clientId,
  tenantId: environment.tenantId,
  redirectUri: environment.redirectUri,
  scopes: ['User.Read', 'Calendars.ReadWrite']
};
