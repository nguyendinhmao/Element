import { Component, OnInit, ViewChild } from '@angular/core';
import { MockDetailPreservationTabApi } from 'src/app/shared/mocks/mock.preservation-tab';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { DetailPreservationTabModel, ImageLookUpPres, PreservationElementInfo, PreservationModel, PreservationStatus, PreservationStatusColor, PreservationStatusEnum, SignaturePres, SignOffPreservationCommand } from 'src/app/shared/models/preservation-tab/preservation-tab.model';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { AuthErrorHandler, ClientState, IdbService } from 'src/app/shared/services';
import { Configs, Constants, JwtTokenHelper, PermissionsViews } from 'src/app/shared/common';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { MAT_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { APP_DATE_FORMATS, AppDateAdapter } from 'src/app/shared/directives/format-datepicker/format-datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { PreservationTabServices } from 'src/app/shared/services/api/preservation-tab/preservation-tab.service';
import { AuthInProjectDto } from 'src/app/shared/models/project-management/project-management.model';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { IndexRelatedSNs, StoreNames } from 'src/app/shared/models/common/common.model';
import { BCryptHelper } from 'src/app/shared/common/bcrypt/bcrypt';
import { KeyLookups } from 'src/app/shared/models/punch-item/punch-item.model';
import { RecheckDate } from 'src/app/shared/services/utils/utils-sub.service';
declare var $: any;

@Component({
  selector: 'detail-preservation',
  templateUrl: './detail-preservation.component.html',
  styleUrls: ['./detail-preservation.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})
export class DetailPreservationComponent implements OnInit {
  //---Boolean
  isShowSignature: boolean;
  isEnableSelectAll: boolean = true;
  isOpenImages: boolean;
  isOpenElementInfoState: boolean;
  isPauseStopShow: boolean = false;
  isDeleteAllState: boolean;
  isShowAddDetailPreservation: boolean;
  isShowPinCode: boolean = false;
  isShowSignBtn: boolean = false;
  isInitialImageDelete: boolean = true;
  isShowCreatePinCode: boolean = false;
  hasShowLoginModal = false;

  //--- Variables
  sub: any;
  changeId: string;
  moduleKey: string;
  projectKey: string;
  detailPreservationCount: number;
  defaultSortEquipment: string = "element desc";
  elementId: string;
  preservationId: string;
  statusColor = PreservationStatusColor;
  statusDisplay = PreservationStatus;
  jQuestionContent: string;
  statusUpdate: string;

  signatureCount: number;

  //--- Model
  detailPreservationTabModels: DetailPreservationTabModel[];
  allocated: DetailPreservationTabModel[] = [];
  imageLookUpModel: ImageLookUpPres[];
  signatureModel: SignaturePres[];
  elements: DetailPreservationTabModel[] = [];
  elementInfo: PreservationElementInfo;
  resumeCount: number = 0;
  pauseCount: number = 0;
  stopCount: number = 0;

  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;

  authInProjectDto: AuthInProjectDto[] = [];

  preservationStatusEnum = PreservationStatusEnum;

  msg = {
    invalid: 'Username or password invalid.',
    notPermission: "You don't have permission",
  }


  //--- Datatable
  dataSource: MatTableDataSource<DetailPreservationTabModel>;
  selection = new SelectionModel<DetailPreservationTabModel>(true, []);
  displayedColumns: string[] = [
    'selectPres',
    'elementPres',
    'preservationNo',
    'frequencyPres',
    'typePres',
    'dateDuePres',
    'statusPres',
    'pauseOrStopPres',
    'signaturePres',
    'imagesPres',
    'dateCompletePres',
    'haltedBy',
    'haltedDate',
    'comment',
  ];
  permissionsViews = PermissionsViews;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  mockDetailPreservationTabApi: MockDetailPreservationTabApi = new MockDetailPreservationTabApi();
  notSelectedAny = 'Please select any elements';

  constructor(
    public clientState: ClientState,
    private authErrorHandler: AuthErrorHandler,
    private route: ActivatedRoute,
    private router: Router,
    private preservationTabServices: PreservationTabServices,
    private idbService: IdbService,
  ) {
    this.sub = this.route.params.subscribe(params => {
      this.preservationId = params['preservationId'];
      this.projectKey = params['projectKey'];
      this.moduleKey = params["moduleKey"];
      if (!this.preservationId || !this.projectKey || !this.moduleKey) {
        this.router.navigate([""]);
      }
    });

    this.selection.changed.subscribe(item => {
      this.isEnableSelectAll = this.selection.selected.length == 0;
    });

    this.authInProjectDto = JwtTokenHelper.GetAuthProject()
      ? <AuthInProjectDto[]>[...JwtTokenHelper.GetAuthProject()]
      : [];
  }

  ngOnInit() {
    this.onGetListDetailPreservation(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortEquipment);
  }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  onCheckPermission = (key: string) => {
    return JwtTokenHelper.IsAuthInProject(key, this.authInProjectDto);
  };

  //-- Get list itr equipment allocate
  onGetListDetailPreservation(pageNumber?: number, pageSize?: number, sortExpression?: string) {
    if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;
    this.clientState.isBusy = true;
    // this.mockDetailPreservationTabApi.getDetailData().subscribe(res => {
    if (this.isOffline) {
      const _snPreservation = StoreNames.preservation;
      const _iPreservation = IndexRelatedSNs.preservation.tagNo;
      this.idbService.getAllDataFromIndex(_snPreservation, _iPreservation, this.preservationId).then(_preservationL => {
        const _afterFilter = _preservationL ? _preservationL.filter(_p => !_p.isDeleted) : null;
        const _afterCheckStatus = _afterFilter ? _afterFilter.map(_p => ({ ..._p, ... this.changeStatusPreservation(_p.dateDue, _p.status) })) : null;
        const _softParts = ["element", "asc"];
        const _sortedData = _afterCheckStatus ? this.sortTagOffline(_afterCheckStatus, _softParts[0], _softParts[1]) : [];
        this.assignDataPreservation(_sortedData || []);
        this.changeStatusTagPreOff();
        this.detailPreservationCount = this.detailPreservationTabModels.length;
        this.clientState.isBusy = false;
      }, err => {
        this.clientState.isBusy = false;
      })

    } else {
      this.preservationTabServices.getPreservationTabList(this.projectKey, this.preservationId, pageNumber || Configs.DefaultPageNumber, pageSize || Configs.DefaultPageSize, sortExpression, null, 0).subscribe(res => {
        this.assignDataPreservation(res.items || []);
        this.clientState.isBusy = false;
        this.detailPreservationCount = res.totalItemCount;
      }, (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      });
    }
  }

  assignDataPreservation(response) {
    this.detailPreservationTabModels = response ? <DetailPreservationTabModel[]>[...response] : [];
    this.selectionData();
    if (this.detailPreservationTabModels.length > 0) {
      this.detailPreservationTabModels.map(item => {
        item.dateDue = !!item.dateDue ? new Date(item.dateDue) : null;
        item.dateComplete = !!item.dateComplete ? new Date(item.dateComplete) : null;
      });
    }
    this.dataSource = new MatTableDataSource(this.detailPreservationTabModels);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  sortTagOffline(detailPreservationTabModels: DetailPreservationTabModel[], column: string, order: string) {
    detailPreservationTabModels.sort((a, b) => {
      if (PreservationStatusEnum[a.status] > PreservationStatusEnum[b.status]) { return -1 }
      if (PreservationStatusEnum[a.status] < PreservationStatusEnum[b.status]) { return 1 }
      if (RecheckDate((new Date()), (new Date(a.dateDue))) < RecheckDate((new Date()), (new Date(b.dateDue)))) { return -1; }
      if (RecheckDate((new Date()), (new Date(a.dateDue))) > RecheckDate((new Date()), (new Date(b.dateDue)))) { return 1; }
      return 0;
    });
    return detailPreservationTabModels;
  }

  numberToArray = (length: number) => {
    let arr = [];
    for (let i = 0; i < length; i++) {
      arr.push(i);
    }
    return arr;
  };

  selectionData() {
    this.selection.clear();
    this.detailPreservationTabModels.forEach(e => {
      if (typeof e.isAllocated !== 'undefined' && e.isAllocated !== null && e.isAllocated) {
        this.selection.select(e);
      }
    })
    this.allocated = this.selection.selected
  }

  onOpenElementInfoModal = (element) => {
    this.isOpenElementInfoState = true;
    this.elementId = element.preservationId;
    this.elementInfo = element['preservationElement'];
  }

  onOpenSignatureModal = (signatureItem: SignaturePres[], element: DetailPreservationTabModel) => {
    const _elemetId = element.preservationId;
    if (signatureItem && signatureItem.length > 0 && _elemetId) {
      this.signatureModel = signatureItem;
      this.elementId = _elemetId;
    } else {
      this.signatureModel = [];
      this.elementId = "";
    }
    this.selection.clear();
    this.isShowSignBtn = element.status !== 'COMPLETED';
    this.isShowSignature = true;
    this.isShowPinCode = true;
    this.hasShowLoginModal = true;
  };

  onSignatureConfirm = (response: string) => {
    if (response && response === 'login') {
      this.isShowPinCode = false;
      $("#loginAnotherUserPresSection").modal("show");
    } else if (response && response !== 'login') {
      this.hasShowLoginModal = false;

      if (this.isOffline) {
        this.onShowPinCodeModal();
      } else {
        this.clientState.isBusy = true;
        this.preservationTabServices.preservationSignValidate(response, this.projectKey).subscribe({
          complete: () => {
            this.clientState.isBusy = false;
            this.onShowPinCodeModal();
          },
          error: (err: ApiError) => {
            this.clientState.isBusy = false;
            if (err.type == Constants.PinCodeNotExistsException) {
              this.onShowPinCodeModal(true);
            } else if (Constants.PermissionException) {
              this.isShowPinCode = false;
              this.authErrorHandler.handleError(err.message);
            }
          },
        });
      }
    }
    this.isShowSignature = false;
  };

  onShowPinCodeModal = (isCreatePinCode: boolean = false) => {
    this.isShowPinCode = true;
    if (isCreatePinCode) {
      this.onShowCreatePinCodeModal();
    }
  };

  onShowCreatePinCodeModal = () => {
    this.isShowCreatePinCode = true;
  };

  onPinCodeConfirmModal = (code: string) => {
    this.isShowPinCode = false;
    if (code) {
      this.clientState.isBusy = true;

      if (this.isOffline) {
        const _snLookup = StoreNames.lookups;
        this.idbService.getItem(_snLookup, KeyLookups.pinCode).then((_pc) => {
          if (BCryptHelper.comparison(code, _pc)) {
            const _snPreservation = StoreNames.preservation;
            const _userInfo = JwtTokenHelper.GetUserInfo();
            const _infoProject = JwtTokenHelper.GetAuthSignInProject();
            this.idbService.getItem(_snPreservation, this.elementId).then((res) => {
              const _element: DetailPreservationTabModel = res ? { ...res } : null;
              const _elementSignTemp: Array<SignaturePres> = _element ? [..._element.signatures] as Array<SignaturePres> : null;
              // check signature permission
              const index = _elementSignTemp && Array.isArray(_elementSignTemp) ? _elementSignTemp.findIndex(_s => _s.isTurn) : null;
              if (_elementSignTemp[index].authorizationLevel >= _infoProject.authLevel) {
                // next step
                const _signNo1 = _elementSignTemp[index].number,
                  _signNo2 = _signNo1 + 1;
                let _currentIndex = index, _nextIndex;
                if (_elementSignTemp && _elementSignTemp.length > 0) {
                  const _temp = {
                    signDate: new Date(),
                    signedName: _userInfo.userName,
                    signUserId: _userInfo.userId,
                    isTurn: false,
                  };
                  Object.assign(_elementSignTemp[_currentIndex], _temp);

                  if (_elementSignTemp.length === 1 || _signNo2 > _elementSignTemp.length) {
                    // update status for element
                    _element.status = PreservationStatus.COMPLETED.toUpperCase();
                    _element.statusId = PreservationStatusEnum.COMPLETED;
                    // assign completed date
                    _element.dateComplete = (new Date());
                    // create element if type is Periodic
                    this._createElementAfterCompleting(_element.type, this.deepCopy(_element));
                  } else {
                    _nextIndex = _elementSignTemp.findIndex(
                      (sign) => sign.number === _signNo2
                    );
                    _elementSignTemp[_nextIndex].isTurn = true;
                  }
                }
                _element.isUpdated = true;

                // update tag preservation change
                const _snTagPreservation = StoreNames.tagPreservation;
                const _iTagPreservation = IndexRelatedSNs.tagPreservation.tagNo;
                this.idbService.getItemFromIndex(_snTagPreservation, _iTagPreservation, this.preservationId).then(_tP => {
                  this.idbService.updateItem(_snTagPreservation, { ..._tP, ...{ isChanged: true } }, _tP.tagId);
                });

                this.idbService
                  .updateItem(_snPreservation, _element, this.elementId).then((res) => {
                    this.clientState.isBusy = false;
                    this.elementId = '';
                    this.onGetListDetailPreservation(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortEquipment);
                    this.authErrorHandler.handleSuccess(
                      Constants.SignSuccess
                    );
                  }, (err) => {
                    this.clientState.isBusy = false;
                  });
              } else {
                this.clientState.isBusy = false;
                this.authErrorHandler.handleError(this.msg.notPermission);
              }
            }, (err) => { })
          } else {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(
              Constants.InvalidPinCode
            );
          }
        }, (err) => { });
      } else {
        const _command: SignOffPreservationCommand = {
          preservationId: this.elementId,
          projectKey: this.projectKey,
          isDifferentUser: false,
          pinCode: code,
        }

        this.preservationTabServices
          .preservationSignOff(_command)
          .subscribe({
            complete: () => {
              this.authErrorHandler.handleSuccess(Constants.SignSuccess);
              this.onGetListDetailPreservation();
            },
            error: (err: ApiError) => {
              this.selection.clear();
              this.clientState.isBusy = false;
              this.authErrorHandler.handleError(err.message);
            },
          });
      }
    }
  };

  _createElementAfterCompleting(type: string, source2Clone: DetailPreservationTabModel) {
    if (type !== 'Periodic') { return; }
    // create new data
    source2Clone.preservationId = this._createGuid();
    source2Clone.preservationNo = '';
    source2Clone.status = PreservationStatus.NOTDUE4Value.toUpperCase();
    source2Clone.statusId = PreservationStatusEnum.ACTIVE;
    source2Clone.dateComplete = null;
    source2Clone.images = new Array();

    // assign preservation due date
    source2Clone.dateDue = new Date((Date.now() + (source2Clone.preservationElement.frequencyInWeeks * 1000 * 3600 * 24 * 7)));
    // assign Signatures
    const _snLookup = StoreNames.lookups;
    this.idbService.getItem(_snLookup, KeyLookups.preservationSignatureTemplate).then(_signatures => {
      source2Clone.signatures = [..._signatures];
      const _snPreservation = StoreNames.preservation;
      this.idbService.addItem(_snPreservation, source2Clone.preservationId, source2Clone);
    });
  }

  _createGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  checkRunningStatus(element: DetailPreservationTabModel) {
    return element.status === 'DUE'
      || element.status === 'OVERDUE'
      || element.status === 'COMPLETED';
  }

  onCancelElementInfoModal(event) {
    this.isOpenElementInfoState = false;
    this.elementId = "";
    this.onGetListDetailPreservation();
  }

  checkboxLabel(row?: DetailPreservationTabModel): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.preservationId + 1}`;
  }

  onSelectElement(row) {
    let _isSelected = this.selection.isSelected(row);
    this.countStatus(row.status, !_isSelected);
    this.selection.toggle(row);
  }

  countStatus(status, isPlus) {
    switch (status) {
      case 'PAUSED':
        if (isPlus) {
          this.resumeCount++;
          this.stopCount++;
        } else {
          this.resumeCount--;
          this.stopCount--;
        }
        break;
      case 'STOPPED':
        break;
      case 'COMPLETE':
        break;
      default:
        if (isPlus) {
          this.pauseCount++;
          this.stopCount++;
        } else {
          this.pauseCount--;
          this.stopCount--;
        }
        break;
    }
  }

  resetCountStatus() {
    this.resumeCount = 0;
    this.pauseCount = 0;
    this.stopCount = 0;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource && this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.isEnableSelectAll = true;
      this.resetCountStatus();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
      this.isEnableSelectAll = false;
      this.selection.selected.forEach(e => {
        this.countStatus(e.status, this.selection.isSelected(e));
      });
    }
  }

  onConfirmImages = (isSuccess: boolean) => {
    if (isSuccess) {
      this.imageLookUpModel = [];
      this.onGetListDetailPreservation();
    }
    this.isOpenImages = false;
  };

  onShowImages = (element: DetailPreservationTabModel, images?: ImageLookUpPres[]) => {
    const _elementId = element.preservationId;
    this.imageLookUpModel = images;
    this.isOpenImages = true;
    this.isInitialImageDelete = element.status !== 'COMPLETED';
    this.elementId = _elementId;
  };

  onOpenDeleteAllModal() {
    if (this.selection && this.selection.selected.length > 0)
      this.isDeleteAllState = true;
    else {
      this.authErrorHandler.handleError(`${this.notSelectedAny} to active [Delete] button.`);
    }
  }

  onDeleteAllConfirm(isConfirm: boolean) {
    if (isConfirm) {
      let _preservationIds: string[] = [];
      this.selection.selected.forEach(element => {
        _preservationIds.push(element.preservationId);
      });
      if (this.isOffline) {
        // update tag preservation change
        const _snTagPreservation = StoreNames.tagPreservation;
        const _iTagPreservation = IndexRelatedSNs.tagPreservation.tagNo;
        this.idbService.getItemFromIndex(_snTagPreservation, _iTagPreservation, this.preservationId).then(_tP => {
          this.idbService.updateItem(_snTagPreservation, { ..._tP, ...{ isChanged: true } }, _tP.tagId);
        });
        this.detailPreservationTabModels.forEach(_p => {
          if (_preservationIds.some(_id => _id === _p.preservationId)) {
            const _snPreservation = StoreNames.preservation;
            this.idbService.updateItem(_snPreservation, { ..._p, ...{ isDeleted: true } }, _p.preservationId);
            this.authErrorHandler.handleSuccess(Constants.PreservationElementDeleted);
            this.onGetListDetailPreservation();
            this.resetCountStatus();
          }
        });
      } else {
        this.clientState.isBusy = true;
        this.preservationTabServices.deleteElementInPreservationTab(_preservationIds, this.projectKey).subscribe(res => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleSuccess(Constants.PreservationElementDeleted);
          this.onGetListDetailPreservation();
          this.resetCountStatus();
        }, (err: ApiError) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        });
      }
    }
    this.isDeleteAllState = false;
  }

  onCancel = () => {
    this.selection.clear();
    this.allocated.forEach(x => this.selection.select(x));
  }

  onSubmitJustification(isSubmit) {
    if (isSubmit) {
      this.authErrorHandler.handleSuccess(Constants.PreservationElementStatusChanged);
      this.onGetListDetailPreservation();
      this.resetCountStatus();
    }
    this.isPauseStopShow = false;
  }

  onStopBtnClick(element) {
    this.isPauseStopShow = true;
    this.jQuestionContent = 'Are you sure want to Stop?';
    this.elements = [element];
    this.statusUpdate = 'STOPPED';
  }

  onPauseBtnClick(element) {
    let _isPaused = element.status === 'PAUSED';
    this.statusUpdate = element.status;
    this.isPauseStopShow = true;
    this.jQuestionContent = _isPaused ? 'Do you want to set Date Due?' : 'Are you sure want to Pause?';
    this.elements = [element];
  }

  onOpenAddDetailPreservationModal = () => {
    this.isShowAddDetailPreservation = true;
  }

  onOpenResumeAllJustification() {
    if (this.resumeCount > 0) {
      this.isPauseStopShow = true;
      this.jQuestionContent = 'Do you want to reset Date Due?'
      this.statusUpdate = 'RESUME';
      this.elements = this.selection.selected;
    } else {
      this.authErrorHandler.handleError(`${this.notSelectedAny} to active [Resume] button.`);
    }
  }
  onOpenPauseAllJustification() {
    if (this.pauseCount > 0) {
      this.isPauseStopShow = true;
      this.jQuestionContent = "Are you sure want to Pause all of these?"
      this.statusUpdate = 'PAUSEDALL';
      this.elements = this.selection.selected;
    } else {
      this.authErrorHandler.handleError(`${this.notSelectedAny} to active [Pause] button.`);
    }
  }
  onOpenStopAllJustification() {
    if (this.stopCount > 0) {
      this.isPauseStopShow = true;
      this.jQuestionContent = "Are you sure want to Stop all of these?"
      this.statusUpdate = 'STOPPED';
      this.elements = this.selection.selected;
    } else {
      this.authErrorHandler.handleError(`${this.notSelectedAny} to active [Stop] button.`);
    }
  }

  convertDateString(dateString) {
    if (dateString) {
      return (new Date(dateString)).toLocaleDateString('es-ES');
    }
    return null;
  }

  isShowPauseOrStop(element: DetailPreservationTabModel) {
    return element.status === 'PAUSED' || element.status === 'DUE' || element.status === 'NOTDUE' || element.status === 'OVERDUE';
  }

  onAddNewElement(isSubmit) {
    if (isSubmit) {
      this.authErrorHandler.handleSuccess(Constants.ElementPresTabAdded);
      this.onGetListDetailPreservation();
      this.resetCountStatus();
    }
    this.isShowAddDetailPreservation = false;
  }

  onLoginModalRes(isSign: boolean) {
    if (isSign) {
      this.elementId = null;
      this.onGetListDetailPreservation();
    }
    this.hasShowLoginModal = false;
  }

  changeStatusTagPreOff() {
    let _level = null;
    let _status = '';
    this.detailPreservationTabModels.forEach(_p => PreservationStatusEnum[_p.status.toUpperCase()] > _level && (_level = PreservationStatusEnum[_p.status.toUpperCase()]) && (_status = _p.status));
    const _snTagPreservation = StoreNames.tagPreservation;
    const _iTagPreservation = IndexRelatedSNs.tagPreservation.tagNo;
    this.idbService.getItemFromIndex(_snTagPreservation, _iTagPreservation, this.preservationId).then((tagPre: PreservationModel) => {
      if (tagPre) {
        this.idbService.updateItem(_snTagPreservation, { ...tagPre, ...{ preservationStatusString: _status, isChanged: true } }, tagPre.tagId);
      }
    });
  }

  changeStatusPreservation(dueDate, status: string) {
    const _currentD = new Date();
    const _dueDate = new Date(dueDate);
    const days = RecheckDate(_currentD, _dueDate);
    if (PreservationStatusEnum[status] !== PreservationStatusEnum.ACTIVE) {
      return {};
    }
    if (days > 0 && days >= 3) {
      return {
        status: PreservationStatus.NOTDUE4Value.toUpperCase(),
        statusId: PreservationStatusEnum.ACTIVE,
      }
    } else if (days === 0) {
      return {
        status: PreservationStatus.DUE.toUpperCase(),
        statusId: PreservationStatusEnum.ACTIVE,
      }
    } else {
      return {
        status: PreservationStatus.OVERDUE.toUpperCase(),
        statusId: PreservationStatusEnum.ACTIVE,
      }
    }
  }

  //#region Utils
  deepCopy(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || 'object' != typeof obj) {
      return obj;
    }

    // Handle Array
    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = this.deepCopy(obj[i]);
      }
      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
          copy[attr] = this.deepCopy(obj[attr]);
        }
      }
      return copy;
    }

    throw new Error('Unable to copy obj! Its type isn\'t supported.');
  }
  //#endregion Utils
}