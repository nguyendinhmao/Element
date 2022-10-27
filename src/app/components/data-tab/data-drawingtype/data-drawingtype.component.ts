import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { DataDrawingTypeService } from 'src/app/shared/services/api/data-tab/data-drawingtype.service';
import { EditDataDrawingTypeComponent } from './edit-data-drawingtype/edit-data-drawingtype.component';
import { Configs } from 'src/app/shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { DataDrawingTypeModel } from 'src/app/shared/models/data-tab/data-drawingtype.model';
import { Constants } from 'src/app/shared/common';

@Component({
  selector: 'data-drawingtype',
  templateUrl: './data-drawingtype.component.html'
})

export class DataDrawingTypeComponent implements OnInit {
  @Input() visible: boolean;
  @Input() projectKey: string;
  @Input() projectId: string;

  isCreateState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;
  isImportState: boolean;
  drawingTypeIdEditing: string;
  drawingTypeDeletionId: string;
  drawingTypeCount: number = 0;
  drawingTypeFilterCode: string;
  drawingTypeSorting: string;
  isFilter: boolean = false;
  isCollapse: boolean = false;
  isHaveData: boolean = false;
  isToggleDropdown: boolean = false;

  dataDrawingTypeModels: DataDrawingTypeModel[] = [];
  exportDrawingTypeModel: ExportParamModel = new ExportParamModel();
  exportModel: ExportModel = new ExportModel();

  dataSource: MatTableDataSource<DataDrawingTypeModel>;
  displayedColumns: string[] = ['drawingTypeCode', 'description', 'locationDrawing', 'edit', 'delete'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('editView', { static: true }) editView: EditDataDrawingTypeComponent;

  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;

  defaultSortDrawingType: string = "DrawingTypeCode desc";

  constructor(
    public clientState: ClientState,
    private dataDrawingTypeService: DataDrawingTypeService,
    private authErrorHandler: AuthErrorHandler,
  ) { }

  public ngOnInit() {
    this.onGetDataDrawingType(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortDrawingType);
  }

  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  }

  //--- Get data DrawingType
  onGetDataDrawingType = (pageNumber?: number, pageSize?: number, sortExpression?: string, drawingTypeCode?: string) => {
    this.isToggleDropdown = false;
    this.clientState.isBusy = true;

    if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;
    if (this.drawingTypeFilterCode) {
      this.drawingTypeFilterCode = this.drawingTypeFilterCode.trim();
      drawingTypeCode = this.drawingTypeFilterCode;
    }

    this.dataDrawingTypeService.getDataDrawingType(this.projectId, pageNumber || 1, pageSize || 50, sortExpression || this.defaultSortDrawingType, drawingTypeCode || "").subscribe(res => {
      this.dataDrawingTypeModels = res.items ? <DataDrawingTypeModel[]>[...res.items] : [];
      if (this.dataDrawingTypeModels.length > 0) {
        this.isHaveData = true;
      }
      this.dataSource = new MatTableDataSource(this.dataDrawingTypeModels);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.drawingTypeCount = res.totalItemCount;

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Create item
  onOpenCreateModal = () => {
    this.isCreateState = true;
  }

  //--- Edit item
  onOpenEditModal = (drawingTypeId: string) => {
    this.isEditState = true;
    this.drawingTypeIdEditing = drawingTypeId;
  }

  onSuccessCreateModal = (isSuccess: boolean) => {
    this.isCreateState = false;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.DrawingTypeCreated);
      this.onGetDataDrawingType(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  onSuccessEditModal = (isSuccess: boolean) => {
    this.isEditState = false;
    this.drawingTypeIdEditing = null;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.DrawingTypeUpdated);
      this.onGetDataDrawingType(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  //--- Delete item
  onOpenDeleteModal = (id: string) => {
    this.drawingTypeDeletionId = id;
    this.isDeleteState = true;
  }

  onDeleteConfirm = (isConfirm: boolean) => {
    if (!isConfirm) {
      this.isDeleteState = false;
      return;
    }

    if (isConfirm && this.drawingTypeDeletionId) {
      this.clientState.isBusy = true;

      this.dataDrawingTypeService.deleteDrawingType(this.drawingTypeDeletionId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.drawingTypeDeletionId = null;
          this.isDeleteState = false;
          this.authErrorHandler.handleSuccess(Constants.DrawingTypeDeleted);
          this.onGetDataDrawingType(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.drawingTypeDeletionId = null;
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
      this.authErrorHandler.handleSuccess(Constants.DrawingTypeImported);
      this.onGetDataDrawingType(Configs.DefaultPageNumber, Configs.DefaultPageSize, "DrawingTypeCode desc");
    }
  }

  onExportExcel = () => {
    this.clientState.isBusy = true;
    this.exportDrawingTypeModel.module = "DrawingType";
    this.exportDrawingTypeModel.projectId = this.projectId;
    this.exportDrawingTypeModel.filter = this.drawingTypeFilterCode;
    this.exportDrawingTypeModel.sortExpression = this.drawingTypeSorting;
    this.dataDrawingTypeService.exportToExcel(this.exportDrawingTypeModel).subscribe(res => {
      this.exportModel = res ? <ExportModel>{ ...res } : null;
      this.onSaveFile();
      this.authErrorHandler.handleSuccess(Constants.DrawingTypeExported);
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onCancelLookup() {
    this.drawingTypeFilterCode = null;
  }

  onRefreshData() {
    this.onCancelLookup();
    this.onGetDataDrawingType();
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
      this.drawingTypeSorting = sortExpressionData;
      this.onGetDataDrawingType(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }

  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
  }
}
