import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { PreservationAllocationModel } from 'src/app/shared/models/itr-tab/preservation-allocation.model';
import { AuthErrorHandler, ClientState } from 'src/app/shared/services';
import { ITRService } from 'src/app/shared/services/api/itr/itr.service';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { Configs } from 'src/app/shared/common/configs/configs';
import { SelectionModel } from '@angular/cdk/collections';
import { ModuleProjectDefaultModel } from 'src/app/shared/models/module/module.model';
import { JwtTokenHelper } from 'src/app/shared/common/jwt-token-helper/jwt-token-helper';
import { MockPreservationAllocationApi } from 'src/app/shared/mocks/mock.itr-tab';
import { EquipmentLookUpModel } from 'src/app/shared/models/equipment/equipment.model';
import { DataEquipmentService } from 'src/app/shared/services/api/data-tab/data-equipment.service';

@Component({
    selector: 'preservation-allocation',
    templateUrl: './preservation-allocation.component.html'
})

export class PreservationAllocationComponent implements OnInit {
    //--- Boolean
    isAddNewState: boolean;
    isEditState: boolean;
    isDeleteState: boolean;
    isDeleteAllState: boolean;
    isCollapse: boolean = false;
    isToggleDropdown: boolean = false;
    isHaveData: boolean = false;
    isEnableDeleteAll: boolean = true;
    isEquipmentLoadingSelect: boolean;

    //--- Variables
    currentPageNumber: number;
    currentPageSize: number;
    currentSortExpression: string;
    equipmentFilterCode: string[];
    descriptionFilter: string;
    equipmentIdEditing: string;
    equipmentDeletionId: string;
    listEquipmentDeletionId: string;
    projectKey: string;
    sub: any;
    moduleKey: string;
    preservationAllocationCount: number;
    bufferSize = 100;

    equipmentTempModels: EquipmentLookUpModel[] = [];
    equipmentModels: EquipmentLookUpModel[] = [];
    defaultSortEquipment: string = "EquipmentTypeCode asc";
    equipmentCode: string;
    description: string;

    //--- Model
    dataSource: MatTableDataSource<PreservationAllocationModel>;
    moduleProjectDefaultModel: ModuleProjectDefaultModel = new ModuleProjectDefaultModel();
    preservationAllocationModels: PreservationAllocationModel[];

    //--- Datatable
    selection = new SelectionModel<PreservationAllocationModel>(true, []);
    displayedColumns: string[] = ['equipmentTypeCode', 'description', 'noOfAssociatedTagsPresAll'];
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


    presServicesMock: MockPreservationAllocationApi = new MockPreservationAllocationApi();

    constructor(
        public clientState: ClientState,
        private authErrorHandler: AuthErrorHandler,
        private itrService: ITRService,
        private dataEquipmentService: DataEquipmentService,
        private route: ActivatedRoute,
        private router: Router,
        //testing mock up api

    ) {
        this.sub = this.route.params.subscribe(params => {
            this.projectKey = params['projectKey'];
            this.moduleKey = params["moduleKey"];
            if (!this.projectKey || !this.moduleKey) {
                this.router.navigate([""]);
            }
        });
        this.selection.changed.subscribe(item => {
            this.isEnableDeleteAll = this.selection.selected.length == 0;
        });
    }

    ngOnInit() {
        this.onGetPreservationAllocation(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortEquipment);
        this.onGetLookUpEquipment();
        //--- Get module by user
        this.moduleProjectDefaultModel = JwtTokenHelper.GetModuleProjectDefault();
    }
    //--- No need to use
    // public reloadData(isAdd: boolean = false, preservationItem: PreservationAllocationModel = new PreservationAllocationModel) {
    //     this.onGetPreservationAllocation(this.currentPageNumber, this.currentPageSize, this.currentSortExpression, "", "", isAdd, preservationItem);
    //     this.onGetLookUpEquipment();
    // }

