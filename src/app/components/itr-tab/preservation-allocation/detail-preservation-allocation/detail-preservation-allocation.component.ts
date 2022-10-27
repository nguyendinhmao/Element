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
import { ElementUpdationCommand, PreservationAllocationModel, PreservationEquipmentAllocate } from 'src/app/shared/models/itr-tab/preservation-allocation.model';
import { MockEquipmentApi, MockPreservationAllocationDetailApi } from 'src/app/shared/mocks/mock.itr-tab';
import { PresservationServices } from 'src/app/shared/services/api/preservation-allocation/preservation-allocation.service';
import { Constants } from 'src/app/shared/common';
import { ITRService } from 'src/app/shared/services/api/itr/itr.service';
declare var $: any;

@Component({
    selector: 'detail-preservation-allocation',
    templateUrl: './detail-preservation-allocation.component.html'
})
export class DetailPreservationAllocationComponent implements OnInit {
    //--- Model
    // itrsAllocatied: ItrLookUpModel[] = [];
    allocated: PreservationEquipmentAllocate[] = [];
    companyColorModel: CompanyColorModel = new CompanyColorModel();
    // itrAllocationDetailModels: ITRAdminModel[] = [];
    // itrAllocationUpdation: UpdationItrAllocationModel[] = [];
    updationElementsCommand: ElementUpdationCommand = new ElementUpdationCommand();
    isEnableSelectAll: boolean = true;
    presEquipmentAllocate: PreservationEquipmentAllocate[];
    elements: PreservationEquipmentAllocate[] = [];

    //--- Datatable
    dataSource: MatTableDataSource<PreservationEquipmentAllocate>;
    selection = new SelectionModel<PreservationEquipmentAllocate>(true, []);
    displayedColumns: string[] = ['selectPresAll', 'element', 'description', 'pauseOrStop'];
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    //--- Boolean
    isCollapse: boolean = false;
    isApplyState: boolean;
    isAllElementResume: boolean = false;
    isAllElementStop: boolean = false;
    isConfirmationShow: boolean = false;

    //--- Variables
    sub: any;
    equipmentCode: string;
    equipment: any;
    defaultSortItr: string = "preservationCode desc";
    onSuccess: any;
    projectKey: string;
    moduleKey: string;
    presAllocationCount: number;
    jQuestionContent: string = '';
    statusUpdate: string;


    currentPageNumber: number;
    currentPageSize: number;
    currentSortExpression: string;

    mockPresAllocDetailS: MockPreservationAllocationDetailApi = new MockPreservationAllocationDetailApi();
    mockEquipmentApi: MockEquipmentApi = new MockEquipmentApi();

    constructor(
        public clientState: ClientState,
        private authErrorHandler: AuthErrorHandler,
        private route: ActivatedRoute,
        private presservationServices: PresservationServices,
        private router: Router,
        private itrService: ITRService,
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
        this.onGetEquipmentPreservationDetail()

        //--- Get itr allocation detail data

        //this.onGetITRList();
        this.onGetListPreservationEquipmentAllocate();
    }

