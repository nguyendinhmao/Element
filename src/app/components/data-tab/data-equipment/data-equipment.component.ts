import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { DataEquipmentService } from 'src/app/shared/services/api/data-tab/data-equipment.service';
import { Configs } from 'src/app/shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { DataEquipmentModel } from 'src/app/shared/models/data-tab/data-equipment.model';
import { Constants } from 'src/app/shared/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'data-equipment',
  templateUrl: './data-equipment.component.html'
})

export class DataEquipmentComponent implements OnInit {
  @Input() visible: boolean;
  @Input() projectKey: string;
  @Input() projectId: string;

  isCreateState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;
  isImportState: boolean;
  isFilter: boolean = false;
  isCollapse: boolean = false;
  isHaveData: boolean = false;
  isToggleDropdown: boolean = false;

  equipmentSorting: string;
  equipmentFilterCode: string;
  equipmentIdEditing: string;
  equipmentDeletionId: string;
  equipmentCount: number = 0;
  defaultSortEquipment: string = "EquipmentCode desc";

  exportEquipmentModel: ExportParamModel = new ExportParamModel();
  exportModel: ExportModel = new ExportModel();
  dataEquipmentModels: DataEquipmentModel[] = [];

  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;

  dataSource: MatTableDataSource<DataEquipmentModel>;
  displayedColumns: string[] = ['equipmentCode', 'equipmentName', 'edit', 'delete'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    public clientState: ClientState,
    private dataEquipmentService: DataEquipmentService,
    private authErrorHandler: AuthErrorHandler,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.route.params.subscribe((params) => {
      this.projectKey = params["projectKey"];
      if (!this.projectKey) {
        this.router.navigate([""]);
      }
    });
  }

  public ngOnInit() {
    this.onGetDataEquipment();
  }

  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  }

  //--- Get data location
  onGetDataEquipment = (pageIndex?: number, pageSize?: number, sortExpression?: string, equipmentCode?: string) => {
    this.isToggleDropdown = false;
    this.clientState.isBusy = true;

    if (pageIndex >= 0) { this.currentPageNumber = pageIndex; pageIndex = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;
    if (this.equipmentFilterCode) equipmentCode = this.equipmentFilterCode.trim();

    this.dataEquipmentService.getEquipment(this.projectKey, pageIndex || 1, pageSize || 50, sortExpression || this.defaultSortEquipment, equipmentCode || "").subscribe(res => {
      this.dataEquipmentModels = res.items ? <DataEquipmentModel[]>[...res.items] : [];
      if (this.dataEquipmentModels.length > 0) this.isHaveData = true;
      this.equipmentCount = res.totalItemCount;
      this.dataSource = new MatTableDataSource(this.dataEquipmentModels);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Filter
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onCancelLookup() {
    this.isFilter = false;
    this.equipmentFilterCode = null;
  }

  //--- Edit item
  onOpenEditModal = (equipmentId: string) => {
    this.isEditState = true;
    this.equipmentIdEditing = equipmentId;
  }

  //--- Create item
  onOpenCreateModal = () => {
    this.isCreateState = true;
  }

  onSuccessEditModal = (isSuccess: boolean) => {
    this.isEditState = false;
    this.equipmentIdEditing = null;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.EquipmentUpdated);
      this.onGetDataEquipment(Configs.DefaultPageNumber, this.currentPageSize, this.defaultSortEquipment);
    }
  }

  onSuccessCreateModal = (isSuccess: boolean) => {
    this.isCreateState = false;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.EquipmentCreated);
      this.onGetDataEquipment(Configs.DefaultPageNumber, this.currentPageSize, this.defaultSortEquipment);
    }
  }

  //--- Delete item
  onOpenDeleteModal = (id: string) => {
    this.equipmentDeletionId = id;
    this.isDeleteState = true;
  }

  onDeleteConfirm = (isConfirm: boolean) => {
    if (!isConfirm) {
      this.isDeleteState = false;
      return;
    }

    if (isConfirm && this.equipmentDeletionId) {
      this.clientState.isBusy = true;

      this.dataEquipmentService.deleteEquipment(this.equipmentDeletionId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.equipmentDeletionId = null;
          this.isDeleteState = false;
          this.authErrorHandler.handleSuccess(Constants.EquipmentDeleted);
          this.onGetDataEquipment(Configs.DefaultPageNumber, this.currentPageSize, this.defaultSortEquipment);
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.equipmentDeletionId = null;
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

  onExportExcel = () => {
    this.clientState.isBusy = true;
    this.exportEquipmentModel.projectKey = this.projectKey;
    this.exportEquipmentModel.module = "Equipment";
    this.exportEquipmentModel.filter = this.equipmentFilterCode;
    this.exportEquipmentModel.sortExpression = this.equipmentSorting;
    this.dataEquipmentService.exportToExcel(this.exportEquipmentModel).subscribe(res => {
      this.exportModel = res ? <ExportModel>{ ...res } : null;
      this.onSaveFile();
      this.authErrorHandler.handleSuccess(Constants.EquipmentExported);
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    }
    );
  }

  onRefreshData() {
    this.onCancelLookup();
    this.onGetDataEquipment();
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

  onSuccessImportModal = (isConfirm: boolean) => {
    this.isImportState = false;
    if (isConfirm) {
      this.onCancelLookup();
      this.authErrorHandler.handleSuccess(Constants.EquipmentImported);
      this.onGetDataEquipment(Configs.DefaultPageNumber, this.currentPageSize, this.defaultSortEquipment);
    }
  }

  //--- Sort data
  onSortData(sort: Sort) {
    let sortExpressionData: string;
    if (sort) {
      sortExpressionData = sort.active + " " + sort.direction;
      this.currentSortExpression = sortExpressionData;
      this.onGetDataEquipment(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }

  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
  }
}
