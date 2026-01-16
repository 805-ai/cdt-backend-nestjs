import { Global, Module } from '@nestjs/common';
import { UserModule } from '../../user/user.module';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

@Global()
@Module({
  imports: [UserModule],
  providers: [AuthGuard, RoleGuard],
  exports: [AuthGuard, RoleGuard, UserModule],
})
export class SharedAuthModule {}
