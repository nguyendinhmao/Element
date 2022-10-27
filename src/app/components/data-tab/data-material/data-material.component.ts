import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { DataMaterialService } from 'src/app/shared/services/api/data-tab/data-material.service';
import { EditDataMaterialComponent } from './edit-data-material/edit-data-material.component';
import { Configs } from 'src/app/shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { DataMaterialModel } from 'src/app/shared/models/data-tab/data-material.model';
import { Constants } from 'src/app/shared/common';

@Component({
    selector: 'data-material',
    templateUrl: './data-material.component.html'
})

export class DataMaterialComponent implements OnInit {
    @Input() visible: boolean;
    @Input() projectKey: string;
    @Input() projectId: string;

    isCreateState: boolean;
    isEditState: boolean;
    isDeleteState: boolean;
    isImportState: boolean;
    materialIdEditing: string;
    materialDeletionId: string;
    materialCount: number = 0;
    materialFilterCode: string;
    materialSorting: string;
    isFilter: boolean = false;
    isCollapse: boolean = false;
    isHaveData: boolean = false;
    isToggleDropdown: boolean = false;

    dataMaterialModels: DataMaterialModel[] = [];
    exportMaterialModel: ExportParamModel = new ExportParamModel();
    exportModel: ExportModel = new ExportModel();

    dataSource: MatTableDataSource<DataMaterialModel>;
    displayedColumns: string[] = ['materialCode', 'description', 'quantity', 'edit', 'delete'];
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('editView', { static: true }) editView: EditDataMaterialComponent;

    currentPageNumber: number;
    currentPageSize: number;
    currentSortExpression: string;

    defaultSortMaterial: string = "MaterialCode desc";

    constructor(
        public clientState: ClientState,
        private dataMaterialService: DataMaterialService,
        private authErrorHandler: AuthErrorHandler,
    ) { }

    public ngOnInit() {
        this.onGetDataMaterial(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortMaterial);
    }

    onCollapse = () => {
        this.isCollapse = !this.isCollapse;
    }

    //--- Get data Material
    onGetDataMaterial = (pageNumber?: number, pageSize?: number, sortExpression?: string, materialCode?: string) => {
        this.isToggleDropdown = false;
        this.clientState.isBusy = true;

        if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
        if (pageSize > 0) this.currentPageSize = pageSize;
        if (sortExpression) this.currentSortExpression = sortExpression;
        if (this.materialFilterCode) {
            this.materialFilterCode = this.materialFilterCode.trim();
            materialCode = this.materialFilterCode;
        }

        this.dataMaterialService.getDataMaterial(pageNumber || 1, pageSize || 50, this.projectKey, sortExpression || this.defaultSortMaterial, materialCode || "").subscribe(res => {
            this.dataMaterialModels = res.items ? <DataMaterialModel[]>[...res.items] : [];
            if (this.dataMaterialModels.length > 0) {
                this.isHaveData = true;
            }
            this.dataSource = new MatTableDataSource(this.dataMaterialModels);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.materialCount = res.totalItemCount;

            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }

    //--- Edit item
    onOpenEditModal = (materialId: string) => {
        this.isEditState = true;
        this.materialIdEditing = materialId;
    }

    onOpenCreateModal = () => {
        this.isCreateState = true;
        console.log('open create modal');
    }

    onSuccessEditModal = (isSuccess: boolean) => {
        this.isEditState = false;
        this.materialIdEditing = null;
        if (isSuccess) {
            this.authErrorHandler.handleSuccess(Constants.MaterialUpdated);
            this.onGetDataMaterial(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
        }
    }

    onSuccessCreateModal = (isSuccess: boolean) => {
      this.isCreateState = false;
      this.materialIdEditing = null;
      if (isSuccess) {
        this.authErrorHandler.handleSuccess(Constants.MaterialCreated);
        this.onGetDataMaterial(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

    //--- Delete item
    onOpenDeleteModal = (id: string) => {
        this.materialDeletionId = id;
        this.isDeleteState = true;
    }

    onDeleteConfirm = (isConfirm: boolean) => {
        if (!isConfirm) {
            this.isDeleteState = false;
            return;
        }

        if (isConfirm && this.materialDeletionId) {
            this.clientState.isBusy = true;

            this.dataMaterialService.deleteMaterial(this.materialDeletionId).subscribe({
                complete: () => {
                    this.clientState.isBusy = false;
                    this.materialDeletionId = null;
                    this.isDeleteState = false;
                    this.authErrorHandler.handleSuccess(Constants.MaterialDeleted);
                    this.onGetDataMaterial(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
                },
                error: (err: ApiError) => {
                    this.clientState.isBusy = false;
                    this.materialDeletionId = null;
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
            this.authErrorHandler.handleSuccess(Constants.MaterialImported);
            this.onGetDataMaterial(Configs.DefaultPageNumber, Configs.DefaultPageSize, "MaterialCode desc");
        }
    }

    onExportExcel = () => {
        this.clientState.isBusy = true;
        this.exportMaterialModel.module = "Material";
        this.exportMaterialModel.projectId = this.projectId;
        this.exportMaterialModel.filter = this.materialFilterCode;
        this.exportMaterialModel.sortExpression = this.materialSorting;
        this.dataMaterialService.exportToExcel(this.exportMaterialModel).subscribe(res => {
            this.exportModel = res ? <ExportModel>{ ...res } : null;
            this.onSaveFile();
            this.authErrorHandler.handleSuccess(Constants.MaterialExported);
            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }

    onCancelLookup() {
        this.materialFilterCode = null;
    }

    onRefreshData() {
        this.onCancelLookup();
        this.onGetDataMaterial();
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
            this.materialSorting = sortExpressionData;
            this.onGetDataMaterial(this.currentPageNumber, this.currentPageSize, sortExpressionData);
        }
    }

    toggleDropdown = () => {
        this.isToggleDropdown = !this.isToggleDropdown;
    }
}
