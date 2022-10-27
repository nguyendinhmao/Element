import { OnInit, Component, ViewChild } from '@angular/core';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { CompanyColorModel } from 'src/app/shared/models/company-management/company-management.model';
import { JwtTokenHelper } from 'src/app/shared/common/jwt-token-helper/jwt-token-helper';
import { Configs } from 'src/app/shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ActivatedRoute, Router } from '@angular/router';
import { ITRService } from 'src/app/shared/services/api/itr/itr.service';
import { ITRAdminModel, ItrLookUpModel, UpdationItrAllocationModel, UpdationItrAllocationCommand, ItrEquipmentAllocate } from 'src/app/shared/models/itr-tab/itr-admin.model';
import { ITRAllocationModel } from 'src/app/shared/models/itr-tab/itr-allocation.model';
import { Constants } from 'src/app/shared/common';

@Component({
    selector: 'detail-itr-allocation',
    templateUrl: './detail-itr-allocation.component.html'
})

export class DetailItrAllocationComponent implements OnInit {
    //--- Model
    itrsAllocatied: ItrLookUpModel[] = [];
    allocated: ItrEquipmentAllocate[] = [];
    companyColorModel: CompanyColorModel = new CompanyColorModel();
    itrAllocationDetailModels: ITRAdminModel[] = [];
    itrAllocationUpdation: UpdationItrAllocationModel[] = [];
    updationItrAllocationCommand: UpdationItrAllocationCommand = new UpdationItrAllocationCommand();
    isEnableSelectAll: boolean = true;
    itrEquipmentAllocate: ItrEquipmentAllocate[];

    //--- Datatable
    dataSource: MatTableDataSource<ItrEquipmentAllocate>;
    selection = new SelectionModel<ItrEquipmentAllocate>(true, []);
    displayedColumns: string[] = ['select', 'itrNo', 'description'];
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    //--- Boolean
    isCollapse: boolean = false;
    isApplyState: boolean;

    //--- Variables
    sub: any;
    equipmentCode: string;
    equipment: ITRAllocationModel;
    defaultSortItr: string = "ItrNo desc";
    onSuccess: any;
    projectKey: string;
    moduleKey: string;
    itrCount: number;

    
    currentPageNumber: number;
    currentPageSize: number;
    currentSortExpression: string;

    constructor(
        public clientState: ClientState,
        private authErrorHandler: AuthErrorHandler,
        private route: ActivatedRoute,
        private itrService: ITRService,
        private router: Router,
    ) {
        this.sub = this.route.params.subscribe(params => {
            this.equipmentCode = params['equipmentCode'];
            this.projectKey = params['projectKey'];
            this.moduleKey = params["moduleKey"];
            if (!this.equipmentCode || !this.projectKey || !this.moduleKey) {
                this.router.navigate([""]);
            }
        });

        this.selection.changed.subscribe(item => {
            this.isEnableSelectAll = this.selection.selected.length == 0;
        });
    }

    public ngOnInit() {
        //--- Get color branding title
        this.onGetColorBrandingTitle();
        this.onGetEquipmentItrDetail()

        //--- Get itr allocation detail data

        //this.onGetITRList();
        this.onGetListItrEquipmentAllocate();
    }

