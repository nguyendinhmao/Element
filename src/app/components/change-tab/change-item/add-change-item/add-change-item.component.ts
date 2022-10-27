import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Subscription } from "rxjs/internal/Subscription";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthErrorHandler } from "src/app/shared/services/auth/auth.error-handler";
import { ClientState } from "src/app/shared/services/client/client-state";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { NgForm } from "@angular/forms";
import { Constants } from "src/app/shared/common";
import { PunchPageService } from "src/app/shared/services/api/punch-page/punch-page.service";
import { DataSystemService } from "src/app/shared/services/api/data-tab/data-system.service";
import { DataSubSystemService } from "src/app/shared/services/api/data-tab/data-subsystem.service";
import {
  CreatePunchItemModel,
  LoadingSelectionPunchModel,
  SelectionControlName,
  TagLookUpPunchPageModel,
  DrawingLookUpModel,
  DisciplineLookUpPunchPage,
  DescriptionStandard,
  CorrectiveActions,
  Category,
} from "src/app/shared/models/punch-page/punch-page.model";
import { SystemLookUpModel } from "src/app/shared/models/data-tab/data-system.model";
import { SubSystemLookUpModel } from "src/app/shared/models/data-tab/data-subsystem.model";
import { PunchTypeLookUpModel } from "src/app/shared/models/data-tab/data-punchtype.model";
import { OrderLookUpModel } from "src/app/shared/models/data-tab/data-order.model";
import { LocationLookUpModel } from "src/app/shared/models/data-tab/data-location.model";
import { CreateChangeItemModel } from 'src/app/shared/models/change-tab/change-tab.model';
import { ChangePageService } from 'src/app/shared/services/api/change-page/change-page.service';
import { ChangeTypeLookUpModel } from 'src/app/shared/models/data-tab/data-change-type.model';

@Component({
  selector: "add-change-item",
  styleUrls: ["./add-change-item.component.scss"],
  templateUrl: "./add-change-item.component.html",
})

export class AddChangeItemComponent {
  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

  createChangeItemModel: CreateChangeItemModel = new CreateChangeItemModel();
  changeTypeLookupModel: ChangeTypeLookUpModel[] = [];
  changeTypeTempLookupModel: ChangeTypeLookUpModel[] = [];
  tagModels: TagLookUpPunchPageModel[] = [];
  tagTempModels: TagLookUpPunchPageModel[] = [];
  systemModels: SystemLookUpModel[] = [];
  systemTempModels: SystemLookUpModel[] = [];
  subSystemModels: SubSystemLookUpModel[] = [];
  subSystemTempModels: SubSystemLookUpModel[] = [];
  disciplineModels: DisciplineLookUpPunchPage[] = [];
  disciplineTempModels: DisciplineLookUpPunchPage[] = [];
  descriptionModels: DescriptionStandard[] = [];
  correctiveActionModels: CorrectiveActions[] = [];
  categoryModels: Category[] = [];
  typeModels: PunchTypeLookUpModel[] = [];
  typeTempModels: PunchTypeLookUpModel[] = [];
  orderNoModels: OrderLookUpModel[] = [];
  orderNoTempModels: OrderLookUpModel[] = [];
  locationModels: LocationLookUpModel[] = [];
  locationTempModels: LocationLookUpModel[] = [];
  drawingModels: DrawingLookUpModel[] = [];
  drawingTempModels: DrawingLookUpModel[] = [];
  specialType: boolean = false;

  sub: Subscription;
  projectKey: string;
  systemId: string;
  subSystemId: string;

  isDrawingError: boolean = false;
  lookSubSystem: boolean = false;

  loadingSelection: LoadingSelectionPunchModel = new LoadingSelectionPunchModel();
  selectionControlName = SelectionControlName;
  bufferSize = 100;

  constructor(
    private clientState: ClientState,
    private authErrorHandler: AuthErrorHandler,
    private route: ActivatedRoute,
    private router: Router,
    private punchPageService: PunchPageService,
    private systemService: DataSystemService,
    private subSystemService: DataSubSystemService,
    private changeService: ChangePageService) {
    this.sub = this.route.params.subscribe((params) => {
      this.projectKey = params["projectKey"];
      if (!this.projectKey) {
        this.router.navigate([""]);
      } else {
        this.onGetDataDropdown();
      }
    });
  }

