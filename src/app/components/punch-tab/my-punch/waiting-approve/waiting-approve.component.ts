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
  LookUpFilterModel,
  ImageLookUp
} from "src/app/shared/models/punch-page/punch-page.model";
import { StatusColor, StoreNames } from 'src/app/shared/models/common/common.model';

import * as $ from "jquery";
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { KeyLookups, PunchStatuses, PunchStatusIds } from 'src/app/shared/models/punch-item/punch-item.model';
import { IdbService } from 'src/app/shared/services';

@Component({
  selector: "waiting-approve",
  styleUrls: ["./waiting-approve.component.scss"],
  templateUrl: "./waiting-approve.component.html",
})
export class WaitingApproveComponent implements OnChanges, AfterViewInit {
  @Input() moduleKey: string;
  @Input() projectKey: string;
  @Input() textLabel: string;
  @Input() isFirstLoad: boolean = true;
  @Input() tagNo: string = '';

  @Output() onGetCounter: EventEmitter<string> = new EventEmitter<string>();
  @Output() onLoadingTab: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild("waitingApprove") waitingApprove: ElementRef;
  @ViewChild("tableContainer") tableContainer: ElementRef;

  //--- Boolean
  isToggleRightSide: boolean = true;
  isEditState: boolean;
  isDeleteState: boolean;
  isToggleDropdown: boolean;
  isFilter: boolean;
  isShowDrawings: boolean;
  isApproveState: boolean;
  isRejectState: boolean;
  isCloseState: boolean;
  isLoadingSelectSystemFilter: boolean;
  isLoadingSelectSubSystemFilter: boolean;
  isLoadingDisciplineSelectFilter: boolean;
  isLoadingSelectLocationFilter: boolean;
  isOpenImages: boolean;

  //--- Variables
  punchId: string;
  StatusColor = StatusColor;
  reason: string;
  permissionsViews = PermissionsViews;
  defaultComponentName: string = "Approve";
  totalItems: number = 0;
  currentPageSize: number = Configs.DefaultPageSize;
  currentPageNumber: number = Configs.DefaultPageNumber;
  currentSortExpression: string;
  defaultSort: string = "punchNo desc";
  bufferSize = 100;
  _storeName: string;

  //--- Model
  authInProjectDto: AuthInProjectDto[] = [];
  punchPageListModel: PunchPageListModel[] = [];
  imageLookUpModel: ImageLookUp[];
  punchPageSearchModel: PunchPageSearchModel = new PunchPageSearchModel();
  drawingLookUpModel: DrawingLookUpModel[];
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

