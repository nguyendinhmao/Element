import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ITRService } from 'src/app/shared/services/api/itr/itr.service';
// import { DataRecordService } from 'src/app/shared/services/api/data-tab/data-record.service';
// import { EditItrAdminComponent } from "src/app/components//itr-tab/itr-admin/edit-itr-admin/edit-itr-admin.component";
import { EditItrAdminComponent } from 'src/app/components/itr-tab/itr-admin/edit-itr-admin/edit-itr-admin.component';
import { Configs } from 'src/app/shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { ITRAdminModel, ITRAdminUpdationModel } from 'src/app/shared/models/itr-tab/itr-admin.model'
// import { DataRecordModel } from 'src/app/shared/models/data-tab/data-record.model';
import { Constants } from 'src/app/shared/common';

@Component({
  selector: 'data-record',
  templateUrl: './data-record.component.html'
})

export class DataRecordComponent implements OnInit {
  @Input() visible: boolean;
  @Input() projectKey: string;
  @Input() projectId: string;

  isCreateState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;
  isImportState: boolean;
  recordIdEditing: string;
  recordDeletionId: string;
  recordCount: number = 0;
  recordFilterCode: string;
  recordSorting: string;
  isFilter: boolean = false;
  isCollapse: boolean = false;
  isHaveData: boolean = false;
  isToggleDropdown: boolean = false;

  dataRecordModels: ITRAdminModel[] = [];
  exportRecordModel: ExportParamModel = new ExportParamModel();
  exportModel: ExportModel = new ExportModel();

  updationModel: ITRAdminUpdationModel = new ITRAdminUpdationModel();
  dataSource: MatTableDataSource<ITRAdminModel>;
  displayedColumns: string[] = ['itrNo', 'description', 'type', 'disciplineName', 'mileStoneName', 'signatureCount', 'dateUpdated', 'edit', 'delete'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('editView', { static: true }) editView: EditItrAdminComponent;

  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;

  defaultSortRecord: string = "itrNo desc";

  constructor(
    public clientState: ClientState,
    private dataRecordService: ITRService,
    private authErrorHandler: AuthErrorHandler,
  ) { }

  public ngOnInit() {
    this.onGetDataRecord(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortRecord);
  }

  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  }

  //--- Get data Record
  onGetDataRecord = (pageNumber?: number, pageSize?: number, sortExpression?: string, RecordCode?: string) => {
    this.isToggleDropdown = false;
    this.clientState.isBusy = true;

    if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;
    if (this.recordFilterCode) {
      this.recordFilterCode = this.recordFilterCode.trim();
      RecordCode = this.recordFilterCode;
    }
    // this.itrService.getITRList(this.projectKey, pageNumber || Configs.DefaultPageNumber, pageSize || Configs.DefaultPageSize, RecordCode, null, null, null, null, null, null, null, sortExpression || this.defaultSortRecord)
    this.dataRecordService.getITRList(this.projectKey, pageNumber || Configs.DefaultPageNumber, pageSize || Configs.DefaultPageSize, RecordCode, null, null, null, null, null, null, null, sortExpression || this.defaultSortRecord).subscribe(res => {
      this.dataRecordModels = res.items ? <ITRAdminModel[]>[...res.items] : [];
      if (this.dataRecordModels.length > 0) {
        this.isHaveData = true;
        this.dataRecordModels.map(item => {
          item.dateUpdated = new Date(item.dateUpdated);
        })
      }
      this.dataSource = new MatTableDataSource(this.dataRecordModels);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.recordCount = res.totalItemCount;

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Edit item

  onOpenEditModal = (RecordId: string) => {
    this.recordIdEditing = RecordId;
    this.clientState.isBusy = true;
    this.isEditState = true;
    this.dataRecordService.getITRById(RecordId).subscribe(res => {
      this.clientState.isBusy = false;
      this.updationModel = res;
      this.isEditState = true;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.isEditState = false;
      this.authErrorHandler.handleError(err.message);
    });
  }
  onOpenCreateModal = () => {
    this.isCreateState = true;
  }

  onSuccessEditModal = (isSuccess: boolean) => {
    this.isEditState = false;
    this.recordIdEditing = null;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.ItrUpdated);
      this.onGetDataRecord(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }
  onSuccessCreateModal = (isSuccess: boolean) => {
    this.isCreateState = false;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.ItrCreated);
      this.onGetDataRecord(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  //--- Delete item
  onOpenDeleteModal = (id: string) => {
    this.recordDeletionId = id;
    this.isDeleteState = true;
  }

  onDeleteConfirm = (isConfirm: boolean) => {
    if (!isConfirm) {
      this.isDeleteState = false;
      return;
    }

    if (isConfirm && this.recordDeletionId) {
      this.clientState.isBusy = true;

      this.dataRecordService.deleteITR(this.recordDeletionId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.recordDeletionId = null;
          this.isDeleteState = false;
          this.authErrorHandler.handleSuccess(Constants.ItrDeleted);
          this.onGetDataRecord(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.recordDeletionId = null;
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
      this.authErrorHandler.handleSuccess(Constants.RecordImported);
      this.onGetDataRecord(Configs.DefaultPageNumber, Configs.DefaultPageSize, "ItrNo desc");
    }
  }

  onExportExcel = () => {
    this.clientState.isBusy = true;
    this.exportRecordModel.module = "Record";
    this.exportRecordModel.projectId = this.projectId;
    this.exportRecordModel.filter = this.recordFilterCode;
    this.exportRecordModel.sortExpression = this.recordSorting;
    this.exportRecordModel.projectKey = this.projectKey;
    this.dataRecordService.exportToExcel(this.exportRecordModel).subscribe(res => {
      this.exportModel = res ? <ExportModel>{ ...res } : null;
      this.onSaveFile();
      this.authErrorHandler.handleSuccess(Constants.RecordExported);
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onCancelLookup() {
    this.recordFilterCode = null;
  }

  onRefreshData() {
    this.onCancelLookup();
    this.onGetDataRecord();
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
      this.recordSorting = sortExpressionData;
      this.onGetDataRecord(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }

  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
  }
}
