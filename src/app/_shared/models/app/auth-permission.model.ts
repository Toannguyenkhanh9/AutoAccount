import { PermissionKeys, PermissionTypes } from 'src/app/_shared/constants';

export interface AuthPermission {
  key: (typeof PermissionKeys)[keyof typeof PermissionKeys];
  type: (typeof PermissionTypes)[keyof typeof PermissionTypes];
}
