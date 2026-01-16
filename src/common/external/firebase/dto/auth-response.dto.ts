export class AuthResponseDto {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  displayName?: string;
}
