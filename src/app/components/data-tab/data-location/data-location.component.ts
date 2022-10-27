import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { DataLocationService } from 'src/app/shared/services/api/data-tab/data-location.service';
import { EditDataLocationComponent } from './edit-data-location/edit-data-location.component';
import { Configs } from 'src/app/shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { DataLocationModel } from 'src/app/shared/models/data-tab/data-location.model';
import { Constants } from 'src/app/shared/common';

@Component({
  selector: 'data-location',
  templateUrl: './data-location.component.html'
})

export class DataLocationComponent implements OnInit {
  @Input() visible: boolean;
  @Input() projectKey: string;
  @Input() projectId: string;

  isCreateState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;
  isImportState: boolean;
  locationIdEditing: string;
  locationDeletionId: string;
  locationCount: number = 0;
  locationFilterCode: string;
  locationSorting: string;
  isFilter: boolean = false;
  isCollapse: boolean = false;
  isHaveData: boolean = false;
  isToggleDropdown: boolean = false;

  dataLocationModels: DataLocationModel[] = [];
  exportLocationModel: ExportParamModel = new ExportParamModel();
  exportModel: ExportModel = new ExportModel();

  dataSource: MatTableDataSource<DataLocationModel>;
  displayedColumns: string[] = ['locationCode', 'locationName', 'edit', 'delete'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('editView', { static: true }) editView: EditDataLocationComponent;

  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;
  defaultSortLocation: string = "LocationCode desc";

  constructor(
    public clientState: ClientState,
    private dataLocationService: DataLocationService,
    private authErrorHandler: AuthErrorHandler
  ) { }

  public ngOnInit() {
    this.onGetDataLocation(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortLocation);
  }

  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  }

  //--- Get data location
  onGetDataLocation = (pageNumber?: number, pageSize?: number, sortExpression?: string, locationCode?: string) => {
    this.isToggleDropdown = false;
    this.clientState.isBusy = true;

    if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;
    if (this.locationFilterCode) locationCode = this.locationFilterCode.trim();

    this.dataLocationService.getDataLocation(pageNumber || Configs.DefaultPageNumber, pageSize || Configs.DefaultPageSize, this.projectKey, sortExpression || this.defaultSortLocation, locationCode || "").subscribe(res => {
      this.dataLocationModels = res.items ? <DataLocationModel[]>[...res.items] : [];
      if (this.dataLocationModels.length > 0) this.isHaveData = true;
      this.dataSource = new MatTableDataSource(this.dataLocationModels);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.locationCount = res.totalItemCount;

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Edit item
  onOpenEditModal = (locationId: string) => {
    this.isEditState = true;
    this.locationIdEditing = locationId;
  }

  onOpenCreateModal = () => {
    this.isCreateState = true;
  }

  onSuccessEditModal = (isSuccess: boolean) => {
    this.isEditState = false;
    this.locationIdEditing = null;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.LocationUpdated);
      this.onGetDataLocation(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  onSuccessCreateModal = (isSuccess: boolean) => {
    this.isCreateState = false;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.LocationCreated);
      this.onGetDataLocation(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  //--- Delete item
  onOpenDeleteModal = (id: string) => {
    this.locationDeletionId = id;
    this.isDeleteState = true;
  }

  onDeleteConfirm = (isConfirm: boolean) => {
    if (!isConfirm) {
      this.isDeleteState = false;
      return;
    }

    if (isConfirm && this.locationDeletionId) {
      this.clientState.isBusy = true;

      this.dataLocationService.deleteLocation(this.locationDeletionId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.locationDeletionId = null;
          this.isDeleteState = false;
          this.authErrorHandler.handleSuccess(Constants.LocationDeleted);
          this.onGetDataLocation(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.locationDeletionId = null;
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
      this.authErrorHandler.handleSuccess(Constants.LocationImported);
      this.onGetDataLocation(Configs.DefaultPageNumber, Configs.DefaultPageSize, "LocationCode desc");
    }
  }

  onExportExcel = () => {
    this.clientState.isBusy = true;
    this.exportLocationModel.projectKey = this.projectKey;
    this.exportLocationModel.module = "Location";
    this.exportLocationModel.filter = this.locationFilterCode;
    this.exportLocationModel.sortExpression = this.locationSorting;
    this.dataLocationService.exportToExcel(this.exportLocationModel).subscribe(res => {
      this.exportModel = res ? <ExportModel>{ ...res } : null;
      this.onSaveFile();
      this.authErrorHandler.handleSuccess(Constants.LocationExported);
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onCancelLookup() {
    this.locationFilterCode = null;
  }

  onRefreshData() {
    this.onCancelLookup();
    this.onGetDataLocation();
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
      this.locationSorting = sortExpressionData;
      this.onGetDataLocation(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }

  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
  }
}
