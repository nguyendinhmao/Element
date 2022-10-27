import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Subscription } from "rxjs/internal/Subscription";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthErrorHandler } from "src/app/shared/services/auth/auth.error-handler";
import { ClientState } from "src/app/shared/services/client/client-state";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { Constants, JwtTokenHelper } from "src/app/shared/common";
import { PunchPageService } from "src/app/shared/services/api/punch-page/punch-page.service";
import { DataPunchTypeService } from "src/app/shared/services/api/data-tab/data-punchtype.service";
import { DataOrderService } from "src/app/shared/services/api/data-tab/data-order.service";
import {
  CreatePunchItemModel,
  LoadingSelectionPunchModel,
  SelectionControlName,
  DrawingLookUpModel,
  DescriptionStandard,
  CorrectiveActions,
  Category,
  ImageLookUp,
  PunchPageListModel,
  DisciplineLookUpPunchPage,
} from "src/app/shared/models/punch-page/punch-page.model";
import { PunchTypeLookUpModel } from "src/app/shared/models/data-tab/data-punchtype.model";
import { OrderLookUpModel } from "src/app/shared/models/data-tab/data-order.model";
import { TagTabService } from 'src/app/shared/services/api/tag-tab/tag-tab.service';
import { TagPucnhDetail } from 'src/app/shared/models/tab-tag/tab-tag.model';
import { NgForm } from '@angular/forms';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { IdbService } from 'src/app/shared/services';
import { StoreNames } from 'src/app/shared/models/common/common.model';
import { KeyLookups, KeyValues, PunchStatuses, PunchStatusIds } from 'src/app/shared/models/punch-item/punch-item.model';

@Component({
  selector: "add-punch-item-tag",
  styleUrls: ["./add-punch-item-tag.component.scss"],
  templateUrl: "./add-punch-item-tag.component.html",
})

export class AddPunchItemTagComponent {
  @Input() tagId: string;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

  createPunchItemModel: CreatePunchItemModel = new CreatePunchItemModel();
  descriptionModels: DescriptionStandard[] = [];
  correctiveActionModels: CorrectiveActions[] = [];
  disciplineModels: DisciplineLookUpPunchPage[] = [];
  disciplineTempModels: DisciplineLookUpPunchPage[] = [];
  categoryModels: Category[] = [];
  typeModels: PunchTypeLookUpModel[] = [];
  typeTempModels: PunchTypeLookUpModel[] = [];
  tagPunchDetail: TagPucnhDetail = new TagPucnhDetail();
  materialsRequiredModels: [
    { value: true; label: "Yes" },
    { value: false; label: "No" }
  ];
  orderNoModels: OrderLookUpModel[] = [];
  orderNoTempModels: OrderLookUpModel[] = [];
  drawingModels: DrawingLookUpModel[] = [];
  drawingTempModels: DrawingLookUpModel[] = [];
  punchImages = [];
  images: File[] = [];

  sub: Subscription;
  projectKey: string;
  systemId: string;
  subSystemId: string;

  isDrawingError: boolean = false;

  loadingSelection: LoadingSelectionPunchModel = new LoadingSelectionPunchModel();
  selectionControlName = SelectionControlName;
  bufferSize = 100;

  constructor(
    private clientState: ClientState,
    private authErrorHandler: AuthErrorHandler,
    private route: ActivatedRoute,
    private router: Router,
    private punchPageService: PunchPageService,
    private punchTypeService: DataPunchTypeService,
    private orderService: DataOrderService,
    private tagTabService: TagTabService,
    private idbService: IdbService,
  ) {
    this.sub = this.route.params.subscribe((params) => {
      this.projectKey = params["projectKey"];
      if (!this.projectKey) {
        this.router.navigate([""]);
      }
    });
  }

  ngOnInit() {
    if (this.isOffline) {
      this.onGetDataDropdownOffline();
    } else {
      this.onGetDataDropdown();
    }
  }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  onGetDataDropdownOffline() {
    this.clientState.isBusy = true;
    const _snLookups = StoreNames.lookups;
    Promise.all([
      this.idbService.getItem(_snLookups, KeyLookups.punchTypeLookup).then(
        (res) => {
          this.typeModels = res
            ? <PunchTypeLookUpModel[]>[...res]
            : [];
          this.typeTempModels = this.typeModels.slice(0, this.bufferSize);
        },
        (err: ApiError) => {
          this.authErrorHandler.handleError(err.message);
        }
      ),
      this.idbService.getItem(_snLookups, KeyLookups.orderLookup).then(
        (res) => {
          this.orderNoModels = res
            ? <OrderLookUpModel[]>[...res]
            : [];
          this.orderNoTempModels = this.orderNoModels.slice(0, this.bufferSize);
        },
        (err: ApiError) => {
          this.authErrorHandler.handleError(err.message);
        }
      ),
      this.idbService.getItem(_snLookups, KeyLookups.drawingLookup).then(
        (res) => {
          this.drawingModels = res
            ? <DrawingLookUpModel[]>[...res]
            : [];
          this.drawingTempModels = this.drawingModels.slice(0, this.bufferSize);
        },
        (err: ApiError) => {
          this.authErrorHandler.handleError(err.message);
        }
      ),
      //--- Discipline filter
      this.idbService.getItem(_snLookups, KeyLookups.disciplineLookUp).then((res) => {
        this.disciplineModels = res
          ? <DisciplineLookUpPunchPage[]>[...res]
          : [];
        this.disciplineTempModels = this.disciplineModels.slice(
          0,
          this.bufferSize
        );
      }),
    ])
      .then(() => {
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
        this.onGetTagPunch();
      })
      .catch((err) => {
        this.clientState.isBusy = false;
      });
  }

