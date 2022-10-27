import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { DataSubSystemService } from 'src/app/shared/services/api/data-tab/data-subsystem.service';
import { EditDataSubSystemComponent } from './edit-data-subsystem/edit-data-subsystem.component';
import { Configs } from 'src/app/shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { DataSubSystemModel, UpdateSubSystemModel } from 'src/app/shared/models/data-tab/data-subsystem.model';
import { Constants } from 'src/app/shared/common';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'data-subsystem',
  templateUrl: './data-subsystem.component.html'
})

export class DataSubSystemComponent implements OnInit {
  @Input() visible: boolean;

  isCreateState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;
  isImportState: boolean;
  isFilter: boolean = false;
  isCollapse: boolean = false;
  isHaveData: boolean = false;
  isToggleDropdown: boolean = false;

  subsystemIdEditing: string;
  subsystemDeletionId: string;
  subsystemCount: number = 0;
  subsystemFilterCode: string;
  subsystemSorting: string;


  dataSubSystemModels: DataSubSystemModel[] = [];
  exportSubSystemModel: ExportParamModel = new ExportParamModel();
  exportModel: ExportModel = new ExportModel();

  dataSource: MatTableDataSource<DataSubSystemModel>;
  displayedColumns: string[] = ['subsystemNo', 'description', 'systemNo', 'edit', 'delete'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('editView', { static: true }) editView: EditDataSubSystemComponent;

  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;
  projectKey: string;
  sub: Subscription;
  defaultSortSubSystem: string = "SubSystemNo desc";
  updationModel: UpdateSubSystemModel = new UpdateSubSystemModel();
  constructor(
    public clientState: ClientState,
    private dataSubSystemService: DataSubSystemService,
    private authErrorHandler: AuthErrorHandler,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.sub = this.route.params.subscribe(params => {
      this.projectKey = params['projectKey'];
      if (!this.projectKey) {
        this.router.navigate(['']);
      }
    })
  }

  public ngOnInit() {
    this.onGetDataSubSystem(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortSubSystem);
  }

  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  }

  //--- Get data sub system
  onGetDataSubSystem = (pageNumber?: number, pageSize?: number, sortExpression?: string, subsystemNo?: string) => {
    this.isToggleDropdown = false;
    this.clientState.isBusy = true;

    if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;
    if (this.subsystemFilterCode) subsystemNo = this.subsystemFilterCode.trim();

    this.dataSubSystemService.getDataSubSystem(this.projectKey, pageNumber || 1, pageSize || 50, sortExpression || this.defaultSortSubSystem, subsystemNo || "").subscribe(res => {
      this.dataSubSystemModels = res.items ? <DataSubSystemModel[]>[...res.items] : [];
      if (this.dataSubSystemModels.length > 0) this.isHaveData = true;
      this.dataSource = new MatTableDataSource(this.dataSubSystemModels);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.subsystemCount = res.totalItemCount;

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Edit item
  onOpenEditModal = (subSystemId: string) => {
    this.isEditState = true;
    this.clientState.isBusy = true;
    this.dataSubSystemService.getSubSystemId(subSystemId).subscribe(res => {
      this.updationModel = res ? <UpdateSubSystemModel>{ ...res } : null;
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
    this.subsystemIdEditing = null;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.SubSystemUpdated);
      this.onGetDataSubSystem(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  onSuccessCreateModal = (isSuccess: boolean) => {
    this.isCreateState = false;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.SubSystemCreated);
      this.onGetDataSubSystem(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  //--- Delete item
  onOpenDeleteModal = (id: string) => {
    this.subsystemDeletionId = id;
    this.isDeleteState = true;
  }

  onDeleteConfirm = (isConfirm: boolean) => {
    if (!isConfirm) {
      this.isDeleteState = false;
      return;
    }

    if (isConfirm && this.subsystemDeletionId) {
      this.clientState.isBusy = true;

      this.dataSubSystemService.deleteSubSystem(this.subsystemDeletionId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.subsystemDeletionId = null;
          this.isDeleteState = false;
          this.authErrorHandler.handleSuccess(Constants.SubSystemDeleted);
          this.onGetDataSubSystem(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.subsystemDeletionId = null;
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
      this.onCancelLookup();
      this.authErrorHandler.handleSuccess(Constants.SubSystemImported);
      this.onGetDataSubSystem(Configs.DefaultPageNumber, Configs.DefaultPageSize, "SubSystemNo desc");
    }
  }

  onExportExcel = () => {
    this.clientState.isBusy = true;
    this.exportSubSystemModel.module = "SubSystem";
    this.exportSubSystemModel.filter = this.subsystemFilterCode;
    this.exportSubSystemModel.sortExpression = this.subsystemSorting;
    this.exportSubSystemModel.projectKey = this.projectKey;
    this.dataSubSystemService.exportToExcel(this.exportSubSystemModel).subscribe(res => {
      this.exportModel = res ? <ExportModel>{ ...res } : null;
      this.onSaveFile();
      this.authErrorHandler.handleSuccess(Constants.SubSystemExported);
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onCancelLookup() {
    this.subsystemFilterCode = null;
  }

  onRefreshData() {
    this.onCancelLookup();
    this.onGetDataSubSystem();
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

  //--- Sort data
  onSortData(sort: Sort) {
    let sortExpressionData: string;
    if (sort) {
      sortExpressionData = sort.active + " " + sort.direction;
      this.subsystemSorting = sortExpressionData;
      this.onGetDataSubSystem(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }

  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
  }
}