  //-- Filter model
  statusFilterModel: LookUpFilterModel[] = [];
  categoryFilterModel: LookUpFilterModel[] = [];
  materialFilterModel:
    [{ value: true, label: "Yes" },
      { value: false, label: "No" }];

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
    "status",
    // "edit",
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
    private idbService: IdbService,
  ) {
    this._storeName = StoreNames.punches;
    this.authInProjectDto = JwtTokenHelper.GetAuthProject() ? <AuthInProjectDto[]>[...JwtTokenHelper.GetAuthProject()] : [];
  }

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

  ngAfterViewInit(): void {
    const tableContainerHeight = $(window).height() - 230;
    if (tableContainerHeight > 0) {
      this.tableContainer.nativeElement.style.maxHeight = tableContainerHeight + "px";
    }
  }

  onCheckPermission = (key: string) => {
    return JwtTokenHelper.IsAuthInProject(key, this.authInProjectDto);
  };

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
      { value: "DONE", label: "Complete" }];
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

  onGetPunchData = (pageNumber?: number, pageSize?: number, sortExpression?: string, punchNo?: string) => {
    this.clientState.isBusy = true;

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
    this.punchPageService.getListSubmittedPunches(
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
        const _submittedPunches = res.filter(_punch => !_punch.isDeleted && (_punch.status === PunchStatuses.submitted));

        const _filterSystem = this.filterOffline(_submittedPunches, 'systemNo', this.punchPageSearchModel.systemNo),
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
    this.waitingApprove.nativeElement.style.minHeight = "auto";
    this.isToggleDropdown = false;
    this.clientState.isBusy = false;
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
      this.onGetPunchData(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
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
    this.onGetCounter.emit(this.defaultComponentName);
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

  //--- Edit item
  onOpenEditModal = (punchId: string) => {
    if (punchId) {
      this.punchId = punchId;
      this.isEditState = true;
    }
  };

  onSuccessEditModal = (punchItem: PunchPageListModel) => {
    if (punchItem && punchItem.punchId) {
      this.onRefreshData();
    }
    this.isEditState = false;
  };

  //--- Approve item
  onOpenApproveModal = () => {
    if (this.selection.selected.length <= 0) {
      this.authErrorHandler.handleError(Constants.ErrPunch);
    } else {
      this.isApproveState = true;
    }
  };

  onApproveConfirm = (isConfirm: boolean) => {
    if (isConfirm) {
      this.clientState.isBusy = true;

      if (this.isOffline) {
        const _snPunches = StoreNames.punches;
        (this.selection.selected).forEach(_punch => {
          let _updateP = { ..._punch };
          _updateP.status = PunchStatuses.approved;
          _updateP.statusId = PunchStatusIds.approved;
          _updateP.totalSignatures = _punch.signatures && _punch.signatures.length;
          _updateP.isEdited = true;
          this.idbService.updateItem(_snPunches, _updateP, _punch.punchId);
        });
        this.onRefreshData();
        this.authErrorHandler.handleSuccess(Constants.ApproveSuccess);
      } else {
        let punchIds = [];
        this.selection.selected.map(
          (punch) => punch.punchId && punchIds.push(punch.punchId)
        );

        this.punchPageService
          .approvePunches(punchIds, this.projectKey)
          .subscribe({
            complete: () => {
              this.selection.clear();
              this.authErrorHandler.handleSuccess(Constants.ApproveSuccess);
              this.onRefreshData();
            },
            error: (err: ApiError) => {
              this.selection.clear();
              this.clientState.isBusy = false;
              this.authErrorHandler.handleError(err.message);
            },
          });
      }
    }
    this.isApproveState = false;
  };

  //--- Reject item
  onOpenRejectModal = () => {
    if (this.selection.selected.length <= 0) {
      this.authErrorHandler.handleError(Constants.ErrPunch);
    } else {
      this.isRejectState = true;
    }
  };

  onRejectConfirm = (reasonText: string) => {
    if (typeof reasonText !== 'undefined') {
      this.clientState.isBusy = true;

      if (this.isOffline) {
        const _snPunches = StoreNames.punches;
        (this.selection.selected).forEach(_punch => {
          let _updateP = { ..._punch };
          _updateP.status = PunchStatuses.rejected;
          _updateP.statusId = PunchStatusIds.rejected;
          _updateP.rejectReason = reasonText;
          _updateP.isEdited = true;
          this.idbService.updateItem(_snPunches, _updateP, _punch.punchId);
        });
        this.onRefreshData();
        this.authErrorHandler.handleSuccess(Constants.RejectSuccess);
      } else {
        let punchIds = [];
        this.selection.selected.map(
          (punch) => punch.punchId && punchIds.push(punch.punchId)
        );

        this.punchPageService.rejectPunches(punchIds, reasonText, this.projectKey).subscribe({
          complete: () => {
            this.selection.clear();
            this.onRefreshData();
            this.authErrorHandler.handleSuccess(Constants.RejectSuccess);
          },
          error: (err: ApiError) => {
            this.selection.clear();
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
          },
        });
      }
    }
    this.isRejectState = false;
  };

  //--- Close item
  onOpenCloseModal = () => {
    if (this.selection.selected.length <= 0) {
      this.authErrorHandler.handleError(Constants.ErrPunch);
    } else {
      this.isCloseState = true;
    }
  };

  onCloseConfirm = (isConfirm: boolean) => {
    if (isConfirm) {
      this.clientState.isBusy = true;

      if (this.isOffline) {
        const _snPunches = StoreNames.punches;
        (this.selection.selected).forEach(_punch => {
          let _updateP = { ..._punch };
          _updateP.status = PunchStatuses.deleted;
          _updateP.statusId = PunchStatusIds.deleted;
          _updateP.isDeleted = true;
          this.idbService.updateItem(_snPunches, _updateP, _punch.punchId);
        });
        this.onRefreshData();
        this.authErrorHandler.handleSuccess(Constants.RejectSuccess);
      } else {
        let punchIds = [];
        this.selection.selected.map(
          (punch) => punch.punchId && punchIds.push(punch.punchId)
        );

        this.punchPageService
          .deletePunches(punchIds, this.reason, this.projectKey)
          .subscribe({
            complete: () => {
              this.selection.clear();
              this.authErrorHandler.handleSuccess(Constants.CloseSuccess);
              this.onRefreshData();
            },
            error: (err: ApiError) => {
              this.selection.clear();
              this.clientState.isBusy = false;
              this.authErrorHandler.handleError(err.message);
            },
          });
      }
    }
    this.isCloseState = false;
  };

  //--- Toggle Dropdown
  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;

    const dropdownHeight = $(".dropdown-menu").outerHeight() + 80;
    if (this.isToggleDropdown && dropdownHeight > 0) {
      this.waitingApprove.nativeElement.style.minHeight = dropdownHeight + "px";
    } else {
      this.waitingApprove.nativeElement.style.minHeight = "auto";
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
