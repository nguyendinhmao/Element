import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { DataPunchListService } from 'src/app/shared/services/api/data-tab/data-punchlist.service';
import { EditDataPunchListComponent } from './edit-data-punchlist/edit-data-punchlist.component';
import { Configs } from 'src/app/shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { DataPunchListModel, UpdatePunchListModel } from 'src/app/shared/models/data-tab/data-punchlist.model';
import { Constants } from 'src/app/shared/common';

@Component({
    selector: 'data-punchlist',
    templateUrl: './data-punchlist.component.html'
})

export class DataPunchListComponent implements OnInit {
    @Input() visible: boolean;

    isEditState: boolean;
    isDeleteState: boolean;
    isImportState: boolean;
    punchListIdEditing: string;
    punchListDeletionId: string;
    punchListCount: number = 0;
    punchListFilterCode: string;
    punchListSorting: string;
    isFilter: boolean = false;
    isCollapse: boolean = false;
    isHaveData: boolean = false;
    isToggleDropdown: boolean = false;

    dataPunchListModels: DataPunchListModel[] = [];
    exportPunchListModel: ExportParamModel = new ExportParamModel();
    exportModel: ExportModel = new ExportModel();

    dataSource: MatTableDataSource<DataPunchListModel>;
    displayedColumns: string[] = ['punchListNo', 'punchListName', 'disciplineCode', 'milestoneName', 'dateCompleted', 'edit', 'delete'];
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('editView', { static: true }) editView: EditDataPunchListComponent;

    currentPageNumber: number;
    currentPageSize: number;
    currentSortExpression: string;

    defaultSortPunchList: string = "PunchListNo desc";
    updationModel: UpdatePunchListModel = new UpdatePunchListModel();
    constructor(
        public clientState: ClientState,
        private dataPunchListService: DataPunchListService,
        private authErrorHandler: AuthErrorHandler
    ) { }

    public ngOnInit() {
        this.onGetDataPunchList(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortPunchList);
    }

    onCollapse = () => {
        this.isCollapse = !this.isCollapse;
    }

    //--- Get data PunchList
    onGetDataPunchList = (pageNumber?: number, pageSize?: number, sortExpression?: string, punchListNo?: string) => {
        this.isToggleDropdown = false;
        this.clientState.isBusy = true;

        if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
        if (pageSize > 0) this.currentPageSize = pageSize;
        if (sortExpression) this.currentSortExpression = sortExpression;
        if (this.punchListFilterCode) punchListNo = this.punchListFilterCode.trim();

        this.dataPunchListService.getDataPunchList(pageNumber || 1, pageSize || 50, sortExpression || this.defaultSortPunchList, punchListNo || "").subscribe(res => {
            this.dataPunchListModels = res.items ? <DataPunchListModel[]>[...res.items] : [];
            if (this.dataPunchListModels.length > 0) {
                this.isHaveData = true;
                this.dataPunchListModels.map(item => {
                    item.dtCompleted = new Date(item.dateCompleted)
                })
            }
            this.dataSource = new MatTableDataSource(this.dataPunchListModels);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.punchListCount = res.totalItemCount;

            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }

    //--- Edit item
    onOpenEditModal = (punchListId: string) => {
        this.isEditState = true;
        this.punchListIdEditing = punchListId;
    }

    onSuccessEditModal = (isSuccess: boolean) => {
        this.isEditState = false;
        this.punchListIdEditing = null;
        if (isSuccess) {
            this.authErrorHandler.handleSuccess(Constants.PunchListUpdated);
            this.onGetDataPunchList(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        }
    }

    //--- Delete item
    onOpenDeleteModal = (id: string) => {
        this.punchListDeletionId = id;
        this.isDeleteState = true;
    }

    onDeleteConfirm = (isConfirm: boolean) => {
        if (!isConfirm) {
            this.isDeleteState = false;
            return;
        }

        if (isConfirm && this.punchListDeletionId) {
            this.clientState.isBusy = true;

            this.dataPunchListService.deletePunchList(this.punchListDeletionId).subscribe({
                complete: () => {
                    this.clientState.isBusy = false;
                    this.punchListDeletionId = null;
                    this.isDeleteState = false;
                    this.authErrorHandler.handleSuccess(Constants.PunchListDeleted);
                    this.onGetDataPunchList(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
                },
                error: (err: ApiError) => {
                    this.clientState.isBusy = false;
                    this.punchListDeletionId = null;
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
            this.authErrorHandler.handleSuccess(Constants.PunchListImported);
            this.onGetDataPunchList(Configs.DefaultPageNumber, Configs.DefaultPageSize, "PunchListNo desc");
        }
    }

    onExportExcel = () => {
        this.clientState.isBusy = true;
        this.exportPunchListModel.module = "PunchList";
        this.exportPunchListModel.filter = this.punchListFilterCode;
        this.exportPunchListModel.sortExpression = this.punchListSorting;
        this.dataPunchListService.exportToExcel(this.exportPunchListModel).subscribe(res => {
            this.exportModel = res ? <ExportModel>{ ...res } : null;
            this.onSaveFile();
            this.authErrorHandler.handleSuccess(Constants.PunchListExported);
            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }

    onCancelLookup() {
        this.punchListFilterCode = null;
    }

    onRefreshData() {
        this.onCancelLookup();
        this.onGetDataPunchList();
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
            this.punchListSorting = sortExpressionData;
            this.onGetDataPunchList(this.currentPageNumber, this.currentPageSize, sortExpressionData);
        }
    }

    toggleDropdown = () => {
        this.isToggleDropdown = !this.isToggleDropdown;
    }
}
