import { Component, OnInit, ViewChild, Input } from "@angular/core";
import {
  ExportParamModel,
  ExportModel,
} from "src/app/shared/models/data-tab/data-tab.model";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort, Sort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { ClientState } from "src/app/shared/services/client/client-state";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { DataPunchService } from "src/app/shared/services/api/data-tab/data-punch.service";
import { EditDataPunchComponent } from "./edit-data-punch/edit-data-punch.component";
import { Configs } from "src/app/shared/common/configs/configs";
import { AuthErrorHandler } from "src/app/shared/services/auth/auth.error-handler";
import {
  DataPunchModel,
  UpdatePunchModel,
} from "src/app/shared/models/data-tab/data-punch.model";
import { Constants } from "src/app/shared/common";
import { DrawingLookUpModel, ImageLookUp } from "src/app/shared/models/punch-page/punch-page.model";

@Component({
  selector: "data-punch",
  templateUrl: "./data-punch.component.html",
})
export class DataPunchComponent implements OnInit {
  @Input() visible: boolean;
  @Input() projectKey: string;
  @Input() projectId: string;

  isCreateState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;
  isImportState: boolean;
  punchIdEditing: string;
  punchDeletionId: string;
  punchCount: number = 0;
  punchFilterCode: string;
  punchSorting: string;
  isFilter: boolean = false;
  isCollapse: boolean = false;
  isHaveData: boolean = false;
  isToggleDropdown: boolean = false;
  isShowDrawings: boolean;

  dataPunchModels: DataPunchModel[] = [];
  exportPunchModel: ExportParamModel = new ExportParamModel();
  exportModel: ExportModel = new ExportModel();
  drawingLookUpModel: DrawingLookUpModel[];

  dataSource: MatTableDataSource<DataPunchModel>;
  displayedColumns: string[] = [
    "punchNo",
    "description",
    "correctiveAction",
    "tagNo",
    "type",
    "locationCode",
    "category",
    "materialsRequired",
    "orderNo",
    "drawings",
    "images",
    "edit",
    "delete",
  ];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild("editView", { static: true }) editView: EditDataPunchComponent;

  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;

  defaultSortPunch: string = "PunchNo desc";
  updationModel: UpdatePunchModel = new UpdatePunchModel();
  imageLookUpModel: ImageLookUp[];
  isOpenImages: boolean;
  constructor(
    public clientState: ClientState,
    private dataPunchService: DataPunchService,
    private authErrorHandler: AuthErrorHandler
  ) { }

