import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { DataTagNoService } from 'src/app/shared/services/api/data-tab/data-tagno.service';
import { Configs } from 'src/app/shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { DataTagNoModel, UpdateTagNoModel } from 'src/app/shared/models/data-tab/data-tagno.model';
import { Constants } from 'src/app/shared/common';
import { EditDataTagNoComponent } from './edit-data-tagno/edit-data-tagno.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TagDrawingModel } from 'src/app/shared/models/tab-tag/tab-tag.model';

@Component({
  selector: 'data-tagno',
  templateUrl: './data-tagno.component.html',
  styleUrls: ["./data-tagno.component.scss"],
})

export class DataTagNoComponent implements OnInit {
  @Input() visible: boolean;
  @Input() projectId: string;

  isCreateState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;
  isImportState: boolean;
  tagNoIdEditing: string;
  tagNoDeletionId: string;
  tagNoCount: number = 0;
  tagNoFilterCode: string;
  tagNoSorting: string;
  isFilter: boolean = false;
  isCollapse: boolean = false;
  isHaveData: boolean = false;
  isToggleDropdown: boolean = false;
  isImportTagDrawingState: boolean;
  isDownloadTemplateState: boolean;

  dataTagNoModels: DataTagNoModel[] = [];
  exportTagNoModel: ExportParamModel = new ExportParamModel();
  exportModel: ExportModel = new ExportModel();
  updationModel: UpdateTagNoModel = new UpdateTagNoModel();

  dataSource: MatTableDataSource<DataTagNoModel>;
  displayedColumns: string[] = ['tagNo', 'tagName', 'equipmentType', 'tagType', 'parent', 'drawings', 'workPackNo', 'locationCode', 'status', 'discipline', 'system', 'subSystem', 'edit', 'delete'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('editView', { static: true }) editView: EditDataTagNoComponent;

  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;
  projectKey: string;
  sub: Subscription;
  defaultSortTagNo: string = "TagNo asc";
  drawings2Info = [];
  isShowDrawings: boolean = false;

  constructor(
    public clientState: ClientState,
    private datatagNoService: DataTagNoService,
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
    this.onGetDataTagNo(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortTagNo);
  }

  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  }

  //--- Get data tagNo
  onGetDataTagNo = (pageNumber?: number, pageSize?: number, sortExpression?: string, tagNo?: string) => {
    this.isToggleDropdown = false;
    this.clientState.isBusy = true;

    if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;
    if (this.tagNoFilterCode) tagNo = this.tagNoFilterCode;

    this.datatagNoService.getDataTagNo(this.projectKey, pageNumber || 1, pageSize || 50, sortExpression || this.defaultSortTagNo, tagNo || "").subscribe(res => {
      this.dataTagNoModels = res.items ? <DataTagNoModel[]>[...res.items] : [];
      if (this.dataTagNoModels.length > 0) this.isHaveData = true;
      this.dataSource = new MatTableDataSource(this.dataTagNoModels);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.tagNoCount = res.totalItemCount;

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Edit item
  onOpenEditModal = (tagId: string) => {
    this.isEditState = true;
    this.tagNoIdEditing = tagId;
  }

  onOpenCreateModal = () => {
    this.isCreateState = true;
  }

  onSuccessEditModal = (isSuccess: boolean) => {
    this.isEditState = false;
    this.tagNoIdEditing = null;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.TagNoUpdated);
      this.onGetDataTagNo(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  onSuccessCreateModal = (isSuccess: boolean) => {
    this.isCreateState = false;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.TagNoCreated);
      this.onGetDataTagNo(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  //--- Delete item
  onOpenDeleteModal = (id: string) => {
    this.tagNoDeletionId = id;
    this.isDeleteState = true;
  }

  onDeleteConfirm = (isConfirm: boolean) => {
    if (!isConfirm) {
      this.isDeleteState = false;
      return;
    }

    if (isConfirm && this.tagNoDeletionId) {
      this.clientState.isBusy = true;

      this.datatagNoService.deleteTagNo(this.tagNoDeletionId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.tagNoDeletionId = null;
          this.isDeleteState = false;
          this.authErrorHandler.handleSuccess(Constants.TagNoDeleted);
          this.onGetDataTagNo(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.tagNoDeletionId = null;
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

  onOpenDownloadTemplate = () => {
    this.isDownloadTemplateState = true;
  }

  onOpenImportTagDrawingModal = () => {
    this.isImportTagDrawingState = true;
  }

  onSuccessImportModal = (isConfirm: boolean) => {
    this.isImportState = false;
    if (isConfirm) {
      this.onCancelLookup();
      this.authErrorHandler.handleSuccess(Constants.TagNoImported);
      this.onGetDataTagNo(Configs.DefaultPageNumber, Configs.DefaultPageSize, "tagNo desc");
    }
  }

  onSuccessImportTagDrawingModal = (isConfirm: boolean) => {
    this.isImportTagDrawingState = false;
    if (isConfirm) {
      this.onCancelLookup();
      this.authErrorHandler.handleSuccess(Constants.TagDrawingImported);
      this.onGetDataTagNo(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  onSuccessDownloadTemplate = (isConfirm: boolean) => {
    this.isDownloadTemplateState = false;
  }
  onExportExcel = () => {
    this.clientState.isBusy = true;
    this.exportTagNoModel.module = "Tag";
    this.exportTagNoModel.filter = this.tagNoFilterCode;
    this.exportTagNoModel.sortExpression = this.tagNoSorting;
    this.exportTagNoModel.projectKey = this.projectKey;
    this.datatagNoService.exportToExcel(this.exportTagNoModel).subscribe(res => {
      this.exportModel = res ? <ExportModel>{ ...res } : null;
      this.onSaveFile();
      this.authErrorHandler.handleSuccess(Constants.TagNoExported);
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onCancelLookup() {
    this.tagNoFilterCode = null;
  }

  onRefreshData() {
    this.onCancelLookup();
    this.onGetDataTagNo();
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
      this.tagNoSorting = sortExpressionData;
      this.onGetDataTagNo(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }

  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
  }

  onShowDrawings(drawings: TagDrawingModel[]) {
    this.drawings2Info = drawings;
    this.isShowDrawings = true;
  }

  onPreviewDrawings(isConfirm: boolean) {
    if (isConfirm) {

    }
    this.drawings2Info = null;
    this.isShowDrawings = false;
  }
}
