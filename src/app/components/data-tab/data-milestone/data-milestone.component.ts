import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { DataMilestoneService } from 'src/app/shared/services/api/data-tab/data-milestone.service';
import { EditDataMilestoneComponent } from './edit-data-milestone/edit-data-milestone.component';
import { Configs } from 'src/app/shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { DataMilestoneModel } from 'src/app/shared/models/data-tab/data-milestone.model';
import { Constants } from 'src/app/shared/common';

@Component({
  selector: 'data-milestone',
  templateUrl: './data-milestone.component.html'
})

export class DataMilestoneComponent implements OnInit {
  @Input() visible: boolean;
  @Input() projectKey: string;
  @Input() projectId: string;

  isCreateState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;
  isImportState: boolean;
  milestoneIdEditing: string;
  milestoneDeletionId: string;
  milestoneCount: number = 0;
  milestoneFilterName: string;
  milestoneSorting: string;
  isFilter: boolean = false;
  isCollapse: boolean = false;
  isHaveData: boolean = false;
  isToggleDropdown: boolean = false;

  dataMilestoneModels: DataMilestoneModel[] = [];
  exportMilestoneModel: ExportParamModel = new ExportParamModel();
  exportModel: ExportModel = new ExportModel();

  dataSource: MatTableDataSource<DataMilestoneModel>;
  displayedColumns: string[] = ['milestoneName', 'description', 'phase', 'projectKey', 'dateStartPlanned', 'dateEndPlanned', 'dateStartActual', 'dateEndActual', 'edit', 'delete'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('editView', { static: true }) editView: EditDataMilestoneComponent;

  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;

  defaultSortMilestone: string = "MilestoneName desc";

  constructor(
    public clientState: ClientState,
    private dataMilestoneService: DataMilestoneService,
    private authErrorHandler: AuthErrorHandler,
  ) { }

  public ngOnInit() {
    this.onGetDataMilestone(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortMilestone);
  }

  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  }

  //--- Get data Milestone
  onGetDataMilestone = (pageNumber?: number, pageSize?: number, sortExpression?: string, milestoneName?: string) => {
    this.isToggleDropdown = false;
    this.clientState.isBusy = true;

    if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;
    if (this.milestoneFilterName) milestoneName = this.milestoneFilterName;

    this.dataMilestoneService.getDataMilestone(this.projectId, pageNumber || 1, pageSize || 50, sortExpression || this.defaultSortMilestone, milestoneName || "").subscribe(res => {
      this.dataMilestoneModels = res.items ? <DataMilestoneModel[]>[...res.items] : [];
      if (this.dataMilestoneModels.length > 0) {
        this.isHaveData = true;
        this.dataMilestoneModels.map(item => {
          item.dtStartPlanned = new Date(item.dateStartPlanned)
          item.dtEndPlanned = new Date(item.dateEndPlanned)
          item.dtStartActual = new Date(item.dateStartActual)
          item.dtEndActual = new Date(item.dateEndActual)
        })
      }
      this.dataSource = new MatTableDataSource(this.dataMilestoneModels);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.milestoneCount = res.totalItemCount;

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Edit item
  onOpenEditModal = (milestoneId: string) => {
    this.isEditState = true;
    this.milestoneIdEditing = milestoneId;
  }

  onOpenCreateModal = () => {
    this.isCreateState = true;
  }

  onSuccessEditModal = (isSuccess: boolean) => {
    this.isEditState = false;
    this.milestoneIdEditing = null;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.MilestoneUpdated);
      this.onGetDataMilestone(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  onSuccessCreateModal = (isSuccess: boolean) => {
    this.isCreateState = false;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.MilestoneCreated);
      this.onGetDataMilestone(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  //--- Delete item
  onOpenDeleteModal = (id: string) => {
    this.milestoneDeletionId = id;
    this.isDeleteState = true;
  }

  onDeleteConfirm = (isConfirm: boolean) => {
    if (!isConfirm) {
      this.isDeleteState = false;
      return;
    }

    if (isConfirm && this.milestoneDeletionId) {
      this.clientState.isBusy = true;

      this.dataMilestoneService.deleteMilestone(this.milestoneDeletionId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.milestoneDeletionId = null;
          this.isDeleteState = false;
          this.authErrorHandler.handleSuccess(Constants.MilestoneDeleted);
          this.onGetDataMilestone(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.milestoneDeletionId = null;
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
      this.authErrorHandler.handleSuccess(Constants.MilestoneImported);
      this.onGetDataMilestone(Configs.DefaultPageNumber, Configs.DefaultPageSize, "MilestoneName desc");
    }
  }

  onExportExcel = () => {
    this.clientState.isBusy = true;
    this.exportMilestoneModel.module = "Milestone";
    this.exportMilestoneModel.projectId = this.projectId;
    this.exportMilestoneModel.filter = this.milestoneFilterName;
    this.exportMilestoneModel.sortExpression = this.milestoneSorting;
    this.dataMilestoneService.exportToExcel(this.exportMilestoneModel).subscribe(res => {
      this.exportModel = res ? <ExportModel>{ ...res } : null;
      this.onSaveFile();
      this.authErrorHandler.handleSuccess(Constants.MilestoneExported);
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onCancelLookup() {
    this.milestoneFilterName = null;
  }

  onRefreshData() {
    this.onCancelLookup();
    this.onGetDataMilestone();
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
      this.milestoneSorting = sortExpressionData;
      this.onGetDataMilestone(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }

  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
  }
}
