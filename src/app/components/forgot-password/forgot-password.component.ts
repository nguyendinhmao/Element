import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { JwtTokenHelper } from 'src/app/shared/common/jwt-token-helper/jwt-token-helper';
import { UserModel, ForgotPasswordModel } from 'src/app/shared/models/user/user.model';
import { UserService } from 'src/app/shared/services/api/user/user.service';

@Component({
    selector: 'forgot-password',
    styleUrls: ['./forgot-password.component.scss'],
    templateUrl: './forgot-password.component.html'
})

export class ForgotPasswordComponent implements OnInit {
    public forgotPasswordForm: FormGroup;

    isSendMailRecoverSuccess: boolean = false;
    recoveryEmail: string;

    titleLable: string;

    userInfo: UserModel;

    isError: boolean;
    message: string;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        public clientState: ClientState,
        private userService: UserService
    ) {
        this.route.queryParams.subscribe(params => {
            // this.recoverAccount = params['RecoverAccount'];
            if (params['action'] && params['action'] === "RecoverAccount") this.titleLable = "Recover Account";
            else this.titleLable = "Forgot password?";
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
        this.forgotPasswordForm = new FormGroup({
            email: new FormControl('', [Validators.required, Validators.email]),
        });
    }

    public hasError = (controlName: string, errorName: string) => {
        return this.forgotPasswordForm.controls[controlName].hasError(errorName);
    }

    //--- End Create form group

    onForgotPassword = (forgotPasswordFormValue) => {
        if (!this.forgotPasswordForm.valid) {
            return;
        }

        this.clientState.isBusy = true;
        let forgotPasswordModel = <ForgotPasswordModel>{
            email: forgotPasswordFormValue.email,
            passwordResetActionLink: "/reset-password"
        };

        this.userService.forgotPassword(forgotPasswordModel).subscribe({
            complete: () => {
                this.clientState.isBusy = false;
                this.isSendMailRecoverSuccess = true;
                this.recoveryEmail = forgotPasswordFormValue.email;
            },
            error: err => {
                this.isError = true;
                this.message = err.message;
                this.clientState.isBusy = false;
            },
        });
    }
}
