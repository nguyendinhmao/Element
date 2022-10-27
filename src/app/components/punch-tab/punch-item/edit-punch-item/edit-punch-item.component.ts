import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Subscription } from "rxjs/internal/Subscription";
import { AuthErrorHandler } from "src/app/shared/services/auth/auth.error-handler";
import { ClientState } from "src/app/shared/services/client/client-state";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { NgForm } from "@angular/forms";
import { Constants, JwtTokenHelper } from "src/app/shared/common";
import { PunchPageService } from "src/app/shared/services/api/punch-page/punch-page.service";
import { DataSystemService } from "src/app/shared/services/api/data-tab/data-system.service";
import { DataSubSystemService } from "src/app/shared/services/api/data-tab/data-subsystem.service";
import { DataPunchTypeService } from "src/app/shared/services/api/data-tab/data-punchtype.service";
import { DataOrderService } from "src/app/shared/services/api/data-tab/data-order.service";
import { DataLocationService } from "src/app/shared/services/api/data-tab/data-location.service";
import {
  UpdatePunchItemModel,
  LoadingSelectionPunchModel,
  SelectionControlName,
  TagLookUpPunchPageModel,
  DrawingLookUpModel,
  DisciplineLookUpPunchPage,
  DescriptionStandard,
  CorrectiveActions,
  PunchPageListModel,
  Category,
  ImageLookUp,
  ImageBase64Helper,
} from "src/app/shared/models/punch-page/punch-page.model";
import { SystemLookUpModel } from "src/app/shared/models/data-tab/data-system.model";
import { SubSystemLookUpModel } from "src/app/shared/models/data-tab/data-subsystem.model";
import { PunchTypeLookUpModel } from "src/app/shared/models/data-tab/data-punchtype.model";
import { OrderLookUpModel } from "src/app/shared/models/data-tab/data-order.model";
import { LocationLookUpModel } from "src/app/shared/models/data-tab/data-location.model";
import { IdbService } from 'src/app/shared/services';
import { StoreNames } from 'src/app/shared/models/common/common.model';
import { KeyLookups, KeyValues, PunchStatuses, PunchStatusIds } from 'src/app/shared/models/punch-item/punch-item.model';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';

@Component({
  selector: "edit-punch-item",
  styleUrls: ["./edit-punch-item.component.scss"],
  templateUrl: "./edit-punch-item.component.html",
})

