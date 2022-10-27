import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { SystemModel } from 'src/app/shared/models/system/system.model';
import { ClientState, AuthErrorHandler } from 'src/app/shared/services';
import { DataSystemService } from 'src/app/shared/services/api/data-tab/data-system.service';
import { ProjectSystemService } from 'src/app/shared/services/api/project-settings/project-system.service';
import { ProjectSystemModel, ProjectSystemUpdationModel } from 'src/app/shared/models/project-settings/project-system.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { Configs } from 'src/app/shared/common/configs/configs';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { DataSystemModel } from 'src/app/shared/models/data-tab/data-system.model';
import { Constants } from 'src/app/shared/common';

@Component({
  selector: 'data-system',
  templateUrl: './data-system.component.html'
})

export class DataSystemComponent implements OnInit {
  @Input() visible: boolean;
  @Input() projectKey: string;
  @Input() projectId: string;

  subSystemModels: SystemModel[] = [];
  dataSystemModels: DataSystemModel[] = [];
  exportLocationModel: ExportParamModel = new ExportParamModel();
  exportModel: ExportModel = new ExportModel();

  isCollapse: boolean = false;
  systemFilterKey: string;
  isImportState: boolean = false;
  isCreateState: boolean = false;
  isEditState: boolean = false;
  isDeleteState: boolean = false;
  isHaveData: boolean = false;
  isToggleDropdown: boolean = false;

  systemIdEditing: string;
  projectSystemDeletionId: string;
  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;
  defaultSortSystem: string = "SystemNo desc";
  systemSorting: string;
  projectSystemsCount: number = 0;

  dataSource: MatTableDataSource<DataSystemModel>;
  displayedColumns: string[] = ['SystemNo', 'name', 'edit', 'delete'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  updationModel: ProjectSystemUpdationModel = new ProjectSystemUpdationModel();
  defaultLogoUrl: string = Configs.DefaultClientLogo;
  updationModelLogoUrl: string;

  constructor(
    public clientState: ClientState,
    private projectSystemService: ProjectSystemService,
    private dataSystemService: DataSystemService,
    private authErrorHandler: AuthErrorHandler
  ) { }

  public ngOnInit(): void {
    this.onGetListDataSystem();
  }

  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  }

  onGetListDataSystem = (pageNumber?: number, pageSize?: number, sortExpression?: string, searchKey?: string) => {
    if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;
    if (this.systemFilterKey) searchKey = this.systemFilterKey.trim();

    this.isToggleDropdown = false;
    this.clientState.isBusy = true;

    this.dataSystemService.getDataSystem(this.projectKey, pageNumber || 1, pageSize || 50, sortExpression || this.defaultSortSystem, searchKey || "").subscribe(res => {
      this.dataSystemModels = res.items ? <DataSystemModel[]>[...res.items] : [];
      if (this.dataSystemModels.length > 0) this.isHaveData = true;
      this.projectSystemsCount = res.totalItemCount;
      this.dataSource = new MatTableDataSource(this.dataSystemModels);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Edit item
  onOpenEditModal = (systemId: string) => {
    this.isEditState = true;
    this.projectSystemService.getProjectSystemById(systemId).subscribe(res => {
      this.clientState.isBusy = false;
      this.updationModel.elementSystemId = res.elementSystemId;
      this.updationModel.projectId = res.projectId;
      this.updationModel.systemName = res.name;
      this.updationModel.systemNo = res.systemNo;
      this.updationModel.logoUrl = res.logoUrl;
      this.updationModelLogoUrl = res.logoUrl ? Configs.BaseSitePath + res.logoUrl : Configs.DefaultClientLogo;
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
    this.systemIdEditing = null;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.SystemUpdated);
      this.onGetListDataSystem();
    }
  }

  onSuccessCreateModal = (isSuccess: boolean) => {
    this.isCreateState = false;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.SystemCreated);
      this.onGetListDataSystem();
    }
  }
  //--- /Edit item

  //--- Delete item
  onOpenDeleteModal = (id: string) => {
    this.projectSystemDeletionId = id;
    this.isDeleteState = true;
  }

  onDeleteConfirm = (isConfirm: boolean) => {
    this.isDeleteState = false;
    if (isConfirm && this.projectSystemDeletionId) {
      this.projectSystemService.deleteProjectSystem(this.projectSystemDeletionId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.projectSystemDeletionId = null;
          this.authErrorHandler.handleSuccess(Constants.SystemDeleted);
          this.onGetListDataSystem();
        }, error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        },
      });
    }
  }
  //--- /Delete item

  //--- Import data
  onOpenImportModal() {
    this.isImportState = true;
  }

  onSuccessImportModal = (isConfirm: boolean) => {
    this.isImportState = false;
    if (isConfirm) {
      this.onCancelLookup();
      this.authErrorHandler.handleSuccess(Constants.SystemImported);
      this.onGetListDataSystem(Configs.DefaultPageNumber, Configs.DefaultPageSize, "SystemNo desc");
    }
  }
  //--- /Import data

  //--- Export data
  onExportExcel() {
    this.clientState.isBusy = true;
    this.exportLocationModel.projectKey = this.projectKey;
    this.exportLocationModel.module = "System";
    this.exportLocationModel.filter = this.systemFilterKey;
    this.exportLocationModel.sortExpression = this.systemSorting;
    this.dataSystemService.exportToExcel(this.exportLocationModel).subscribe(res => {
      this.exportModel = res ? <ExportModel>{ ...res } : null;
      this.onSaveFile();
      this.authErrorHandler.handleSuccess(Constants.SystemExported);
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

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
  //--- /Export data

  //--- Cancel search
  onCancelLookup() {
    this.systemFilterKey = null;
  }

  onRefreshData() {
    this.onCancelLookup();
    this.onGetListDataSystem();
  }
  //--- /Cancel search

  //--- Sort data
  onSortData(sort: Sort) {
    let sortExpressionData: string;
    if (sort) {
      sortExpressionData = sort.active + " " + sort.direction;
      this.systemSorting = sortExpressionData;
      this.onGetListDataSystem(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }

  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
  }
}
