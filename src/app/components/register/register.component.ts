import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup, FormGroupDirective, NgForm, ValidationErrors, AbstractControl, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ErrorStateMatcher } from '@angular/material/core';
import { JwtTokenHelper } from 'src/app/shared/common/jwt-token-helper/jwt-token-helper';
import { UserModel, UserRegistrationModel } from 'src/app/shared/models/user/user.model';
import { UserService } from 'src/app/shared/services/api/user/user.service';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';

//--- My error matcher
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
    const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty && control.parent.hasError('passwordsDoNotMatch'));

    return invalidParent;
  }
}

@Component({
  selector: 'register',
  styleUrls: ['./register.component.scss'],
  templateUrl: './register.component.html'
})

export class RegisterComponent implements OnInit {
  public registerForm: FormGroup;
  errorMatcher = new MyErrorStateMatcher();
  userRegistrationModel: UserRegistrationModel = new UserRegistrationModel();
  isRegisterSuccess: boolean;
  primaryEmail: string;

  phoneRegex: string = '^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$';

  userInfo: UserModel;

  constructor(
    private router: Router,
    public clientState: ClientState,
    private userService: UserService,
    private authErrorHandler: AuthErrorHandler
  ) { }

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
    this.registerForm = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      userName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8), RegisterComponent.patternValidator(/[A-Z]/, { hasCapitalCase: true }),]),
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

  static patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        // if control is empty return no error
        return null;
      }

      // test the value of the control against the regexp supplied
      const valid = regex.test(control.value);

      // if true, return no error (no error), else return error passed in the second parameter
      return valid ? null : error;
    };
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.registerForm.controls[controlName].hasError(errorName);
  }

  //--- Register
  onRegister = (registerFormValue) => {
    if (!this.registerForm.valid) {
      return;
    }

    this.clientState.isBusy = true;
    this.userRegistrationModel.activationActionLink = '/activate-account';

    this.userService.registerUser(this.userRegistrationModel).subscribe({
      complete: () => {
        this.isRegisterSuccess = true;
        this.clientState.isBusy = false;
      },
      error: (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      },
    });
  }
}
