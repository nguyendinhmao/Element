import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { DataChangeTypeModel, UpdationDataChangeTypeModel } from 'src/app/shared/models/data-tab/data-change-type.model';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { EditChangeTypeComponent } from './edit-data-change-type/edit-change-type.component';
import { ClientState, AuthErrorHandler } from 'src/app/shared/services';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { Constants, Configs } from 'src/app/shared/common';
import { DataChangeTypeService } from "src/app/shared/services/api/data-tab/data-changetype.service";
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'data-change-type',
    templateUrl: './data-change-type.component.html'
})
export class DataChangeTypeComponent implements OnInit {
    @Input() visible: boolean;
    @Input() projectId: string;

    isCreateState: boolean;
    isEditState: boolean;
    isDeleteState: boolean;
    isImportState: boolean;
    changeTypeIdEditing: string;
    changeTypeDeletionId: string;
    changeTypeCount: number = 0;
    changeTypeFilterCode: string;
    changeTypeSorting: string;
    isFilter: boolean = false;
    isCollapse: boolean = false;
    isHaveData: boolean = false;
    isToggleDropdown: boolean = false;

    changeTypeEditingId: string;

    dataChangeTypeModels: DataChangeTypeModel[] = [];
    exportChangeTypeModel: ExportParamModel = new ExportParamModel();
    exportModel: ExportModel = new ExportModel();
    updationModel: UpdationDataChangeTypeModel = new UpdationDataChangeTypeModel();

    dataSource: MatTableDataSource<DataChangeTypeModel>;
    displayedColumns: string[] = ['type', 'description', 'edit', 'delete'];
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('editView', { static: true }) editView: EditChangeTypeComponent;

    currentPageNumber: number;
    currentPageSize: number;
    currentSortExpression: string;

    defaultSortOrder: string = "Type asc";
    sub: Subscription;
    projectKey: string;

    constructor(
        public clientState: ClientState,
        private dataChangeTypeService: DataChangeTypeService,
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
        this.onGetListDataChangeType();
        this.changeTypeIdEditing = null;
    }

    onCollapse = () => {
        this.isCollapse = !this.isCollapse;
    }

    onGetListDataChangeType(pageNumber?: number, pageSize?: number, sortExpression?: string, changeType?: string) {
        this.isToggleDropdown = false;
        this.clientState.isBusy = true;

        if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
        if (pageSize > 0) this.currentPageSize = pageSize;
        if (sortExpression) this.currentSortExpression = sortExpression;
        if (this.changeTypeFilterCode) changeType = this.changeTypeFilterCode.trim();

        this.dataChangeTypeService.getDataChangeType(pageNumber || 1, pageSize || 50, this.projectKey, sortExpression || this.defaultSortOrder, changeType || "").subscribe(res => {
            this.dataChangeTypeModels = res.items ? <DataChangeTypeModel[]>[...res.items] : [];
            if (this.dataChangeTypeModels.length > 0) this.isHaveData = true;
            this.dataSource = new MatTableDataSource(this.dataChangeTypeModels);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.changeTypeCount = res.totalItemCount;

            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }

    onOpenCreateModal = () => {
        this.isCreateState = true;
    }

    onOpenEditModal = (orderId: string) => {
        this.isEditState = true;
        this.changeTypeEditingId = orderId;
    }

    onSuccessCreateModal = (isSuccess: boolean) => {
        this.isCreateState = false;
        if (isSuccess) {
            this.authErrorHandler.handleSuccess(Constants.ChangeTypeCreated);
            this.onGetListDataChangeType(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        }
    }

    onSuccessEditModal = (isSuccess: boolean) => {
        this.isEditState = false;
        this.changeTypeIdEditing = null;
        if (isSuccess) {
            this.authErrorHandler.handleSuccess(Constants.ChangeTypeUpdated);
            this.onGetListDataChangeType(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        }
    }

    //--- Delete item
    onOpenDeleteModal = (id: string) => {
        this.changeTypeDeletionId = id;
        this.isDeleteState = true;
    }

    onDeleteConfirm = (isConfirm: boolean) => {
        if (!isConfirm) {
            this.isDeleteState = false;
            return;
        }

        if (isConfirm && this.changeTypeDeletionId) {
            this.clientState.isBusy = true;

            this.dataChangeTypeService.deleteChangeType(this.changeTypeDeletionId).subscribe({
                complete: () => {
                    this.clientState.isBusy = false;
                    this.changeTypeDeletionId = null;
                    this.isDeleteState = false;
                    this.authErrorHandler.handleSuccess(Constants.ChangeTypeDeleted);
                    this.onGetListDataChangeType(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
                },
                error: (err: ApiError) => {
                    this.clientState.isBusy = false;
                    this.changeTypeDeletionId = null;
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
            this.authErrorHandler.handleSuccess(Constants.ChangeTypeImported);
            this.onGetListDataChangeType(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortOrder || "Type asc");
        }
    }

    onExportExcel = () => {
        this.clientState.isBusy = true;
        this.exportChangeTypeModel.module = "ChangeType";
        this.exportChangeTypeModel.filter = this.changeTypeFilterCode;
        this.exportChangeTypeModel.sortExpression = this.changeTypeSorting;
        this.dataChangeTypeService.exportToExcel(this.exportChangeTypeModel).subscribe(res => {
            this.exportModel = res ? <ExportModel>{ ...res } : null;
            this.onSaveFile();
            this.authErrorHandler.handleSuccess(Constants.ChangeTypeExported);
            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }

    onCancelLookup() {
        this.changeTypeFilterCode = null;
    }

    onRefreshData() {
        this.onCancelLookup();
        this.onGetListDataChangeType();
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
            this.changeTypeSorting = sortExpressionData;
            this.onGetListDataChangeType(this.currentPageNumber, this.currentPageSize, sortExpressionData);
        }
    }

    toggleDropdown = () => {
        this.isToggleDropdown = !this.isToggleDropdown;
    }
}
