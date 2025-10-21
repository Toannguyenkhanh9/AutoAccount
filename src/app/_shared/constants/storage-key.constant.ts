import { environment } from 'src/environments/environment';

const prefix = `${environment.appVersion}-`;

export const STORAGE_KEY = Object.freeze({
  version: `${environment.appVersion}`,
  user: `${prefix}user`,
  permission: `${prefix}permission`,
  embed: `${prefix}embed`,
});
