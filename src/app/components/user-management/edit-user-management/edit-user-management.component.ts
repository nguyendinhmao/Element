import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { UserService } from 'src/app/shared/services/api/user/user.service';
import { UserUpdationModel } from 'src/app/shared/models/user/user.model';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';

@Component({
  selector: 'edit-user-management',
  templateUrl: './edit-user-management.component.html'
})

export class EditUserManagementComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() userUpdationModel: UserUpdationModel;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private clientState: ClientState,
    private userService: UserService,
    private authErrorHandler: AuthErrorHandler
  ) { }

  public ngOnInit() {
    if (!this.userUpdationModel) this.userUpdationModel = new UserUpdationModel();
  }

  onUpdateUser = (form: NgForm) => {
    if (form.invalid) {
      return;
    }

    this.clientState.isBusy = true;

    this.userService.updateUser(this.userUpdationModel).subscribe({
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
