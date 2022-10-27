import {
  Component,
  ViewChild,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  ElementRef,
  AfterViewInit
} from "@angular/core";
import { ClientState } from "src/app/shared/services/client/client-state";
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import { MatSort, Sort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { Constants, Configs } from "src/app/shared/common";
import { AuthErrorHandler } from "src/app/shared/services/auth/auth.error-handler";
import { JwtTokenHelper } from "src/app/shared/common/jwt-token-helper/jwt-token-helper";
import { AuthInProjectDto } from "src/app/shared/models/project-management/project-management.model";
import { PermissionsViews } from "src/app/shared/common/constants/permissions";
import { Router } from "@angular/router";
import { PunchPageService } from "src/app/shared/services/api/punch-page/punch-page.service";
import { DataLocationService } from 'src/app/shared/services/api/data-tab/data-location.service';
import { DataSystemService } from 'src/app/shared/services/api/data-tab/data-system.service';
import { DataSubSystemService } from 'src/app/shared/services/api/data-tab/data-subsystem.service';
import { DisciplineLookUpModel } from 'src/app/shared/models/data-tab/data-discipline.model';
import { DataDisciplineService } from 'src/app/shared/services/api/data-tab/data-discipline.service';
import { SystemLookUpModel } from 'src/app/shared/models/data-tab/data-system.model';
import { SubSystemLookUpModel } from 'src/app/shared/models/data-tab/data-subsystem.model';
import { LocationLookUpModel } from 'src/app/shared/models/data-tab/data-location.model';

import {
  PunchPageListModel,
  PunchPageSearchModel,
  DrawingLookUpModel,
  Signature,
  LookUpFilterModel,
  ImageLookUp
} from "src/app/shared/models/punch-page/punch-page.model";
import { StatusColor, StoreNames } from 'src/app/shared/models/common/common.model';

import * as $ from "jquery";
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { IdbService } from 'src/app/shared/services';
import { KeyLookups, PunchStatuses, PunchStatusIds } from 'src/app/shared/models/punch-item/punch-item.model';
import { BCryptHelper } from "src/app/shared/common/bcrypt/bcrypt";

@Component({
  selector: "waiting-signatures",
  styleUrls: ["./waiting-signatures.component.scss"],
  templateUrl: "./waiting-signatures.component.html",
})

export class WaitingSignaturesComponent implements OnChanges, AfterViewInit {
  @Input() moduleKey: string;
  @Input() projectKey: string;
  @Input() textLabel: string;
  @Input() isFirstLoad: boolean = true;
  @Input() tagNo: string = '';
  @Output() onGetCounter: EventEmitter<string> = new EventEmitter<string>();
  @Output() onLoadingTab: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild("waitingSignatures") waitingSignatures: ElementRef;
  @ViewChild("tableContainer") tableContainer: ElementRef;

  //--- Boolean
  isToggleRightSide: boolean = true;
  isAddNewState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;
  isImportState: boolean;
  isSignOffState: boolean;
  isInformState: boolean;
  isToggleDropdown: boolean;
  isFilter: boolean;
  isShowDrawings: boolean;
  isSignState: boolean;
  isShowSignature: boolean;
  isShowPinCode: boolean = false;
  isShowPinCodeSingle: boolean = false;
  isShowCreatePinCodeSingle: boolean;
  isShowCreatePinCode: boolean;
  isLoadingSelectSystemFilter: boolean;
  isLoadingSelectSubSystemFilter: boolean;
  isLoadingDisciplineSelectFilter: boolean;
  isLoadingSelectLocationFilter: boolean;
  isOpenImages: boolean;

  //--- Variables
  punchId: string;
  StatusColor = StatusColor;
  permissionsViews = PermissionsViews;
  defaultComponentName: string = "Sign-off";
  _storeName: string;
  punchIdForSign: string;

  //--- Model
  authInProjectDto: AuthInProjectDto[] = [];
  punchPageListModel: PunchPageListModel[] = [];
  punchPageSearchModel: PunchPageSearchModel = new PunchPageSearchModel();
  drawingLookUpModel: DrawingLookUpModel[];
  signatureModel: Signature[];
  imageLookUpModel: ImageLookUp[];

  //--- System Filter Models
  systemFilterModels: SystemLookUpModel[] = [];
  systemFilterTemModels: SystemLookUpModel[] = [];

  //--- Subsystem Filter Models
  subSystemLookUpFilterModels: SubSystemLookUpModel[] = [];
  subSystemFilterTempModel: SubSystemLookUpModel[] = [];

  //--- Discipline Models
  disciplineFilterModels: DisciplineLookUpModel[] = [];
  disciplineFilterTempModels: DisciplineLookUpModel[] = [];

  //--- Location Filter Models
  locationLookUpFilterModels: LocationLookUpModel[] = [];
  locationFilterTempModel: LocationLookUpModel[] = [];

  totalItems: number = 0;
  currentPageSize: number = Configs.DefaultPageSize;
  currentPageNumber: number = Configs.DefaultPageNumber;
  currentSortExpression: string;
  defaultSort: string = "punchNo desc";
  bufferSize = 100;

  //-- Filter model
  statusFilterModel: LookUpFilterModel[] = [];
  categoryFilterModel: LookUpFilterModel[] = [];
  materialFilterModel: [{ value: true, label: "Yes" }, { value: false, label: "No" }];


  //-- Datatable
  dataSource: MatTableDataSource<PunchPageListModel>;
  selection = new SelectionModel<PunchPageListModel>(true, []);
  displayedColumns: string[] = [
    "select",
    "punchNo",
    "tagNo",
    "description",
    "correctiveAction",
    "systemNo",
    "subSystemNo",
    "disciplineCode",
    "category",
    "type",
    "materialsRequired",
    "orderNo",
    "locationCode",
    "drawings",
    "jobCard",
    "images",
    "raisedBy",
    "signatures",
    "status",
  ];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatPaginator) paginationTemp: MatPaginator;

  constructor(
    private clientState: ClientState,
    private authErrorHandler: AuthErrorHandler,
    private punchPageService: PunchPageService,
    private systemService: DataSystemService,
    private subSystemService: DataSubSystemService,
    private dataDisciplineService: DataDisciplineService,
    private locationService: DataLocationService,
    private router: Router,
    private idbService: IdbService,
  ) {
    this._storeName = StoreNames.punches;
    this.authInProjectDto = JwtTokenHelper.GetAuthProject() ? <AuthInProjectDto[]>[...JwtTokenHelper.GetAuthProject()] : [];
  }

  ngAfterViewInit(): void {
    const tableContainerHeight = $(window).height() - 230;
    if (tableContainerHeight > 0) {
      this.tableContainer.nativeElement.style.maxHeight = tableContainerHeight + "px";
    }
  }

  onCheckPermission = (key: string) => {
    return JwtTokenHelper.IsAuthInProject(key, this.authInProjectDto);
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.moduleKey &&
      this.projectKey &&
      this.textLabel &&
      this.textLabel.includes(this.defaultComponentName) && 
      this.isFirstLoad
    ) {
      this.isFirstLoad = false;
      if (this.isOffline) {
        this.onGetFilterOffline();
      } else {
        this.onGetFilterOnline();
      }
      this.onAssignStaticFilter();
      this.onGetPunchData();
    }
  }

  //--- Check info device
  get isTablet() {
    return InfoDevice.isTablet;
  }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  onAssignStaticFilter() {
    this.statusFilterModel =
      [{ value: "DRAFT", label: "Draft" },
      { value: "SUBMITTED", label: "Submitted" },
      { value: "APPROVED", label: "Approved" },
      { value: "REJECTED", label: "Rejected" },
      { value: "DONE", label: "Done" }];
    this.categoryFilterModel =
      [{ value: "A", label: "A" },
      { value: "B", label: "B" },
      { value: "C", label: "C" }];
    this.materialFilterModel =
      [{ value: true, label: "Yes" },
      { value: false, label: "No" }];
  }

  onGetFilterOnline = () => {
    this.clientState.isBusy = true;
    Promise.all([
      // this.onGetPunchList(),
      this.onGetLookUpSystemFilter(),
      this.onGetSubSystemLookUpFilter(),
      this.onGetLocationLookUpFilter(),
      this.onGetDisciplineFilterLookup()])
      .then((res) => {
        this.clientState.isBusy = false;
      })
      .catch((err) => {
        this.clientState.isBusy = false;
      });
  };

  onGetFilterOffline() {
    const _snLookups = StoreNames.lookups;
    this.clientState.isBusy = true;

    Promise.all([
      this.idbService.getItem(_snLookups, KeyLookups.systemLookup).then((res) => {
        if (res && res.length > 0) {
          this.onGetSystemFilterOffline(res);
        }
      }, (err) => { }),
      this.idbService.getItem(_snLookups, KeyLookups.subSystemLookup).then((res) => {
        if (res && res.length > 0) {
          this.onGetSubsystemFilterOffline(res);
        }
      }, (err) => { }),
      this.idbService.getItem(_snLookups, KeyLookups.disciplineLookUp).then((res) => {
        if (res && res.length > 0) {
          this.onGetDisciplineFilterOffline(res);
        }
      }, (err) => { }),
      this.idbService.getItem(_snLookups, KeyLookups.locationLookup).then((res) => {
        if (res && res.length > 0) {
          this.onGetLocationFilterOffline(res);
        }
      }, (err) => { }),
    ])
      .then((res) => {
        this.clientState.isBusy = false;
      })
      .catch((err) => {
        this.clientState.isBusy = false;
      });
  }

  onGetPunchData = (
    pageNumber?: number,
    pageSize?: number,
    sortExpression?: string,
    punchNo?: string
  ) => {
    this.clientState.isBusy = true;
    this.selection.clear();

    if (pageNumber >= 0) {
      this.currentPageNumber = pageNumber;
      pageNumber = this.currentPageNumber + 1;
    }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;

    if (this.isOffline) {
      this.executeGetPunchDataOffline(sortExpression);
    } else {
      this.executeGetPunchDataOnline(pageNumber, pageSize, sortExpression, punchNo);
    }
  };

  executeGetPunchDataOnline(pageNumber?: number, pageSize?: number, sortExpression?: string, punchNo?: string) {
    this.punchPageService
      .getPunchesNeedMySignature(
        this.projectKey,
        this.tagNo || '',
        pageNumber || Configs.DefaultPageNumber,
        pageSize || Configs.DefaultPageSize,
        this.punchPageSearchModel.systemNo || "",
        this.punchPageSearchModel.subSystemNo || "",
        this.punchPageSearchModel.disciplineCode || "",
        this.punchPageSearchModel.category || "",
        this.punchPageSearchModel.materialsRequired,
        this.punchPageSearchModel.locationCode || "",
        this.punchPageSearchModel.status || "",
        sortExpression || this.currentSortExpression || this.defaultSort,
        punchNo || this.punchPageSearchModel.punchNo || ""
      )
      .subscribe(
        (res) => {
          this.totalItems = res.totalItemCount;
          this.assignPunchData2Model(res.items);
          this.clientState.isBusy = false;
        },
        (err: ApiError) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        }
      );
  }

  executeGetPunchDataOffline(sortExpression?: string) {
    this.clientState.isBusy = true;
    const _softParts = sortExpression ? sortExpression.split(' ') : ["punchNo", "asc"];

    this.idbService.getAllData(this._storeName).then((res) => {
      if (res && res.length > 0) {
        const _approvedPunches = res.filter(_punch => !_punch.isDeleted && (_punch.status === PunchStatuses.approved));

        const _filterSystem = this.filterOffline(_approvedPunches, 'systemNo', this.punchPageSearchModel.systemNo),
          _filterSubsystem = this.filterOffline(_filterSystem, 'subSystemNo', this.punchPageSearchModel.subSystemNo),
          _filterDiscipline = this.filterOffline(_filterSubsystem, 'disciplineCode', this.punchPageSearchModel.disciplineCode),
          _filterCategory = this.filterOffline(_filterDiscipline, 'category', this.punchPageSearchModel.category),
          _filterMRequire = this.filterOffline(_filterCategory, 'materialsRequired', this.punchPageSearchModel.materialsRequired),
          _filterLocation = this.filterOffline(_filterMRequire, 'locationCode', this.punchPageSearchModel.locationCode),
          _filterStatus = this.filterOffline(_filterLocation, 'status', this.punchPageSearchModel.status);

        const _afterFilter = [..._filterStatus];
        this.totalItems = _afterFilter.length;
        const _sortedData = this.sortPunchOffline(_afterFilter, _softParts[0], _softParts[1]);
        this.assignPunchData2Model(_sortedData);
      }
      this.clientState.isBusy = false;
    }, (err) => {
      this.clientState.isBusy = false;
    });
  }

  filterOffline(punches, fieldToFilter, value) {
    if (!value) { return punches; }
    return punches.filter(_p => value.includes(_p[fieldToFilter]));
  }

  assignPunchData2Model(punches) {
    this.punchPageListModel = punches
      ? <PunchPageListModel[]>[...punches]
      : [];
    this.dataSource = new MatTableDataSource(this.punchPageListModel);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.onLoadingTab.emit(this.defaultComponentName);
    this.waitingSignatures.nativeElement.style.minHeight = "auto";
    this.isToggleDropdown = false;
  }

  sortPunchOffline(punchListModels: PunchPageListModel[], column: string, order: string) {
    if (!this.isOffline) { return punchListModels; }
    if (!punchListModels || punchListModels.length === 0) { return null; }
    console.log(punchListModels[0] instanceof PunchPageListModel);


    switch (order) {
      case 'asc':
        punchListModels.sort((a, b) => ((a[column] || '').localeCompare(b[column] || '')));
        break;
      case 'desc':
        punchListModels.sort((a, b) => (-1) * ((a[column] || '').localeCompare(b[column] || '')));
        break;
    }
    return punchListModels;
  }

  onSortData(sort: Sort) {
    let sortExpressionData: string;
    if (sort) {
      sortExpressionData = sort.active + " " + sort.direction;
      this.currentSortExpression = sortExpressionData;
      this.onGetPunchData(
        this.currentPageNumber,
        this.currentPageSize,
        this.currentSortExpression
      );
    }
  }

  onClearFilter = () => {
    this.punchPageSearchModel = new PunchPageSearchModel();
  };

  onRefreshData() {
    this.onClearFilter();
    this.selection.clear();
    this.currentPageNumber = Configs.DefaultPageNumber;
    this.currentPageSize = Configs.DefaultPageSize;
    if (this.paginationTemp && this.paginationTemp.pageIndex) {
      this.paginationTemp.pageIndex = Configs.DefaultPageNumber;
    }
    this.onGetPunchData();
  }

  onShowDrawings = (drawings: DrawingLookUpModel[]) => {
    this.drawingLookUpModel = drawings;
    this.isShowDrawings = true;
  };

  onConfirmDrawings = (isSuccess: boolean) => {
    this.isShowDrawings = isSuccess;
    this.drawingLookUpModel = [];
  };

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  checkboxLabel(row?: PunchPageListModel): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.punchId + 1
      }`;
  }

  onToggleRightSide = () => {
    this.isToggleRightSide = !this.isToggleRightSide;
  };

  //--- Sign item
  onOpenSignModal = () => {
    if (this.selection.selected.length <= 0) {
      this.authErrorHandler.handleError(Constants.ErrPunch);
    } else {
      this.isSignState = true;
      this.isShowPinCode = true;
    }
  };

  onSignConfirm = (isConfirm: boolean) => {
    if (isConfirm) {
      this.clientState.isBusy = true;

      if (this.isOffline) {
        this.onShowPinCodeModal();
        this.clientState.isBusy = false;
      } else {
        let punchIds = [];
        this.selection.selected.map(
          (punch) => punch.punchId && punchIds.push(punch.punchId)
        );

        this.punchPageService.signValidate(punchIds, this.projectKey).subscribe({
          complete: () => {
            this.clientState.isBusy = false;
            this.onShowPinCodeModal();
          },
          error: (err: ApiError) => {
            this.clientState.isBusy = false;
            if (err.type == Constants.PinCodeNotExistsException) {
              this.onShowPinCodeModal(true);
            } else {
              this.authErrorHandler.handleError(err.message);
            }
          },
        });
      }
    }
    this.isSignState = false;
  };

  //--- Execute signatures
  _executeSignatures(signatures: Signature[]) {
    const _userinfo = JwtTokenHelper.GetUserInfo();
    const infoProject = JwtTokenHelper.GetAuthSignInProject();
    let _signatures = [...signatures];
    let _isDone = false;
    let _inSignOff = true;
    let _signNo1 = -1;
    let _signaturesAmount = 0;
    const _currentIndex = _signatures.findIndex(_s => {
      _signNo1 = _s.number;
      return _s.isTurn
    });
    const _temp = {
      signDate: (new Date()),
      signedName: _userinfo.userName,
      isTurn: false,
    }
    Object.assign(_signatures[_currentIndex], _temp);

    if (_currentIndex === (_signatures.length - 1)) {
      _isDone = true;
    } else {
      const _nextSignIndex = _signatures.findIndex(sign => sign.number === (_signNo1 + 1));
      _signatures[_nextSignIndex].isTurn = true;
      _inSignOff = (_signatures[_nextSignIndex].authorizationLevel >= infoProject.authLevel);
    }

    _signaturesAmount = _signatures.filter(_s => !!_s.signDate).length;

    return {
      signs: _signatures,
      isDone: _isDone,
      inSignOff: _inSignOff,
      signaturesAmount: _signaturesAmount,
    };
  }

  //--- Signature item
  onOpenSignatureModal = (signatureItem: Signature[], punchId: string) => {
    if (!signatureItem || (signatureItem && signatureItem.length <= 0) || !punchId) {
      this.signatureModel = [];
      this.punchId = "";
    } else {
      this.signatureModel = signatureItem;
      this.punchId = punchId;
    }
    this.selection.clear();
    this.isShowSignature = true;

    this.isShowPinCodeSingle = true;
  };

  onSignatureConfirm = (punchId: string) => {
    if (punchId) {
      this.clientState.isBusy = true;

      if (this.isOffline) {
        this.punchIdForSign = punchId;
        this.onShowPinCodeSingleModal();
        this.clientState.isBusy = false;
      } else {
        let punchIds = [];
        punchIds.push(punchId);

        this.punchPageService.signValidate(punchIds, this.projectKey).subscribe({
          complete: () => {
            this.clientState.isBusy = false;
            this.onShowPinCodeSingleModal();
          },
          error: (err: ApiError) => {
            this.clientState.isBusy = false;
            if (err.type == Constants.PinCodeNotExistsException) {
              this.onShowPinCodeSingleModal(true);
            } else {
              this.authErrorHandler.handleError(err.message);
            }
          },
        });
      }
    }
    this.isShowSignature = false;
  };

  //--- Pin Code
  onShowPinCodeModal = (isCreatePinCode: boolean = false) => {
    this.isShowPinCode = true;
    if (isCreatePinCode) {
      this.onShowCreatePinCodeModal();
    }
  };

  onShowPinCodeSingleModal = (isCreatePinCode: boolean = false) => {
    this.isShowPinCodeSingle = true;
    if (isCreatePinCode) {
      this.onShowCreatePinCodeSingleModal();
    }
  };

  onPinCodeConfirmModal = (code: string) => {
    this.isShowPinCode = false;
    this.isShowCreatePinCode = false;
    if (code) {
      if (code == "CREATE") {
        this.onCreatePinCodeConfirmModal(true);
        return;
      }
      this.clientState.isBusy = true;

      if (this.isOffline) {
        const _snLookup = StoreNames.lookups;
        this.idbService.getItem(_snLookup, KeyLookups.pinCode).then((_pc) => {
          if (BCryptHelper.comparison(code, _pc)) {
            const _snPunches = StoreNames.punches;
            (this.selection.selected).forEach(_punch => {
              let _signP = { ..._punch };
              const _obj = this._executeSignatures(_signP.signatures);
              _signP.signatures = _obj.signs;
              _signP.inSignOff = _obj.inSignOff;
              if (_obj.isDone) {
                _signP.status = PunchStatuses.done;
                _signP.statusId = PunchStatusIds.done;
                this.updateCompleteSideMenuChart(_signP.tagId, _signP.category);
              }
              _signP.numberSigned = _obj.signaturesAmount;
              _signP.isEdited = true;
              this.idbService.updateItem(_snPunches, _signP, _punch.punchId)
                .then(
                  (res) => {
                    this.clientState.isBusy = false;
                    this.authErrorHandler.handleSuccess(Constants.SignSuccess);
                  },
                  (err) => {
                    this.clientState.isBusy = false;
                  }
                );
            });
            this.onGetPunchData();
          } else {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(
              Constants.InvalidPinCode
            );
          }
        });
      } else {
        this.executeAfterMapPinCode(code);
      }
    }
  };

  executeAfterMapPinCode(code: string) {
    let punchIds = [];
    if (this.selection.selected && this.selection.selected.length > 0) {
      this.selection.selected.map(
        (punch) => punch.punchId && punchIds.push(punch.punchId)
      );
    } else if (this.punchId) {
      punchIds.push(this.punchId);
    } else {
      return;
    }

    this.punchPageService
      .signOffPunches(punchIds, this.projectKey, parseInt(code))
      .subscribe({
        complete: () => {
          this.authErrorHandler.handleSuccess(Constants.SignSuccess);
          this.onRefreshData();
          this.onGetCounter.emit(this.defaultComponentName);
        },
        error: (err: ApiError) => {
          this.selection.clear();
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        },
      });
  }

  onPinCodeSingleConfirmModal(code: string) {
    this.isShowPinCodeSingle = false;
    this.isShowCreatePinCodeSingle = false;
    if (code) {
      if (code == "CREATE") {
        this.onCreatePinCodeConfirmModal(true);
        return;
      }
      this.clientState.isBusy = true;

      if (this.isOffline) {

        const _snLookup = StoreNames.lookups;
        this.idbService.getItem(_snLookup, KeyLookups.pinCode).then((_pc) => {
          if (BCryptHelper.comparison(code, _pc)) {
            const _snPunches = StoreNames.punches;
            this.idbService.getItem(_snPunches, this.punchIdForSign).then((_punch) => {
              this.punchIdForSign = '';
              let _signP = { ..._punch };
              const _obj = this._executeSignatures(_signP.signatures);
              _signP.signatures = _obj.signs;
              _signP.inSignOff = _obj.inSignOff;
              if (_obj.isDone) {
                _signP.status = PunchStatuses.done;
                _signP.statusId = PunchStatusIds.done;
                this.updateCompleteSideMenuChart(_signP.tagId, _signP.category);
              }
              _signP.numberSigned = _obj.signaturesAmount;
              _signP.isEdited = true;
              this.idbService.updateItem(_snPunches, _signP, _punch.punchId)
                .then(
                  (res) => {
                    this.clientState.isBusy = false;
                    this.authErrorHandler.handleSuccess(Constants.SignSuccess);
                  },
                  (err) => {
                    this.clientState.isBusy = false;
                  }
                );
            });
            setTimeout(() => {
              this.onGetPunchData();
            }, 10);
          } else {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(
              Constants.InvalidPinCode
            );
          }
        });
      } else {
        this.executeAfterMapPinCode(code);
      }
    }
  }

  updateCompleteSideMenuChart(tagId: string, category: string) {
    const _sn = StoreNames.tags;
    this.idbService.getItem(_sn, tagId).then(
      (res) => {
        if (res) {
          let _tagData = res;
          switch (category) {
            case 'A':
              _tagData.tagSideMenu.detailChart.noOfPunchTypeACompleted += 1;
              break;
            case 'B':
              _tagData.tagSideMenu.detailChart.noOfPunchTypeBCompleted += 1;
              break;
            case 'C':
              _tagData.tagSideMenu.detailChart.noOfPunchTypeCCompleted += 1;
              break;
          }
          this.idbService.updateItem(_sn, _tagData, tagId);
        }
      },
      (err) => { }
    );
  }

  //--- Create Pin Code
  onShowCreatePinCodeModal = () => {
    this.isShowCreatePinCode = true;
  };

  onShowCreatePinCodeSingleModal = () => {
    this.isShowCreatePinCodeSingle = true;
  };

  onCreatePinCodeConfirmModal = (isConfirm: boolean) => {
    this.isShowCreatePinCode = false;
    if (isConfirm) {
      this.router.navigate(["/change-pincode"]);
    }
  };

  onCreatePinCodeSingleConfirmModal = (isConfirm: boolean) => {
    this.isShowCreatePinCodeSingle = false;
    if (isConfirm) {
      this.router.navigate(["/change-pincode"]);
    }
  };

  numberToArray = (length: number) => {
    let arr = [];
    for (let i = 0; i < length; i++) {
      arr.push(i);
    }
    return arr;
  };

  //--- Toggle Dropdown
  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;

    const dropdownHeight = $(".dropdown-menu").outerHeight() + 80;
    if (this.isToggleDropdown && dropdownHeight > 0) {
      this.waitingSignatures.nativeElement.style.minHeight = dropdownHeight + "px";
    } else {
      this.waitingSignatures.nativeElement.style.minHeight = "auto";
    }
  };

  onGetSubSystemBySystemFilter(event) {
    if (!event || !event.id) {
      return;
    }

    if (this.isOffline) {
      const _snLookups = StoreNames.lookups;
      this.idbService.getItem(_snLookups, KeyLookups.subSystemLookup).then((res) => {
        if (res && res.length > 0) {
          const _filterSystem = res.filter(_subsystem => _subsystem['systemId'] === event.id);
          this.onGetSubsystemFilterOffline(_filterSystem);
        }
      }, (err) => { });
    } else {
      this.onGetSubSystemLookUpFilter(event.id);
    }
  };
  //--- SystemFilter 
  onGetLookUpSystemFilter() {
    return new Promise((resolve, reject) => {
      this.systemService.getElementSystemLookUpPunchPage(this.projectKey).subscribe(res => {
        this.systemFilterModels = res.content ? <SystemLookUpModel[]>[...res.content] : [];
        this.systemFilterTemModels = this.systemFilterModels.slice(0, this.bufferSize);
        this.clientState.isBusy = true;
        resolve(res.content);
      }, (err: ApiError) => {
        this.clientState.isBusy = true;
        reject(err.message)
        this.authErrorHandler.handleError(err.message);
      });
    });
  }

  onGetSystemFilterOffline(response) {
    this.systemFilterModels = response ? <SystemLookUpModel[]>[...response] : [];
    this.systemFilterTemModels = this.systemFilterModels.slice(0, this.bufferSize);
  }

  onScrollToEndSystemFilter = () => {
    if (this.systemFilterModels.length > this.bufferSize) {
      const len = this.systemFilterTemModels.length;
      const more = this.systemFilterModels.slice(len, this.bufferSize + len);
      this.isLoadingSelectSystemFilter = true;
      setTimeout(() => {
        this.isLoadingSelectSystemFilter = false;
        this.systemFilterTemModels = this.systemFilterTemModels.concat(more);
      }, 500)
    }
  }

  onSearchSystemFilter = ($event) => {
    this.isLoadingSelectSystemFilter = true;
    if ($event.term == '') {
      this.systemFilterTemModels = this.systemFilterModels.slice(0, this.bufferSize);
      this.isLoadingSelectSystemFilter = false;
    } else {
      this.systemFilterTemModels = this.systemFilterModels;
      this.isLoadingSelectSystemFilter = false;
    }
  }

  onClearSystemFilter = () => {
    this.systemFilterTemModels = this.systemFilterModels.slice(0, this.bufferSize);
  }
  //--- /SystemFilter

  //--- SubSystemFilter
  onGetSubSystemLookUpFilter(systemId?: string) {
    this.clientState.isBusy = true;
    this.subSystemService.getSubSystemLookUp(this.projectKey, systemId).subscribe(res => {
      this.subSystemLookUpFilterModels = res.content ? <SubSystemLookUpModel[]>[...res.content] : [];
      this.subSystemFilterTempModel = this.subSystemLookUpFilterModels.slice(0, this.bufferSize);
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onGetSubsystemFilterOffline(response) {
    this.subSystemLookUpFilterModels = response ? <SubSystemLookUpModel[]>[...response] : [];
    this.subSystemFilterTempModel = this.subSystemLookUpFilterModels.slice(0, this.bufferSize);
  }

  onScrollToEndSubSystemFilter = () => {
    if (this.subSystemLookUpFilterModels.length > this.bufferSize) {
      const len = this.subSystemFilterTempModel.length;
      const more = this.subSystemLookUpFilterModels.slice(len, this.bufferSize + len);
      this.isLoadingSelectSubSystemFilter = true;
      setTimeout(() => {
        this.isLoadingSelectSubSystemFilter = false;
        this.subSystemFilterTempModel = this.subSystemFilterTempModel.concat(more);
      }, 500)
    }
  }

  onSearchSubSystemFilter = ($event) => {
    this.isLoadingSelectSubSystemFilter = true;
    if ($event.term == '') {
      this.subSystemFilterTempModel = this.subSystemLookUpFilterModels.slice(0, this.bufferSize);
      this.isLoadingSelectSubSystemFilter = false;
    } else {
      this.subSystemFilterTempModel = this.subSystemLookUpFilterModels;
      this.isLoadingSelectSubSystemFilter = false;
    }
  }

  onClearSubSystemFilter = () => {
    this.subSystemFilterTempModel = this.subSystemLookUpFilterModels.slice(0, this.bufferSize);
  }
  //--- /SubSystemFilter

  //--- DisciplineFilter
  onGetDisciplineFilterLookup = () => {
    return new Promise((resolve, reject) => {
      this.dataDisciplineService.getDisciplineLookUpPunchPage(this.projectKey).subscribe(res => {
        this.disciplineFilterModels = res.content ? <DisciplineLookUpModel[]>[...res.content] : [];
        this.disciplineFilterTempModels = this.disciplineFilterModels.slice(0, this.bufferSize);
        this.clientState.isBusy = true;
        resolve(res.content);
      }, (err: ApiError) => {
        this.clientState.isBusy = true;
        reject(err.message)
        this.authErrorHandler.handleError(err.message);
      });
    });
  }

  onGetDisciplineFilterOffline(response) {
    this.disciplineFilterModels = response ? <DisciplineLookUpModel[]>[...response] : [];
    this.disciplineFilterTempModels = this.disciplineFilterModels.slice(0, this.bufferSize);
  }

  onScrollToEndDisciplineFilter = () => {
    if (this.disciplineFilterModels.length > this.bufferSize) {
      const len = this.disciplineFilterTempModels.length;
      const more = this.disciplineFilterModels.slice(len, this.bufferSize + len);
      this.isLoadingDisciplineSelectFilter = true;
      setTimeout(() => {
        this.isLoadingDisciplineSelectFilter = false;
        this.disciplineFilterTempModels = this.disciplineFilterTempModels.concat(more);
      }, 500)
    }
  }

  onSearchDisciplineFilter = ($event) => {
    this.isLoadingDisciplineSelectFilter = true;
    if ($event.term == '') {
      this.disciplineFilterTempModels = this.disciplineFilterModels.slice(0, this.bufferSize);
      this.isLoadingDisciplineSelectFilter = false;
    } else {
      this.disciplineFilterTempModels = this.disciplineFilterModels;
      this.isLoadingDisciplineSelectFilter = false;
    }
  }

  onClearDisciplineFilter = () => {
    this.disciplineFilterTempModels = this.disciplineFilterModels.slice(0, this.bufferSize);
  }
  //--- /DisciplineFilter

  //--- LocationFilter 
  onGetLocationLookUpFilter() {
    return new Promise((resolve, reject) => {
      this.locationService.getLocationLookUpPunchPage(this.projectKey).subscribe(res => {
        this.locationLookUpFilterModels = res.content ? <LocationLookUpModel[]>[...res.content] : [];
        this.locationFilterTempModel = this.locationLookUpFilterModels.slice(0, this.bufferSize)
        this.clientState.isBusy = true;
        resolve(res.content);
      }, (err: ApiError) => {
        this.clientState.isBusy = true;
        reject(err.message)
        this.authErrorHandler.handleError(err.message);
      });
    });
  }

  onGetLocationFilterOffline(response) {
    this.locationLookUpFilterModels = response ? <LocationLookUpModel[]>[...response] : [];
    this.locationFilterTempModel = this.locationLookUpFilterModels.slice(0, this.bufferSize);
  }

  onScrollToLocationFilter = () => {
    if (this.locationLookUpFilterModels.length > this.bufferSize) {
      const len = this.locationFilterTempModel.length;
      const more = this.locationLookUpFilterModels.slice(len, this.bufferSize + len);
      this.isLoadingSelectLocationFilter = true;
      setTimeout(() => {
        this.isLoadingSelectLocationFilter = false;
        this.locationFilterTempModel = this.locationFilterTempModel.concat(more);
      }, 500)
    }
  }

  onSearchLocationFilter = ($event) => {
    this.isLoadingSelectLocationFilter = true;
    if ($event.term == '') {
      this.locationFilterTempModel = this.locationLookUpFilterModels.slice(0, this.bufferSize);
      this.isLoadingSelectLocationFilter = false;
    } else {
      this.locationFilterTempModel = this.locationLookUpFilterModels;
      this.isLoadingSelectLocationFilter = false;
    }
  }

  onClearLocationFilter = () => {
    this.locationFilterTempModel = this.locationLookUpFilterModels.slice(0, this.bufferSize);
  }
  //--- /LocationFilter

  onShowImages = (images: ImageLookUp[]) => {
    this.imageLookUpModel = images;
    this.isOpenImages = true;
  };

  onConfirmImages = (isSuccess: boolean) => {
    this.isOpenImages = isSuccess;
    this.imageLookUpModel = [];
  };
}
