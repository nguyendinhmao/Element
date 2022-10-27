import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { DataWorkpackService } from 'src/app/shared/services/api/data-tab/data-workpack.service';
import { EditDataWorkpackComponent } from './edit-data-workpack/edit-data-workpack.component';
import { Configs } from 'src/app/shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { DataWorkpackModel, UpdateWorkpackModel } from 'src/app/shared/models/data-tab/data-workpack.model';
import { Constants } from 'src/app/shared/common';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'data-workpack',
  templateUrl: './data-workpack.component.html'
})

export class DataWorkpackComponent implements OnInit {
  @Input() visible: boolean;
  @Input() projectId: string;

  isCreateState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;
  isImportState: boolean;
  workpackIdEditing: string;
  workpackDeletionId: string;
  workpackCount: number = 0;
  workpackFilterCode: string;
  workpackSorting: string;
  isFilter: boolean = false;
  isCollapse: boolean = false;
  isHaveData: boolean = false;
  isToggleDropdown: boolean = false;

  dataWorkpackModels: DataWorkpackModel[] = [];
  exportWorkpackModel: ExportParamModel = new ExportParamModel();
  exportModel: ExportModel = new ExportModel();

  dataSource: MatTableDataSource<DataWorkpackModel>;
  displayedColumns: string[] = ['workPackNo', 'workPackName', 'disciplineCode', 'edit', 'delete'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('editView', { static: true }) editView: EditDataWorkpackComponent;

  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;
  sub: Subscription;
  projectKey: string;

  defaultSortWorkpack: string = "WorkPackNo desc";
  updationModel: UpdateWorkpackModel = new UpdateWorkpackModel();
  constructor(
    public clientState: ClientState,
    private dataWorkpackService: DataWorkpackService,
    private authErrorHandler: AuthErrorHandler,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.sub = this.route.params.subscribe((params) => {
      this.projectKey = params["projectKey"];
      if (!this.projectKey) {
        this.router.navigate([""]);
      }
    });
  }

  public ngOnInit() {
    this.onGetDataWorkpack(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortWorkpack);
  }

  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  }

  //--- Get data Workpack
  onGetDataWorkpack = (pageNumber?: number, pageSize?: number, sortExpression?: string, workpackNo?: string) => {
    this.isToggleDropdown = false;
    this.clientState.isBusy = true;

    if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;
    if (this.workpackFilterCode) workpackNo = this.workpackFilterCode.trim();

    this.dataWorkpackService.getDataWorkpack(pageNumber || 1, pageSize || 50, this.projectKey, sortExpression || this.defaultSortWorkpack, workpackNo || "").subscribe(res => {
      this.dataWorkpackModels = res.items ? <DataWorkpackModel[]>[...res.items] : [];
      if (this.dataWorkpackModels.length > 0) this.isHaveData = true;
      this.dataSource = new MatTableDataSource(this.dataWorkpackModels);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.workpackCount = res.totalItemCount;

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Edit item
  onOpenEditModal = (workpackId: string) => {
    this.isEditState = true;
    this.clientState.isBusy = true;
    this.dataWorkpackService.getWorkpackId(workpackId).subscribe(res => {
      this.updationModel = res ? <UpdateWorkpackModel>{ ...res } : null;
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
    this.workpackIdEditing = null;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.WorkPackUpdated);
      this.onGetDataWorkpack(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }
  onSuccessCreateModal = (isSuccess: boolean) => {
    this.isCreateState = false;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.WorkPackCreated);
      this.onGetDataWorkpack(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  //--- Delete item
  onOpenDeleteModal = (id: string) => {
    this.workpackDeletionId = id;
    this.isDeleteState = true;
  }

  onDeleteConfirm = (isConfirm: boolean) => {
    if (!isConfirm) {
      this.isDeleteState = false;
      return;
    }

    if (isConfirm && this.workpackDeletionId) {
      this.clientState.isBusy = true;

      this.dataWorkpackService.deleteWorkpack(this.workpackDeletionId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.workpackDeletionId = null;
          this.isDeleteState = false;
          this.authErrorHandler.handleSuccess(Constants.WorkPackDeleted);
          this.onGetDataWorkpack(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.workpackDeletionId = null;
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
      this.authErrorHandler.handleSuccess(Constants.WorkPackImported);
      this.onGetDataWorkpack(Configs.DefaultPageNumber, Configs.DefaultPageSize, "WorkPackNo desc");
    }
  }

  onExportExcel = () => {
    this.clientState.isBusy = true;
    this.exportWorkpackModel.module = "WorkPack";
    this.exportWorkpackModel.filter = this.workpackFilterCode;
    this.exportWorkpackModel.sortExpression = this.workpackSorting;
    this.dataWorkpackService.exportToExcel(this.exportWorkpackModel).subscribe(res => {
      this.exportModel = res ? <ExportModel>{ ...res } : null;
      this.onSaveFile();
      this.authErrorHandler.handleSuccess(Constants.WorkPackExported);
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onCancelLookup() {
    this.workpackFilterCode = null;
  }

  onRefreshData() {
    this.onCancelLookup();
    this.onGetDataWorkpack();
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
      this.workpackSorting = sortExpressionData;
      this.onGetDataWorkpack(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }

  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
  }
}
