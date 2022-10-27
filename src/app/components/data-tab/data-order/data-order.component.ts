import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { DataOrderModel, UpdationDataOrderModel } from 'src/app/shared/models/data-tab/data-order.model';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { EditOrderComponent } from './edit-data-order/edit-order.component';
import { ClientState, AuthErrorHandler } from 'src/app/shared/services';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { Constants, Configs } from 'src/app/shared/common';
import { DataOrderService } from 'src/app/shared/services/api/data-tab/data-order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'data-order',
    templateUrl: './data-order.component.html'
})
export class DataOrderComponent implements OnInit {
    @Input() visible: boolean;
    @Input() projectId: string;
    isCreateState: boolean;
    isEditState: boolean;
    isDeleteState: boolean;
    isImportState: boolean;
    orderIdEditing: string;
    orderDeletionId: string;
    orderCount: number = 0;
    orderFilterCode: string;
    orderSorting: string;
    isFilter: boolean = false;
    isCollapse: boolean = false;
    isHaveData: boolean = false;
    isToggleDropdown: boolean = false;

    orderEditingId: string;

    dataOrderModels: DataOrderModel[] = [];
    exportOrderModel: ExportParamModel = new ExportParamModel();
    exportModel: ExportModel = new ExportModel();
    updationModel: UpdationDataOrderModel = new UpdationDataOrderModel();

    dataSource: MatTableDataSource<DataOrderModel>;
    displayedColumns: string[] = ['orderNo', 'materialCode', 'quantity', 'edit', 'delete'];
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('editView', { static: true }) editView: EditOrderComponent;

    currentPageNumber: number;
    currentPageSize: number;
    currentSortExpression: string;
    sub: Subscription;
    projectKey: string;

    defaultSortOrder: string = "OrderNo asc";

    constructor(
        public clientState: ClientState,
        private dataOrderService: DataOrderService,
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
        this.onGetListDataOrder();
        this.orderIdEditing = null;
    }

    onCollapse = () => {
        this.isCollapse = !this.isCollapse;
    }

    onGetListDataOrder(pageNumber?: number, pageSize?: number, sortExpression?: string, orderNo?: string) {
        this.isToggleDropdown = false;
        this.clientState.isBusy = true;

        if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
        if (pageSize > 0) this.currentPageSize = pageSize;
        if (sortExpression) this.currentSortExpression = sortExpression;
        if (this.orderFilterCode) orderNo = this.orderFilterCode.trim();

        this.dataOrderService.getDataOrder(pageNumber || 1, pageSize || 50, this.projectKey, sortExpression || this.defaultSortOrder, orderNo || "").subscribe(res => {
            this.dataOrderModels = res.items ? <DataOrderModel[]>[...res.items] : [];
            if (this.dataOrderModels.length > 0) this.isHaveData = true;
            this.dataSource = new MatTableDataSource(this.dataOrderModels);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.orderCount = res.totalItemCount;

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
        this.orderEditingId = orderId;
    }

    onSuccessCreateModal = (isSuccess: boolean) => {
        this.isCreateState = false;
        if (isSuccess) {
            this.authErrorHandler.handleSuccess(Constants.OrderCreated);
            this.onGetListDataOrder(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        }
    }
    onSuccessEditModal = (isSuccess: boolean) => {
        this.isEditState = false;
        this.orderIdEditing = null;
        if (isSuccess) {
            this.authErrorHandler.handleSuccess(Constants.OrderUpdated);
            this.onGetListDataOrder(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        }
    }

    //--- Delete item
    onOpenDeleteModal = (id: string) => {
        this.orderDeletionId = id;
        this.isDeleteState = true;
    }

    onDeleteConfirm = (isConfirm: boolean) => {
        if (!isConfirm) {
            this.isDeleteState = false;
            return;
        }

        if (isConfirm && this.orderDeletionId) {
            this.clientState.isBusy = true;

            this.dataOrderService.deleteOrder(this.orderDeletionId).subscribe({
                complete: () => {
                    this.clientState.isBusy = false;
                    this.orderDeletionId = null;
                    this.isDeleteState = false;
                    this.authErrorHandler.handleSuccess(Constants.OrderDeleted);
                    this.onGetListDataOrder(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
                },
                error: (err: ApiError) => {
                    this.clientState.isBusy = false;
                    this.orderDeletionId = null;
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
            this.authErrorHandler.handleSuccess(Constants.OrderImported);
            this.onGetListDataOrder(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortOrder || "OrderNo asc");
        }
    }

    onExportExcel = () => {
        this.clientState.isBusy = true;
        this.exportOrderModel.module = "Order";
        this.exportOrderModel.filter = this.orderFilterCode;
        this.exportOrderModel.sortExpression = this.orderSorting;
        this.dataOrderService.exportToExcel(this.exportOrderModel).subscribe(res => {
            this.exportModel = res ? <ExportModel>{ ...res } : null;
            this.onSaveFile();
            this.authErrorHandler.handleSuccess(Constants.OrderExported);
            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }

    onCancelLookup() {
        this.orderFilterCode = null;
    }

    onRefreshData() {
        this.onCancelLookup();
        this.onGetListDataOrder();
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
            this.orderSorting = sortExpressionData;
            this.onGetListDataOrder(this.currentPageNumber, this.currentPageSize, sortExpressionData);
        }
    }

    toggleDropdown = () => {
        this.isToggleDropdown = !this.isToggleDropdown;
    }
}