export class EditPunchItemComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() projectKey: string;
  @Input() punchId: string;
  @Output() onSuccess: EventEmitter<PunchPageListModel> = new EventEmitter();

  punchItemModel: PunchPageListModel = new PunchPageListModel();
  updatePunchItemModel: UpdatePunchItemModel = new UpdatePunchItemModel();
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
  images: File[] = [];
  materialsRequiredModels: [
    { value: true; label: "Yes" },
    { value: false; label: "No" }
  ];
  orderNoModels: OrderLookUpModel[] = [];
  orderNoTempModels: OrderLookUpModel[] = [];
  locationModels: LocationLookUpModel[] = [];
  locationTempModels: LocationLookUpModel[] = [];
  drawingModels: DrawingLookUpModel[] = [];
  drawingTempModels: DrawingLookUpModel[] = [];
  loadingSelection: LoadingSelectionPunchModel = new LoadingSelectionPunchModel();
  _storeName: string;

  //--- Boolean
  isDrawingError: boolean = false;
  lookSubSystem: boolean = false;

  //--- Variable
  sub: Subscription;
  systemId: string;
  subSystemId: string;
  selectionControlName = SelectionControlName;
  bufferSize = 100;
  punchImages = [];

  constructor(
    private clientState: ClientState,
    private authErrorHandler: AuthErrorHandler,
    private punchPageService: PunchPageService,
    private systemService: DataSystemService,
    private subSystemService: DataSubSystemService,
    private punchTypeService: DataPunchTypeService,
    private orderService: DataOrderService,
    private locationService: DataLocationService,
    private idbService: IdbService,
  ) {
    this._storeName = StoreNames.lookups;
  }

  public ngOnInit() {
    if (this.projectKey && this.punchId) {
      if (this.isOffline) {
        this.onGetDataDropdownOffline();
      } else {
        this.onGetDataDropdownOnline();
      }
    } else {
      this.onSuccess.emit(null);
    }
  }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  onGetDataDropdownOnline = () => {
    this.clientState.isBusy = true;
    Promise.all([
      this.onGetPunchDetail(),
      this.onGetTagLookUp(this.projectKey),
      this.onGetLookUpSystem(),
      this.onGetLookUpDiscipline(),
      this.onGetLookUpPunchType(),
      this.onGetLookUpOrder(),
      this.onGetLocationLookUp(),
      this.onGetDrawingLookUp(this.projectKey),
    ])
      .then((res) => {
        this.executeFuncsAfterHavingData();
        this.clientState.isBusy = false;
      })
      .catch((err) => {
        this.clientState.isBusy = false;
      });
  };

  executeFuncsAfterHavingData() {
    this.categoryModels = [
      { category: "A" },
      { category: "B" },
      { category: "C" },
    ];

    this.materialsRequiredModels = [
      { value: true, label: "Yes" },
      { value: false, label: "No" },
    ];

    this.onGetSubSystemLookUpBySystem(this.systemId);


    this.onChangeDiscipline(true);

    if (
      this.updatePunchItemModel.punchTypeId &&
      this.typeTempModels &&
      this.typeTempModels.length > 0 &&
      !this.typeTempModels.some(
        (item) => item.id == this.updatePunchItemModel.punchTypeId
      )
    ) {
      let typeItem = this.typeModels.filter(
        (item) => item.id == this.updatePunchItemModel.punchTypeId
      )[0];
      this.typeTempModels = this.typeTempModels.concat(typeItem);
    }

    if (
      this.updatePunchItemModel.locationId &&
      this.locationTempModels &&
      this.locationTempModels.length > 0 &&
      !this.locationTempModels.some(
        (item) => item.id == this.updatePunchItemModel.locationId
      )
    ) {
      let locationItem = this.locationModels.filter(
        (item) => item.id == this.updatePunchItemModel.locationId
      )[0];
      this.locationTempModels = this.locationTempModels.concat(
        locationItem
      );
    }

    if (
      this.updatePunchItemModel.orderId &&
      this.orderNoTempModels &&
      this.orderNoTempModels.length > 0 &&
      !this.orderNoTempModels.some(
        (item) => item.id == this.updatePunchItemModel.orderId
      )
    ) {
      let orderItem = this.orderNoModels.filter(
        (item) => item.id == this.updatePunchItemModel.orderId
      )[0];
      this.orderNoTempModels = this.orderNoTempModels.concat(orderItem);
    }

    if (
      this.updatePunchItemModel.systemId &&
      this.systemTempModels &&
      this.systemTempModels.length > 0 &&
      !this.systemTempModels.some(
        (item) => item.id == this.updatePunchItemModel.systemId
      )
    ) {
      let systemItem = this.systemModels.filter(
        (item) => item.id == this.updatePunchItemModel.systemId
      )[0];
      this.systemTempModels = this.systemTempModels.concat(systemItem);
    }

    if (
      this.updatePunchItemModel.disciplineId &&
      this.disciplineTempModels &&
      this.disciplineTempModels.length > 0 &&
      !this.disciplineTempModels.some(
        (item) => item.id == this.updatePunchItemModel.disciplineId
      )
    ) {
      let disciplineItem = this.disciplineModels.filter(
        (item) => item.id == this.updatePunchItemModel.disciplineId
      )[0];
      this.disciplineTempModels = this.disciplineTempModels.concat(disciplineItem);
    }

    if (!this.updatePunchItemModel.materialsRequired) {
      this.updatePunchItemModel.materialsRequired = false;
    }

  }

  onGetDataDropdownOffline() {
    this.clientState.isBusy = true;
    const _snPunches = StoreNames.punches;

    Promise.all([
      //--- Get PunchDetail
      this.idbService.getItem(_snPunches, this.punchId).then((res) => {
        this.updatePunchItemModel = res
          ? <UpdatePunchItemModel>{ ...res }
          : new UpdatePunchItemModel();
        let _drawingIds = [];
        this.updatePunchItemModel.drawings.forEach(_dr => {
          _drawingIds.push(_dr.drawingId);
        });
        this.updatePunchItemModel.drawingIds = [..._drawingIds];
        this.updatePunchItemModel.projectKey = this.projectKey;
        this.systemId = this.updatePunchItemModel.systemId;
        this.subSystemId = this.updatePunchItemModel.subSystemId;
        this.updatePunchItemModel.deleteImages = [];
      }, (err) => { }),
      //--- Get Tag filter
      this.idbService.getItem(this._storeName, KeyLookups.tagLookUpPunchPage).then((res) => {
        this.tagModels = res
          ? <TagLookUpPunchPageModel[]>[...res]
          : [];
        this.tagTempModels = this.tagModels.slice(0, this.bufferSize);
      }, (err) => { }),
      //--- Get System filter
      this.idbService.getItem(this._storeName, KeyLookups.systemLookup).then((res) => {
        this.systemModels = res
          ? <SystemLookUpModel[]>[...res]
          : [];
        this.systemTempModels = this.systemModels.slice(0, this.bufferSize);
      }, (err) => { }),
      //--- Get Discipline filter
      this.idbService.getItem(this._storeName, KeyLookups.disciplineLookUp).then((res) => {
        this.disciplineModels = res
          ? <DisciplineLookUpPunchPage[]>[...res]
          : [];
        this.disciplineTempModels = this.disciplineModels.slice(
          0,
          this.bufferSize
        );
      }, (err) => { }),
      //--- Get PunchType filter
      this.idbService.getItem(this._storeName, KeyLookups.punchTypeLookup).then((res) => {
        this.typeModels = res
          ? <PunchTypeLookUpModel[]>[...res]
          : [];
        this.typeTempModels = this.typeModels.slice(0, this.bufferSize);
      }, (err) => { }),
      //--- Get Order filter
      this.idbService.getItem(this._storeName, KeyLookups.orderLookup).then((res) => {
        this.orderNoModels = res
          ? <OrderLookUpModel[]>[...res]
          : [];
        this.orderNoTempModels = this.orderNoModels.slice(0, this.bufferSize);
      }, (err) => { }),
      //--- Get Location filter
      this.idbService.getItem(this._storeName, KeyLookups.locationLookup).then((res) => {
        this.locationModels = res
          ? <LocationLookUpModel[]>[...res]
          : [];
        this.locationTempModels = this.locationModels.slice(
          0,
          this.bufferSize
        );
      }, (err) => { }),
      //--- Get Drawing filter
      this.idbService.getItem(this._storeName, KeyLookups.drawingLookup).then((res) => {
        this.drawingModels = res
          ? <DrawingLookUpModel[]>[...res]
          : [];
        this.drawingTempModels = this.drawingModels.slice(0, this.bufferSize);
      }, (err) => { }),
    ])
      .then((res) => {
        this.executeFuncsAfterHavingData();
        if (this.locationModels) {
          const _locationLookup = this.locationModels.find(_dr => _dr.value === this.updatePunchItemModel.locationCode);
          this.updatePunchItemModel.locationId = _locationLookup.id;
        }
        this.clientState.isBusy = false;
      })
      .catch((err) => {
        this.clientState.isBusy = false;
      });
  }

  onGetPunchDetail = () => {
    return new Promise((resolve, reject) => {
      this.punchPageService
        .getPunchDetail(this.projectKey, this.punchId)
        .subscribe(
          (res) => {
            this.updatePunchItemModel = res
              ? <UpdatePunchItemModel>{ ...res }
              : new UpdatePunchItemModel();
            this.updatePunchItemModel.projectKey = this.projectKey;
            this.systemId = this.updatePunchItemModel.systemId;
            this.subSystemId = this.updatePunchItemModel.subSystemId;
            this.updatePunchItemModel.deleteImages = []
            resolve(res);
          },
          (err: ApiError) => {
            this.authErrorHandler.handleError(err.message);
            reject(err.message);
          }
        );
    });
  };

  onGetTagLookUp = (projectKey: string) => {
    return new Promise((resolve, reject) => {
      this.punchPageService.getTagLookUpPunchPage(projectKey).subscribe(
        (res) => {
          this.tagModels = res.content
            ? <TagLookUpPunchPageModel[]>[...res.content]
            : [];
          this.tagTempModels = this.tagModels.slice(0, this.bufferSize);
          resolve(res.content);
        },
        (err: ApiError) => {
          this.authErrorHandler.handleError(err.message);
          reject(err.message);
        }
      );
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

  onGetLookUpPunchType = () => {
    return new Promise((resolve, reject) => {
      this.punchTypeService.getPunchTypeLookUp(this.projectKey).subscribe(
        (res) => {
          this.typeModels = res.content
            ? <PunchTypeLookUpModel[]>[...res.content]
            : [];
          this.typeTempModels = this.typeModels.slice(0, this.bufferSize);
          resolve(res.content);
        },
        (err: ApiError) => {
          this.authErrorHandler.handleError(err.message);
          reject(err.message);
        }
      );
    });
  };

  onGetLookUpOrder() {
    return new Promise((resolve, reject) => {
      this.orderService.getOrderLookUp(this.projectKey).subscribe(
        (res) => {
          this.orderNoModels = res.content
            ? <OrderLookUpModel[]>[...res.content]
            : [];
          this.orderNoTempModels = this.orderNoModels.slice(0, this.bufferSize);
          resolve(res.content);
        },
        (err: ApiError) => {
          this.authErrorHandler.handleError(err.message);
          reject(err.message);
        }
      );
    });
  }

  onGetLocationLookUp() {
    return new Promise((resolve, reject) => {
      this.locationService.getLocationLookUp(this.projectKey).subscribe(
        (res) => {
          this.locationModels = res.content
            ? <LocationLookUpModel[]>[...res.content]
            : [];
          this.locationTempModels = this.locationModels.slice(
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
  }

  onGetDrawingLookUp = (projectKey: string) => {
    return new Promise((resolve, reject) => {
      this.punchPageService.getDrawingLookUpPunchPage(projectKey).subscribe(
        (res) => {
          this.drawingModels = res.content
            ? <DrawingLookUpModel[]>[...res.content]
            : [];
          this.drawingTempModels = this.drawingModels.slice(0, this.bufferSize);
          resolve(res.content);
        },
        (err: ApiError) => {
          this.authErrorHandler.handleError(err.message);
          reject(err.message);
        }
      );
    });
  };

  onGetSubSystemLookUpBySystem(systemId?: string) {
    if (this.isOffline) {
      this.executeGetSubsystemFilterOff(systemId);
    } else {
      this.executeGetSubsystemFilterOn(systemId);
    }
  }

  executeGetSubsystemFilterOn(systemId: string) {
    this.clientState.isBusy = true;
    this.subSystemService.getSubSystemLookUp(this.projectKey, systemId || "").subscribe(
      (res) => {
        this.subSystemModels = res.content
          ? <SubSystemLookUpModel[]>[...res.content]
          : [];
        this.subSystemTempModels = this.subSystemModels.slice(
          0,
          this.bufferSize
        );
        this.clientState.isBusy = false;
      },
      (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      }
    );
  }

  executeGetSubsystemFilterOff(systemId: string) {
    this.clientState.isBusy = true;
    this.idbService.getItem(this._storeName, KeyLookups.subSystemLookup).then((res) => {
      if (res && res.length > 0) {
        const _subMatchSys = systemId ? res.filter(sub => sub.systemId === systemId) : res;
        this.subSystemModels = _subMatchSys
          ? <SubSystemLookUpModel[]>[..._subMatchSys]
          : [];
        this.subSystemTempModels = this.subSystemModels.slice(
          0,
          this.bufferSize
        );
      }
      this.clientState.isBusy = false;
    }, (err) => {
      this.clientState.isBusy = false;
    })
  }

  onScrollToEndSelect = (key: string) => {
    if (key) {
      switch (key) {
        case this.selectionControlName.tag:
          if (this.tagModels.length > this.bufferSize) {
            this.loadingSelection.isLoadingTag = true;
            const len = this.tagTempModels.length;
            const more = this.tagModels.slice(len, this.bufferSize + len);
            setTimeout(() => {
              this.loadingSelection.isLoadingTag = false;
              this.tagTempModels = this.tagTempModels.concat(more);
            }, 500);
          }
          break;

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
          if (this.typeModels.length > this.bufferSize) {
            this.loadingSelection.isLoadingType = true;
            const len = this.typeTempModels.length;
            const more = this.typeModels.slice(len, this.bufferSize + len);
            setTimeout(() => {
              this.loadingSelection.isLoadingType = false;
              this.typeTempModels = this.typeTempModels.concat(more);
            }, 500);
          }
          break;

        case this.selectionControlName.orderNo:
          if (this.orderNoModels.length > this.bufferSize) {
            this.loadingSelection.isLoadingOrderNo = true;
            const len = this.orderNoTempModels.length;
            const more = this.orderNoModels.slice(len, this.bufferSize + len);
            setTimeout(() => {
              this.loadingSelection.isLoadingOrderNo = false;
              this.orderNoTempModels = this.orderNoTempModels.concat(more);
            }, 500);
          }
          break;

        case this.selectionControlName.location:
          if (this.locationModels.length > this.bufferSize) {
            this.loadingSelection.isLoadingLocation = true;
            const len = this.locationTempModels.length;
            const more = this.locationModels.slice(len, this.bufferSize + len);
            setTimeout(() => {
              this.loadingSelection.isLoadingLocation = false;
              this.locationTempModels = this.locationTempModels.concat(more);
            }, 500);
          }
          break;

        case this.selectionControlName.drawing:
          if (this.drawingModels.length > this.bufferSize) {
            this.loadingSelection.isLoadingDrawing = true;
            const len = this.drawingTempModels.length;
            const more = this.drawingModels.slice(len, this.bufferSize + len);
            setTimeout(() => {
              this.loadingSelection.isLoadingDrawing = false;
              this.drawingTempModels = this.drawingTempModels.concat(more);
            }, 500);
          }
          break;

        default:
          break;
      }
    }
  };

  onSearchSelect = ($event, key: string) => {
    if (key) {
      switch (key) {
        case this.selectionControlName.tag:
          this.loadingSelection.isLoadingTag = true;
          if ($event.term == "") {
            this.tagTempModels = this.tagModels.slice(0, this.bufferSize);
            this.loadingSelection.isLoadingTag = false;
          } else {
            this.tagTempModels = this.tagModels;
            this.loadingSelection.isLoadingTag = false;
          }
          break;

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
            this.typeTempModels = this.typeModels.slice(0, this.bufferSize);
            this.loadingSelection.isLoadingType = false;
          } else {
            this.typeTempModels = this.typeModels;
            this.loadingSelection.isLoadingType = false;
          }
          break;

        case this.selectionControlName.orderNo:
          this.loadingSelection.isLoadingOrderNo = true;
          if ($event.term == "") {
            this.orderNoTempModels = this.orderNoModels.slice(
              0,
              this.bufferSize
            );
            this.loadingSelection.isLoadingOrderNo = false;
          } else {
            this.orderNoTempModels = this.orderNoModels;
            this.loadingSelection.isLoadingOrderNo = false;
          }
          break;

        case this.selectionControlName.location:
          this.loadingSelection.isLoadingLocation = true;
          if ($event.term == "") {
            this.locationTempModels = this.locationModels.slice(
              0,
              this.bufferSize
            );
            this.loadingSelection.isLoadingLocation = false;
          } else {
            this.locationTempModels = this.locationModels;
            this.loadingSelection.isLoadingLocation = false;
          }
          break;

        case this.selectionControlName.drawing:
          this.loadingSelection.isLoadingDrawing = true;
          if ($event.term == "") {
            this.drawingTempModels = this.drawingModels.slice(
              0,
              this.bufferSize
            );
            this.loadingSelection.isLoadingDrawing = false;
          } else {
            this.drawingTempModels = this.drawingModels;
            this.loadingSelection.isLoadingDrawing = false;
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
        case this.selectionControlName.tag:
          this.tagTempModels = this.tagModels.slice(0, this.bufferSize);
          break;

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
          this.typeTempModels = this.typeModels.slice(0, this.bufferSize);
          break;

        case this.selectionControlName.orderNo:
          this.orderNoTempModels = this.orderNoModels.slice(0, this.bufferSize);
          break;

        case this.selectionControlName.location:
          this.locationTempModels = this.locationModels.slice(
            0,
            this.bufferSize
          );
          break;

        case this.selectionControlName.drawing:
          this.drawingTempModels = this.drawingModels.slice(0, this.bufferSize);
          break;

        default:
          break;
      }
    }
  };

  onChangeTag = () => {
    if (
      this.updatePunchItemModel.tagId &&
      this.tagModels &&
      this.tagModels.length > 0 &&
      this.tagModels.some((item) => item.id == this.updatePunchItemModel.tagId)
    ) {
      let tagItem = this.tagModels.filter(
        (item) => item.id == this.updatePunchItemModel.tagId
      )[0];
      this.systemId = tagItem && tagItem.systemId ? tagItem.systemId : null;
      this.subSystemId =
        tagItem && tagItem.subSystemId ? tagItem.subSystemId : null;
      this.updatePunchItemModel.disciplineId =
        tagItem && tagItem.disciplineId ? tagItem.disciplineId : null;
    } else {
      this.systemId = null;
      this.subSystemId = null;
      this.updatePunchItemModel.disciplineId = null;
    }

    this.lookSubSystem = this.subSystemId == null;
    this.onGetSubSystemLookUpBySystem(this.systemId);
    this.onChangeDiscipline(true);
  };

  onSetTag = () => {
    let temp = [];
    if (
      this.updatePunchItemModel.disciplineId &&
      this.systemId &&
      this.subSystemId
    ) {
      temp = this.tagModels.filter(
        (item) =>
          item.disciplineId == this.updatePunchItemModel.disciplineId &&
          item.systemId == this.systemId &&
          item.subSystemId == this.subSystemId
      );
    } else if (
      this.updatePunchItemModel.disciplineId &&
      !this.systemId &&
      !this.subSystemId
    ) {
      temp = this.tagModels.filter(
        (item) => item.disciplineId == this.updatePunchItemModel.disciplineId
      );
    } else if (
      this.updatePunchItemModel.disciplineId &&
      this.systemId &&
      !this.subSystemId
    ) {
      temp = this.tagModels.filter(
        (item) =>
          item.disciplineId == this.updatePunchItemModel.disciplineId &&
          item.systemId == this.systemId
      );
    } else if (
      !this.updatePunchItemModel.disciplineId &&
      this.systemId &&
      !this.subSystemId
    ) {
      temp = this.tagModels.filter((item) => item.systemId == this.systemId);
    } else if (
      !this.updatePunchItemModel.disciplineId &&
      this.systemId &&
      this.subSystemId
    ) {
      temp = this.tagModels.filter(
        (item) =>
          item.systemId == this.systemId && item.subSystemId == this.subSystemId
      );
    } else if (
      !this.updatePunchItemModel.disciplineId &&
      !this.systemId &&
      this.subSystemId
    ) {
      temp = this.tagModels.filter(
        (item) => item.subSystemId == this.subSystemId
      );
    } else {
      temp = this.tagModels;
    }

    this.tagTempModels = temp.slice(0, this.bufferSize);
  };

  onChangeDiscipline = (isChangeTag: boolean = false) => {
    if (
      this.updatePunchItemModel.disciplineId &&
      this.disciplineModels &&
      this.disciplineModels.length > 0 &&
      this.disciplineModels.some(
        (item) => item.id == this.updatePunchItemModel.disciplineId
      )
    ) {
      let disciplineItem = this.disciplineModels.filter(
        (item) => item.id == this.updatePunchItemModel.disciplineId
      )[0];
      if (
        !this.disciplineTempModels.some(
          (item) => item.id == this.updatePunchItemModel.disciplineId
        )
      ) {
        this.disciplineTempModels = this.disciplineTempModels.concat(
          disciplineItem
        );
      }
      this.descriptionModels = disciplineItem.descriptions;
    } else {
      this.descriptionModels = [];
    }
    if (!isChangeTag) {
      if (this.updatePunchItemModel.tagId) {
        this.systemId = null;
        this.subSystemId = null;
        this.subSystemModels = [];
        this.subSystemTempModels = [];
      }
      this.updatePunchItemModel.tagId = null;
    }
    this.onSetTag();
    this.onChangeDescription();
  };

  onChangeDescription = () => {
    if (
      this.updatePunchItemModel.description &&
      this.descriptionModels &&
      this.descriptionModels.length > 0 &&
      this.descriptionModels.some(
        (item) => item.description == this.updatePunchItemModel.description
      )
    ) {
      let descriptionItem = this.descriptionModels.filter(
        (item) => item.description == this.updatePunchItemModel.description
      )[0];
      this.correctiveActionModels = descriptionItem.correctiveActions;
      if (
        descriptionItem.correctiveActions &&
        descriptionItem.correctiveActions.length > 0 &&
        descriptionItem.correctiveActions[0].category
      ) {
        this.updatePunchItemModel.category =
          descriptionItem.correctiveActions[0].category;
      }
      this.correctiveActionModels = descriptionItem.correctiveActions;
    } else {
      this.correctiveActionModels = [];
    }
  };

  onChangeSystem = (isChangeTag: boolean = false) => {
    if (!isChangeTag) {
      if (this.updatePunchItemModel.tagId) {
        this.updatePunchItemModel.disciplineId = null;
      }
      this.updatePunchItemModel.tagId = null;
    }
    this.lookSubSystem = false;
    this.subSystemId = null;
    this.onSetTag();
    this.onGetSubSystemLookUpBySystem(this.systemId);
  };

  onChangeSubSystem = (isChangeTag: boolean = false) => {
    if (!isChangeTag) this.updatePunchItemModel.tagId = null;
    this.onSetTag();
  };

  onCheckDrawingLocation = () => {
    let isExistDrawingLocation = false;
    if (
      this.updatePunchItemModel.drawingIds &&
      this.updatePunchItemModel.drawingIds.length > 0
    ) {
      this.updatePunchItemModel.drawingIds.map((drawing) => {
        if (
          this.drawingModels.some(
            (item) =>
              item.drawingId == drawing && item.isLocationDrawing == true
          )
        ) {
          isExistDrawingLocation = true;
        }
      });
    } else {
      return;
    }

    if (!isExistDrawingLocation) {
      this.isDrawingError = true;
      return;
    } else {
      this.isDrawingError = false;
    }
  };

  onSubmit = (f: NgForm) => {
    this.onCheckDrawingLocation();

    if (f.invalid || this.isDrawingError) {
      return;
    }

    this.clientState.isBusy = true;

    this.updatePunchItemModel.systemId = this.systemId;
    this.updatePunchItemModel.subSystemId = this.subSystemId;
    let drawingTemp = this.updatePunchItemModel.drawings || [];
    if (drawingTemp) {
      this.updatePunchItemModel.drawings = [];
      if (this.updatePunchItemModel.drawingIds
        && this.updatePunchItemModel.drawingIds.length > 0) {
        this.updatePunchItemModel.drawingIds.map((drawingId) => {
          if (
            drawingId &&
            !drawingTemp.some((item) => item.drawingId == drawingId)
          ) {
            let drawing = this.drawingModels.filter(
              (item) => item.drawingId == drawingId
            )[0];
            this.updatePunchItemModel.drawings.push({
              ...drawing,
              isAdded: true,
              isDeleted: false,
            });
          }
        });
      }

      drawingTemp.map((drawing) => {
        if (
          drawing &&
          drawing.drawingId &&
          this.updatePunchItemModel.drawingIds &&
          !this.updatePunchItemModel.drawingIds.some(
            (item) => item == drawing.drawingId
          )
        ) {
          this.updatePunchItemModel.drawings.push({
            ...drawing,
            isAdded: false,
            isDeleted: true,
          });
        }
      });
    }

    if (this.isOffline) {
      const _snPunches = StoreNames.punches;
      const _userInfo = JwtTokenHelper.GetUserInfo();

      let _update = this.editPunchOffline();
      _update.status = PunchStatuses.submitted;
      _update.statusId = PunchStatusIds.submitted;
      _update.raisedBy = _userInfo.userName; //--- Change when having any wrong

      this.idbService.addItem(_snPunches, _update.punchId, _update);
      this.onSuccess.emit(null); //--- Don't send response when offline
      this.clientState.isBusy = false;
      this.authErrorHandler.handleSuccess(Constants.PunchPageUpdated);
    } else {
      this.updatePunchItemModel.isSubmit = true;
      this.punchPageService
        .updatePunchPage(this.updatePunchItemModel, this.images)
        .subscribe(
          (res) => {
            this.punchItemModel = res.content
              ? <PunchPageListModel>{ ...res.content }
              : new PunchPageListModel();
            this.onSuccess.emit(this.punchItemModel);
            this.clientState.isBusy = false;
            this.authErrorHandler.handleSuccess(Constants.PunchPageUpdated);
          },
          (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
          }
        );
    }
  };

  onSaveAsDraft = () => {
    this.clientState.isBusy = true;

    this.updatePunchItemModel.systemId = this.systemId;
    this.updatePunchItemModel.subSystemId = this.subSystemId;

    let drawingTemp = this.updatePunchItemModel.drawings || [];
    if (drawingTemp) {
      this.updatePunchItemModel.drawings = [];

      if (this.updatePunchItemModel.drawingIds
        && this.updatePunchItemModel.drawingIds.length > 0) {
        this.updatePunchItemModel.drawingIds.map((drawingId) => {
          if (
            drawingId &&
            !drawingTemp.some((item) => item.drawingId == drawingId)
          ) {
            let drawing = this.drawingModels.filter(
              (item) => item.drawingId == drawingId
            )[0];
            this.updatePunchItemModel.drawings.push({
              ...drawing,
              isAdded: true,
              isDeleted: false,
            });
          }
        });
      }

      drawingTemp.map((drawing) => {
        if (
          drawing &&
          drawing.drawingId &&
          this.updatePunchItemModel.drawingIds &&
          !this.updatePunchItemModel.drawingIds.some(
            (item) => item == drawing.drawingId
          )
        ) {
          this.updatePunchItemModel.drawings.push({
            ...drawing,
            isAdded: false,
            isDeleted: true,
          });
        }
      });
    }

    if (this.isOffline) {
      const _snPunches = StoreNames.punches;
      let _update = this.editPunchOffline();
      this.idbService.updateItem(_snPunches, _update, _update.punchId);
      this.onSuccess.emit(null); //--- Don't send response when offline
      this.clientState.isBusy = false;
      this.authErrorHandler.handleSuccess(Constants.PunchPageUpdated);
    } else {
      this.updatePunchItemModel.isSubmit = false;

      this.punchPageService
        .updatePunchPage(this.updatePunchItemModel, this.images)
        .subscribe(
          (res) => {
            this.punchItemModel = res.content
              ? <PunchPageListModel>{ ...res.content }
              : new PunchPageListModel();
            this.onSuccess.emit(this.punchItemModel);
            this.clientState.isBusy = false;
            this.authErrorHandler.handleSuccess(Constants.PunchPageUpdated);
          },
          (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
          }
        );
    }
  };

  editPunchOffline() {
    let _updatePunch: PunchPageListModel = new PunchPageListModel();
    Object.assign(_updatePunch, { ...this.updatePunchItemModel });
    _updatePunch.isEdited = true;

    _updatePunch.tagNo = this._getStringValue(this.updatePunchItemModel.tagId, KeyValues.tagNo);
    _updatePunch.disciplineCode = this._getStringValue(this.updatePunchItemModel.disciplineId, KeyValues.disciplineCode);
    _updatePunch.orderNo = this._getStringValue(this.updatePunchItemModel.orderId, KeyValues.orderNo);
    _updatePunch.locationCode = this._getStringValue(this.updatePunchItemModel.locationId, KeyValues.locationCode);
    _updatePunch.systemNo = this._getStringValue(this.updatePunchItemModel.systemId, KeyValues.systemNo);
    _updatePunch.subSystemNo = this._getStringValue(this.updatePunchItemModel.subSystemId, KeyValues.subSystemNo);
    _updatePunch.type = this._getStringValue(this.updatePunchItemModel.punchTypeId, KeyValues.type);

    _updatePunch.drawings = this._getDrawings(this.drawingModels, this.updatePunchItemModel.drawingIds);
    _updatePunch.images = this.updatePunchItemModel.images.concat(this._getImages(this.punchImages));

    return _updatePunch;
  }

  _getImages(based64Images) {
    let _result: ImageLookUp[] = [];
    based64Images.forEach(_i => {
      let _value: ImageLookUp = new ImageLookUp();
      _value.base64 = _i.imgUrl;
      _result.push(_value);
    });
    return _result;
  }

  _getDrawings(drawingModels: DrawingLookUpModel[], drawingIds: string[]) {
    let _result = [];
    if (!drawingIds || drawingIds.length < 1) { return _result; }
    drawingIds.forEach(_id => {
      const _value = drawingModels.find(_d => _d.drawingId === _id);
      if (_value && _value !== null) {
        _result.push(_value);
      }
    })
    return _result;
  }

  _getStringValue(id: string, type: string): string {
    let _result;
    switch (type) {
      case KeyValues.tagNo:
        _result = this.tagModels.find(_item => _item.id === id);
        break;
      case KeyValues.systemNo:
        _result = this.systemModels.find(_item => _item.id === id);
        break;
      case KeyValues.subSystemNo:
        _result = this.subSystemModels.find(_item => _item.id === id);
        break;
      case KeyValues.disciplineCode:
        _result = this.disciplineModels.find(_item => _item.id === id);
        break;
      case KeyValues.orderNo:
        _result = this.orderNoModels.find(_item => _item.id === id);
        break;
      case KeyValues.locationCode:
        _result = this.locationModels.find(_item => _item.id === id);
        break;
      case KeyValues.type:
        _result = this.typeModels.find(_item => _item.id === id);
        break;
    }
    return _result ? _result.value : null;
  }

  onGetImage(objImage: ImageLookUp) {
    if (this.isOffline) {
      return objImage.base64;
    }
    return objImage.url;
  }

  onClearDrawingSelect = (drawing: DrawingLookUpModel) => {
    if (
      drawing &&
      drawing.drawingId &&
      this.updatePunchItemModel.drawingIds &&
      this.updatePunchItemModel.drawingIds.length > 0
    ) {
      this.updatePunchItemModel.drawingIds = this.updatePunchItemModel.drawingIds.filter(
        (item) => item != drawing.drawingId
      );
    }
  };

  onCancel = () => {
    this.onSuccess.emit(null);
  };

  onFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      var filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();
        reader.readAsDataURL(event.target.files[i]);
        reader.onload = (e: any) => {
          this.punchImages.push({ image: event.target.files[i], imgUrl: e.target.result });
        }
        this.images.push(event.target.files[i])
      }
    }
  }

  onRemoveImage = (image) => {
    this.punchImages = this.punchImages.filter(img => img != image);
    this.images = this.images.filter(img => img != image.image);
  }

  onRemoveImageInitial = (image: ImageLookUp) => {
    this.updatePunchItemModel.images = this.updatePunchItemModel.images.filter(img => img != image);
    this.updatePunchItemModel.deleteImages.push(image);
  }
}
