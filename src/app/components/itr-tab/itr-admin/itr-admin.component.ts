import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ITRAdminModel, ITRAdminUpdationModel } from 'src/app/shared/models/itr-tab/itr-admin.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { ITRService } from 'src/app/shared/services/api/itr/itr.service';
import { AuthErrorHandler } from 'src/app/shared/services';
import { Constants, Configs } from 'src/app/shared/common';
import { MAT_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { APP_DATE_FORMATS, AppDateAdapter } from 'src/app/shared/directives/format-datepicker/format-datepicker';

@Component({
  selector: 'itr-admin',
  templateUrl: './itr-admin.component.html',
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})

export class ITRAdminComponent implements OnInit {
  //--- Boolean
  isAddNewState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;
  isDeleteAllState: boolean;
  isCollapse: boolean = false;
  isEnableDeleteAll: boolean = true;
  isToggleDropdown: boolean = false;

  //--- Model
  itrAdminModels: ITRAdminModel[] = [];

  //--- Datatable
  dataSource: MatTableDataSource<ITRAdminModel>;
  selection = new SelectionModel<ITRAdminModel>(true, []);
  updationModel: ITRAdminUpdationModel = new ITRAdminUpdationModel();
  displayedColumns: string[] = ['select', 'itrNo', 'description', 'type', 'disciplineName', 'mileStoneName', 'signatureCount', 'isPublish', 'dateUpdated', 'edit', 'delete'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  //--- Variable
  sub: Subscription;
  itrNo: string;
  projectKey: string;
  description: string;
  type: string;
  discipline: string;
  signatureCount: string;
  milestone: string;
  fromDate: string;
  toDate: string;
  itrSortExpression: string;
  itrDeletionId: string;
  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;
  defaultSortItr: string = "itrNo asc";
  itrCount: number = 0;
  listItrDeleteId: string;

  constructor(
    public clientState: ClientState,
    private route: ActivatedRoute,
    private router: Router,
    private itrService: ITRService,
    private authErrorHandler: AuthErrorHandler
  ) {
    this.sub = this.route.params.subscribe(params => {
      this.projectKey = params['projectKey'];
      if (!this.projectKey) {
        this.router.navigate(['']);
      }
    });

    this.selection.changed.subscribe(item => {
      this.isEnableDeleteAll = this.selection.selected.length == 0;
    })
  }

  public ngOnInit() {
    this.onGetITRAdmin(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortItr);
  }

  //--- Get itr data
  onGetITRAdmin = (pageNumber?: number, pageSize?: number, sortExpression?: string) => {
    this.clientState.isBusy = true;
    this.isToggleDropdown = false;

    if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;
    if (this.itrNo) this.itrNo = this.itrNo.trim();
    if (this.description) this.description = this.description.trim();
    if (this.discipline) this.discipline = this.discipline.trim();
    if (this.milestone) this.milestone = this.milestone.trim();
    this.itrService.getITRList(this.projectKey, pageNumber || Configs.DefaultPageNumber, pageSize || Configs.DefaultPageSize, this.itrNo, this.description, this.type, this.discipline, this.signatureCount, this.milestone, this.fromDate, this.toDate, sortExpression || this.defaultSortItr).subscribe(res => {
      this.itrAdminModels = res.items ? <ITRAdminModel[]>[...res.items] : [];
      if (this.itrAdminModels.length > 0) {
        this.itrAdminModels.map(item => {
          item.dateUpdated = new Date(item.dateUpdated);
        })
      }
      this.dataSource = new MatTableDataSource(this.itrAdminModels);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.itrCount = res.totalItemCount;

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
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

  //--- Collapse
  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  }

  //--- Add item
  onOpenAddModal = () => {
    this.isAddNewState = true;
  }

  onSuccessAddModal = (isSuccess: boolean) => {
    this.isAddNewState = false;
    if (isSuccess) {
      this.isAddNewState = false;
      this.authErrorHandler.handleSuccess(Constants.ItrCreated);
      this.onGetITRAdmin();
    }
  }

  //--- Edit item
  onOpenEditModal = (itrId) => {
    this.clientState.isBusy = true;
    this.isEditState = true;
    this.itrService.getITRById(itrId).subscribe(res => {
      this.clientState.isBusy = false;
      this.updationModel = res;
      this.isEditState = true;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.isEditState = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onSuccessEditModal = (isSuccess: boolean) => {
    if (isSuccess) {
      this.isEditState = false;
      this.authErrorHandler.handleSuccess(Constants.ItrUpdated);
      this.onGetITRAdmin();
    }
  }

  //--- Delete item
  onOpenDeleteModal = (id: string) => {
    this.itrDeletionId = id;
    this.isDeleteState = true;
  }

  onDeleteConfirm = (isConfirm: boolean) => {
    if (isConfirm && this.itrDeletionId) {
      this.itrService.deleteITR(this.itrDeletionId).subscribe({
        complete: () => {
          this.isDeleteState = false;
          this.clientState.isBusy = false;
          this.itrDeletionId = null;
          this.authErrorHandler.handleSuccess(Constants.ItrDeleted);
          this.onGetITRAdmin();
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.isDeleteState = false;
          this.itrDeletionId = null;
          this.authErrorHandler.handleError(err.message);
        }
      });
    }
  }

  onClearSearch() {
    this.sub = null;
    this.itrNo = null;
    this.description = null;
    this.type = null;
    this.discipline = null;
    this.signatureCount = null;
    this.milestone = null;
    this.fromDate = null;
    this.toDate = null;
    this.itrDeletionId = null;
  }

  onRefreshData() {
    this.onClearSearch();
    this.onGetITRAdmin();
  }

  onSortData(sort: Sort) {
    let sortExpressionData: string;
    if (sort) {
      sortExpressionData = sort.active + " " + sort.direction;
      this.itrSortExpression = sortExpressionData;
      this.onGetITRAdmin(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }

  onOpenDeleteAllModal() {
    this.isDeleteAllState = true;
    var listIdDelete = []
    if (this.selection && this.selection.selected.length > 0) {
      this.selection.selected.forEach(item => {
        listIdDelete.push(item.itrId)
      });
    }
    this.listItrDeleteId = listIdDelete.toString();
  }

  onDeleteAllConfirm(isConfirm: boolean) {
    if (isConfirm && this.listItrDeleteId) {
      this.clientState.isBusy = true;
      this.itrService.deleteListItr(this.listItrDeleteId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.listItrDeleteId = null;
          this.isDeleteAllState = false;
          this.authErrorHandler.handleSuccess(Constants.EquipmentDeleted);
          this.onGetITRAdmin(Configs.DefaultPageNumber, this.currentPageSize, this.currentSortExpression);
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.listItrDeleteId = null;
          this.isDeleteAllState = false;
          this.authErrorHandler.handleError(err.message);
        },
      });
    }
  }

  //--- Toggle Dropdown
  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
  }
}
