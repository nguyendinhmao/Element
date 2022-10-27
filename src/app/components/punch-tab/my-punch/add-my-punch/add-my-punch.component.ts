import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { Subscription } from "rxjs/internal/Subscription";
import { ActivatedRoute, Router } from "@angular/router";
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
  CreatePunchItemModel,
  LoadingSelectionPunchModel,
  SelectionControlName,
  TagLookUpPunchPageModel,
  DrawingLookUpModel,
  DisciplineLookUpPunchPage,
  DescriptionStandard,
  CorrectiveActions,
  Category,
  ImageLookUp,
  PunchPageListModel,
} from "src/app/shared/models/punch-page/punch-page.model";
import { SystemLookUpModel } from "src/app/shared/models/data-tab/data-system.model";
import { SubSystemLookUpModel } from "src/app/shared/models/data-tab/data-subsystem.model";
import { PunchTypeLookUpModel } from "src/app/shared/models/data-tab/data-punchtype.model";
import { OrderLookUpModel } from "src/app/shared/models/data-tab/data-order.model";
import { LocationLookUpModel } from "src/app/shared/models/data-tab/data-location.model";
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { KeyLookups, KeyValues, PunchStatuses, PunchStatusIds } from 'src/app/shared/models/punch-item/punch-item.model';
import { IdbService } from 'src/app/shared/services';
import { StoreNames } from 'src/app/shared/models/common/common.model';

@Component({
  selector: "add-my-punch",
  styleUrls: ["./add-my-punch.component.scss"],
  templateUrl: "./add-my-punch.component.html",
})