  onGetDataDropdown = () => {
    this.clientState.isBusy = true;
    Promise.all([
      this.onGetLookUpPunchType(),
      this.onGetLookUpOrder(),
      this.onGetDrawingLookUp(this.projectKey),
      this.onGetLookUpDiscipline(),
    ])
      .then(() => {
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
        this.onGetTagPunch();
      })
      .catch((err) => {
        this.clientState.isBusy = false;
      });
  };

  getStandardDescriptions() {
    if (this.tagPunchDetail.disciplineId) {
      let disciplineItem = this.disciplineModels.filter(
        (item) => item.id == this.tagPunchDetail.disciplineId
      )[0];
      if (
        !this.disciplineTempModels.some(
          (item) => item.id == this.tagPunchDetail.disciplineId
        )
      ) {
        this.disciplineTempModels = this.disciplineTempModels.concat(
          disciplineItem
        );
      }
      this.descriptionModels = disciplineItem.descriptions;
    }
  }

  onGetTagPunch() {
    if (this.isOffline) {
      const _sn = StoreNames.tags;
      this.idbService.getItem(_sn, this.tagId).then((res) => {
        if (res && res.tagSideMenu) {
          this.tagPunchDetail = res.tagSideMenu.detailTag ? <TagPucnhDetail>{ ...res.tagSideMenu.detailTag } : null;
          this.getStandardDescriptions();
          this.clientState.isBusy = false;
        }
      }, (err) => {
        this.clientState.isBusy = false;
      });
    } else {
      this.tagTabService.getTagPunchDetail(this.tagId).subscribe(
        (res) => {
          this.tagPunchDetail = res ? <TagPucnhDetail>{ ...res } : null;
          this.getStandardDescriptions();
          this.clientState.isBusy = false;
        }, (err) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        }
      )
    }
  }

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

  onScrollToEndSelect = (key: string) => {
    if (key) {
      switch (key) {
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
        case this.selectionControlName.type:
          this.typeTempModels = this.typeModels.slice(0, this.bufferSize);
          break;

        case this.selectionControlName.orderNo:
          this.orderNoTempModels = this.orderNoModels.slice(0, this.bufferSize);
          break;
        case this.selectionControlName.drawing:
          this.drawingTempModels = this.drawingModels.slice(0, this.bufferSize);
          break;

        default:
          break;
      }
    }
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

  onSaveAsDraft = () => {
    this.clientState.isBusy = true;
    this.createPunchItemModel.tagId = this.tagPunchDetail.tagId;
    this.createPunchItemModel.disciplineId = this.tagPunchDetail.disciplineId;
    this.createPunchItemModel.systemId = this.tagPunchDetail.systemId;
    this.createPunchItemModel.subSystemId = this.tagPunchDetail.subSystemId;
    this.createPunchItemModel.locationId = this.tagPunchDetail.locationId;
    this.createPunchItemModel.isSubmit = false;
    this.createPunchItemModel.projectKey = this.projectKey;

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
        // update tag changed
        const _snTags = StoreNames.tags;
        this.idbService.getItem(_snTags, _new.tagId).then(_tag => {
          this.idbService.updateItem(_snTags, { ..._tag, ...{ isChanged: true } }, _new.tagId);
        });
        // ---------------
        this.idbService.addItem(_snPunches, _guid, _new);
        this.onSuccess.emit(true);
        this.clientState.isBusy = false;
        this.authErrorHandler.handleSuccess(Constants.PunchPageCreated);
      }, (err) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      });
    } else {
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

    _newPunch.punchNo = '';//(Math.floor(Math.random() * 10)).toString(); //--- Change when having any wrong
    _newPunch.tagNo = this.tagPunchDetail.tagNo;
    _newPunch.disciplineCode = this.tagPunchDetail.disciplineCode;
    _newPunch.orderNo = this._getStringValue(this.createPunchItemModel.orderId, KeyValues.orderNo);
    _newPunch.locationCode = this.tagPunchDetail.locationCode;
    _newPunch.systemNo = this.tagPunchDetail.systemNo;
    _newPunch.subSystemNo = this.tagPunchDetail.subSystemNo;
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
      case KeyValues.orderNo:
        _result = this.orderNoModels.find(_item => _item.id === id);
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
        // update tag changed
        const _snTags = StoreNames.tags;
        this.idbService.getItem(_snTags, _new.tagId).then(_tag => {
          this.idbService.updateItem(_snTags, { ..._tag, ...{ isChanged: true } }, _new.tagId);
        });
        // ---------------
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
  }

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
