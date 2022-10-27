import {
  Component,
  ViewChild,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
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

import { ChangePageService } from "src/app/shared/services/api/change-page/change-page.service";
import { DataLocationService } from 'src/app/shared/services/api/data-tab/data-location.service';
import { DataSystemService } from 'src/app/shared/services/api/data-tab/data-system.service';
import { DataSubSystemService } from 'src/app/shared/services/api/data-tab/data-subsystem.service';
import { DisciplineLookUpModel } from 'src/app/shared/models/data-tab/data-discipline.model';
import { DataDisciplineService } from 'src/app/shared/services/api/data-tab/data-discipline.service';
import { SystemLookUpModel } from 'src/app/shared/models/data-tab/data-system.model';
import { SubSystemLookUpModel } from 'src/app/shared/models/data-tab/data-subsystem.model';
import { LocationLookUpModel } from 'src/app/shared/models/data-tab/data-location.model';
import { StatusColor, SelectionControlName, LoadingSelectionModel, LookUpModel } from 'src/app/shared/models/common/common.model';

import {
  ChangePageListModel,
  ChangePageSearchModel,
  Signature,
  ChangeTypeLookUpModel
} from "src/app/shared/models/change-tab/change-tab.model";

import * as $ from "jquery";

@Component({
  selector: "init-change",
  styleUrls: ["./init-change.component.scss"],
  templateUrl: "./init-change.component.html",
})

export class InitChangeComponent implements OnChanges {
  @Input() moduleKey: string;
  @Input() projectKey: string;
  @Input() textLabel: string;
  @Output() onGetCounter: EventEmitter<string> = new EventEmitter<string>();
  @Output() onLoadingTab: EventEmitter<string> = new EventEmitter<string>();

  @Input() isFirstLoad: boolean = true;
  defaultComponentName: string = "Update";

  @ViewChild("initChange") initChange: ElementRef;

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
  isShowDisciplines: boolean;
  isShowSystems: boolean;
  isShowSubSystems: boolean;
  isCanCreateChange: boolean;
  //--- Variables
  changeId: string;
  StatusColor = StatusColor;
  permissionsViews = PermissionsViews;
  authInProjectDto: AuthInProjectDto[] = [];

  //--- Model
  disciplineLookUpModel: DisciplineLookUpModel[];
  systemsLookUpModel: SystemLookUpModel[];
  subSystemsLookUpModel: SubSystemLookUpModel[];
  changePageListModel: ChangePageListModel[] = [];
  //-- changeType
  changeTypeLookupModel: ChangeTypeLookUpModel[] = [];
  changeTypeTempLookupModel: ChangeTypeLookUpModel[] = [];

  changePageSearchModel: ChangePageSearchModel = new ChangePageSearchModel();
  // drawingLookUpModel: DrawingLookUpModel[];
  signatureModel: Signature[];
  //--- System Filter Models
  systemFilterModels: SystemLookUpModel[] = [];
  systemFilterTemModels: SystemLookUpModel[] = [];
  //--- Subsystem Filter Models
  subSystemFilterModels: SubSystemLookUpModel[] = [];
  subSystemFilterTempModels: SubSystemLookUpModel[] = [];
  //--- Discipline Models
  disciplineFilterModels: DisciplineLookUpModel[] = [];
  disciplineFilterTempModels: DisciplineLookUpModel[] = [];
  //--- Location Filter Models
  locationLookUpFilterModels: LocationLookUpModel[] = [];
  locationFilterTempModel: LocationLookUpModel[] = [];
  //-- Change Stage
  changeStageLookUpModel: LookUpModel[];

  totalItems: number = 0;
  currentPageSize: number = Configs.DefaultPageSize;
  currentPageNumber: number = Configs.DefaultPageNumber;
  currentSortExpression: string;
  defaultSort: string = "changeNo desc";
  bufferSize = 100;
  loadingSelection: LoadingSelectionModel = new LoadingSelectionModel();
  selectionControlName = SelectionControlName;
  //-- Filter model
  //-- Filter model
  materialFilterModel:
    [{ value: true, label: "Yes" },
      { value: false, label: "No" }];

  //-- Datatable
  dataSource: MatTableDataSource<ChangePageListModel>;
  selection = new SelectionModel<ChangePageListModel>(true, []);
  displayedColumns: string[] = [
    "select",
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
    private changePageService: ChangePageService,
    private systemService: DataSystemService,
    private subSystemService: DataSubSystemService,
    private dataDisciplineService: DataDisciplineService,
    private locationService: DataLocationService,
  ) {
    this.authInProjectDto = JwtTokenHelper.GetAuthProject()
      ? <AuthInProjectDto[]>[...JwtTokenHelper.GetAuthProject()]
      : [];
  }

  onCheckPermission = (key: string) => {
    return JwtTokenHelper.IsAuthInProject(key, this.authInProjectDto);
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.moduleKey &&
      this.projectKey &&
      this.textLabel.includes(this.defaultComponentName)
      && this.isFirstLoad
    ) {
      this.isFirstLoad = false;
      this.onGetData();
    }
    // else if (this.changePageListModel && this.changePageListModel.length > 0) {
    //   this.clientState.isBusy = false;
    // } else {
    //   this.clientState.isBusy = false;
    // }
  }
  public ngOnInit() {
  }
  onGetData = () => {
    this.clientState.isBusy = true;
    Promise.all([this.onGetChangeList(),
    this.onGetLookUpSystemFilter(),
    this.onGetLookupChangeType(),
    this.onGetDisciplineFilterLookup(),
    this.onGetLookUpStageFilter(),
    this.onGetSubSystemLookUpFilter()])
      .then(() => { //cannot resolve to call then func
        this.clientState.isBusy = false;
      })
      .catch(() => {
        this.clientState.isBusy = false;
      });
      
  };

  onGetChangeList = (pageNumber?: number,
    pageSize?: number,
    sortExpression?: string,) => {

    return new Promise((resolve, reject) => {
      this.clientState.isBusy = true;

      if (pageNumber >= 0) {
        this.currentPageNumber = pageNumber;
        pageNumber = this.currentPageNumber + 1;
      }
      if (pageSize > 0) this.currentPageSize = pageSize;
      if (sortExpression) this.currentSortExpression = sortExpression;
      this.changePageService.getUnSubmittedChanges(this.projectKey, Configs.DefaultPageNumber, Configs.DefaultPageSize,
        this.currentSortExpression || this.defaultSort,
        this.changePageSearchModel.changeNo || "",
        this.changePageSearchModel.title || "",
        this.changePageSearchModel.changeType || "",
        this.changePageSearchModel.stage || "",
        this.changePageSearchModel.system || "",
        this.changePageSearchModel.subSystem || "",
        this.changePageSearchModel.discipline || ""
      ).subscribe(
        (res) => {
          this.changePageListModel = res.items ? <ChangePageListModel[]>[...res.items] : [];
          this.totalItems = res.totalItemCount;
          this.isCanCreateChange = res.isCanCreateChange;
          this.dataSource = new MatTableDataSource(this.changePageListModel);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.clientState.isBusy = false;
          this.onLoadingTab.emit(this.defaultComponentName);
          resolve(res.content)
          this.isToggleDropdown = false;
          //this.initChange.nativeElement.style.minHeight = "auto";
        },
        (err: ApiError) => {
          this.clientState.isBusy = false;
          reject(err.message)
          this.authErrorHandler.handleError(err.message);
        }
      );
    });
  };

  onGetChangeData = (pageNumber?: number, pageSize?: number, sortExpression?: string, changeNo?: string) => {
    this.clientState.isBusy = true;

    if (pageNumber >= 0) {
      this.currentPageNumber = pageNumber;
      pageNumber = this.currentPageNumber + 1;
    }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;

    this.changePageService.getUnSubmittedChanges(
      this.projectKey,
      pageNumber || Configs.DefaultPageNumber,
      pageSize || Configs.DefaultPageSize,
      sortExpression || this.currentSortExpression || this.defaultSort,
      changeNo || this.changePageSearchModel.changeNo || ""
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
          this.initChange.nativeElement.style.minHeight = "auto";
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
      this.onGetChangeData(
        this.currentPageNumber,
        this.currentPageSize,
        this.currentSortExpression
      );
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
    this.onGetChangeData();
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

  //--- Add item
  onOpenAddModal = () => {
    this.isAddNewState = true;
  };

  onSuccessAddModal = (isSuccess: boolean) => {
    if (isSuccess) {
      this.onRefreshData();
      this.onGetCounter.emit(this.defaultComponentName);

    }
    this.isAddNewState = false;

  };

  //--- Edit item
  onOpenEditModal = (changeId: string) => {
    if (changeId) {
      this.changeId = changeId;
      this.isEditState = true;
    }
  };

  onSuccessEditModal = (changeItem: ChangePageListModel) => {
    if (changeItem && changeItem.id) {
      this.onRefreshData();
      this.onGetCounter.emit(this.defaultComponentName);
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
        (change) => change.id && listDeleted.push(change.id)
      );
      this.changePageService
        .deleteChanges(listDeleted, this.projectKey)
        .subscribe({
          complete: () => {
            this.selection.clear();
            this.authErrorHandler.handleSuccess(Constants.PunchListDeleted);
            this.onGetCounter.emit(this.defaultComponentName);
            this.onRefreshData();
          },
          error: (err: ApiError) => {
            this.selection.clear();
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
          },
        });
    }
    this.isDeleteState = false;
  };

  //--- Signature item
  onOpenSignatureModal = (signatureItem: Signature[], changeId: string) => {
    if (
      !signatureItem ||
      (signatureItem && signatureItem.length <= 0) ||
      !changeId
    )
      return;
    this.signatureModel = signatureItem;
    this.changeId = changeId;
    this.isShowSignature = true;
  };

  onSignatureConfirm = (changeId: string) => {
    this.isShowSignature = false;
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
      this.initChange.nativeElement.style.minHeight = dropdownHeight + "px";
    } else {
      this.initChange.nativeElement.style.minHeight = "auto";
    }
  };
  onShowDisciplines = (disciplines: DisciplineLookUpModel[]) => {
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
  onGetLookupChangeType = () => {
    return new Promise((resolve, reject) => {
      this.changePageService.getChangeTypeLookup(this.projectKey).subscribe(
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
        this.authErrorHandler.handleError(err.message);
      });
    });
  }

  onGetSubSystemLookUpFilter(systemId?: string) {
    return new Promise((resolve, reject) => {
      this.subSystemService.getSubSystemLookUp(this.projectKey, systemId).subscribe(res => {
        this.subSystemFilterModels = res.content ? <SubSystemLookUpModel[]>[...res.content] : [];
        this.subSystemFilterTempModels = this.subSystemFilterModels.slice(0, this.bufferSize);
        resolve(res.content);
      }, (err: ApiError) => {
        reject(err.message);
        this.authErrorHandler.handleError(err.message);
      });
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
}
