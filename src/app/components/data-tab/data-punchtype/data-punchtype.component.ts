import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { DataPunchTypeService } from 'src/app/shared/services/api/data-tab/data-punchtype.service';
import { EditDataPunchTypeComponent } from './edit-data-punchtype/edit-data-punchtype.component';
import { Configs } from 'src/app/shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { DataPunchTypeModel, UpdatePunchTypeModel } from 'src/app/shared/models/data-tab/data-punchtype.model';
import { Constants } from 'src/app/shared/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'data-punchtype',
  templateUrl: './data-punchtype.component.html'
})

export class DataPunchTypeComponent implements OnInit {
  @Input() visible: boolean;
  @Input() projectId: string;

  isCreateState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;
  isImportState: boolean;
  punchTypeIdEditing: string;
  punchTypeDeletionId: string;
  punchTypeCount: number = 0;
  punchTypeFilterCode: string;
  punchTypeSorting: string;
  isFilter: boolean = false;
  isCollapse: boolean = false;
  isHaveData: boolean = false;
  isToggleDropdown: boolean = false;

  dataPunchTypeModels: DataPunchTypeModel[] = [];
  exportPunchTypeModel: ExportParamModel = new ExportParamModel();
  exportModel: ExportModel = new ExportModel();

  dataSource: MatTableDataSource<DataPunchTypeModel>;
  displayedColumns: string[] = ['type', 'description', 'edit', 'delete'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('editView', { static: true }) editView: EditDataPunchTypeComponent;

  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;
  sub: Subscription;
  projectKey: string;

  defaultSortPunchType: string = "Type desc";
  updationModel: UpdatePunchTypeModel = new UpdatePunchTypeModel();
  constructor(
    public clientState: ClientState,
    private dataPunchTypeService: DataPunchTypeService,
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
    this.onGetDataPunchType(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortPunchType);
  }

  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  }

  //--- Get data punchType
  onGetDataPunchType = (pageNumber?: number, pageSize?: number, sortExpression?: string, type?: string) => {
    this.isToggleDropdown = false;
    this.clientState.isBusy = true;

    if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;
    if (this.punchTypeFilterCode) type = this.punchTypeFilterCode.trim();

    this.dataPunchTypeService.getDataPunchType(pageNumber || 1, pageSize || 50, this.projectKey, sortExpression || this.defaultSortPunchType, type || "").subscribe(res => {
      this.dataPunchTypeModels = res.items ? <DataPunchTypeModel[]>[...res.items] : [];
      if (this.dataPunchTypeModels.length > 0) this.isHaveData = true;
      this.dataSource = new MatTableDataSource(this.dataPunchTypeModels);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.punchTypeCount = res.totalItemCount;

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Edit item
  onOpenEditModal = (punchTypeId: string) => {
    this.isEditState = true;
    this.clientState.isBusy = true;
    this.dataPunchTypeService.getPunchTypeId(punchTypeId).subscribe(res => {
      this.updationModel = res ? <UpdatePunchTypeModel>{ ...res } : null;
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
    this.punchTypeIdEditing = null;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.PunchTypeUpdated);
      this.onGetDataPunchType(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }
  onSuccessCreateModal = (isSuccess: boolean) => {
    this.isCreateState = false;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.PunchTypeCreated);
      this.onGetDataPunchType(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  //--- Delete item
  onOpenDeleteModal = (id: string) => {
    this.punchTypeDeletionId = id;
    this.isDeleteState = true;
  }

  onDeleteConfirm = (isConfirm: boolean) => {
    if (!isConfirm) {
      this.isDeleteState = false;
      return;
    }

    if (isConfirm && this.punchTypeDeletionId) {
      this.clientState.isBusy = true;

      this.dataPunchTypeService.deletePunchType(this.punchTypeDeletionId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.punchTypeDeletionId = null;
          this.isDeleteState = false;
          this.authErrorHandler.handleSuccess(Constants.PunchTypeDeleted);
          this.onGetDataPunchType(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.punchTypeDeletionId = null;
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
      this.authErrorHandler.handleSuccess(Constants.PunchTypeImported);
      this.onGetDataPunchType(Configs.DefaultPageNumber, Configs.DefaultPageSize, "Type desc");
    }
  }

  onExportExcel = () => {
    this.clientState.isBusy = true;
    this.exportPunchTypeModel.module = "PunchType";
    this.exportPunchTypeModel.filter = this.punchTypeFilterCode;
    this.exportPunchTypeModel.sortExpression = this.punchTypeSorting;
    this.dataPunchTypeService.exportToExcel(this.exportPunchTypeModel).subscribe(res => {
      this.exportModel = res ? <ExportModel>{ ...res } : null;
      this.onSaveFile();
      this.authErrorHandler.handleSuccess(Constants.PunchTypeExported);
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onCancelLookup() {
    this.punchTypeFilterCode = null;
  }

  onRefreshData() {
    this.onCancelLookup();
    this.onGetDataPunchType();
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
      this.punchTypeSorting = sortExpressionData;
      this.onGetDataPunchType(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }

  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
  }
}
