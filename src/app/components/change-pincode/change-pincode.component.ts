import { Component, OnInit } from '@angular/core';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { NgForm } from '@angular/forms';
import { UserProfileModel, ChangePinCodeModel, UserModel, RemovePinCodeModel } from 'src/app/shared/models/user/user.model';
import { UserService } from 'src/app/shared/services/api/user/user.service';
import { JwtTokenHelper } from 'src/app/shared/common/jwt-token-helper/jwt-token-helper';
import { Configs } from 'src/app/shared/common/configs/configs';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { StorageService } from 'src/app/shared/services/core/storage.service';
import { Router } from '@angular/router';
import { StorageKey } from 'src/app/shared/models/storage-key/storage-key';
import { Constants } from 'src/app/shared/common';
import * as $ from "jquery";

@Component({
  selector: 'change-pincode',
  styleUrls: ['./change-pincode.component.scss'],
  templateUrl: './change-pincode.component.html'
})

export class ChangePinCodeComponent implements OnInit {
  isToggleRightSide: boolean = true;
  personalLogoUrl: string;
  isConfirmPassword: boolean = false;

  userProfileModel: UserProfileModel = new UserProfileModel();
  changePinCodeModel: ChangePinCodeModel = new ChangePinCodeModel();
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

  formChangePinCode: NgForm;

  //--- Change pincode
  onChangePinCode(form: NgForm) {
    if (form.invalid) {
      return;
    }
    if (this.userProfileModel.havePinCode) {
      this.clientState.isBusy = true;
      // this.changePinCodeModel.recoverAccountActionLink = '/forgot-pincode';

      this.userService.changePinCode(this.changePinCodeModel).subscribe({
        complete: () => {
          this.authErrorHandler.handleSuccess(Constants.ChangePinCodeSuccess);
          this.clientState.isBusy = false;
          form.resetForm();
          this.onGetUserProfile()
          // this.storageService.onRemoveTokens([StorageKey.UserInfo, StorageKey.Token, StorageKey.ModuleProjectDefault]);
          // this.router.navigate(['login']);
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        },
      });
    }
    else {
      this.clientState.isBusy = true;
      // this.changePinCodeModel.recoverAccountActionLink = '/forgot-pincode';

      this.userService.createPinCode(this.changePinCodeModel).subscribe({
        complete: () => {
          this.authErrorHandler.handleSuccess(Constants.CreatePinCodeSuccess);
          this.clientState.isBusy = false;
          form.resetForm();
          this.onGetUserProfile()
          // this.storageService.onRemoveTokens([StorageKey.UserInfo, StorageKey.Token, StorageKey.ModuleProjectDefault]);
          // this.router.navigate(['login']);
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        },
      });
    }
  }

  onCancel = () => {
    this.router.navigate(['']);
  }
  onConfirmPassword = (f: NgForm) => {
    this.formChangePinCode = f;
    this.isConfirmPassword = true;
  }



  onRemoveConfirm = (password: string) => {
    if (typeof password !== 'undefined') {
      var removePinModel: RemovePinCodeModel = new RemovePinCodeModel();
      removePinModel.password = password
      this.userService.removePinCode(removePinModel).subscribe({
        complete: () => {
          this.authErrorHandler.handleSuccess(Constants.RemovePinCodeSuccess);
          this.clientState.isBusy = false;
          this.isConfirmPassword = false;
          this.formChangePinCode.resetForm();
          this.onGetUserProfile()
          // this.storageService.onRemoveTokens([StorageKey.UserInfo, StorageKey.Token, StorageKey.ModuleProjectDefault]);
          // this.router.navigate(['login']);
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.isConfirmPassword = false;
          this.authErrorHandler.handleError(err.message);
        },
      });
    }
  }
}
