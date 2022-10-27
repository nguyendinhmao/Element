import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { DataJobCardModel, UpdateJobCardModel } from 'src/app/shared/models/data-tab/data-jobcard.model';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { EditJobCardComponent } from './edit-data-jobcard/edit-jobcard.component';
import { ClientState, AuthErrorHandler } from 'src/app/shared/services';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { Constants, Configs } from 'src/app/shared/common';
import { DataJobCardService } from 'src/app/shared/services/api/data-tab/data-jobcard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'data-jobcard',
  templateUrl: './data-jobcard.component.html'
})
export class DataJobCardComponent implements OnInit {
  @Input() visible: boolean;
  @Input() projectId: string;

  isCreateState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;
  isImportState: boolean;
  jobcardIdEditing: string;
  jobcardDeletionId: string;
  jobcardCount: number = 0;
  jobcardFilterCode: string;
  jobcardSorting: string;

  isFilter: boolean = false;
  isCollapse: boolean = false;
  isHaveData: boolean = false;
  isToggleDropdown: boolean = false;

  dataJobCardModels: DataJobCardModel[] = [];
  exportJobCardModel: ExportParamModel = new ExportParamModel();
  exportModel: ExportModel = new ExportModel();
  updationModel: UpdateJobCardModel = new UpdateJobCardModel();

  dataSource: MatTableDataSource<DataJobCardModel>;
  displayedColumns: string[] = ['jobCardNo', 'jobCardName', 'workPackNo', 'edit', 'delete'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('editView', { static: true }) editView: EditJobCardComponent;

  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;

  defaultSortJobCard: string = "JobCardNo asc";
  sub: Subscription;
  projectKey: string;

  constructor(
    public clientState: ClientState,
    private dataJobCardService: DataJobCardService,
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

  ngOnInit(): void {
    this.onGetListDataJobCard();
    this.jobcardIdEditing = null;
  }

  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  }

  onGetListDataJobCard(pageNumber?: number, pageSize?: number, sortExpression?: string, jobcardNo?: string) {
    this.isToggleDropdown = false;
    this.clientState.isBusy = true;

    if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;
    if (this.jobcardFilterCode) jobcardNo = this.jobcardFilterCode.trim();

    this.dataJobCardService.getDataJobCard(pageNumber || 1, pageSize || 50, this.projectKey, sortExpression || this.defaultSortJobCard, jobcardNo || "").subscribe(res => {
      this.dataJobCardModels = res.items ? <DataJobCardModel[]>[...res.items] : [];
      if (this.dataJobCardModels.length > 0) this.isHaveData = true;
      this.dataSource = new MatTableDataSource(this.dataJobCardModels);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.jobcardCount = res.totalItemCount;

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onOpenEditModal = (jobcardId: string) => {
    this.isEditState = true;
    this.clientState.isBusy = true;
    this.dataJobCardService.getJobCardId(jobcardId).subscribe(res => {
      this.updationModel = res ? <UpdateJobCardModel>{ ...res } : null;
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
    this.jobcardIdEditing = null;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.JobCardUpdated);
      this.onGetListDataJobCard(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }
  onSuccessCreateModal = (isSuccess: boolean) => {
    this.isCreateState = false;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.JobCardCreated);
      this.onGetListDataJobCard(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  //--- Delete item
  onOpenDeleteModal = (id: string) => {
    this.jobcardDeletionId = id;
    this.isDeleteState = true;
  }

  onDeleteConfirm = (isConfirm: boolean) => {
    if (!isConfirm) {
      this.isDeleteState = false;
      return;
    }

    if (isConfirm && this.jobcardDeletionId) {
      this.clientState.isBusy = true;

      this.dataJobCardService.deleteJobCard(this.jobcardDeletionId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.jobcardDeletionId = null;
          this.isDeleteState = false;
          this.authErrorHandler.handleSuccess(Constants.JobCardDeleted);
          this.onGetListDataJobCard(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.jobcardDeletionId = null;
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
      this.authErrorHandler.handleSuccess(Constants.JobCardImported);
      this.onGetListDataJobCard(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortJobCard || "JobCardNo asc");
    }
  }

  onExportExcel = () => {
    this.clientState.isBusy = true;
    this.exportJobCardModel.module = "JobCard";
    this.exportJobCardModel.filter = this.jobcardFilterCode;
    this.exportJobCardModel.sortExpression = this.jobcardSorting;
    this.dataJobCardService.exportToExcel(this.exportJobCardModel).subscribe(res => {
      this.exportModel = res ? <ExportModel>{ ...res } : null;
      this.onSaveFile();
      this.authErrorHandler.handleSuccess(Constants.JobCardExported);
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onCancelLookup() {
    this.jobcardFilterCode = null;
  }

  onRefreshData() {
    this.onCancelLookup();
    this.onGetListDataJobCard();
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
      this.jobcardSorting = sortExpressionData;
      this.onGetListDataJobCard(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }

  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
  }
}