  onGetDataDropdown = () => {
    this.clientState.isBusy = true;
    Promise.all([
      this.onGetLookUpSystem(),
      this.onGetLookUpSubsystem(),
      this.onGetLookUpDiscipline(),
      this.onGetLookupChangeType()])
      .then((res) => {
        const [
          systemModels,
          subSystemModels,
          disciplineModels,
          changeTypeLookupModel,
        ] = res;
        this.clientState.isBusy = false;
      })
      .catch(() => {
        this.clientState.isBusy = false;
      });
  };
  onGetLookUpSystem = () => {
    return new Promise((resolve, reject) => {
      this.systemService.getElementSystemLookUp(this.projectKey).subscribe(
        (res) => {
          this.systemModels = res.content
            ? <SystemLookUpModel[]>[...res.content]
            : [];
          this.systemTempModels = this.systemModels.slice(0, this.bufferSize);
          resolve(res.content);
        },
        (err: ApiError) => {
          this.authErrorHandler.handleError(err.message);
          reject(err.message);
        }
      );
    });
  };

  onGetLookUpSubsystem = () => {
    return new Promise((resolve, reject) => {
      this.subSystemService.getSubSystemLookUp(this.projectKey).subscribe(
        (res) => {
          this.subSystemModels = res.content
            ? <SubSystemLookUpModel[]>[...res.content]
            : [];
          this.subSystemTempModels = this.subSystemModels.slice(
            0,
            this.bufferSize
          );
          resolve(res.content);
        },
        (err: ApiError) => {
          this.authErrorHandler.handleError(err.message);
          reject(err.message);
        }
      );
    });
  };

  onGetLookUpDiscipline = () => {
    return new Promise((resolve, reject) => {
      this.punchPageService.getDisciplineLookUpPunchPage(this.projectKey).subscribe(
        (res) => {
          this.disciplineModels = res.content
            ? <DisciplineLookUpPunchPage[]>[...res.content]
            : [];
          this.disciplineTempModels = this.disciplineModels.slice(
            0,
            this.bufferSize
          );
          resolve(res.content);
        },
        (err: ApiError) => {
          this.authErrorHandler.handleError(err.message);
          reject(err.message);
        }
      );
    });
  };

  onGetLookupChangeType = () => {
    return new Promise((resolve, reject) => {
      this.changeService.getChangeTypeLookup(this.projectKey).subscribe(
        (res) => {
          this.changeTypeLookupModel = res.content
            ? <ChangeTypeLookUpModel[]>[...res.content]
            : [];
          this.changeTypeTempLookupModel = this.changeTypeLookupModel.slice(
            0,
            this.bufferSize
          );
          resolve(res.content);
        },
        (err: ApiError) => {
          this.authErrorHandler.handleError(err.message);
          reject(err.message);
        }
      );
    });
  };
  onScrollToEndSelect = (key: string) => {
    if (key) {
      switch (key) {
        case this.selectionControlName.system:
          if (this.systemModels.length > this.bufferSize) {
            this.loadingSelection.isLoadingSystem = true;
            const len = this.systemTempModels.length;
            const more = this.systemModels.slice(len, this.bufferSize + len);
            setTimeout(() => {
              this.loadingSelection.isLoadingSystem = false;
              this.systemTempModels = this.systemTempModels.concat(more);
            }, 500);
          }
          break;

        case this.selectionControlName.subSystem:
          if (this.subSystemModels.length > this.bufferSize) {
            this.loadingSelection.isLoadingSubSystem = true;
            const len = this.subSystemTempModels.length;
            const more = this.subSystemModels.slice(len, this.bufferSize + len);
            setTimeout(() => {
              this.loadingSelection.isLoadingSubSystem = false;
              this.subSystemTempModels = this.subSystemTempModels.concat(more);
            }, 500);
          }
          break;

        case this.selectionControlName.discipline:
          if (this.disciplineModels.length > this.bufferSize) {
            this.loadingSelection.isLoadingDiscipline = true;
            const len = this.disciplineTempModels.length;
            const more = this.disciplineModels.slice(
              len,
              this.bufferSize + len
            );
            setTimeout(() => {
              this.loadingSelection.isLoadingDiscipline = false;
              this.disciplineTempModels = this.disciplineTempModels.concat(
                more
              );
            }, 500);
          }
          break;

        case this.selectionControlName.type:
          if (this.changeTypeLookupModel.length > this.bufferSize) {
            this.loadingSelection.isLoadingType = true;
            const len = this.changeTypeTempLookupModel.length;
            const more = this.changeTypeLookupModel.slice(len, this.bufferSize + len);
            setTimeout(() => {
              this.loadingSelection.isLoadingType = false;
              this.changeTypeTempLookupModel = this.changeTypeTempLookupModel.concat(more);
            }, 500);
          }
          break;
        default:
          break;
      }
    }
  };

