import { OnInit, Component, Input, Output, EventEmitter } from "@angular/core";
import { UpdationDataChangeTypeModel } from "src/app/shared/models/data-tab/data-change-type.model";
import { ClientState, AuthErrorHandler } from "src/app/shared/services";
import { DataChangeTypeService } from "src/app/shared/services/api/data-tab/data-changetype.service";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { NgForm } from "@angular/forms";
import { MaterialLookUpModel } from "src/app/shared/models/data-tab/data-material.model";

@Component({
  selector: "edit-change-type",
  templateUrl: "./edit-change-type.component.html",
})
export class EditChangeTypeComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() changeTypeEditingId: string;

  changeTypeCodeError: boolean = false;
  changeTypeErrorMessage: string;
  materialLookUps: MaterialLookUpModel[] = [];
  updationModel: UpdationDataChangeTypeModel = new UpdationDataChangeTypeModel();
  constructor(
    public clientState: ClientState,
    private dataChangeTypeService: DataChangeTypeService,
    private authErrorHandler: AuthErrorHandler
  ) { }

  ngOnInit() {
    this.changeTypeCodeError = false;
    this.changeTypeErrorMessage = null;
    this.onGetChangeType();
  }
  onGetChangeType() {
    this.clientState.isBusy = true;
    this.dataChangeTypeService
      .getChangeTypeId(this.changeTypeEditingId)
      .subscribe((res) => {
        this.updationModel = res ? <UpdationDataChangeTypeModel>{ ...res } : null;
        this.clientState.isBusy = false;
      }),
      (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      };
  }
  onSaveData = (form: NgForm) => {
    if (!form || form.invalid) {
      return;
    }
    this.clientState.isBusy = true;
    let orderUpdateModel = <UpdationDataChangeTypeModel>{
      ...this.updationModel,
    };
    this.dataChangeTypeService.updateChangeType(orderUpdateModel).subscribe({
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
