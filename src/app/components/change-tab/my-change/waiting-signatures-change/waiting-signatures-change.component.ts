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

import { StatusColor, SelectionControlName, LoadingSelectionModel, LookUpModel, Signature } from 'src/app/shared/models/common/common.model';

import * as $ from "jquery";
import { ChangePageListModel, ChangeTypeLookUpModel, ChangePageSearchModel } from 'src/app/shared/models/change-tab/change-tab.model';
import { ChangePageService } from 'src/app/shared/services/api/change-page/change-page.service';
import { element } from 'protractor';

@Component({
  selector: "waiting-signatures-change",
  styleUrls: ["./waiting-signatures-change.component.scss"],
  templateUrl: "./waiting-signatures-change.component.html",
})

export class WaitingSignaturesChangeComponent implements OnChanges {
  @Input() moduleKey: string;
  @Input() projectKey: string;
  @Input() textLabel: string;
  @Input() isFirstLoad: boolean = true;

  defaultComponentName: string = "Sign-off";
  @Output() onGetCounter: EventEmitter<string> = new EventEmitter<string>();
  @Output() onLoadingTab: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild("waitingSignatures") waitingSignatures: ElementRef;

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
  isShowPinCode: boolean = true;
  isShowCreatePinCode: boolean;
  isLoadingSelectSystemFilter: boolean;
  isLoadingSelectSubSystemFilter: boolean;
  isLoadingDisciplineSelectFilter: boolean;
  isLoadingSelectLocationFilter: boolean;
  isShowDisciplines: boolean;
  isShowSystems: boolean;
  isShowSubSystems: boolean;
  //--- Variables
  changeId: string;

  StatusColor = StatusColor;
  permissionsViews = PermissionsViews;
  authInProjectDto: AuthInProjectDto[] = [];

  //--- Model
  changePageListModel: ChangePageListModel[] = [];
  disciplineLookUpModel: DisciplineLookUpModel[];
  systemsLookUpModel: SystemLookUpModel[];
  subSystemsLookUpModel: SubSystemLookUpModel[];

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
  //-- changeType
  changeTypeLookupModel: ChangeTypeLookUpModel[] = [];
  changeTypeTempLookupModel: ChangeTypeLookUpModel[] = [];
  //-- Filter model
  changePageSearchModel: ChangePageSearchModel = new ChangePageSearchModel()

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
    "signatures",
    "createdDate",
    "createdBy",
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
    private changePageService: ChangePageService,
    private router: Router
  ) {
    this.authInProjectDto = JwtTokenHelper.GetAuthProject() ? <AuthInProjectDto[]>[...JwtTokenHelper.GetAuthProject()] : [];
  }

  onCheckPermission = (key: string) => {
    return JwtTokenHelper.IsAuthInProject(key, this.authInProjectDto);
  };

  ngOnChanges(changes: SimpleChanges): void {
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
  public ngOnInit() {
  }
  onGetChangeList = (pageNumber?: number, pageSize?: number, sortExpression?: string, changeNo?: string) => {
    this.clientState.isBusy = true;

    if (pageNumber >= 0) {
      this.currentPageNumber = pageNumber;
      pageNumber = this.currentPageNumber + 1;
    }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;
    this.changePageService
      .getChangesNeedMySignature(
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
          this.onLoadingTab.emit(this.defaultComponentName);
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
      this.onGetChangeList(
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
    this.onGetChangeList();
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
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${
      row.id + 1
      }`;
  }

  onToggleRightSide = () => {
    this.isToggleRightSide = !this.isToggleRightSide;
  };

  //--- Sign item
  onOpenSignModal = () => {
    if (this.selection.selected.length <= 0) {
      this.authErrorHandler.handleError(Constants.ErrChange);
    } else {
      this.isSignState = true;
      this.isShowPinCode = true;
    }
  };

  onSignConfirm = (isConfirm: boolean) => {
    if (isConfirm) {
      this.clientState.isBusy = true;

      let changeIds = [];
      this.selection.selected.map(
        (change) => change.id && changeIds.push(change.id)
      );

      this.changePageService.signValidate(changeIds, this.projectKey).subscribe({
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
    this.isSignState = false;
  };

  //--- Signature item
  onOpenSignatureModal = (signatureItem: Signature[], changeId: string) => {
    if (
      !signatureItem ||
      (signatureItem && signatureItem.length <= 0) ||
      !changeId
    ) {
      this.signatureModel = [];
      this.changeId = "";
    } else {
      this.signatureModel = signatureItem;
      this.changeId = changeId;
    }
    this.selection.clear();
    this.isShowSignature = true;
    this.isShowPinCode = true;
  };

  onSignatureConfirm = (changeId: string) => {
    if (changeId) {
      this.clientState.isBusy = true;

      let changeIds = [];
      changeIds.push(changeId);

      this.changePageService.signValidate(changeIds, this.projectKey).subscribe({
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
    this.isShowSignature = false;
  };

  //--- Pin Code
  onShowPinCodeModal = (isCreatePinCode: boolean = false) => {
    this.isShowPinCode = true;
    if (isCreatePinCode) {
      this.onShowCreatePinCodeModal();
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

      let changeIds = [];
      if (this.selection.selected && this.selection.selected.length > 0) {
        this.selection.selected.map(
          (change) => change.id && changeIds.push(change.id)
        );
      } else if (this.changeId) {
        changeIds.push(this.changeId);
      } else {
        return;
      }

      this.changePageService
        .signOffChanges(changeIds, this.projectKey, parseInt(code))
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
  };

  //--- Create Pin Code
  onShowCreatePinCodeModal = () => {
    this.isShowCreatePinCode = true;
  };

  onCreatePinCodeConfirmModal = (isConfirm: boolean) => {
    this.isShowCreatePinCode = false;
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
}
