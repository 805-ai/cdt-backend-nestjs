import { SetMetadata } from '@nestjs/common';
import { Role } from '../../user/enums/role-user.enum';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
