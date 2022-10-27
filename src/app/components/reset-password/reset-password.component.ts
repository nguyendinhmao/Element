import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup, FormGroupDirective, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ErrorStateMatcher } from '@angular/material/core';
import { JwtTokenHelper } from 'src/app/shared/common/jwt-token-helper/jwt-token-helper';
import { UserModel, ResetPasswordModel } from 'src/app/shared/models/user/user.model';
import { UserService } from 'src/app/shared/services/api/user/user.service';
import { ToastrService } from 'ngx-toastr';

//--- My error matcher
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
    const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty && control.parent.hasError('passwordsDoNotMatch'));
    return invalidParent;
  }
}

@Component({
  selector: 'reset-password',
  styleUrls: ['./reset-password.component.scss'],
  templateUrl: './reset-password.component.html'
})

export class ResetPasswordComponent implements OnInit {
  public resetPasswordForm: FormGroup;
  errorMatcher = new MyErrorStateMatcher();

  isError: boolean;
  message: string;

  sub: any;

  userInfo: UserModel;
  userId: string;
  token: string;

  isResetPasswordSuccess: boolean = false;

  constructor(
    private router: Router,
    public clientState: ClientState,
    private route: ActivatedRoute,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    this.sub = this.route.params.subscribe(params => {
      this.userId = params['userId'];
    });

    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  public ngOnInit() {
    //---Check authenticated
    this.userInfo = JwtTokenHelper.GetUserInfo();
    if (this.userInfo) {
      this.router.navigate(['']);
    } else {
      this.createFormGroup();
    }
  }

  //--- Create form group
  createFormGroup = () => {
    this.resetPasswordForm = new FormGroup({
      password: new FormControl('', [Validators.required]),
      rePassword: new FormControl(''),
    }, { validators: this.checkRePasswords });
  }

  checkRePasswords(group: FormGroup) { // here we have the 'passwords' group
    let pass = group.controls.password.value || '';
    let confirmPass = group.controls.rePassword.value || '';
    let result = pass.length > 0 && confirmPass.length > 0 &&
      pass !== confirmPass;
    return result ? { passwordsDoNotMatch: true } : null;
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.resetPasswordForm.controls[controlName].hasError(errorName);
  }

  //--- End Create form group

  //--- Reset password
  onResetPassword = (resetPasswordFormValue) => {
    if (!this.resetPasswordForm.valid) {
      return;
    }

    let resetPasswordModel = <ResetPasswordModel>{
      userId: this.userId,
      token: this.token,
      newPassword: resetPasswordFormValue.password,
      newPasswordConfirm: resetPasswordFormValue.rePassword,
    };

    this.clientState.isBusy = true;
    this.userService.resetPassword(resetPasswordModel).subscribe({
      complete: () => {
        this.isResetPasswordSuccess = true;
        this.clientState.isBusy = false;
        this.toastr.success('Reset password successfully');
        let router = this.router;
        setTimeout(function () {
          router.navigate(['/login']);
        },1000);
      },
      error: err => {
        this.isError = true;
        this.message = err.message;
        this.clientState.isBusy = false;
      },
    });
  }
}
