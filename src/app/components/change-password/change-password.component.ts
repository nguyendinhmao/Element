import { Component, OnInit } from '@angular/core';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { NgForm } from '@angular/forms';
import { UserProfileModel, ChangePasswordModel, UserModel } from 'src/app/shared/models/user/user.model';
import { UserService } from 'src/app/shared/services/api/user/user.service';
import { JwtTokenHelper } from 'src/app/shared/common/jwt-token-helper/jwt-token-helper';
import { Configs } from 'src/app/shared/common/configs/configs';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { StorageService } from 'src/app/shared/services/core/storage.service';
import { Router } from '@angular/router';
import { StorageKey } from 'src/app/shared/models/storage-key/storage-key';
import { Constants } from 'src/app/shared/common';

@Component({
  selector: 'change-password',
  styleUrls: ['./change-password.component.scss'],
  templateUrl: './change-password.component.html'
})

export class ChangePasswordComponent implements OnInit {
  isToggleRightSide: boolean = true;
  personalLogoUrl: string;

  userProfileModel: UserProfileModel = new UserProfileModel();
  changePasswordModel: ChangePasswordModel = new ChangePasswordModel();
  userInfo: UserModel = new UserModel();

  constructor(
    public clientState: ClientState,
    private userService: UserService,
    private authErrorHandler: AuthErrorHandler,
    private storageService: StorageService,
    private router: Router,
  ) { }

  public ngOnInit() {
    this.userInfo = JwtTokenHelper.GetUserInfo();
    if (this.userInfo) {
      this.onGetUserProfile();
    }
  }

  //--- Get user profile
  onGetUserProfile = () => {
    this.clientState.isBusy = true;

    this.userService.getUserProfile(this.userInfo.userId + "").subscribe(res => {
      this.userProfileModel = res ? <UserProfileModel>{ ...res } : null;

      this.personalLogoUrl = this.userProfileModel.photoUrl ? Configs.BaseSitePath + this.userProfileModel.photoUrl : Configs.DefaultAvatar;

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Change password
  onChangePassword(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.clientState.isBusy = true;
    this.changePasswordModel.recoverAccountActionLink = '/forgot-password';

    this.userService.changePassword(this.changePasswordModel).subscribe({
      complete: () => {
        this.authErrorHandler.handleSuccess(Constants.ChangePasswordSuccess);
        this.clientState.isBusy = false;
        form.resetForm();
        this.storageService.onRemoveTokens([StorageKey.UserInfo, StorageKey.Token, StorageKey.ModuleProjectDefault]);
        this.router.navigate(['login']);
      },
      error: (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      },
    });
  }

  onCancel = () => {
    this.router.navigate(['']);
  }
}
