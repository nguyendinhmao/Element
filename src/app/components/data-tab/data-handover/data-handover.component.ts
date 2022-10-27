import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { DataHandoverModel, UpdateHandoverModel } from 'src/app/shared/models/data-tab/data-handover.model';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { EditHandoverComponent } from './edit-data-handover/edit-handover.component';
import { ClientState, AuthErrorHandler } from 'src/app/shared/services';
import { DataHandoverService } from 'src/app/shared/services/api/data-tab/data-handover.service';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { Constants, Configs } from 'src/app/shared/common';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'data-handover',
    templateUrl: './data-handover.component.html'
})
export class DataHandoverComponent implements OnInit {
    @Input() visible: boolean;

    isEditState: boolean;
    isDeleteState: boolean;
    isImportState: boolean;
    handoverIdEditing: string;
    handoverDeletionId: string;
    handoverCount: number = 0;
    handoverFilterCode: string;
    handoverSorting: string;

    isFilter: boolean = false;
    isCollapse: boolean = false;
    isHaveData: boolean = false;
    isToggleDropdown: boolean = false;

    projectKey: string;
    dataHandoverModels: DataHandoverModel[] = [];
    exportHandoverModel: ExportParamModel = new ExportParamModel();
    exportModel: ExportModel = new ExportModel();
    updationModel: UpdateHandoverModel = new UpdateHandoverModel();
    sub: Subscription;
    dataSource: MatTableDataSource<DataHandoverModel>;
    displayedColumns: string[] = ['handoverNo', 'handoverName', 'milestoneName', 'disciplineCode', 'system', 'subSystem', 'complete', 'edit', 'delete'];
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('editView', { static: true }) editView: EditHandoverComponent;

    currentPageNumber: number;
    currentPageSize: number;
    currentSortExpression: string;

    defaultSortHandover: string = "HandoverNo asc";

    constructor(
        public clientState: ClientState,
        private dataHandoverService: DataHandoverService,
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
    ngOnInit(): void {
        this.onGetListDataHandover();
        this.handoverIdEditing = null;
    }

    onCollapse = () => {
        this.isCollapse = !this.isCollapse;
    }

    onGetListDataHandover(pageNumber?: number, pageSize?: number, sortExpression?: string, handoverNo?: string) {
        this.isToggleDropdown = false;
        this.clientState.isBusy = true;

        if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
        if (pageSize > 0) this.currentPageSize = pageSize;
        if (sortExpression) this.currentSortExpression = sortExpression;
        if (this.handoverFilterCode) handoverNo = this.handoverFilterCode.trim();

        this.dataHandoverService.getDataHandover(this.projectKey, pageNumber || Configs.DefaultPageNumber, pageSize || Configs.DefaultPageSize, sortExpression || this.defaultSortHandover, handoverNo || "").subscribe(res => {
            this.dataHandoverModels = res.items ? <DataHandoverModel[]>[...res.items] : [];
            if (this.dataHandoverModels.length > 0) this.isHaveData = true;
            this.dataSource = new MatTableDataSource(this.dataHandoverModels);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.handoverCount = res.totalItemCount;

            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }
    onOpenEditModal = (handoverId: string) => {
        this.handoverIdEditing = handoverId;
        this.isEditState = true;
    }

    onSuccessEditModal = (isSuccess: boolean) => {
        this.isEditState = false;
        this.handoverIdEditing = null;
        if (isSuccess) {
            this.authErrorHandler.handleSuccess(Constants.HandoverUpdated);
            this.onGetListDataHandover(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        }
    }

    //--- Delete item
    onOpenDeleteModal = (id: string) => {
        this.handoverDeletionId = id;
        this.isDeleteState = true;
    }

    onDeleteConfirm = (isConfirm: boolean) => {
        if (!isConfirm) {
            this.isDeleteState = false;
            return;
        }

        if (isConfirm && this.handoverDeletionId) {
            this.clientState.isBusy = true;

            this.dataHandoverService.deleteHandover(this.handoverDeletionId).subscribe({
                complete: () => {
                    this.clientState.isBusy = false;
                    this.handoverDeletionId = null;
                    this.isDeleteState = false;
                    this.authErrorHandler.handleSuccess(Constants.HandoverDeleted);
                    this.onGetListDataHandover(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
                },
                error: (err: ApiError) => {
                    this.clientState.isBusy = false;
                    this.handoverDeletionId = null;
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
            this.authErrorHandler.handleSuccess(Constants.HandoverImported);
            this.onGetListDataHandover(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortHandover || "HandoverNo asc");
        }
    }

    onExportExcel = () => {
        this.clientState.isBusy = true;
        this.exportHandoverModel.module = "Handover";
        this.exportHandoverModel.filter = this.handoverFilterCode;
        this.exportHandoverModel.sortExpression = this.handoverSorting;
        this.dataHandoverService.exportToExcel(this.exportHandoverModel).subscribe(res => {
            this.exportModel = res ? <ExportModel>{ ...res } : null;
            this.onSaveFile();
            this.authErrorHandler.handleSuccess(Constants.HandoverExported);
            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }

    onCancelLookup() {
        this.handoverFilterCode = null;
    }

    onRefreshData() {
        this.onCancelLookup();
        this.onGetListDataHandover();
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
            this.handoverSorting = sortExpressionData;
            this.onGetListDataHandover(this.currentPageNumber, this.currentPageSize, sortExpressionData);
        }
    }

    toggleDropdown = () => {
        this.isToggleDropdown = !this.isToggleDropdown;
    }
}