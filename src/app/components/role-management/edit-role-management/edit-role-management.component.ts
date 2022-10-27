import { OnInit, Component, Input, Output, EventEmitter } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ClientState } from "src/app/shared/services/client/client-state";
import { UpdateRoleManagementModel } from "src/app/shared/models/role-management/role-management.model";
import { RoleService } from "src/app/shared/services/api/role/role.service";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { AuthErrorHandler } from "src/app/shared/services/auth/auth.error-handler";

@Component({
  selector: "edit-role-management",
  templateUrl: "./edit-role-management.component.html",
})
export class EditRoleManagementComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() updateRoleManagementModel: UpdateRoleManagementModel;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private clientState: ClientState,
    private roleService: RoleService,
    private authErrorHandler: AuthErrorHandler
  ) {}

  public ngOnInit() {
    if (!this.updateRoleManagementModel)
      this.updateRoleManagementModel = new UpdateRoleManagementModel();
  }

  onChangeRoleName = () => {
    this.updateRoleManagementModel.name = this.onRemoveSpecialCharactersName(
      this.updateRoleManagementModel.name
    );
  };

  onChangeCode = () => {
    this.updateRoleManagementModel.code = this.onRemoveSpecialCharactersCode(
      this.updateRoleManagementModel.code
    );
  };

  onRemoveSpecialCharactersName = (str: string) => {
    return str && str.replace(/[^a-zA-Z0-9- ]/g, "");
  };

  onRemoveSpecialCharactersCode = (str: string) => {
    return (
      str &&
      str
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLocaleUpperCase()
        .substring(0, 15)
    );
  };

  onUpdateRole = (form: NgForm) => {
    if (form.invalid) {
      return;
    }

    this.clientState.isBusy = true;

    this.clientState.isBusy = true;
    let updateModel = <UpdateRoleManagementModel>{
      ...this.updateRoleManagementModel,
    };

    this.roleService.updateRole(updateModel).subscribe(
      (res) => {
        this.onSuccess.emit(true);
        this.clientState.isBusy = false;
      },
      (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      }
    );
  };

  onCancel = () => {
    this.onSuccess.emit(false);
  };
}
