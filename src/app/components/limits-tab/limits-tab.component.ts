import { Component, OnInit, ViewChild } from '@angular/core';
import { LimitsTabModel } from 'src/app/shared/models/limits-tab/limits-tab.model';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { MockLimitsTabApi } from 'src/app/shared/mocks/mock.limits-tab';
import { ApiError } from 'src/app/shared/models/api-response/api-response';

@Component({
    selector: 'limits-tab',
    templateUrl: './limits-tab.component.html'
})

export class LimitsTabComponent implements OnInit {
    isShowPreview: boolean = false;
    isCollapse: boolean = false;

    isAddNewState: boolean;
    isEditState: boolean;
    isDeleteState: boolean;

    limitsTabModels: LimitsTabModel[] = [];
    dataSource: MatTableDataSource<LimitsTabModel>;
    selection = new SelectionModel<LimitsTabModel>(true, []);
    displayedColumns: string[] = ['select', 'drawingNo', 'description', 'type', 'rev', 'edit', 'delete'];
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    private mockLimitsTabApi = new MockLimitsTabApi();

    constructor(
        public clientState: ClientState,
    ) { }

    public ngOnInit() {
        this.onGetLimitsData();
    }

    //--- Get itr data
    onGetLimitsData = () => {
        this.clientState.isBusy = true;
        this.mockLimitsTabApi.getLimitsTabData().subscribe(res => {
            this.limitsTabModels = res.content ? <LimitsTabModel[]>[...res.content] : [];
            this.dataSource = new MatTableDataSource(this.limitsTabModels);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;

            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
        });
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.data.forEach(row => this.selection.select(row));
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: LimitsTabModel): string {
        if (!row) {
            return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.drawingNo + 1}`;
    }

    //--- Pdf preview
    pdfPreview = () => {
        this.isShowPreview = true;
    }

    onCollapse = () => {
        this.isCollapse = !this.isCollapse;
    }

    //--- Add item
    onOpenAddModal = () => {
        this.isAddNewState = true;
    }

    onSuccessAddModal = (isSuccess: boolean) => {
        this.isAddNewState = false;
    }

    //--- Edit item
    onOpenEditModal = () => {
        this.isEditState = true;
    }

    onSuccessEditModal = (isSuccess: boolean) => {
        this.isEditState = false;
    }

    //--- Delete item
    onOpenDeleteModal = () => {
        this.isDeleteState = true;
    }

    onDeleteConfirm = (isConfirm: boolean) => {
        this.isDeleteState = false;
    }
}