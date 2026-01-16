export class UserRecordDto {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  disabled: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime?: string;
  };
}
