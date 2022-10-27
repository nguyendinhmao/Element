import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ClientState } from "src/app/shared/services/client/client-state";
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import { MatSort, Sort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { Constants, Configs, PermissionsViews, JwtTokenHelper } from "src/app/shared/common";
import { AuthErrorHandler } from "src/app/shared/services/auth/auth.error-handler";
import { DataLocationService } from 'src/app/shared/services/api/data-tab/data-location.service';
import { DataSystemService } from 'src/app/shared/services/api/data-tab/data-system.service';
import { DataSubSystemService } from 'src/app/shared/services/api/data-tab/data-subsystem.service';
import { DisciplineLookUpModel } from 'src/app/shared/models/data-tab/data-discipline.model';
import { DataDisciplineService } from 'src/app/shared/services/api/data-tab/data-discipline.service';
import { SystemLookUpModel } from 'src/app/shared/models/data-tab/data-system.model';
import { SubSystemLookUpModel } from 'src/app/shared/models/data-tab/data-subsystem.model';
import { LocationLookUpModel } from 'src/app/shared/models/data-tab/data-location.model';
import { PunchPageService } from "src/app/shared/services/api/punch-page/punch-page.service";
import {
  PunchPageListModel,
  PunchPageSearchModel,
  DrawingLookUpModel,
  Signature,
  DisciplineLookUpPunchPage,
  LookUpFilterModel,
  ImageLookUp
} from "src/app/shared/models/punch-page/punch-page.model";
import { StatusColor, StoreNames } from 'src/app/shared/models/common/common.model';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import * as $ from "jquery";
import { IdbService } from 'src/app/shared/services';
import { KeyLookups, PunchStatuses } from 'src/app/shared/models/punch-item/punch-item.model';
import { AuthInProjectDto } from "src/app/shared/models/project-management/project-management.model";

@Component({
  selector: "punch-item",
  styleUrls: ["./punch-item.component.scss"],
  templateUrl: "./punch-item.component.html",
})

export class PunchItemComponent implements OnInit, AfterViewInit {
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
  isShowSignature: boolean;
  isLoadingSelectSystemFilter: boolean;
  isLoadingSelectSubSystemFilter: boolean;
  isLoadingDisciplineSelectFilter: boolean;
  isLoadingSelectLocationFilter: boolean;
  isOpenImages: boolean;

  //--- Variables
  sub: any;
  punchId: string;
  moduleKey: string;
  projectKey: string;
  tagNo: string;

  //--- Model
  punchPageListModel: PunchPageListModel[] = [];
  punchPageSearchModel: PunchPageSearchModel = new PunchPageSearchModel();
  drawingLookUpModel: DrawingLookUpModel[];
  isMySubmittedPunches: boolean = false;
  imageLookUpModel: ImageLookUp[];
  authInProjectDto = [];

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
  _storeName: string;

  StatusColor = StatusColor;

  signatureModel: Signature[];

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
    "signatures",
    "status",
    "edit",
  ];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatPaginator) paginationTemp: MatPaginator;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientState: ClientState,
    private authErrorHandler: AuthErrorHandler,
    private punchPageService: PunchPageService,
    private systemService: DataSystemService,
    private subSystemService: DataSubSystemService,
    private dataDisciplineService: DataDisciplineService,
    private locationService: DataLocationService,
    private idbService: IdbService,
  ) {
    this.route.queryParams.subscribe(params => {
      this.tagNo = params['tagNo'];
    });
    this.sub = this.route.params.subscribe((params) => {
      this.moduleKey = params["moduleKey"];
      this.projectKey = params["projectKey"];

      if (!this.moduleKey || !this.projectKey) {
        this.router.navigate([""]);
      }
    });
    this._storeName = StoreNames.punches;
    this.authInProjectDto = JwtTokenHelper.GetAuthProject() ? <AuthInProjectDto[]>[...JwtTokenHelper.GetAuthProject()] : [];
  }

  ngAfterViewInit(): void {
    const tableContainerHeight = $(window).height() - 230;
    if (tableContainerHeight > 0) {
      this.tableContainer.nativeElement.style.maxHeight = tableContainerHeight + "px";
    }
  }

  public ngOnInit() {
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

    if (this.isOffline) {
      this.onGetFilterOffline()
    } else {
      this.onGetFilterOnline();
    }

    this.onGetPunchData();
  }

  //--- Check info device
  get isTablet() {
    return InfoDevice.isTablet;
  }

  get isOffline() {
    return InfoDevice.isOffline;
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
    this.clientState.isBusy = true;
    const _snLookups = StoreNames.lookups;
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
    ]).then((res) => {
      this.clientState.isBusy = false;
    }).catch((err) => {
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

    if (pageNumber >= 0) {
      this.currentPageNumber = pageNumber;
      pageNumber = this.currentPageNumber + 1;
    }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;

    if (this.isOffline) {
      this.assignPunchDataOffline(sortExpression);
    } else {
      this.assignPunchDataOnline(pageNumber, pageSize, sortExpression, punchNo);
    }
  };

  assignPunchDataOffline(sortExpression?: string) {
    this.clientState.isBusy = true;
    const _softParts = sortExpression ? sortExpression.split(' ') : ["punchNo", "asc"];

    this.idbService.getAllData(this._storeName).then((res) => {
      if (res && res.length > 0) {
        const _notDeletedPunches = res.filter(_punch => !_punch.isDeleted);

        const _filterSystem = this.filterOffline(_notDeletedPunches, 'systemNo', this.punchPageSearchModel.systemNo),
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

  assignPunchDataOnline(pageNumber?: number, pageSize?: number, sortExpression?: string, punchNo?: string) {
    if (this.isMySubmittedPunches) {
      this.punchPageService
        .getMySubmittedPunches(
          this.projectKey,
          this.tagNo,
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
          punchNo || this.punchPageSearchModel.punchNo || "",

        )
        .subscribe(
          (res) => {
            this.totalItems = res.totalItemCount;
            this.assignPunchData2Model(res.items);
            this.clientState.isBusy = false;
            this.isToggleDropdown = false;
          },
          (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
          }
        );
    } else {
      this.punchPageService
        .getDataPunchPage(
          this.projectKey,
          this.tagNo,
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
            this.isToggleDropdown = false;
          },
          (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
          }
        );
    }
  }

  assignPunchData2Model(response: PunchPageListModel[]) {
    this.punchPageListModel = response
      ? <PunchPageListModel[]>[...response]
      : [];
    this.dataSource = new MatTableDataSource(this.punchPageListModel);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  sortPunchOffline(punchListModels: PunchPageListModel[], column: string, order: string) {
    if (!this.isOffline) { return punchListModels; }
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

  getActionType(status: string) {
    const _actionTypes = {
      create: "create",
      approve: "approve",
      sign: "sign",
    }
    if (PunchStatuses.done === status) {
      return '';
    } else if (PunchStatuses.submitted === status && JwtTokenHelper.IsAuthInProject(PermissionsViews.PUNCH_TAB_VIEW_TAB_APPROVE, this.authInProjectDto)) {
      return _actionTypes.approve;
    } else if (PunchStatuses.approved === status) {
      return _actionTypes.sign;
    }
    return _actionTypes.create;
  }

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

  //--- Add item
  onOpenAddModal = () => {
    this.isAddNewState = true;
  };

  onSuccessAddModal = (isSuccess: boolean) => {
    if (isSuccess) {
      this.onRefreshData();
    }
    this.isAddNewState = false;
  };

  //--- Edit item
  onOpenEditModal = (punchId: string) => {
    if (punchId) {
      this.punchId = punchId;
      this.isEditState = true;
    }
  };

  onSuccessEditModal = (punchItem: PunchPageListModel) => {
    if (this.isOffline) {
      this.onGetPunchData();
    } else if (
      punchItem &&
      punchItem.punchId &&
      this.punchPageListModel.some(
        (punch) => punch.punchId == punchItem.punchId
      )
    ) {
      this.punchPageListModel.map((punch) => {
        if (punch.punchId == punchItem.punchId) Object.assign(punch, punchItem);
      });
    }

    this.isEditState = false;
  };

  //--- Delete item
  onOpenDeleteModal = () => {
    this.isDeleteState = true;
  };

  onDeleteConfirm = (isConfirm: boolean) => {
    if (isConfirm) {
      this.clientState.isBusy = true;

      let listDeleted = [];
      this.selection.selected.map(
        (punch) => punch.punchId && listDeleted.push(punch.punchId)
      );

      if (listDeleted.length > 0) {
        let _content = listDeleted.length === 1 ? "Punch has been deleted" : Constants.PunchListDeleted;
        if (this.isOffline) {
          (this.selection.selected).forEach(_punch => {
            const _p = { ..._punch };
            _p.isDeleted = true;
            this.updateCompleteSideMenuChart(_p.tagId, _p.category);
            this.idbService.updateItem(this._storeName, _p, _punch.punchId);
          });
          this.authErrorHandler.handleSuccess(_content);
          this.onRefreshData();
        } else {
          this.punchPageService
            .deletePunchPage(listDeleted, this.projectKey)
            .subscribe({
              complete: () => {
                this.selection.clear();
                this.authErrorHandler.handleSuccess(_content);
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
    }
    this.isDeleteState = false;
  };

  updateCompleteSideMenuChart(tagId: string, category: string) {
    const _sn = StoreNames.tags;
    this.idbService.getItem(_sn, tagId).then(
      (res) => {
        if (res) {
          let _tagData = res;
          switch (category) {
            case 'A':
              _tagData.tagSideMenu.detailChart.noOfPunchTypeACompleted -= 1;
              break;
            case 'B':
              _tagData.tagSideMenu.detailChart.noOfPunchTypeBCompleted -= 1;
              break;
            case 'C':
              _tagData.tagSideMenu.detailChart.noOfPunchTypeCCompleted -= 1;
              break;
          }
          this.idbService.updateItem(_sn, _tagData, tagId);
        }
      },
      (err) => { }
    );
  }

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
  };

  onChangeMyPunches = (isCheck: any) => {
    this.isMySubmittedPunches = isCheck.checked;
  };

  onOpenSignatureModal = (signatureItem: Signature[], punchId: string) => {
    if (signatureItem && signatureItem.length > 0 && punchId) {
      this.signatureModel = signatureItem;
      this.punchId = punchId;
      this.isShowSignature = true;
    } else {
      this.signatureModel = [];
      this.punchId = "";
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
        this.disciplineFilterModels = res.content ? <DisciplineLookUpPunchPage[]>[...res.content] : [];
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
    this.disciplineFilterModels = response ? <DisciplineLookUpPunchPage[]>[...response] : [];
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