    onGetEquipmentPreservationDetail() {
        this.clientState.isBusy = true;
        this.itrService.getEquipmentItrDetail(this.equipmentCode, this.projectKey).subscribe(res => {
            this.equipment = res ? {...res} : null;
            this.clientState.isBusy = false;
        }), (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        };
    }
    //-- Get list preservation equipment allocate
    onGetListPreservationEquipmentAllocate(pageNumber?: number, pageSize?: number, sortExpression?: string) {
        if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
        if (pageSize > 0) this.currentPageSize = pageSize;
        if (sortExpression) this.currentSortExpression = sortExpression;
        this.clientState.isBusy = true;

        this.presservationServices.getPreservationAllocatedList(this.projectKey, this.equipmentCode, pageNumber || Configs.DefaultPageNumber, pageSize || Configs.DefaultPageSize, sortExpression).subscribe(res => {
            this.presEquipmentAllocate = res.items ? <PreservationEquipmentAllocate[]>[...res.items] : [];
            this.selectionData();
            this.dataSource = new MatTableDataSource(this.presEquipmentAllocate);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.clientState.isBusy = false;
            this.presAllocationCount = res.totalItemCount;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }
    selectionData() {
        let _isResume = false;
        this.selection.clear();
        this.presEquipmentAllocate.forEach(e => {
            if (typeof e.isAllocated !== 'undefined' && e.isAllocated !== null && e.isAllocated) {
                this.selection.select(e)
            }
            if (e.status === 'PAUSED') {
                _isResume = true;
            }
        })
        this.isAllElementResume = _isResume;
        this.allocated = this.selection.selected;
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
            this.elements = [];
            this.isAllElementResume = false;
        } else {
            this.dataSource.data.forEach(row => this.selection.select(row));
            this.isEnableSelectAll = false;
            this.elements = this.selection.selected;
            this.isAllElementResume = !(this.elements.find(e => e.status === 'ACTIVE'));
        }
    }

    checkboxLabel(row?: PreservationEquipmentAllocate): string {
        if (!row) {
            return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.preservationElementId + 1}`;
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
        let _isChange: boolean = false;
        var listElementSelected = this.selection.selected;

        if (listElementSelected.length === this.allocated.length) {
            _isChange = !!listElementSelected.find((e, i) => e.preservationElementId !== this.allocated[i].preservationElementId);
        } else if (listElementSelected.length !== this.allocated.length) {
            _isChange = true;
        }
        if (!_isChange) {
            this.authErrorHandler.handleError(Constants.PreservationAllocationElementsNotChanged);
        }
        this.isApplyState = _isChange;
        this.isConfirmationShow = true;
    }

    onConfirmApply = (isConfirm: boolean) => {
        if (!isConfirm) {
            this.isApplyState = false;
            return;
        }
        if (isConfirm) {
            //--- Get reason from user when they want to remove any elements
            if (this.isRemovedAnyElements()) {
                this.isApplyState = false;
                this.isConfirmationShow = true;
                this.statusUpdate = 'REMOVED';
                $("#justificationModal").modal("show");
            } else {
                let _elementIds = [];
                this.selection.selected.forEach((e, i) => {
                    _elementIds.push(e.preservationElementId);
                });
                this.updationElementsCommand.equipmentCode = this.equipmentCode;
                this.updationElementsCommand.comments = '';
                this.updationElementsCommand.elementsUpdated = [..._elementIds];
                this.updationElementsCommand.projectKey = this.projectKey;
                this.presservationServices.updateElementsAllocation(this.updationElementsCommand).subscribe(res => {
                    this.clientState.isBusy = false;
                    this.authErrorHandler.handleSuccess(Constants.PreservationAllocationElementUpdate);
                    this.onGetListPreservationEquipmentAllocate();
                    this.clientState.isBusy = false;
                }, (err) => {
                    this.clientState.isBusy = false;
                    this.authErrorHandler.handleError(err.message);
                });
                this.isApplyState = false;
            }
        }
    }

    isRemovedAnyElements() {
        let _count = 0;
        this.selection.selected.forEach(e => {
            if (e.isAllocated) _count++;
        })
        return this.allocated.length > _count;
    }

    onCancel = () => {
        this.selection.clear();
        this.allocated.forEach(x => this.selection.select(x));
    }

    onSubmitJustification(content) {
        if (typeof (content) === 'boolean' && content) {
            this.authErrorHandler.handleSuccess(Constants.PreservationAllocationStatusChange);
            this.onGetListPreservationEquipmentAllocate();
        } else if (typeof (content) === 'object' && content != null) {
            let _elementIds = [];
            this.selection.selected.forEach((e, i) => {
                _elementIds.push(e.preservationElementId);
            });
            this.updationElementsCommand.equipmentCode = this.equipmentCode;
            this.updationElementsCommand.comments = content['comment'];
            this.updationElementsCommand.elementsUpdated = [..._elementIds];
            this.updationElementsCommand.projectKey = this.projectKey;
            this.presservationServices.updateElementsAllocation(this.updationElementsCommand).subscribe(res => {
                this.clientState.isBusy = false;
                this.authErrorHandler.handleSuccess(Constants.PreservationAllocationElementUpdate);
                this.onGetListPreservationEquipmentAllocate();
                this.clientState.isBusy = false;
            }, (err) => {
                this.clientState.isBusy = false;
                this.authErrorHandler.handleError(err.message);
            });
        }

        this.isConfirmationShow = false;
    }

    onStopBtnClick(element: PreservationEquipmentAllocate) {
        this.isConfirmationShow = true;
        this.jQuestionContent = "Are you sure want to Stop?"
        this.elements = [element];
        this.statusUpdate = 'STOPPED';
    }
    onPauseBtnClick(element: PreservationEquipmentAllocate) {
        const _isPaused = element.status === 'PAUSED';
        this.isConfirmationShow = true;
        this.jQuestionContent = _isPaused ? 'Would you like to resume this element?' : 'Are you sure want to Pause?'
        this.elements = [element];
        this.statusUpdate = _isPaused ? 'ACTIVE' : 'PAUSED';
    }

    onOpenPauseAllJustification() {
        const _es = this.selection.selected,
            _isActive = !!(_es.find(e => e.status === 'ACTIVE'));
        this.isConfirmationShow = true;
        this.jQuestionContent = _isActive ? 'Are you sure want to Pause all of these?' : 'Would you like to Resume all of these?';
        this.elements = _es;
        this.statusUpdate = _isActive ? 'PAUSED' : 'ACTIVE';
    }
    onOpenStopAllJustification() {
        this.isConfirmationShow = true;
        this.jQuestionContent = "Are you sure want to Stop all of these?"
        this.elements = this.selection.selected;
        this.statusUpdate = 'STOPPED';
    }
}