  onSearchSelect = ($event: { term: string; }, key: string) => {
    if (key) {
      switch (key) {
        case this.selectionControlName.system:
          this.loadingSelection.isLoadingSystem = true;
          if ($event.term == "") {
            this.systemTempModels = this.systemModels.slice(0, this.bufferSize);
            this.loadingSelection.isLoadingSystem = false;
          } else {
            this.systemTempModels = this.systemModels;
            this.loadingSelection.isLoadingSystem = false;
          }
          break;

        case this.selectionControlName.subSystem:
          this.loadingSelection.isLoadingSubSystem = true;
          if ($event.term == "") {
            this.subSystemTempModels = this.subSystemModels.slice(
              0,
              this.bufferSize
            );
            this.loadingSelection.isLoadingSubSystem = false;
          } else {
            this.subSystemTempModels = this.subSystemModels;
            this.loadingSelection.isLoadingSubSystem = false;
          }
          break;

        case this.selectionControlName.discipline:
          this.loadingSelection.isLoadingDiscipline = true;
          if ($event.term == "") {
            this.disciplineTempModels = this.disciplineModels.slice(
              0,
              this.bufferSize
            );
            this.loadingSelection.isLoadingDiscipline = false;
          } else {
            this.disciplineTempModels = this.disciplineModels;
            this.loadingSelection.isLoadingDiscipline = false;
          }
          break;

        case this.selectionControlName.type:
          this.loadingSelection.isLoadingType = true;
          if ($event.term == "") {
            this.changeTypeTempLookupModel = this.changeTypeLookupModel.slice(0, this.bufferSize);
            this.loadingSelection.isLoadingType = false;
          } else {
            this.changeTypeTempLookupModel = this.changeTypeLookupModel;
            this.loadingSelection.isLoadingType = false;
          }
          break;
        default:
          break;
      }
    }
  };

  onClearSelect = (key: string) => {
    if (key) {
      switch (key) {
        case this.selectionControlName.system:
          this.systemTempModels = this.systemModels.slice(0, this.bufferSize);
          break;
        case this.selectionControlName.subSystem:
          this.subSystemTempModels = this.subSystemModels.slice(
            0,
            this.bufferSize
          );
          break;
        case this.selectionControlName.discipline:
          this.disciplineTempModels = this.disciplineModels.slice(
            0,
            this.bufferSize
          );
          break;
        case this.selectionControlName.type:
          this.changeTypeTempLookupModel = this.changeTypeLookupModel.slice(0, this.bufferSize);
          break;
        default:
          break;
      }
    }
  };

  onSubmit = (f: NgForm) => {
    if (f.invalid) {
      return;
    }
    this.clientState.isBusy = true;
    this.createChangeItemModel.projectKey = this.projectKey;
    this.createChangeItemModel.isSubmit = true;
    this.changeService
      .createChangePage(this.createChangeItemModel)
      .subscribe(
        () => {
          this.clientState.isBusy = false;
          this.onSuccess.emit(true);
          this.authErrorHandler.handleSuccess(Constants.ChangePageCreated);
        },
        (err: ApiError) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        }
      );
  };

  onSaveAsDraft = () => {
    this.clientState.isBusy = true;
    this.createChangeItemModel.projectKey = this.projectKey;
    this.createChangeItemModel.isSubmit = false;
    this.changeService
      .createChangePage(this.createChangeItemModel)
      .subscribe(
        () => {
          this.clientState.isBusy = false;
          this.onSuccess.emit(true);
          this.authErrorHandler.handleSuccess(Constants.ChangePageCreated);
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

  onChangeTypeSelected = ($event: any) => {
    this.specialType = $event.value == 'DBAT';
  }
}
