import { Component, EventEmitter, Output, Input } from "@angular/core";
import { ClientState, AuthErrorHandler } from "src/app/shared/services";
import { RoleManagementModel } from "src/app/shared/models/role-management/role-management.model";
import { RoleService } from "src/app/shared/services/api/role/role.service";
import { ToastrService } from "ngx-toastr";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { Constants } from "src/app/shared/common";

@Component({
  selector: "import-role",
  templateUrl: "./import-role.component.html",
})
export class ImportRoleComponent {
  @Input() visible: boolean;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

  suggestion: boolean = false;
  fileDataRole: File;
  roleManagementModel: RoleManagementModel[] = [];

  constructor(
    public clientState: ClientState,
    private roleService: RoleService,
    private toastr: ToastrService,
    private authErrorHandler: AuthErrorHandler
  ) {}

  onSelectFile = (event) => {
    let file: File = event.target.files && <File>event.target.files[0];
    if (this.fileDataRole !== null) this.fileDataRole = null;
    const filetype = file.type;
    const fileNameEndsWithCsv = file.name.toLocaleLowerCase().endsWith(".csv");
    var isCorrectFileType =
      filetype === "text/csv" ||
      filetype === "application/vnd.ms-excel" ||
      fileNameEndsWithCsv;
    if (file) {
      this.suggestion = isCorrectFileType;
      this.fileDataRole = file;
    }
  };

  onImportData = () => {
    if (this.fileDataRole) {
      const filetype = this.fileDataRole.type;
      const fileNameEndsWithCsv = this.fileDataRole.name
        .toLocaleLowerCase()
        .endsWith(".csv");
      var isCorrectFileType =
        filetype === "text/csv" ||
        filetype === "application/vnd.ms-excel" ||
        fileNameEndsWithCsv;
      if (!isCorrectFileType) {
        this.authErrorHandler.handleError(
          "Please select the file format as csv."
        );
        return;
      }

      this.clientState.isBusy = true;

      this.roleService.insertRolesViaCsvFile(this.fileDataRole).subscribe(
        (res) => {
          this.fileDataRole = null;
          this.onSuccess.emit(true);
          this.clientState.isBusy = false;
        },
        (err: ApiError) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        }
      );
    } else {
      this.toastr.error(Constants.ChooseFile);
    }
  };

  onCancel = () => {
    this.onSuccess.emit(false);
  };
}
