import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UserCreationModel } from 'src/app/shared/models/user/user.model';
import { NgForm } from '@angular/forms';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { UserService } from 'src/app/shared/services/api/user/user.service';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';

@Component({
    selector: 'add-user-management',
    templateUrl: './add-user-management.component.html'
})

export class AddUserManagementComponent {
    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

    userCreationModel: UserCreationModel = new UserCreationModel();

    constructor(
        private clientState: ClientState,
        private userService: UserService,
        private authErrorHandler: AuthErrorHandler
    ) { }

    onCreateUser = (form: NgForm) => {
        if (form.invalid) {
            return;
        }

        this.clientState.isBusy = true;
        this.userCreationModel.activationActionLink = "/login";
        let creationModel = <UserCreationModel>{
            ...this.userCreationModel
        };

        this.userService.createUser(creationModel).subscribe({
            complete: () => {
                this.clientState.isBusy = false;
                this.onSuccess.emit(true);
            },
            error: (err: ApiError) => {
                this.clientState.isBusy = false;
                this.authErrorHandler.handleError(err.message);
            },
        });
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}