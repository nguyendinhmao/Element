import { OnInit, Component, ViewChild, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ProjectMemberUpdatingModel, ProjectMemberModel } from 'src/app/shared/models/project-settings/project-user.model';
import { ProjectMemberService } from 'src/app/shared/services/api/project-settings/project-member.service';
import { ActivatedRoute } from '@angular/router';
import { Configs } from 'src/app/shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { Constants } from 'src/app/shared/common';

@Component({
  selector: 'project-user',
  templateUrl: './project-user.component.html'
})

export class ProjectUserComponent implements OnInit {
  //--- Input
  @Input() projectId: string;
  @Input() isAddedMember: boolean;

  //--- Boolean
  isAddNewState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;
  idEditing: string;

  //--- Model
  projectMemberModels: ProjectMemberModel[] = [];
  projectMemberUpdationModel: ProjectMemberUpdatingModel = new ProjectMemberUpdatingModel();

  //--- Variables
  projectMembersCount: number = 0;
  projectMemberDeletionId: string;

  //--- Databale
  displayedColumns: string[] = ['memberName', 'role', 'authorisationLevel', 'edit', 'delete'];
  dataSource: MatTableDataSource<ProjectMemberModel>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  //
  defaultSort: string = "MemberName asc";
  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;
  constructor(
    public clientState: ClientState,
    public projectMemberService: ProjectMemberService,
    public activatedRoute: ActivatedRoute,
    private authErrorHandler: AuthErrorHandler
  ) { }

  public ngOnInit() {
    if (this.projectId && this.projectId != "") this.onGetProjectUserData();
  }

  //--- Get project user data
  onGetProjectUserData = (pageNumber?: number, pageSize?: number, sortExpression?: string) => {
    if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;
    this.clientState.isBusy = true;
    this.projectMemberService.getProjectMemberList(this.projectId, pageNumber || Configs.DefaultPageNumber, pageSize || Configs.DefaultPageSize, sortExpression || this.defaultSort).subscribe(res => {
      this.projectMemberModels = res.items ? <ProjectMemberModel[]>[...res.items] : [];
      this.projectMemberModels.map(p => {
        if (p.photoUrl) {
          p.photoUrl = Configs.BaseSitePath + p.photoUrl;
        }
      });

      this.projectMembersCount = res.totalItemCount;
      this.dataSource = new MatTableDataSource(this.projectMemberModels);
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
      this.onGetProjectUserData();
      this.authErrorHandler.handleSuccess(Constants.UserAdd);
    }
  }

  //--- Edit item
  onOpenEditModal = (id: string) => {
    this.isEditState = true;
    this.idEditing = id;
  }

  onSuccessEditModal = (isSuccess: boolean) => {
    this.isEditState = false;
    if (isSuccess) {
      this.onGetProjectUserData();
      this.authErrorHandler.handleSuccess(Constants.UserUpdated);
    }
  }

  //--- Delete item
  onOpenDeleteModal = (id: string) => {
    this.projectMemberDeletionId = id;
    this.isDeleteState = true;
  }

  onDeleteConfirm = (isConfirm: boolean) => {
    this.isDeleteState = false;
    if (isConfirm && this.projectMemberDeletionId) {
      this.projectMemberService.deleteProjectMember(this.projectMemberDeletionId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.projectMemberDeletionId = null;
          this.authErrorHandler.handleSuccess(Constants.UserDeleted);
          this.onGetProjectUserData();
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
      this.onGetProjectUserData(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }
}
