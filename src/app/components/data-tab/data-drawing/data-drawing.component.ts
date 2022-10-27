import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { DataDrawingService } from 'src/app/shared/services/api/data-tab/data-drawing.service';
import { EditDataDrawingComponent } from './edit-data-drawing/edit-data-drawing.component';
import { Configs } from 'src/app/shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { DataDrawingModel } from 'src/app/shared/models/data-tab/data-drawing.model';
import { Constants } from 'src/app/shared/common';

@Component({
    selector: 'data-drawing',
    templateUrl: './data-drawing.component.html',
    styleUrls: ['./data-drawing.component.scss'],
})

export class DataDrawingComponent implements OnInit {
    @Input() visible: boolean;
    @Input() projectKey: string;
    @Input() projectId: string;

    //--- Boolean
    isEditState: boolean;
    isDeleteState: boolean;
    isImportState: boolean;
    isFilter: boolean = false;
    isHaveData: boolean = false;
    isToggleDropdown: boolean = false;
    isAddState = false;
    isUploadFileState = false;

    //--- Variable
    drawingIdEditing: string;
    drawingDeletionId: string;
    drawingCount: number = 0;
    drawingFilterNo: string;
    drawingSorting: string;
    currentPageNumber: number;
    currentPageSize: number;
    currentSortExpression: string;
    defaultSortDrawing: string = "drawingNo desc";

    //--- Model
    dataDrawingModels: DataDrawingModel[] = [];
    exportDrawingModel: ExportParamModel = new ExportParamModel();
    exportModel: ExportModel = new ExportModel();

    //--- Datatable
    dataSource: MatTableDataSource<DataDrawingModel>;
    displayedColumns: string[] = ['drawingNo', 'description', 'revision', 'drawingTypeCode', 'drawingEntry', 'status', 'edit', 'delete'];
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('editView', { static: true }) editView: EditDataDrawingComponent;

    constructor(
        public clientState: ClientState,
        private dataDrawingService: DataDrawingService,
        private authErrorHandler: AuthErrorHandler,
    ) { }

    public ngOnInit() {
        this.onGetDataDrawing(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortDrawing);
    }

    //--- Get data Drawing
    onGetDataDrawing = (pageNumber?: number, pageSize?: number, sortExpression?: string, drawingNo?: string) => {
        this.clientState.isBusy = true;
        this.isToggleDropdown = false;

        if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
        if (pageSize > 0) this.currentPageSize = pageSize;
        if (sortExpression) this.currentSortExpression = sortExpression;
        if (this.drawingFilterNo) {
            this.drawingFilterNo = this.drawingFilterNo.trim()
            drawingNo = this.drawingFilterNo;
        }

        this.dataDrawingService.getDataDrawing(this.projectId, pageNumber || 1, pageSize || 50, sortExpression || this.defaultSortDrawing, drawingNo || "").subscribe(res => {
            this.dataDrawingModels = res.items ? <DataDrawingModel[]>[...res.items] : [];
            if (this.dataDrawingModels.length > 0) {
                this.isHaveData = true;
            }
            this.dataSource = new MatTableDataSource(this.dataDrawingModels);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.drawingCount = res.totalItemCount;

            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }

    //--- Add item
    onOpenAddModal() {
        this.isAddState = true;
    }

    onSuccessAddModal(isSave: boolean) {
        this.isAddState = false;
        if (isSave) {
            this.authErrorHandler.handleSuccess(Constants.DrawingCreated);
            this.onGetDataDrawing(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        }
    }

    //--- Upload file
    onUploadFileModal(drawingId: string) {
        this.isUploadFileState = true;
        this.drawingIdEditing = drawingId;
    }

    onSuccessUploadFileModal = (isUpload: boolean) => {
        this.isUploadFileState = false;
        this.drawingIdEditing = null;
        if (isUpload) {
            this.authErrorHandler.handleSuccess(Constants.DrawingUpdated);
            this.onGetDataDrawing(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        }
    }

    //--- Edit item
    onOpenEditModal = (drawingId: string) => {
        this.isEditState = true;
        this.drawingIdEditing = drawingId;
    }

    onSuccessEditModal = (isSuccess: boolean) => {
        this.isEditState = false;
        this.drawingIdEditing = null;
        if (isSuccess) {
            this.authErrorHandler.handleSuccess(Constants.DrawingUpdated);
            this.onGetDataDrawing(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        }
    }

    //--- Delete item
    onOpenDeleteModal = (id: string) => {
        this.drawingDeletionId = id;
        this.isDeleteState = true;
    }

    onDeleteConfirm = (isConfirm: boolean) => {
        if (!isConfirm) {
            this.isDeleteState = false;
            return;
        }

        if (isConfirm && this.drawingDeletionId) {
            this.clientState.isBusy = true;

            this.dataDrawingService.deleteDrawing(this.drawingDeletionId).subscribe({
                complete: () => {
                    this.clientState.isBusy = false;
                    this.drawingDeletionId = null;
                    this.isDeleteState = false;
                    this.authErrorHandler.handleSuccess(Constants.DrawingDeleted);
                    this.onGetDataDrawing(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
                },
                error: (err: ApiError) => {
                    this.clientState.isBusy = false;
                    this.drawingDeletionId = null;
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
            this.onClearSearch();
            this.authErrorHandler.handleSuccess(Constants.DrawingImported);
            this.onGetDataDrawing(Configs.DefaultPageNumber, Configs.DefaultPageSize, "drawingNo desc");
        }
    }

    onExportExcel = () => {
        this.clientState.isBusy = true;
        this.exportDrawingModel.module = "Drawing";
        this.exportDrawingModel.projectId = this.projectId;
        this.exportDrawingModel.filter = this.drawingFilterNo;
        this.exportDrawingModel.sortExpression = this.drawingSorting;
        this.dataDrawingService.exportToExcel(this.exportDrawingModel).subscribe(res => {
            this.exportModel = res ? <ExportModel>{ ...res } : null;
            this.onSaveFile();
            this.authErrorHandler.handleSuccess(Constants.DrawingExported);
            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }

    //--- Clear search
    onClearSearch() {
        this.drawingFilterNo = null;
    }

    //--- Refresh data
    onRefreshData() {
        this.onClearSearch();
        this.onGetDataDrawing();
    }

    //--- Save file
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
            this.drawingSorting = sortExpressionData;
            this.onGetDataDrawing(this.currentPageNumber, this.currentPageSize, sortExpressionData);
        }
    }

    //--- Toggle Dropdown
    toggleDropdown = () => {
        this.isToggleDropdown = !this.isToggleDropdown;
    }
}
