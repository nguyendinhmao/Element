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
} from "src/app/shared/models/punch-page/punch-page.model";
import { SystemLookUpModel } from "src/app/shared/models/data-tab/data-system.model";
import { SubSystemLookUpModel } from "src/app/shared/models/data-tab/data-subsystem.model";
import { PunchTypeLookUpModel } from "src/app/shared/models/data-tab/data-punchtype.model";
import { OrderLookUpModel } from "src/app/shared/models/data-tab/data-order.model";
import { LocationLookUpModel } from "src/app/shared/models/data-tab/data-location.model";

@Component({
  selector: "add-my-change",
  styleUrls: ["./add-my-change.component.scss"],
  templateUrl: "./add-my-change.component.html",
})

export class AddMyChangeComponent {
  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

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
    private punchTypeService: DataPunchTypeService,
    private orderService: DataOrderService,
    private locationService: DataLocationService
  ) {
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
      })
      .catch((err) => {
        this.clientState.isBusy = false;
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
    if (systemId) {
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
    } else {
      this.subSystemModels = [];
      this.subSystemTempModels = [];
    }
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

    this.createPunchItemModel.isSubmit = true;
    this.createPunchItemModel.systemId = this.systemId;
    this.createPunchItemModel.subSystemId = this.subSystemId;
    this.createPunchItemModel.projectKey = this.projectKey;
    this.punchPageService
      .createPunchPage(this.createPunchItemModel, [])
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
  };

  onSaveAsDraft = () => {
    this.clientState.isBusy = true;
    this.createPunchItemModel.isSubmit = false;
    this.createPunchItemModel.systemId = this.systemId;
    this.createPunchItemModel.subSystemId = this.subSystemId;
    this.createPunchItemModel.projectKey = this.projectKey;
    this.punchPageService
      .createPunchPage(this.createPunchItemModel, [])
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
  };

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
}
