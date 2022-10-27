import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { DataPreservationElementService } from 'src/app/shared/services/api/data-tab/data-preservationelement.service';
import { EditDataPreservationElementComponent } from './edit-data-preservationelement/edit-data-preservationelement.component';
import { Configs } from 'src/app/shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { DataPreservationElementModel } from 'src/app/shared/models/data-tab/data-preservationelement.model';
import { Constants } from 'src/app/shared/common';

@Component({
  selector: 'data-preservationelement',
  templateUrl: './data-preservationelement.component.html'
})

export class DataPreservationElementComponent implements OnInit {
  @Input() visible: boolean;
  @Input() projectKey: string;
  @Input() projectId: string;

  isCreateState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;
  isImportState: boolean;
  preservationElementIdEditing: string;
  preservationElementDeletionId: string;
  preservationElementCount: number = 0;
  preservationElementFilterCode: string;
  preservationElementSorting: string;
  isFilter: boolean = false;
  isCollapse: boolean = false;
  isHaveData: boolean = false;
  isToggleDropdown: boolean = false;

  dataPreservationElementModels: DataPreservationElementModel[] = [];
  exportPreservationElementModel: ExportParamModel = new ExportParamModel();
  exportModel: ExportModel = new ExportModel();

  dataSource: MatTableDataSource<DataPreservationElementModel>;
  displayedColumns: string[] = ['elementNo', 'task', 'description', 'type', 'frequencyInWeeks', 'edit', 'delete'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('editView', { static: true }) editView: EditDataPreservationElementComponent;

  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;

  defaultSortPreservationElement: string = "elementNo desc";

  constructor(
    public clientState: ClientState,
    private dataPreservationElementService: DataPreservationElementService,
    private authErrorHandler: AuthErrorHandler,
  ) { }

  public ngOnInit() {
    this.onGetDataPreservationElement(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortPreservationElement);
  }

  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  }

  //--- Get data PreservationElement
  onGetDataPreservationElement = (pageNumber?: number, pageSize?: number, sortExpression?: string, preservationElementCode?: string) => {
    this.isToggleDropdown = false;
    this.clientState.isBusy = true;

    if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;
    if (this.preservationElementFilterCode) {
      this.preservationElementFilterCode = this.preservationElementFilterCode.trim();
      preservationElementCode = this.preservationElementFilterCode;
    }

    this.dataPreservationElementService.getDataPreservationElement(this.projectId, pageNumber || 1, pageSize || 50, sortExpression || this.defaultSortPreservationElement, preservationElementCode || "").subscribe(res => {
      this.dataPreservationElementModels = res.items ? <DataPreservationElementModel[]>[...res.items] : [];
      if (this.dataPreservationElementModels.length > 0) {
        this.isHaveData = true;
      }
      this.dataSource = new MatTableDataSource(this.dataPreservationElementModels);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.preservationElementCount = res.totalItemCount;

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Edit item
  onOpenEditModal = (preservationElementId: string) => {
    this.isEditState = true;
    this.preservationElementIdEditing = preservationElementId;
  }

  onOpenCreateModal = () => {
    this.isCreateState = true;
  }

  onSuccessEditModal = (isSuccess: boolean) => {
    this.isEditState = false;
    this.preservationElementIdEditing = null;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.PreservationElementUpdated);
      this.onGetDataPreservationElement(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  onSuccessCreateModal = (isSuccess: boolean) => {
    this.isCreateState = false;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.PreservationElementCreated);
      this.onGetDataPreservationElement(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  //--- Delete item
  onOpenDeleteModal = (id: string) => {
    this.preservationElementDeletionId = id;
    this.isDeleteState = true;
  }

  onDeleteConfirm = (isConfirm: boolean) => {
    if (!isConfirm) {
      this.isDeleteState = false;
      return;
    }

    if (isConfirm && this.preservationElementDeletionId) {
      this.clientState.isBusy = true;

      this.dataPreservationElementService.deletePreservationElement(this.preservationElementDeletionId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.preservationElementDeletionId = null;
          this.isDeleteState = false;
          this.authErrorHandler.handleSuccess(Constants.PreservationElementDeleted);
          this.onGetDataPreservationElement(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.preservationElementDeletionId = null;
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
      this.authErrorHandler.handleSuccess(Constants.PreservationElementImported);
      this.onGetDataPreservationElement(Configs.DefaultPageNumber, Configs.DefaultPageSize, "ElementNo desc");
    }
  }

  onExportExcel = () => {
    this.clientState.isBusy = true;
    this.exportPreservationElementModel.module = "PreservationElement";
    this.exportPreservationElementModel.projectId = this.projectId;
    this.exportPreservationElementModel.filter = this.preservationElementFilterCode;
    this.exportPreservationElementModel.sortExpression = this.preservationElementSorting;
    this.dataPreservationElementService.exportToExcel(this.exportPreservationElementModel).subscribe(res => {
      this.exportModel = res ? <ExportModel>{ ...res } : null;
      this.onSaveFile();
      this.authErrorHandler.handleSuccess(Constants.PreservationElementExported);
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onCancelLookup() {
    this.preservationElementFilterCode = null;
  }

  onRefreshData() {
    this.onCancelLookup();
    this.onGetDataPreservationElement();
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
      this.preservationElementSorting = sortExpressionData;
      this.onGetDataPreservationElement(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }

  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
  }
}
