import { Component, OnInit, ViewChild, Input, ɵConsole } from '@angular/core';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { DataDisciplineService } from 'src/app/shared/services/api/data-tab/data-discipline.service';
import { EditDataDisciplineComponent } from './edit-data-discipline/edit-data-discipline.component';
import { Configs } from 'src/app/shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { DataDisciplineModel, UpdateDisciplineModel } from 'src/app/shared/models/data-tab/data-discipline.model';
import { Constants } from 'src/app/shared/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'data-discipline',
  templateUrl: './data-discipline.component.html'
})

export class DataDisciplineComponent implements OnInit {
  @Input() visible: boolean;
  @Input() projectId: string;

  //--- Boolean
  isCreateState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;
  isImportState: boolean;
  isFilter: boolean = false;
  isHaveData: boolean = false;
  isToggleDropdown: boolean = false;

  //--- Variable
  disciplineIdEditing: string;
  disciplineDeletionId: string;
  disciplineCount: number = 0;
  disciplineFilterCode: string;
  disciplineSorting: string;
  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;
  defaultSortDiscipline: string = "DisciplineCode desc";
  projectKey: string;
  sub: Subscription;

  //--- Model
  dataDisciplineModels: DataDisciplineModel[] = [];
  exportDisciplineModel: ExportParamModel = new ExportParamModel();
  exportModel: ExportModel = new ExportModel();
  updationModel: UpdateDisciplineModel = new UpdateDisciplineModel();

  //--- Datatable
  dataSource: MatTableDataSource<DataDisciplineModel>;
  displayedColumns: string[] = ['disciplineCode', 'disciplineName', 'edit', 'delete'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('editView', { static: true }) editView: EditDataDisciplineComponent;

  constructor(
    public clientState: ClientState,
    private dataDisciplineService: DataDisciplineService,
    private authErrorHandler: AuthErrorHandler,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.sub = this.route.params.subscribe(params => {
      this.projectKey = params['projectKey'];
      if (!this.projectKey) {
        this.router.navigate([""]);
      }
    });
  }

  public ngOnInit() {
    this.onGetDataDiscipline(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortDiscipline);
  }

  //--- Get data discipline
  onGetDataDiscipline = (pageNumber?: number, pageSize?: number, sortExpression?: string, disciplineNo?: string) => {
    this.clientState.isBusy = true;
    this.isToggleDropdown = false;
    if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;
    if (this.disciplineFilterCode) disciplineNo = this.disciplineFilterCode.trim();
    if (!pageNumber)
      this.currentPageNumber = 0;

    this.dataDisciplineService.getDataDiscipline(pageNumber || 1, pageSize || 50, this.projectKey, sortExpression || this.defaultSortDiscipline, disciplineNo || "").subscribe(res => {
      this.dataDisciplineModels = res.items ? <DataDisciplineModel[]>[...res.items] : [];
      if (this.dataDisciplineModels.length > 0) this.isHaveData = true;
      this.dataSource = new MatTableDataSource(this.dataDisciplineModels);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.disciplineCount = res.totalItemCount;

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Edit item
  onOpenEditModal = (disciplineId: string) => {
    this.isEditState = true;
    this.clientState.isBusy = true;
    this.dataDisciplineService.getDisciplineId(disciplineId).subscribe(res => {
      this.updationModel = res ? <UpdateDisciplineModel>{ ...res } : null;
      this.clientState.isBusy = false;
    }), (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    };
  }

  onOpenCreateModal = () => {
    this.isCreateState = true;
  }

  onSuccessEditModal = (isSuccess: boolean) => {
    this.isEditState = false;
    this.disciplineIdEditing = null;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.DisciplineUpdated);
      this.onGetDataDiscipline(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  onSuccessCreateModal = (isSuccess: boolean) => {
    this.isCreateState = false;
    this.disciplineIdEditing = null;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.DisciplineCreated);
      this.onGetDataDiscipline(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  //--- Delete item
  onOpenDeleteModal = (id: string) => {
    this.disciplineDeletionId = id;
    this.isDeleteState = true;
  }

  onDeleteConfirm = (isConfirm: boolean) => {
    if (!isConfirm) {
      this.isDeleteState = false;
      return;
    }

    if (isConfirm && this.disciplineDeletionId) {
      this.clientState.isBusy = true;

      this.dataDisciplineService.deleteDiscipline(this.disciplineDeletionId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.disciplineDeletionId = null;
          this.isDeleteState = false;
          this.authErrorHandler.handleSuccess(Constants.DisciplineDeleted);
          this.onGetDataDiscipline(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.disciplineDeletionId = null;
          this.isDeleteState = false;
          this.authErrorHandler.handleError(err.message);
        },
      });
    }
  }

  //--- Import
  onOpenImportModal = () => {
    this.isImportState = true;
  }

  onSuccessImportModal = (isConfirm: boolean) => {
    this.isImportState = false;
    if (isConfirm) {
      this.onClearSearch();
      this.authErrorHandler.handleSuccess(Constants.DisciplineImported);
      this.onGetDataDiscipline(Configs.DefaultPageNumber, Configs.DefaultPageSize, "DisciplineCode desc");
    }
  }

  onExportExcel = () => {
    this.clientState.isBusy = true;
    this.exportDisciplineModel.module = "Discipline";
    this.exportDisciplineModel.filter = this.disciplineFilterCode;
    this.exportDisciplineModel.sortExpression = this.disciplineSorting;
    this.exportDisciplineModel.projectKey = this.projectKey;
    this.dataDisciplineService.exportToExcel(this.exportDisciplineModel).subscribe(res => {
      this.exportModel = res ? <ExportModel>{ ...res } : null;
      this.onSaveFile();
      this.authErrorHandler.handleSuccess(Constants.DisciplineExported);
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Clear search
  onClearSearch() {
    this.disciplineFilterCode = null;
  }

  //--- Refresh data
  onRefreshData() {
    this.onClearSearch();
    this.onGetDataDiscipline();
  }

  //--- Save file
  onSaveFile() {
    if (this.exportModel == undefined || this.exportModel == null)
      return;

    var bytes = this.base64ToArrayBuffer(this.exportModel.fileContent);
    var blob = new Blob([bytes], { type: this.exportModel.contentType });

    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    var edge = ua.indexOf("Edge");
    if (msie > 0 || edge > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      window.navigator.msSaveOrOpenBlob(blob, this.exportModel.fileName);
    } else {
      var url = window.URL;
      var downloadUrl = url.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = downloadUrl;
      a.download = this.exportModel.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  //--- Sort data
  onSortData(sort: Sort) {
    let sortExpressionData: string;
    if (sort) {
      sortExpressionData = sort.active + " " + sort.direction;
      this.disciplineSorting = sortExpressionData;
      this.onGetDataDiscipline(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }

  //--- Toggle Dropdown
  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
  }
}
