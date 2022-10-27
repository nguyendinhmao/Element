import {
  Component,
  ViewChild,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  ElementRef
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

// import { PunchPageService } from "src/app/shared/services/api/punch-page/punch-page.service";
import { DataLocationService } from 'src/app/shared/services/api/data-tab/data-location.service';
import { DataSystemService } from 'src/app/shared/services/api/data-tab/data-system.service';
import { DataSubSystemService } from 'src/app/shared/services/api/data-tab/data-subsystem.service';
import { DisciplineLookUpModel } from 'src/app/shared/models/data-tab/data-discipline.model';
import { DataDisciplineService } from 'src/app/shared/services/api/data-tab/data-discipline.service';
import { SystemLookUpModel } from 'src/app/shared/models/data-tab/data-system.model';
import { SubSystemLookUpModel } from 'src/app/shared/models/data-tab/data-subsystem.model';


import * as $ from "jquery";
import { ChangePageListModel, ChangeTypeLookUpModel, ChangePageSearchModel } from 'src/app/shared/models/change-tab/change-tab.model';
import { ChangePageService } from 'src/app/shared/services/api/change-page/change-page.service';
import { StatusColor, SelectionControlName, LoadingSelectionModel, LookUpModel } from 'src/app/shared/models/common/common.model';

@Component({
  selector: "waiting-approve-change",
  styleUrls: ["./waiting-approve-change.component.scss"],
  templateUrl: "./waiting-approve-change.component.html",
})
export class WaitingApproveChangeComponent implements OnChanges {
  @Input() moduleKey: string;
  @Input() projectKey: string;
  @Input() textLabel: string;
  @Input() isFirstLoad: boolean = true;

  @Output() onGetCounter: EventEmitter<string> = new EventEmitter<string>();
  @Output() onLoadingTab: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild("waitingApprove") waitingApprove: ElementRef;

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
  isShowDisciplines: boolean;
  isShowSystems: boolean;
  isShowSubSystems: boolean;
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
  defaultSort: string = "changeNo desc";
  bufferSize = 100;

  //--- Model
  changePageListModel: ChangePageListModel[] = [];
  disciplineLookUpModel: LookUpModel[];
  systemsLookUpModel: SystemLookUpModel[];
  subSystemsLookUpModel: SubSystemLookUpModel[];
  authInProjectDto: AuthInProjectDto[] = [];
  //--- System Filter Models
  systemFilterModels: SystemLookUpModel[] = [];
  systemFilterTemModels: SystemLookUpModel[] = [];
  //--- Subsystem Filter Models
  subSystemFilterModels: SubSystemLookUpModel[] = [];
  subSystemFilterTempModels: SubSystemLookUpModel[] = [];
  //--- Discipline Models
  disciplineFilterModels: LookUpModel[] = [];
  disciplineFilterTempModels: LookUpModel[] = [];
  //-- Change Stage
  changeStageLookUpModel: LookUpModel[];
  //-- changeType
  changeTypeLookupModel: LookUpModel[] = [];
  changeTypeTempLookupModel: LookUpModel[] = [];

  loadingSelection: LoadingSelectionModel = new LoadingSelectionModel();
  selectionControlName = SelectionControlName;
  //-- Filter model
  changePageSearchModel: ChangePageSearchModel = new ChangePageSearchModel()
  //-- Filter model
  //-- Datatable
  dataSource: MatTableDataSource<ChangePageListModel>;
  selection = new SelectionModel<ChangePageListModel>(true, []);
  displayedColumns: string[] = [
    //"select",
    "changeNo",
    "title",
    "changeType",
    "description",
    "stageName",
    "status",
    "justification",
    "proposedSolution",
    "disciplines",
    "systems",
    "subSystems",
    "createdDate",
    "createdBy",
  ];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatPaginator) paginationTemp: MatPaginator;

  constructor(
    private clientState: ClientState,
    private authErrorHandler: AuthErrorHandler,
    private systemService: DataSystemService,
    private subSystemService: DataSubSystemService,
    private dataDisciplineService: DataDisciplineService,
    private changePageService: ChangePageService,
  ) {
    this.authInProjectDto = JwtTokenHelper.GetAuthProject() ? <AuthInProjectDto[]>[...JwtTokenHelper.GetAuthProject()] : [];
  }

  onCheckPermission = (key: string) => {
    return JwtTokenHelper.IsAuthInProject(key, this.authInProjectDto);
  };

  ngOnChanges(_changes: SimpleChanges): void {
    if (
      this.moduleKey &&
      this.projectKey &&
      this.textLabel.includes(this.defaultComponentName) &&
      this.isFirstLoad
    ) {
      this.isFirstLoad = false;
      this.onGetData();
    }
  }
  public ngOnInit() {

  }
  onGetData = () => {
    this.clientState.isBusy = true;
    Promise.all([this.onGetChangeList(),
    this.onGetLookUpSystemFilter(),
    this.onGetSubSystemLookUpFilter(),
    this.onGetLookupChangeType(),
    this.onGetDisciplineFilterLookup(),
    this.onGetLookUpStageFilter()])
      .then(() => {
        this.clientState.isBusy = false;
      })
      .catch(() => {
        this.clientState.isBusy = false;
      });
  };

  onGetChangeList = (pageNumber?: number, pageSize?: number, sortExpression?: string, changeNo?: string) => {
    this.clientState.isBusy = true;

    if (pageNumber >= 0) {
      this.currentPageNumber = pageNumber;
      pageNumber = this.currentPageNumber + 1;
    }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;

    this.changePageService.getListSubmittedChanges(
      this.projectKey,
      pageNumber || Configs.DefaultPageNumber,
      pageSize || Configs.DefaultPageSize,
      sortExpression || this.currentSortExpression || this.defaultSort,
      this.changePageSearchModel.changeNo || "",
      this.changePageSearchModel.title || "",
      this.changePageSearchModel.changeType || "",
      this.changePageSearchModel.stage || "",
      this.changePageSearchModel.system || "",
      this.changePageSearchModel.subSystem || "",
      this.changePageSearchModel.discipline || ""
    )
      .subscribe(
        (res) => {
          this.changePageListModel = res.items
            ? <ChangePageListModel[]>[...res.items]
            : [];
          this.totalItems = res.totalItemCount;
          this.dataSource = new MatTableDataSource(this.changePageListModel);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.clientState.isBusy = false;
          this.onLoadingTab.emit(this.defaultComponentName);
          this.isToggleDropdown = false;
          //this.initChange.nativeElement.style.minHeight = "auto";
        },
        (err: ApiError) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        }
      );
  };

  onSortData(sort: Sort) {
    let sortExpressionData: string;
    if (sort) {
      sortExpressionData = sort.active + " " + sort.direction;
      this.currentSortExpression = sortExpressionData;
      this.onGetChangeList(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  onClearFilter = () => {
    this.changePageSearchModel = new ChangePageSearchModel();
  };

  onRefreshData() {
    this.onClearFilter();
    this.selection.clear();
    this.currentPageNumber = Configs.DefaultPageNumber;
    this.currentPageSize = Configs.DefaultPageSize;
    if (this.paginationTemp && this.paginationTemp.pageIndex) {
      this.paginationTemp.pageIndex = Configs.DefaultPageNumber;
    }
    this.onGetChangeList();
    this.onGetCounter.emit(this.defaultComponentName);
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

  checkboxLabel(row?: ChangePageListModel): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.id + 1
      }`;
  }

  onToggleRightSide = () => {
    this.isToggleRightSide = !this.isToggleRightSide;
  };





  onApproveConfirm = (isConfirm: boolean) => {
    // if (isConfirm) {
    //   this.clientState.isBusy = true;

    //   let punchIds = [];
    //   this.selection.selected.map(
    //     (punch) => punch.punchId && punchIds.push(punch.punchId)
    //   );

    //   this.punchPageService
    //     .approvePunches(punchIds, this.projectKey)
    //     .subscribe({
    //       complete: () => {
    //         this.selection.clear();
    //         this.authErrorHandler.handleSuccess(Constants.ApproveSuccess);
    //         this.onRefreshData();
    //       },
    //       error: (err: ApiError) => {
    //         this.selection.clear();
    //         this.clientState.isBusy = false;
    //         this.authErrorHandler.handleError(err.message);
    //       },
    //     });
    // }
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
    // if (typeof reasonText !== 'undefined') {
    //   this.clientState.isBusy = true;

    //   let punchIds = [];
    //   this.selection.selected.map(
    //     (punch) => punch.punchId && punchIds.push(punch.punchId)
    //   );

    //   this.punchPageService.rejectPunches(punchIds, reasonText, this.projectKey).subscribe({
    //     complete: () => {
    //       this.selection.clear();
    //       this.authErrorHandler.handleSuccess(Constants.RejectSuccess);
    //       this.onRefreshData();
    //     },
    //     error: (err: ApiError) => {
    //       this.selection.clear();
    //       this.clientState.isBusy = false;
    //       this.authErrorHandler.handleError(err.message);
    //     },
    //   });
    // }
    // this.isRejectState = false;
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
    // if (isConfirm) {
    //   this.clientState.isBusy = true;

    //   let punchIds = [];
    //   this.selection.selected.map(
    //     (punch) => punch.punchId && punchIds.push(punch.punchId)
    //   );

    //   this.punchPageService
    //     .deletePunches(punchIds, this.reason, this.projectKey)
    //     .subscribe({
    //       complete: () => {
    //         this.selection.clear();
    //         this.authErrorHandler.handleSuccess(Constants.CloseSuccess);
    //         this.onRefreshData();
    //       },
    //       error: (err: ApiError) => {
    //         this.selection.clear();
    //         this.clientState.isBusy = false;
    //         this.authErrorHandler.handleError(err.message);
    //       },
    //     });
    // }
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


  //--- SystemFilter
  onGetLookUpSystemFilter() {
    return new Promise((resolve, reject) => {
      this.systemService.getElementSystemLookUp(this.projectKey).subscribe(res => {
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

  //--- SubSystemFilter
  onGetSubSystemLookUpFilter(systemId?: string) {
    this.clientState.isBusy = true;
    this.subSystemService.getSubSystemLookUp(this.projectKey, systemId).subscribe(res => {
      this.subSystemFilterModels = res.content ? <SubSystemLookUpModel[]>[...res.content] : [];
      this.subSystemFilterTempModels = this.subSystemFilterModels.slice(0, this.bufferSize);
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- DisciplineFilter
  onGetDisciplineFilterLookup = () => {
    return new Promise((resolve, reject) => {
      this.dataDisciplineService.getDisciplineLookUpTagPage(this.projectKey).subscribe(res => {
        this.disciplineFilterModels = res.content ? <LookUpModel[]>[...res.content] : [];
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

  onGetLookUpStageFilter() {
    return new Promise((resolve, reject) => {
      this.changePageService.getChangeStageLookUp(this.projectKey).subscribe(res => {
        this.changeStageLookUpModel = res.content ? <LookUpModel[]>[...res.content] : [];
        this.clientState.isBusy = true;
        resolve(res.content);
      }, (err: ApiError) => {
        this.clientState.isBusy = true;
        reject(err.message)
        this.authErrorHandler.handleError(err.message);
      });
    });
  }

  onShowDisciplines = (disciplines: LookUpModel[]) => {
    this.disciplineLookUpModel = disciplines;
    this.isShowDisciplines = true;
  };
  onShowSystems = (systems: SystemLookUpModel[]) => {
    this.systemsLookUpModel = systems;
    this.isShowSystems = true;
  };

  onShowSubSystems = (subSystems: SubSystemLookUpModel[]) => {
    this.subSystemsLookUpModel = subSystems;
    this.isShowSubSystems = true;
  };
  onGetLookupChangeType = () => {
    return new Promise((resolve, reject) => {
      this.changePageService.getChangeTypeLookup(this.projectKey).subscribe(
        (res) => {
          this.changeTypeLookupModel = res.content
            ? <LookUpModel[]>[...res.content]
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
  //--- /DisciplineFilter

  //-- type
  onScrollToEndSelect = (key: string) => {
    if (key) {
      //--Change Type
      if (key == this.selectionControlName.type) {
        if (this.changeTypeLookupModel.length > this.bufferSize) {
          this.loadingSelection.isLoadingType = true;
          const len = this.changeTypeTempLookupModel.length;
          const more = this.changeTypeLookupModel.slice(len, this.bufferSize + len);
          setTimeout(() => {
            this.loadingSelection.isLoadingType = false;
            this.changeTypeTempLookupModel = this.changeTypeLookupModel.concat(more);
          }, 500);
        }
      }
      //--System
      if (key == this.selectionControlName.system) {
        if (this.systemFilterModels.length > this.bufferSize) {
          this.loadingSelection.isLoadingSystem = true;
          const len = this.systemFilterTemModels.length;
          const more = this.systemFilterModels.slice(len, this.bufferSize + len);
          setTimeout(() => {
            this.loadingSelection.isLoadingSystem = false;
            this.systemFilterTemModels = this.systemFilterModels.concat(more);
          }, 500);
        }
      }
      //--SubSystem
      if (key == this.selectionControlName.subSystem) {
        if (this.subSystemFilterModels.length > this.bufferSize) {
          this.loadingSelection.isLoadingSubSystem = true;
          const len = this.subSystemFilterTempModels.length;
          const more = this.subSystemFilterModels.slice(len, this.bufferSize + len);
          setTimeout(() => {
            this.loadingSelection.isLoadingSubSystem = false;
            this.subSystemFilterTempModels = this.subSystemFilterModels.concat(more);
          }, 500);
        }
      }
      //--Discipline
      if (key == this.selectionControlName.discipline) {
        if (this.disciplineFilterModels.length > this.bufferSize) {
          this.loadingSelection.isLoadingDiscipline = true;
          const len = this.disciplineFilterTempModels.length;
          const more = this.disciplineFilterModels.slice(len, this.bufferSize + len);
          setTimeout(() => {
            this.loadingSelection.isLoadingDiscipline = false;
            this.disciplineFilterTempModels = this.disciplineFilterModels.concat(more);
          }, 500);
        }
      }
    }
  };

  onSearchSelect = ($event: { term: string; }, key: string) => {
    if (key) {
      //--Change Type
      if (key == this.selectionControlName.type) {
        this.loadingSelection.isLoadingType = true;
        if ($event.term == "") {
          this.changeTypeTempLookupModel = this.changeTypeLookupModel.slice(0, this.bufferSize);
          this.loadingSelection.isLoadingType = false;
        } else {
          this.changeTypeTempLookupModel = this.changeTypeLookupModel;
          this.loadingSelection.isLoadingType = false;
        }
      }
      //--System
      if (key == this.selectionControlName.system) {
        this.loadingSelection.isLoadingSystem = true;
        if ($event.term == "") {
          this.systemFilterTemModels = this.systemFilterModels.slice(0, this.bufferSize);
          this.loadingSelection.isLoadingSystem = false;
        } else {
          this.systemFilterTemModels = this.systemFilterModels;
          this.loadingSelection.isLoadingSystem = false;
        }
      }
      //--SubSystem
      if (key == this.selectionControlName.subSystem) {
        this.loadingSelection.isLoadingSubSystem = true;
        if ($event.term == "") {
          this.subSystemFilterTempModels = this.subSystemFilterModels.slice(0, this.bufferSize);
          this.loadingSelection.isLoadingSubSystem = false;
        } else {
          this.subSystemFilterTempModels = this.subSystemFilterModels;
          this.loadingSelection.isLoadingSubSystem = false;
        }
      }
      //--Discipline
      if (key == this.selectionControlName.discipline) {
        this.loadingSelection.isLoadingDiscipline = true;
        if ($event.term == "") {
          this.disciplineFilterTempModels = this.disciplineFilterModels.slice(0, this.bufferSize);
          this.loadingSelection.isLoadingDiscipline = false;
        } else {
          this.disciplineFilterTempModels = this.disciplineFilterModels;
          this.loadingSelection.isLoadingDiscipline = false;
        }
      }
    };
  }

  onClearSelect = (key: string) => {
    if (key) {
      if (key == this.selectionControlName.type) this.changeTypeTempLookupModel = this.changeTypeLookupModel.slice(0, this.bufferSize);
      if (key == this.selectionControlName.system) this.systemFilterTemModels = this.systemFilterModels.slice(0, this.bufferSize);
      if (key == this.selectionControlName.subSystem) this.subSystemFilterTempModels = this.subSystemFilterModels.slice(0, this.bufferSize);
      if (key == this.selectionControlName.discipline) this.disciplineFilterTempModels = this.disciplineFilterModels.slice(0, this.bufferSize);
    }
  };
  //--- /DisciplineFilter
}
