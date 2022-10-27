import { Component, Input, Output, EventEmitter } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ClientState } from "src/app/shared/services/client/client-state";
import { AddRoleManagementModel } from "src/app/shared/models/role-management/role-management.model";
import { RoleService } from "src/app/shared/services/api/role/role.service";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { AuthErrorHandler } from "src/app/shared/services/auth/auth.error-handler";

@Component({
  selector: "add-role-management",
  templateUrl: "./add-role-management.component.html",
})
export class AddRoleManagementComponent {
  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

  addRoleManagementModel: AddRoleManagementModel = new AddRoleManagementModel();

  isEditCode: boolean;

  constructor(
    private clientState: ClientState,
    private roleService: RoleService,
    private authErrorHandler: AuthErrorHandler
  ) {}

  onChangeRoleName = () => {
    this.addRoleManagementModel.name = this.onRemoveSpecialCharactersName(
      this.addRoleManagementModel.name
    );
    if (!this.isEditCode) {
      this.addRoleManagementModel.code = this.onRemoveSpecialCharactersCode(
        this.addRoleManagementModel.name
      );
    }
  };

  onChangeCode = () => {
    this.isEditCode = true;
    this.addRoleManagementModel.code = this.onRemoveSpecialCharactersCode(
      this.addRoleManagementModel.code
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

  onCreateRole = (form: NgForm) => {
    if (form.invalid) {
      return;
    }

    this.clientState.isBusy = true;
    let creationModel = <AddRoleManagementModel>{
      ...this.addRoleManagementModel,
    };

    this.roleService.createRole(creationModel).subscribe(
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