export class AddMyPunchComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() tagNo: string = '';
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

  //--- Model
  createPunchItemModel: CreatePunchItemModel = new CreatePunchItemModel();
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
  loadingSelection: LoadingSelectionPunchModel = new LoadingSelectionPunchModel();
  orderNoModels: OrderLookUpModel[] = [];
  orderNoTempModels: OrderLookUpModel[] = [];
  locationModels: LocationLookUpModel[] = [];
  locationTempModels: LocationLookUpModel[] = [];
  drawingModels: DrawingLookUpModel[] = [];
  drawingTempModels: DrawingLookUpModel[] = [];
  images: File[] = [];
  materialsRequiredModels: [
    { value: true; label: "Yes" },
    { value: false; label: "No" }
  ];

  //--- Boolean
  isDrawingError: boolean = false;
  lookSubSystem: boolean = false;

  //--- Variable
  sub: Subscription;
  projectKey: string;
  systemId: string;
  subSystemId: string;
  selectionControlName = SelectionControlName;
  bufferSize = 100;
  punchImages = [];
  _storeName: string;

  constructor(
    private clientState: ClientState,
    private authErrorHandler: AuthErrorHandler,
    private route: ActivatedRoute,
    private router: Router,
    private punchPageService: PunchPageService,
    private systemService: DataSystemService,
    private subSystemService: DataSubSystemService,
    private punchTypeService: DataPunchTypeService,
    private orderService: DataOrderService,
    private locationService: DataLocationService,
    private idbService: IdbService,
  ) {
    this._storeName = StoreNames.lookups;
    this.sub = this.route.params.subscribe((params) => {
      this.projectKey = params["projectKey"];
      if (!this.projectKey) {
        this.router.navigate([""]);
      }
    });
  }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  ngOnInit() {
    if (this.isOffline) {
      this.onGetDataDropdownOffline();
    } else {
      this.onGetDataDropdownOnline();
    }
  }

  onGetDataDropdownOffline() {
    this.clientState.isBusy = true;
    Promise.all([
      //--- Tag filter
      this.idbService.getItem(this._storeName, KeyLookups.tagLookUpPunchPage).then((res) => {
        this.tagModels = res
          ? <TagLookUpPunchPageModel[]>[...res]
          : [];
        this.tagTempModels = this.tagModels.slice(0, this.bufferSize);
      }),
      //--- System filter
      this.idbService.getItem(this._storeName, KeyLookups.systemLookup).then((res) => {
        this.systemModels = res
          ? <SystemLookUpModel[]>[...res]
          : [];
        this.systemTempModels = this.systemModels.slice(0, this.bufferSize);
      }),
      //--- Subsystem filter
      this.idbService.getItem(this._storeName, KeyLookups.subSystemLookup).then((res) => {
        this.subSystemModels = res
          ? <SubSystemLookUpModel[]>[...res]
          : [];
        this.subSystemTempModels = this.subSystemModels.slice(
          0,
          this.bufferSize
        );
      }),
      //--- Discipline filter
      this.idbService.getItem(this._storeName, KeyLookups.disciplineLookUp).then((res) => {
        this.disciplineModels = res
          ? <DisciplineLookUpPunchPage[]>[...res]
          : [];
        this.disciplineTempModels = this.disciplineModels.slice(
          0,
          this.bufferSize
        );
      }),
      //--- PunchType filter
      this.idbService.getItem(this._storeName, KeyLookups.punchTypeLookup).then((res) => {
        this.typeModels = res
          ? <PunchTypeLookUpModel[]>[...res]
          : [];
        this.typeTempModels = this.typeModels.slice(0, this.bufferSize);
      }),
      //--- Order filter
      this.idbService.getItem(this._storeName, KeyLookups.orderLookup).then((res) => {
        this.orderNoModels = res
          ? <OrderLookUpModel[]>[...res]
          : [];
        this.orderNoTempModels = this.orderNoModels.slice(0, this.bufferSize);
      }),
      //--- Location filter
      this.idbService.getItem(this._storeName, KeyLookups.locationLookup).then((res) => {
        this.locationModels = res
          ? <LocationLookUpModel[]>[...res]
          : [];
        this.locationTempModels = this.locationModels.slice(
          0,
          this.bufferSize
        );
      }),
      //--- Drawing filter
      this.idbService.getItem(this._storeName, KeyLookups.drawingLookup).then((res) => {
        this.drawingModels = res
          ? <DrawingLookUpModel[]>[...res]
          : [];
        this.drawingTempModels = this.drawingModels.slice(0, this.bufferSize);
      })
    ])
      .then((res) => {
        this.clientState.isBusy = false;
        this.categoryModels = [
          { category: "A" },
          { category: "B" },
          { category: "C" },
        ];
        this.materialsRequiredModels = [
          { value: true, label: "Yes" },
          { value: false, label: "No" },
        ];
        this.createPunchItemModel.materialsRequired = false;
        if (this.tagNo) {
          this.initialDataAddPunch();
        }
      })
      .catch((err) => {
        this.clientState.isBusy = false;
      });
  }

  onGetDataDropdownOnline = () => {
    this.clientState.isBusy = true;
    Promise.all([
      this.onGetTagLookUp(this.projectKey),
      this.onGetLookUpSystem(),
      this.onGetLookUpSubsystem(),
      this.onGetLookUpDiscipline(),
      this.onGetLookUpPunchType(),
      this.onGetLookUpOrder(),
      this.onGetLocationLookUp(),
      this.onGetDrawingLookUp(this.projectKey),
    ])
      .then((res) => {
        this.categoryModels = [
          { category: "A" },
          { category: "B" },
          { category: "C" },
        ];
        this.materialsRequiredModels = [
          { value: true, label: "Yes" },
          { value: false, label: "No" },
        ];
        this.createPunchItemModel.materialsRequired = false;
        this.clientState.isBusy = false;
        if (this.tagNo) {
          this.initialDataAddPunch();
        }
      })
      .catch((err) => {
        this.clientState.isBusy = false;
      });
  };

  initialDataAddPunch() {
    const _tag = this.tagModels.find((item) => item.value == this.tagNo);
    this.createPunchItemModel.tagId = _tag.id;
    this.onChangeTag();
  }

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
    if (systemId) {
      if (this.isOffline) {
        this.executeGetSubSystemBySystemOff(systemId);
      } else {
        this.executeGetSubSystemBySystemOn(systemId);
      }
    } else {
      this.subSystemModels = [];
      this.subSystemTempModels = [];
    }
  }

  executeGetSubSystemBySystemOn(systemId: string) {
    this.clientState.isBusy = true;
    this.subSystemService.getSubSystemLookUp(this.projectKey, systemId).subscribe(
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

  executeGetSubSystemBySystemOff(systemId: string) {
    this.clientState.isBusy = true;
    this.idbService.getItem(this._storeName, KeyLookups.subSystemLookup).then((res) => {
      if (res && res.length > 0) {
        const _subMatchSys = res.filter(sub => sub.systemId === systemId);
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
    });
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
      this.createPunchItemModel.tagId &&
      this.tagModels &&
      this.tagModels.length > 0 &&
      this.tagModels.some((item) => item.id == this.createPunchItemModel.tagId)
    ) {
      let tagItem = this.tagModels.filter(
        (item) => item.id == this.createPunchItemModel.tagId
      )[0];
      this.systemId = tagItem && tagItem.systemId ? tagItem.systemId : null;
      this.subSystemId =
        tagItem && tagItem.subSystemId ? tagItem.subSystemId : null;
      this.createPunchItemModel.disciplineId =
        tagItem && tagItem.disciplineId ? tagItem.disciplineId : null;
    } else {
      this.systemId = null;
      this.subSystemId = null;
      this.createPunchItemModel.disciplineId = null;
    }
    this.lookSubSystem = this.subSystemId == null;
    this.onGetSubSystemLookUpBySystem(this.systemId);
    this.onChangeDiscipline(true);
  };

  onSetTag = () => {
    let temp = [];
    if (
      this.createPunchItemModel.disciplineId &&
      this.systemId &&
      this.subSystemId
    ) {
      temp = this.tagModels.filter(
        (item) =>
          item.disciplineId == this.createPunchItemModel.disciplineId &&
          item.systemId == this.systemId &&
          item.subSystemId == this.subSystemId
      );
    } else if (
      this.createPunchItemModel.disciplineId &&
      !this.systemId &&
      !this.subSystemId
    ) {
      temp = this.tagModels.filter(
        (item) => item.disciplineId == this.createPunchItemModel.disciplineId
      );
    } else if (
      this.createPunchItemModel.disciplineId &&
      this.systemId &&
      !this.subSystemId
    ) {
      temp = this.tagModels.filter(
        (item) =>
          item.disciplineId == this.createPunchItemModel.disciplineId &&
          item.systemId == this.systemId
      );
    } else if (
      !this.createPunchItemModel.disciplineId &&
      this.systemId &&
      !this.subSystemId
    ) {
      temp = this.tagModels.filter((item) => item.systemId == this.systemId);
    } else if (
      !this.createPunchItemModel.disciplineId &&
      this.systemId &&
      this.subSystemId
    ) {
      temp = this.tagModels.filter(
        (item) =>
          item.systemId == this.systemId && item.subSystemId == this.subSystemId
      );
    } else if (
      !this.createPunchItemModel.disciplineId &&
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
      this.createPunchItemModel.disciplineId &&
      this.disciplineModels &&
      this.disciplineModels.length > 0 &&
      this.disciplineModels.some(
        (item) => item.id == this.createPunchItemModel.disciplineId
      )
    ) {
      let disciplineItem = this.disciplineModels.filter(
        (item) => item.id == this.createPunchItemModel.disciplineId
      )[0];
      if (
        !this.disciplineTempModels.some(
          (item) => item.id == this.createPunchItemModel.disciplineId
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
      if (this.createPunchItemModel.tagId) {
        this.systemId = null;
        this.subSystemId = null;
        this.subSystemModels = [];
        this.subSystemTempModels = [];
      }
      this.createPunchItemModel.tagId = null;
    }
    this.onSetTag();
    this.onChangeDescription();
  };

  onChangeDescription = () => {
    if (
      this.createPunchItemModel.description &&
      this.descriptionModels &&
      this.descriptionModels.length > 0 &&
      this.descriptionModels.some(
        (item) => item.description == this.createPunchItemModel.description
      )
    ) {
      let descriptionItem = this.descriptionModels.filter(
        (item) => item.description == this.createPunchItemModel.description
      )[0];
      this.correctiveActionModels = descriptionItem.correctiveActions;
      if (
        descriptionItem.correctiveActions &&
        descriptionItem.correctiveActions.length > 0 &&
        descriptionItem.correctiveActions[0].category
      ) {
        this.createPunchItemModel.category =
          descriptionItem.correctiveActions[0].category;
      }
      this.correctiveActionModels = descriptionItem.correctiveActions;
    } else {
      this.correctiveActionModels = [];
    }
  };

  onChangeSystem = (isChangeTag: boolean = false) => {
    if (!isChangeTag) {
      if (this.createPunchItemModel.tagId) {
        this.createPunchItemModel.disciplineId = null;
      }
      this.createPunchItemModel.tagId = null;
    }
    this.lookSubSystem = false;
    this.subSystemId = null;
    this.onSetTag();
    this.onGetSubSystemLookUpBySystem(this.systemId);
  };

  onChangeSubSystem = (isChangeTag: boolean = false) => {
    if (!isChangeTag) this.createPunchItemModel.tagId = null;
    this.onSetTag();
  };

  onCheckDrawingLocation = () => {
    let isExistDrawingLocation = false;
    if (
      this.createPunchItemModel.drawingIds &&
      this.createPunchItemModel.drawingIds.length > 0
    ) {
      this.createPunchItemModel.drawingIds.map((drawing) => {
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
    this.createPunchItemModel.systemId = this.systemId;
    this.createPunchItemModel.subSystemId = this.subSystemId;

    if (this.isOffline) {
      const _guid = this._createGuid();
      const _snPunches = StoreNames.punches;
      let _new = this.createNewPunchOffline();
      const _userInfo = JwtTokenHelper.GetUserInfo();
      _new.raisedBy = _userInfo.userName; //--- Change when having any wrong
      _new.punchId = _guid;
      _new.status = PunchStatuses.submitted;
      _new.statusId = PunchStatusIds.submitted;

      this.updateSideMenuChart(_new.tagId, _new.category);

      const _snSignTemp = StoreNames.punchSignatureTemplate;
      this.idbService.getAllData(_snSignTemp).then((res) => {
        _new.signatures = [...res[0]];
        this.idbService.addItem(_snPunches, _guid, _new);
        this.onSuccess.emit(true);
        this.clientState.isBusy = false;
        this.authErrorHandler.handleSuccess(Constants.PunchPageCreated);
      }, (err) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      });
    } else {
      this.createPunchItemModel.isSubmit = true;
      this.createPunchItemModel.projectKey = this.projectKey;
      this.punchPageService
        .createPunchPage(this.createPunchItemModel, this.images)
        .subscribe(
          (res) => {
            this.clientState.isBusy = false;
            this.onSuccess.emit(true);
            this.authErrorHandler.handleSuccess(Constants.PunchPageCreated);
          },
          (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
          }
        );
    }
  };

  updateSideMenuChart(tagId: string, type: string) {
    const _sn = StoreNames.tags;
    this.idbService.getItem(_sn, tagId).then(
      (res) => {
        if (res) {
          let _tagData = res;
          switch (type) {
            case 'A':
              _tagData.tagSideMenu.detailChart.noOfPunchTypeA += 1;
              break;
            case 'B':
              _tagData.tagSideMenu.detailChart.noOfPunchTypeB += 1;
              break;
            case 'C':
              _tagData.tagSideMenu.detailChart.noOfPunchTypeC += 1;
              break;
          }
          this.idbService.updateItem(_sn, _tagData, tagId);
        }
      },
      (err) => { }
    );
  }

  onSaveAsDraft = () => {
    this.clientState.isBusy = true;
    this.createPunchItemModel.systemId = this.systemId;
    this.createPunchItemModel.subSystemId = this.subSystemId;

    if (this.isOffline) {
      const _guid = this._createGuid();
      const _snPunches = StoreNames.punches;
      let _new = this.createNewPunchOffline();
      _new.punchId = _guid;
      _new.status = PunchStatuses.draft;
      _new.statusId = PunchStatusIds.draft;

      const _snSignTemp = StoreNames.punchSignatureTemplate;
      this.idbService.getAllData(_snSignTemp).then((res) => {
        _new.signatures = [...res[0]];
        this.idbService.addItem(_snPunches, _guid, _new);
        this.onSuccess.emit(true);
        this.clientState.isBusy = false;
        this.authErrorHandler.handleSuccess(Constants.PunchPageCreated);
      }, (err) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      });
    } else {
      this.createPunchItemModel.isSubmit = false;
      this.createPunchItemModel.projectKey = this.projectKey;
      this.punchPageService
        .createPunchPage(this.createPunchItemModel, this.images)
        .subscribe(
          (res) => {
            this.clientState.isBusy = false;
            this.onSuccess.emit(true);
            this.authErrorHandler.handleSuccess(Constants.PunchPageCreated);
          },
          (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
          }
        );
    }
  };

  createNewPunchOffline() {
    let _newPunch: PunchPageListModel = new PunchPageListModel();
    Object.assign(_newPunch, { ...this.createPunchItemModel });
    _newPunch.isAdded = true;

    _newPunch.punchNo = ''; //(Math.floor(Math.random() * 10)).toString(); //--- Change when having any wrong
    _newPunch.tagNo = this._getStringValue(this.createPunchItemModel.tagId, KeyValues.tagNo);
    _newPunch.disciplineCode = this._getStringValue(this.createPunchItemModel.disciplineId, KeyValues.disciplineCode);
    _newPunch.orderNo = this._getStringValue(this.createPunchItemModel.orderId, KeyValues.orderNo);
    _newPunch.locationCode = this._getStringValue(this.createPunchItemModel.locationId, KeyValues.locationCode);
    _newPunch.systemId = this.systemId;
    _newPunch.systemNo = this._getStringValue(this.systemId, KeyValues.systemNo);
    _newPunch.subSystemId = this.subSystemId;
    _newPunch.subSystemNo = this._getStringValue(this.subSystemId, KeyValues.subSystemNo);
    _newPunch.type = this._getStringValue(this.createPunchItemModel.punchTypeId, KeyValues.type);

    _newPunch.drawings = this._getDrawings(this.drawingModels, this.createPunchItemModel.drawingIds);
    _newPunch.images = this._getImages(this.punchImages);

    return _newPunch;
  }

  _createGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
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


  onClearDrawingSelect = (drawing: DrawingLookUpModel) => {
    if (
      drawing &&
      drawing.drawingId &&
      this.createPunchItemModel.drawingIds &&
      this.createPunchItemModel.drawingIds.length > 0
    ) {
      this.createPunchItemModel.drawingIds = this.createPunchItemModel.drawingIds.filter(
        (item) => item != drawing.drawingId
      );
    }
  };

  onCancel = () => {
    this.onSuccess.emit(false);
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
        this.images.push(event.target.files[i]);
      }
    }
  }

  onRemoveImage = (image) => {
    this.punchImages = this.punchImages.filter(img => img != image);
    this.images = this.images.filter(img => img != image.image);
  }
}
