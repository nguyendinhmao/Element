import { OnInit, Component, Input, Output, EventEmitter } from "@angular/core";
import { CreationDataChangeTypeModel } from "src/app/shared/models/data-tab/data-change-type.model";
import { ClientState, AuthErrorHandler } from "src/app/shared/services";
import { DataChangeTypeService } from "src/app/shared/services/api/data-tab/data-changetype.service";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { NgForm } from "@angular/forms";
import { MaterialLookUpModel } from "src/app/shared/models/data-tab/data-material.model";

@Component({
  selector: "create-change-type",
  templateUrl: "./create-change-type.component.html",
})
export class CreateChangeTypeComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() projectId: string;

  changeTypeCodeError: boolean = false;
  changeTypeErrorMessage: string;
  materialLookUps: MaterialLookUpModel[] = [];
  creationModel: CreationDataChangeTypeModel = new CreationDataChangeTypeModel();
  constructor(
    public clientState: ClientState,
    private dataChangeTypeService: DataChangeTypeService,
    private authErrorHandler: AuthErrorHandler
  ) { }

  ngOnInit() {
    this.changeTypeCodeError = false;
    this.changeTypeErrorMessage = null;
  }

  onSaveData = (form: NgForm) => {
    if (!form || form.invalid) {
      return;
    }
    this.clientState.isBusy = true;

    this.creationModel.projectId = this.projectId;
    let orderCreateModel = <CreationDataChangeTypeModel>{
      ...this.creationModel,
    };
    this.dataChangeTypeService.createChangeType(orderCreateModel).subscribe({
      complete: () => {
        this.clientState.isBusy = false;
        this.onSuccess.emit(true);
      },
      error: (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      },
    });
  };

  onCancel = () => {
    this.onSuccess.emit(false);
  };
}
