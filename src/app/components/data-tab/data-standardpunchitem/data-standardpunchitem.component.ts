import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { EditStandardPunchItemComponent } from './edit-data-standardpunchitem/edit-data-standardpunchitem'
import { Configs } from 'src/app/shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { Constants } from 'src/app/shared/common';
import { DataStandardPunchItem } from 'src/app/shared/models/data-tab/data-standardpunchitem.model';
import { DataStandardPunchItemService } from 'src/app/shared/services/api/data-tab/data-standardpunchitem.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'data-standardpunchitem',
  templateUrl: './data-standardpunchitem.component.html'
})

export class DataStandardPunchItemComponent implements OnInit {
  @Input() visible: boolean;
  @Input() projectId: string;
  isCreateState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;
  isImportState: boolean;
  standardPunchItemIdEditing: string;
  standardPunchItemDeletionId: string;
  standardPunchItemCount: number = 0;
  standardPunchItemFilterCode: string;
  standardPunchItemSorting: string;
  isFilter: boolean = false;
  isCollapse: boolean = false;
  isHaveData: boolean = false;
  isToggleDropdown: boolean = false;

  dataStandardPunchItem: DataStandardPunchItem[] = [];
  exportStandardPunchItem: ExportParamModel = new ExportParamModel();
  exportModel: ExportModel = new ExportModel();

  dataSource: MatTableDataSource<DataStandardPunchItem>;
  displayedColumns: string[] = ['disciplineCode', 'description', 'correctiveAction', 'category', 'edit', 'delete'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('editView', { static: true }) editView: EditStandardPunchItemComponent;

  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;
  sub: Subscription;
  projectKey: string;

  defaultSortStandardPunchItem: string = "DisciplineCode desc";
  constructor(
    public clientState: ClientState,
    private dataStandardPunchItemService: DataStandardPunchItemService,
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
    this.onGetDataStandardPunchItem(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortStandardPunchItem);
  }

  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  }

  //--- Get data standardPunchItem
  onGetDataStandardPunchItem = (pageNumber?: number, pageSize?: number, sortExpression?: string, disciplineCode?: string) => {
    this.isToggleDropdown = false;
    this.clientState.isBusy = true;

    if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;
    if (this.standardPunchItemFilterCode) disciplineCode = this.standardPunchItemFilterCode.trim();

    this.dataStandardPunchItemService.getStandardPunchItem(pageNumber || 1, pageSize || 50, this.projectKey, sortExpression || this.defaultSortStandardPunchItem, disciplineCode || "").subscribe(res => {
      this.dataStandardPunchItem = res.items ? <DataStandardPunchItem[]>[...res.items] : [];
      if (this.dataStandardPunchItem.length > 0) this.isHaveData = true;
      this.dataSource = new MatTableDataSource(this.dataStandardPunchItem);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.standardPunchItemCount = res.totalItemCount;

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  // --- Edit item
  onOpenEditModal = (standardPunchItemId: string) => {
    this.isEditState = true;
    this.standardPunchItemIdEditing = standardPunchItemId;
  }
  onOpenCreateModal = () => {
    this.isCreateState = true;
  }

  onSuccessEditModal = (isSuccess: boolean) => {
    this.isEditState = false;
    this.standardPunchItemIdEditing = null;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.StandardPunchItemUpdated);
      this.onGetDataStandardPunchItem(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }
  onSuccessCreateModal = (isSuccess: boolean) => {
    this.isCreateState = false;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.StandardPunchItemCreated);
      this.onGetDataStandardPunchItem(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  //--- Delete item
  onOpenDeleteModal = (id: string) => {
    this.standardPunchItemDeletionId = id;
    this.isDeleteState = true;
  }

  onDeleteConfirm = (isConfirm: boolean) => {
    if (!isConfirm) {
      this.isDeleteState = false;
      return;
    }

    if (isConfirm && this.standardPunchItemDeletionId) {
      this.clientState.isBusy = true;

      this.dataStandardPunchItemService.deletegetStandardPunchItem(this.standardPunchItemDeletionId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.standardPunchItemDeletionId = null;
          this.isDeleteState = false;
          this.authErrorHandler.handleSuccess(Constants.StandardPunchItemDeleted);
          this.onGetDataStandardPunchItem(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.standardPunchItemDeletionId = null;
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
      this.authErrorHandler.handleSuccess("Standard Punch Item import success fully");
      this.onGetDataStandardPunchItem(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortStandardPunchItem);
    }
  }

  onExportExcel = () => {
    this.clientState.isBusy = true;
    this.exportStandardPunchItem.module = "StandardPunchItem";
    this.exportStandardPunchItem.filter = this.standardPunchItemFilterCode;
    this.exportStandardPunchItem.sortExpression = this.standardPunchItemSorting;
    this.exportStandardPunchItem.projectKey = this.projectKey;
    this.dataStandardPunchItemService.exportToExcel(this.exportStandardPunchItem).subscribe(res => {
      this.exportModel = res ? <ExportModel>{ ...res } : null;
      this.onSaveFile();
      this.authErrorHandler.handleSuccess(Constants.StandardPunchItemExported);
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onCancelLookup() {
    this.standardPunchItemFilterCode = null;
  }

  onRefreshData() {
    this.onCancelLookup();
    this.onGetDataStandardPunchItem();
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
      this.standardPunchItemSorting = sortExpressionData;
      this.onGetDataStandardPunchItem(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }

  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
  }
}
