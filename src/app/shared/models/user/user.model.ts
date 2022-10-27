export class UserModel {
  access_token: string;
  userId: string;
  userName: string;
  userType: string;
  firstName: string;
  surName: string;
  photoUrl: string;
}

export class UserLoginModel {
  grant_type: string;
  constructor() {
    this.grant_type = "password";
  }
  username: string;
  password: string;
}

export class ForgotPasswordModel {
  email: string;
  passwordResetActionLink: string;
}

export class ResetPasswordModel {
  userId: string;
  token: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export class UserCreationModel {
  password: string;
  email: string;
  userName: string;
  title: string;
  firstName: string;
  surName: string;
  company: string;
  activationActionLink: string;
}

export class UserUpdationModel {
  userId: string;
  userName: string;
  email: string;
  title: string;
  firstName: string;
  surname: string;
  company: string;
  personId: string;
}

export class UserRegistrationModel {
  password: string;
  email: string;
  userName: string;
  firstName: string;
  surName: string;
  // mobilePhone: string;
  activationActionLink: string;
}

export class UserProfileModel {
  userId: string;
  userName: string;
  firstName: string;
  surname: string;
  email: string;
  address: string;
  photoUrl: string;
  moduleId: number;
  defaultProjectId: string;
  personId: string;
  havePinCode: boolean;
}

export class UserProfileUpdationModel {
  userId: string;
  userName: string;
  firstName: string;
  surname: string;
  email: string;
  phoneNumber: string;
  address: string;
  photoUrl: string;
  defaultProjectId: string;
  photoUpload: File;
  personId: string;
}

export class ChangePasswordModel {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
  recoverAccountActionLink: string;
}

export class UserLookupModel {
  userId: string;
  name: string;
  photoUrl: string;
}

export class UserFilterModel {
  firstName: string;
  surName: string;
  email: string;
  role: any;
}

export class ChangePinCodeModel {
  oldPinCode: string;
  newPinCode: string;
  newPinCodeConfirm: string;
}

export class RemovePinCodeModel {
  password: string;
}

export class User4SignOff {
  authorizationLevel: number;
  clientToken: string;
  password?: string;
  company?: string;
  role: number;
  userId: string;
  userName: string;
}