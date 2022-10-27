import { Component, Output, EventEmitter } from '@angular/core';
import { DetailChangeModel, ChangeFirstStageModel, OtherChangeStageModel, ChangeTypeLookUpModel, LoadingSelectionChangeModel, ChangeStatus, ApproveModel, RejectModel, Signature } from 'src/app/shared/models/change-tab/change-tab.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientState, AuthErrorHandler } from 'src/app/shared/services';
import { ChangePageService } from 'src/app/shared/services/api/change-page/change-page.service';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { SystemLookUpModel } from 'src/app/shared/models/data-tab/data-system.model';
import { SubSystemLookUpModel } from 'src/app/shared/models/data-tab/data-subsystem.model';
import { SelectionControlName } from 'src/app/shared/models/punch-page/punch-page.model';
import { DisciplineLookUpModel } from 'src/app/shared/models/data-tab/data-discipline.model';
import { DataSystemService } from 'src/app/shared/services/api/data-tab/data-system.service';
import { DataSubSystemService } from 'src/app/shared/services/api/data-tab/data-subsystem.service';
import { DataDisciplineService } from 'src/app/shared/services/api/data-tab/data-discipline.service';
import { NgForm } from '@angular/forms';
import { Constants } from 'src/app/shared/common/constants/constants';
import { AuthInProjectDto } from 'src/app/shared/models/project-management/project-management.model';
import { JwtTokenHelper, PermissionsViews } from 'src/app/shared/common';
import { ThemeService } from 'ng2-charts';

@Component({
  selector: 'change-detail',
  templateUrl: './change-detail.component.html',
  styleUrls: ['./change-detail.component.scss']
})

export class ChangeDetailComponent {
  //--- Boolean
  public get changeStatus(): typeof ChangeStatus {
    return ChangeStatus;
  }

  //boolean
  isShowRightSideBar: boolean = false;
  isRejectState: boolean;
  isApproveState: boolean;
  isExpandedAll: boolean;
  isSignState: boolean;
  isShowPinCode: boolean;
  isShowCreatePinCode: boolean;
  isLastStageApprove: boolean;
  isShowSignature: boolean;
  isCanSignature: boolean;
  isSpecialType: boolean = false;

