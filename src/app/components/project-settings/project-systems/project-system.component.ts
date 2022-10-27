import { OnInit, Component, ViewChild, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ProjectSystemUpdationModel, ProjectSystemModel } from 'src/app/shared/models/project-settings/project-system.model';
import { ProjectSystemService } from 'src/app/shared/services/api/project-settings/project-system.service';
import { ActivatedRoute } from '@angular/router';
import { Configs } from '../../../shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { Constants } from 'src/app/shared/common';

@Component({
  selector: 'project-system',
  styleUrls: ['./project-system.component.scss'],
  templateUrl: './project-system.component.html'
})

export class ProjectSystemComponent implements OnInit {
  //--- Input
  @Input() projectKey: string;

  //--- Boolean
  isAddNewState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;

  //--- Variables
  projectSystemsCount: number = 0;
  projectSystemDeletionId: string;
  projectSystemUpdationLogoUrl: string;
  defaultSortSystem: string = "SystemNo desc";
  currentSortExpression: string;
  projectSystemModels: ProjectSystemModel[] = [];
  projectSystemUpdationModel: ProjectSystemUpdationModel;
  currentPageNumber: number;
  currentPageSize: number;

  //--- Datatable
  dataSource: MatTableDataSource<ProjectSystemModel>;
  displayedColumns: string[] = ['systemNo', 'name', 'edit', 'delete'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    public clientState: ClientState,
    public projectSystemService: ProjectSystemService,
    public activatedRoute: ActivatedRoute,
    private authErrorHandler: AuthErrorHandler
  ) { }

  public ngOnInit() {
    if (this.projectKey && this.projectKey != "") this.onGetProjectSystemData();
  }

  //--- Get project system data
  onGetProjectSystemData = (pageIndex?: number, pageSize?: number, sortExpression?: string) => {
    if (pageIndex >= 0) { this.currentPageNumber = pageIndex; pageIndex = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    this.clientState.isBusy = true;
    if (sortExpression) this.currentSortExpression = sortExpression;

    this.projectSystemService.getProjectSystemList(this.projectKey, pageIndex || 1, pageSize || 50, sortExpression || this.defaultSortSystem, "").subscribe(res => {
      this.projectSystemModels = res.items ? <ProjectSystemModel[]>[...res.items] : [];
      this.projectSystemsCount = res.totalItemCount;
      this.dataSource = new MatTableDataSource(this.projectSystemModels);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Add item
  onOpenAddModal = () => {
    this.isAddNewState = true;
  }

  onSuccessAddModal = (isSuccess: boolean) => {
    this.isAddNewState = false;
    if (isSuccess) {
      this.onGetProjectSystemData();
      this.authErrorHandler.handleSuccess(Constants.SystemInProjectAdd);
    }
  }

  //--- Edit item
  onOpenEditModal = (id: string) => {
    this.clientState.isBusy = true;
    this.isEditState = true;
    this.projectSystemService.getProjectSystemById(id).subscribe(res => {
      this.clientState.isBusy = false;
      this.projectSystemUpdationModel = new ProjectSystemUpdationModel();
      this.projectSystemUpdationModel.elementSystemId = res.elementSystemId;
      this.projectSystemUpdationModel.projectId = res.projectId;
      this.projectSystemUpdationModel.systemName = res.name;
      this.projectSystemUpdationModel.systemNo = res.systemNo;
      this.projectSystemUpdationModel.logoUrl = res.logoUrl;
      this.projectSystemUpdationLogoUrl = res.logoUrl ? Configs.BaseSitePath + res.logoUrl : Configs.DefaultClientLogo;
      this.isEditState = true;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.isEditState = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onSuccessEditModal = (isSuccess: boolean) => {
    this.isEditState = false;
    if (isSuccess) {
      this.onGetProjectSystemData();
      this.authErrorHandler.handleSuccess(Constants.SystemInProjectUpdated);
    }
  }

  //--- Delete item
  onOpenDeleteModal = (id: string) => {
    this.projectSystemDeletionId = id;
    this.isDeleteState = true;
  }

  onDeleteConfirm = (isConfirm: boolean) => {
    this.isDeleteState = false;
    if (isConfirm && this.projectSystemDeletionId) {
      this.projectSystemService.deleteProjectSystem(this.projectSystemDeletionId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.projectSystemDeletionId = null;
          this.authErrorHandler.handleSuccess(Constants.SystemInProjectDeleted);
          this.onGetProjectSystemData();
        }, error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        },
      });
    }
  }

  onSortData(sort: Sort) {
    let sortExpressionData: string;
    if (sort) {
      sortExpressionData = sort.active + " " + sort.direction;
      this.onGetProjectSystemData(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }
}