  public ngOnInit() {
    this.onGetDataPunch(
      Configs.DefaultPageNumber,
      Configs.DefaultPageSize,
      this.defaultSortPunch
    );
  }

  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  };

  //--- Get data Punch
  onGetDataPunch = (
    pageNumber?: number,
    pageSize?: number,
    sortExpression?: string,
    punchNo?: string
  ) => {
    this.isToggleDropdown = false;
    this.clientState.isBusy = true;

    if (pageNumber >= 0) {
      this.currentPageNumber = pageNumber;
      pageNumber = this.currentPageNumber + 1;
    }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;
    if (this.punchFilterCode) punchNo = this.punchFilterCode.trim();

    this.dataPunchService
      .getDataPunch(
        this.projectKey,
        pageNumber || 1,
        pageSize || 50,
        sortExpression || this.defaultSortPunch,
        punchNo || ""
      )
      .subscribe(
        (res) => {
          this.dataPunchModels = res.items
            ? <DataPunchModel[]>[...res.items]
            : [];
          if (this.dataPunchModels.length > 0) this.isHaveData = true;
          this.dataSource = new MatTableDataSource(this.dataPunchModels);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.punchCount = res.totalItemCount;
          this.clientState.isBusy = false;
        },
        (err: ApiError) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        }
      );
  };

  //--- Edit item
  onOpenEditModal = (punchId: string) => {
    this.isEditState = true;
    this.punchIdEditing = punchId;
  };

  onOpenCreateModal = () => {
    this.isCreateState = true;
  };

  onSuccessEditModal = (isSuccess: boolean) => {
    this.isEditState = false;
    this.punchIdEditing = null;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.PunchUpdated);
      this.onGetDataPunch(
        this.currentPageNumber,
        this.currentPageSize,
        this.currentSortExpression
      );
    }
  };

  onSuccessCreateModal = (isSuccess: boolean) => {
    this.isCreateState = false;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.PunchCreated);
      this.onGetDataPunch(
        this.currentPageNumber,
        this.currentPageSize,
        this.currentSortExpression
      );
    }
  };

  //--- Delete item
  onOpenDeleteModal = (id: string) => {
    this.punchDeletionId = id;
    this.isDeleteState = true;
  };

  onDeleteConfirm = (isConfirm: boolean) => {
    if (!isConfirm) {
      this.isDeleteState = false;
      return;
    }

    if (isConfirm && this.punchDeletionId) {
      this.clientState.isBusy = true;

      this.dataPunchService.deletePunch(this.punchDeletionId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.punchDeletionId = null;
          this.isDeleteState = false;
          this.authErrorHandler.handleSuccess(Constants.PunchDeleted);
          this.onGetDataPunch(
            this.currentPageNumber,
            this.currentPageSize,
            this.currentSortExpression
          );
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.punchDeletionId = null;
          this.isDeleteState = false;
          this.authErrorHandler.handleError(err.message);
        },
      });
    }
  };

  //--- Import
  onOpenImportModal = () => {
    this.isImportState = true;
  };

  onSuccessImportModal = (isConfirm: boolean) => {
    this.isImportState = false;
    if (isConfirm) {
      this.onCancelLookup();
      this.authErrorHandler.handleSuccess(Constants.PunchImported);
      this.onGetDataPunch(
        Configs.DefaultPageNumber,
        Configs.DefaultPageSize,
        "PunchNo desc"
      );
    }
  };

  onExportExcel = () => {
    this.clientState.isBusy = true;
    this.exportPunchModel.projectKey = this.projectKey;
    this.exportPunchModel.module = "PunchItem";
    this.exportPunchModel.filter = this.punchFilterCode;
    this.exportPunchModel.sortExpression = this.punchSorting;
    this.dataPunchService.exportToExcel(this.exportPunchModel).subscribe(
      (res) => {
        this.exportModel = res ? <ExportModel>{ ...res } : null;
        this.onSaveFile();
        this.authErrorHandler.handleSuccess(Constants.PunchExported);
        this.clientState.isBusy = false;
      },
      (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      }
    );
  };

  onCancelLookup() {
    this.punchFilterCode = null;
  }

  onRefreshData() {
    this.onCancelLookup();
    this.onGetDataPunch();
  }

  onSaveFile() {
    if (this.exportModel == undefined || this.exportModel == null) return;

    var bytes = this.base64ToArrayBuffer(this.exportModel.fileContent);
    var blob = new Blob([bytes], { type: this.exportModel.contentType });

    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    var edge = ua.indexOf("Edge");
    if (
      msie > 0 ||
      edge > 0 ||
      !!navigator.userAgent.match(/Trident.*rv\:11\./)
    ) {
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
      this.punchSorting = sortExpressionData;
      this.onGetDataPunch(
        this.currentPageNumber,
        this.currentPageSize,
        sortExpressionData
      );
    }
  }

  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
  };

  onShowDrawings = (drawings: DrawingLookUpModel[]) => {
    this.drawingLookUpModel = drawings;
    this.isShowDrawings = true;
  };

  onConfirmDrawings = (isSuccess: boolean) => {
    this.isShowDrawings = isSuccess;
    this.drawingLookUpModel = [];
  };

  onShowImages = (images: ImageLookUp[]) => {
    this.imageLookUpModel = images;
    this.isOpenImages = true;
  };

  onConfirmImages = (isSuccess: boolean) => {
    this.isOpenImages = isSuccess;
    this.imageLookUpModel = [];
  };
}