  detailChangeModel: DetailChangeModel = new DetailChangeModel();
  changeFirtStage: ChangeFirstStageModel;
  changeOtherStage: OtherChangeStageModel[] = [];
  changeId: string;
  changeSignatureId: string;
  // model
  changeTypeLookupModel: ChangeTypeLookUpModel[] = [];
  changeTypeTempLookupModel: ChangeTypeLookUpModel[] = [];
  systemModels: SystemLookUpModel[] = [];
  systemTempModels: SystemLookUpModel[] = [];
  subSystemModels: SubSystemLookUpModel[] = [];
  subSystemTempModels: SubSystemLookUpModel[] = [];
  disciplineModels: DisciplineLookUpModel[] = [];
  disciplineTempModels: DisciplineLookUpModel[] = [];
  authInProjectDto: AuthInProjectDto[] = [];
  signatureModel: Signature[] = [];
  //--- Variables
  sub: any;
  moduleKey: string;
  projectKey: string;
  permissionsViews = PermissionsViews;
  loadingSelection: LoadingSelectionChangeModel = new LoadingSelectionChangeModel();
  selectionControlName = SelectionControlName;
  bufferSize = 100;
  changeStageRejectId: string;
  changeStageApproveId: string;
  canSignature = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientState: ClientState,
    private _changeService: ChangePageService,
    private authErrorHandler: AuthErrorHandler,
    private systemService: DataSystemService,
    private subSystemService: DataSubSystemService,
    private changeService: ChangePageService,
    private disciplineService: DataDisciplineService,
  ) {
    this.sub = this.route.params.subscribe((params) => {
      this.moduleKey = params["moduleKey"];
      this.projectKey = params["projectKey"];
      this.changeId = params["changeId"];
      if (!this.moduleKey || !this.projectKey || !this.changeId) {
        this.router.navigate([""]);
      } else {
        this.authInProjectDto = JwtTokenHelper.GetAuthProject()
          ? <AuthInProjectDto[]>[...JwtTokenHelper.GetAuthProject()]
          : [];
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
      this.onGetLookupChangeType(),
      this.onGetData(),
    ])
      .then(() => {
        if (!this.changeTypeTempLookupModel.some((item) => item.id == this.detailChangeModel.firstStage.changeTypeId)) {
          this.changeTypeTempLookupModel = this.changeTypeTempLookupModel.concat(this.changeTypeLookupModel.filter(item => item.id == this.detailChangeModel.firstStage.changeTypeId))
        }
        this.clientState.isBusy = false;

      })
      .catch(() => {
        this.clientState.isBusy = false;
      });
  };
  //--- Open right side bar
  openRightSideBar = () => {
    this.isShowRightSideBar = true;
    this.changeId = this.changeId;
  }
  onCollapseAll() {
    this.isExpandedAll = !this.isExpandedAll;
  }
  closeRightSideBar = () => {
    this.isShowRightSideBar = false;
  }
  onGetData() {
    return new Promise((resolve, reject) => {
      this._changeService.getChangeDetail(this.changeId).subscribe(
        (res) => {
          this.detailChangeModel = res ? <DetailChangeModel>{ ...res } : null;
          this.changeFirtStage = this.detailChangeModel.firstStage;
          this.changeOtherStage = this.detailChangeModel.otherStage;
          this.signatureModel = this.detailChangeModel.signatures;
          this.isCanSignature = this.detailChangeModel.canSignature;
          this.isSpecialType = this.detailChangeModel.isSpecialType;
          let temp = [];
          this.changeOtherStage.map(item => {
            temp.push(Object.assign({}, item))
          });
          let lastStage = this.changeOtherStage.length > 0 ? temp.sort((a, b) => { return b.number - a.number })[0] : this.changeFirtStage
          this.canSignature = lastStage.isCurrentStage && lastStage.status == 2;
          resolve(res);
        },
        (err: ApiError) => {
          this.authErrorHandler.handleError(err.message);
          reject(err.message);
        }
      )
    });
  }
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
      this.disciplineService.getDisciplineLookUp(this.projectKey).subscribe(
        (res) => {
          this.disciplineModels = res.content
            ? <DisciplineLookUpModel[]>[...res.content]
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
            const more = this.changeTypeLookupModel.slice(
              len,
              this.bufferSize + len
            );
            setTimeout(() => {
              this.loadingSelection.isLoadingType = false;
              this.changeTypeTempLookupModel = this.changeTypeTempLookupModel.concat(
                more
              );
            }, 500);
          }
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
            this.changeTypeTempLookupModel = this.changeTypeLookupModel.slice(
              0,
              this.bufferSize
            );
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
          this.changeTypeTempLookupModel = this.changeTypeLookupModel.slice(
            0,
            this.bufferSize
          );
          break;
        default:
          break;
      }
    }
  };
  onSaveAsDraft = () => {
    this.clientState.isBusy = true;
    this.changeFirtStage.projectKey = this.projectKey;
    this.changeService
      .updateChangeFirstStage(this.changeFirtStage)
      .subscribe(
        {
          complete: () => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleSuccess(Constants.ChangeFirstStageUpdated);
            this.onGetData();
          },
          error: (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
          },
        });
  }
  onSaveStageDraft(model: OtherChangeStageModel) {
    this.clientState.isBusy = true;
    model.projectKey = this.projectKey;
    this.changeService
      .updateChangeOrtherStage(model)
      .subscribe(
        {
          complete: () => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleSuccess(Constants.ChangeFirstStageUpdated);
            this.onGetData();
          },
          error: (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
          },
        });
  }
  onSubmit(f: NgForm) {
    if (f.invalid) {
      return;
    }
    this.clientState.isBusy = true;
    this.changeFirtStage.projectKey = this.projectKey;
    this.changeFirtStage.isSubmitted = true;
    this.changeService
      .updateChangeFirstStage(this.changeFirtStage)
      .subscribe(
        {
          complete: () => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleSuccess(Constants.ChangeFirstStageUpdated);
            this.onGetData();
          },
          error: (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
          },
        });
    this.onGetData();
  }
  onSubmitOtherStage(changeStage: OtherChangeStageModel) {
    this.clientState.isBusy = true;
    changeStage.projectKey = this.projectKey;
    changeStage.isSubmitted = true;
    this.changeService
      .updateChangeOrtherStage(changeStage)
      .subscribe(
        {
          complete: () => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleSuccess(Constants.ChangeFirstStageUpdated);
            this.onGetData();
          },
          error: (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
          },
        });
  }

  onApprove(changeStageId: string) {
    this.changeStageApproveId = changeStageId;
    this.isApproveState = true;
  }
  onApproveConfirm(isConfirm: boolean) {
    if (isConfirm) {
      var changeApproveModel = new ApproveModel();
      changeApproveModel.changeStageId = this.changeStageApproveId;
      changeApproveModel.projectKey = this.projectKey;
      this.changeService
        .approveChange(changeApproveModel)
        .subscribe(
          {
            complete: () => {
              this.clientState.isBusy = false;
              this.changeStageApproveId = null;
              this.isApproveState = false;
              this.authErrorHandler.handleSuccess(Constants.ChangeStageApproved);
              this.onGetData();
            },
            error: (err: ApiError) => {
              this.clientState.isBusy = false;
              this.authErrorHandler.handleError(err.message);
            },
          });
    }
  }
  onReject(changeStageId: string) {
    this.changeStageRejectId = changeStageId;
    this.isRejectState = true;
  }
  onRejectConfirm = (reasonText: string) => {
    var changeRejectModal = new RejectModel();
    changeRejectModal.changeStageId = this.changeStageRejectId;
    changeRejectModal.projectKey = this.projectKey;
    changeRejectModal.reason = reasonText;
    this.changeService
      .rejectChange(changeRejectModal)
      .subscribe(
        {
          complete: () => {
            this.clientState.isBusy = false;
            this.changeStageRejectId = null;
            this.authErrorHandler.handleSuccess(Constants.ChangeStageRejected);
            this.isRejectState = false;
            this.onGetData();
          },
          error: (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
          },
        });
  };
  onOpenSignModal = () => {
    this.isShowSignature = true;
  };

  onSignConfirm(changeId: string) {
    if (!changeId) { return };
    this.clientState.isBusy = true;
    this.changeService.signValidate([changeId], this.projectKey).subscribe({
      complete: () => {
        this.isShowSignature = false;
        this.onShowPinCodeModal();
      },
      error: (err: ApiError) => {
        this.clientState.isBusy = false;
        this.isShowSignature = false;
        if (err.type == Constants.PinCodeNotExistsException) {
          this.onShowPinCodeModal(true);
        } else {
          this.authErrorHandler.handleError(err.message);
        }
      },
    });
  }

  onShowPinCodeModal = (isCreatePinCode: boolean = false) => {
    this.isShowPinCode = true;
    if (isCreatePinCode) {
      this.onShowCreatePinCodeModal();
    }
    this.clientState.isBusy = false;
  };

  onPinCodeConfirmModal(code: string) {
    this.isShowPinCode = false;
    this.isShowCreatePinCode = false;

    if (code) {
      if (code == "CREATE") {
        this.onCreatePinCodeConfirmModal(true);
        return;
      }
      this.clientState.isBusy = true;
      let changeIds = [];
      changeIds.push(this.changeId);
      this.changeService
        .signOffChanges(changeIds, this.projectKey, parseInt(code))
        .subscribe({
          complete: () => {
            this.authErrorHandler.handleSuccess(Constants.SignSuccess);
            this.clientState.isBusy = false;
            this.onGetData();
          },
          error: (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
          },
        });
    }
  }
  onShowCreatePinCodeModal = () => {
    this.isShowCreatePinCode = true;
  };

  onCreatePinCodeConfirmModal = (isConfirm: boolean) => {
    this.isShowCreatePinCode = false;
    if (isConfirm) {
      this.router.navigate(["/change-pincode"]);
    }
  };
  onCancelReject(isConfirm: boolean) {
    this.isRejectState = false;
  }
}
