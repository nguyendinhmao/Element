import { OnInit, Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ProjectRoleModel } from 'src/app/shared/models/project-settings/project-user.model';
import { ProjectRoleService } from 'src/app/shared/services/api/project-settings/project-role.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { Constants, Configs } from 'src/app/shared/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'project-role',
  styleUrls: ['./project-role.component.scss'],
  templateUrl: './project-role.component.html'
})

export class ProjectRoleComponent implements OnInit {
  //--- Input
  @Input() projectId: string;
  @Output() isAddedMember: EventEmitter<boolean> = new EventEmitter();

  //--- Boolean
  isAddNewState: boolean;
  isDeleteState: boolean;

  //--- Model
  projectRoleModels: ProjectRoleModel[] = [];

  //--- Variables
  projectRolesCount: number = 0;
  projectRoleDeletionId: string;
  //
  sub: Subscription;
  projectKey: string;

  defaultSort: string = "RoleName asc";
  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;
  //--- Databale
  displayedColumns: string[] = ['roleName', 'code', 'delete'];
  dataSource: MatTableDataSource<ProjectRoleModel>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    public clientState: ClientState,
    public projectRoleService: ProjectRoleService,
    public activatedRoute: ActivatedRoute,
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

  public ngOnInit() {
    if (this.projectId && this.projectId != "") this.onGetProjectRoleData();
  }

  onGetProjectRoleData = (pageNumber?: number, pageSize?: number,sortExpression?:string) => {
    if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;
    this.clientState.isBusy = true;
    this.projectRoleService.getProjectRoleList(this.projectKey, pageNumber || Configs.DefaultPageNumber, pageSize || Configs.DefaultPageSize,sortExpression || this.defaultSort).subscribe(res => {
      this.projectRoleModels = res.items ? <ProjectRoleModel[]>[...res.items] : [];
      this.projectRolesCount = res.totalItemCount;
      this.dataSource = new MatTableDataSource(this.projectRoleModels);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;

      this.isAddedMember.emit(this.projectRoleModels.length > 0);
      
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
      this.onGetProjectRoleData();
      this.authErrorHandler.handleSuccess(Constants.RoleAdd);
    }
  }

  //--- Delete item
  onOpenDeleteModal = (id: string) => {
    this.projectRoleDeletionId = id;
    this.isDeleteState = true;
  }

  onDeleteConfirm = (isConfirm: boolean) => {
    this.isDeleteState = false;
    if (isConfirm && this.projectRoleDeletionId) {
      this.projectRoleService.deleteProjectRole(this.projectRoleDeletionId,this.projectId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.projectRoleDeletionId = null;
          this.authErrorHandler.handleSuccess(Constants.RoleDeleted);
          this.onGetProjectRoleData();
        },
        error: (err: ApiError) => {
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
      this.defaultSort = sortExpressionData;
      this.onGetProjectRoleData(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }
}