    onGetEquipmentItrDetail() {
        this.clientState.isBusy = true;
        this.itrService.getEquipmentItrDetail(this.equipmentCode, this.projectKey).subscribe(res => {
            this.equipment = res ? <ITRAllocationModel>{ ...res } : null;
            this.clientState.isBusy = false;
        }), (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        };
    }
    //-- Get list itr equipment allocate
    onGetListItrEquipmentAllocate(pageNumber?: number, pageSize?: number, sortExpression?: string) {
        if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
        if (pageSize > 0) this.currentPageSize = pageSize;
        if (sortExpression) this.currentSortExpression = sortExpression;
        this.clientState.isBusy = true;
        this.itrService.getItrAllocatedList(pageNumber || Configs.DefaultPageNumber, pageSize || Configs.DefaultPageSize, this.projectKey, this.equipmentCode, sortExpression).subscribe(res => {
            this.itrEquipmentAllocate = res.items ? <ItrEquipmentAllocate[]>[...res.items] : [];
            this.selectionData();
            this.dataSource = new MatTableDataSource(this.itrEquipmentAllocate);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.clientState.isBusy = false;
            this.itrCount = res.totalItemCount;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }
    selectionData() {
        this.selection.clear();
        this.itrEquipmentAllocate.forEach(itr => {
            if (typeof itr.isAllocated !== 'undefined' && itr.isAllocated !== null && itr.isAllocated) {
                this.selection.select(itr)
            }
        })
        this.allocated = this.selection.selected
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource && this.dataSource.data.length;
        return numSelected === numRows;
    }

    masterToggle() {
        if (this.isAllSelected()) {
            this.selection.clear();
            this.isEnableSelectAll = true;
        } else {
            this.dataSource.data.forEach(row => this.selection.select(row));
            this.isEnableSelectAll = false;
        }
    }

    checkboxLabel(row?: ItrEquipmentAllocate): string {
        if (!row) {
            return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.itrNo + 1}`;
    }

    //--- Get color branding title
    onGetColorBrandingTitle = () => {
        const colorBrandings = JwtTokenHelper.GetColorBranding();
        if (colorBrandings === null) {
            this.companyColorModel.colorTextColour1 = Configs.ColorTextColour1Default;
        } else {
            this.companyColorModel.colorTextColour1 = colorBrandings.colorTextColour1;
        }
    }

    //--- Collapse
    onCollapse = () => {
        this.isCollapse = !this.isCollapse;
    }

    //--- Apply item
    onOpenInformModal = () => {
        this.itrAllocationUpdation = [];
        var listItrSelected = this.selection.selected;
        listItrSelected.forEach(e => {
            if (!this.allocated.find(x => x.itrId == e.itrId)) {
                var itr = new UpdationItrAllocationModel();
                itr.itrId = e.itrId;
                itr.itrNo = e.itrNo;
                itr.isAdd = true;
                itr.isDelete = false;
                this.itrAllocationUpdation.push(itr);
            }
        });
        this.allocated.forEach(e => {
            if (!listItrSelected.find(x => x.itrId == e.itrId)) {
                var itr = new UpdationItrAllocationModel();
                itr.itrId = e.itrId;
                itr.itrNo = e.itrNo;
                itr.isAdd = false;
                itr.isDelete = true;
                this.itrAllocationUpdation.push(itr);
            }
        })
        if (this.itrAllocationUpdation.length > 0)
            this.isApplyState = true;
        else this.authErrorHandler.handleError(Constants.ListItrNotChanged);
    }

    onConfirmApply = (isConfirm: boolean) => {
        if (!isConfirm) {
            this.isApplyState = false;
            return;
        }
        if (isConfirm) {
            this.updationItrAllocationCommand.equipmentCode = this.equipmentCode;
            this.updationItrAllocationCommand.remarks = '';
            this.updationItrAllocationCommand.itrAllocationUpdation = this.itrAllocationUpdation;
            this.updationItrAllocationCommand.projectKey = this.projectKey;
            this.itrService.updateItrAllocation(this.updationItrAllocationCommand).subscribe(res => {
                this.clientState.isBusy = false;
                this.authErrorHandler.handleSuccess(Constants.ItrAllocationUpdated);
                this.onGetListItrEquipmentAllocate();
                this.clientState.isBusy = false;
            }, (err) => {
                this.clientState.isBusy = false;
                this.authErrorHandler.handleError(err.message);
            })
            this.isApplyState = false;

        }
    }
    onCancel = () => {
        this.itrAllocationUpdation = []
        this.selection.clear();
        this.allocated.forEach(x => this.selection.select(x));
    }
}