    onGetLookUpEquipment = () => {
        this.clientState.isBusy = true;
        this.dataEquipmentService.getEquipmentTypeLookUp(this.projectKey).subscribe(res => {
            this.equipmentModels = res.content ? <EquipmentLookUpModel[]>[...res.content] : [];
            this.equipmentTempModels = this.equipmentModels.slice(0, this.bufferSize);
            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }

    onGetPreservationAllocation = (pageNumber?: number, pageSize?: number, sortExpression?: string, equipmentCode?: string, description?: string, isAdd: boolean = false, presItem: PreservationAllocationModel = new PreservationAllocationModel) => {
        this.isToggleDropdown = false;
        this.clientState.isBusy = true;

        if (isAdd) pageSize = pageSize ? pageSize - 1 : 49;

        if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
        if (pageSize > 0) this.currentPageSize = pageSize;
        if (sortExpression) this.currentSortExpression = sortExpression;
        var codeList = [];
        if (this.equipmentFilterCode) {
            if (this.equipmentFilterCode instanceof Array && this.equipmentFilterCode.length > 0) {
                this.equipmentFilterCode.forEach(item => {
                    codeList.push("'" + item + "'");
                });
                equipmentCode = codeList.toString();
            } else {
                equipmentCode = this.equipmentFilterCode.length > 0 ? "'" + this.equipmentFilterCode.toString() + "'" : '';
            }
        }
        if (this.descriptionFilter) description = this.descriptionFilter.trim();


        // this.presServicesMock.getITRTabData().subscribe(res => {
        //--- Using ItrService to test
        this.itrService.getEquipmentItrList(pageNumber || 1, pageSize || 50, this.projectKey, sortExpression, equipmentCode, description).subscribe(res => {
            this.preservationAllocationModels = res.items ? <PreservationAllocationModel[]>[...res.items] : [];
            if (isAdd) {
                this.preservationAllocationModels = this.preservationAllocationModels.filter(item => item.equipmentTypeId != presItem.equipmentTypeId);
                this.preservationAllocationModels = [presItem].concat(this.preservationAllocationModels);
            }
            if (this.preservationAllocationModels.length > 0) this.isHaveData = true;
            this.dataSource = new MatTableDataSource(this.preservationAllocationModels);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.preservationAllocationCount = res.totalItemCount;

            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }

    onSearchEquipment = ($event) => {
        this.isEquipmentLoadingSelect = true;
        if ($event.term == '') {
            this.equipmentTempModels = this.equipmentModels.slice(0, this.bufferSize);
            this.isEquipmentLoadingSelect = false;
        } else {
            this.equipmentTempModels = this.equipmentModels;
            this.isEquipmentLoadingSelect = false;
        }
    }

    onClearEquipment = () => {
        this.equipmentTempModels = this.equipmentModels.slice(0, this.bufferSize);
    }

    onCancelLookup() {
        // this.isFilter = false;
        this.equipmentFilterCode = null;
        this.descriptionFilter = null;
    }

    onScrollToEndEquipment = () => {
        if (this.equipmentModels.length > this.bufferSize) {
            const len = this.equipmentTempModels.length;
            const more = this.equipmentModels.slice(len, this.bufferSize + len);
            this.isEquipmentLoadingSelect = true;
            setTimeout(() => {
                this.isEquipmentLoadingSelect = false;
                this.equipmentTempModels = this.equipmentTempModels.concat(more);
            }, 500)
        }
    }

    onOpenAddModal = () => {

    }

    onSuccessAddModal = (isSuccess: boolean) => {

    }

    onAddSuccess = (itrItem: PreservationAllocationModel) => {

    }

    onOpenEditModal = (equipmentId: string) => {

    }

    onEditSuccess = (itrItem: PreservationAllocationModel) => {

    }

    onSuccessEditModal = (isSuccess: boolean) => {

    }

    onDeleteConfirm = (isConfirm: boolean) => {

    }

    onDeleteAllConfirm(isConfirm: boolean) {

    }

    onOpenDeleteModal = (equipmentId: string) => {

    }

    onOpenDeleteAllModal() {

    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource && this.dataSource.data.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        if (this.isAllSelected()) {
            this.selection.clear();
            this.isEnableDeleteAll = true;
        } else {
            this.dataSource.data.forEach(row => this.selection.select(row));
            this.isEnableDeleteAll = false;
        }
    }

    onCollapse = () => {
        this.isCollapse = !this.isCollapse;
    }

    toggleDropdown = () => {
        this.isToggleDropdown = !this.isToggleDropdown;
    }

    onRefreshData = () => {

    }

    onSortData(sort: Sort) {
        let sortExpressionData: string;
        if (sort) {
            sortExpressionData = sort.active + " " + sort.direction;
            this.onGetPreservationAllocation(this.currentPageNumber, this.currentPageSize, sortExpressionData);
        }
    }
}