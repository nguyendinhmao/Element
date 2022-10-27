import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ProjectUpdatingModel, ProjectManagementModel } from 'src/app/shared/models/project-management/project-management.model';
import { ProjectService } from 'src/app/shared/services/api/projects/project.service';
import { EditProjectManagementComponent } from './edit-project-management/edit-project-management.component';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { ModuleProjectDefaultModel } from 'src/app/shared/models/module/module.model';
import { JwtTokenHelper } from 'src/app/shared/common/jwt-token-helper/jwt-token-helper';
import { UserModel } from 'src/app/shared/models/user/user.model';
import { Router } from '@angular/router';
import { Constants } from 'src/app/shared/common';
import * as $ from "jquery";

@Component({
  selector: 'project-management',
  templateUrl: './project-management.component.html'
})

export class ProjectManagementComponent implements OnInit {
  //--- Boolean
  isAddNewState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;

  //--- Model
  projectManagementModels: ProjectManagementModel[] = [];
  moduleProjectDefaultModel: ModuleProjectDefaultModel = new ModuleProjectDefaultModel();
  projectUpdationModel: ProjectUpdatingModel = new ProjectUpdatingModel();
  userInfo: UserModel = new UserModel();

  //--- Variables
  projectsCount: number = 0;
  projectDeletionId: string;

  //--- Datatable
  displayedColumns: string[] = ['projectName', 'projectKey', 'company', 'punchSignatureCount', 'status', 'edit', 'delete'];
  dataSource: MatTableDataSource<ProjectManagementModel>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('editView') editView: EditProjectManagementComponent;

  constructor(
    public clientState: ClientState,
    private projectService: ProjectService,
    private authErrorHandler: AuthErrorHandler,
    private router: Router,
  ) {
    //--- Hide left menu
   // $("#top-header .project-name").hide();
    //$("#matSideNavMenu").hide();
    //$(".toggle-nav").hide();
  }

  public ngOnInit() {
    this.userInfo = JwtTokenHelper.GetUserInfo();
    if (this.userInfo) {
      if (this.userInfo.userType === "Admin") {
        this.moduleProjectDefaultModel = JwtTokenHelper.GetModuleProjectDefault();
        if (this.moduleProjectDefaultModel) {
          this.onGetProjectData();
        }
      } else {
        this.router.navigate(['access-denied']);
      }
    }
  }

  //--- Get project data
  onGetProjectData = (pageIndex?: number) => {
    this.clientState.isBusy = true;

    if (pageIndex) pageIndex = pageIndex + 1;

    this.projectService.getListProject(this.moduleProjectDefaultModel.moduleId, pageIndex || 1).subscribe(res => {
      this.projectManagementModels = res.items ? <ProjectManagementModel[]>[...res.items] : [];
      this.projectManagementModels.map(p => {
        if (p.projectLogo) p.projectLogo = p.projectLogo;
        if (p.companyLogo) p.companyLogo = p.companyLogo;
      });
      this.projectsCount = res.totalItemCount;
      this.dataSource = new MatTableDataSource(this.projectManagementModels);
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
    if (isSuccess) {
      this.isAddNewState = false;
      this.authErrorHandler.handleSuccess(Constants.ProjectCreated);
      this.onGetProjectData();
    }
  }

  //--- Edit item
  onOpenEditModal = (projectKey: string) => {
    this.clientState.isBusy = true;
    this.isEditState = true;

    this.projectService.getProjectByKey(projectKey).subscribe(res => {
      this.clientState.isBusy = false;
      this.projectUpdationModel = res;
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
      this.authErrorHandler.handleSuccess(Constants.ProjectUpdated);
      this.onGetProjectData();
    }
  }

  //--- Delete item
  onOpenDeleteModal = (id: string) => {
    this.projectDeletionId = id;
    this.isDeleteState = true;
  }

  onDeleteConfirm = (isConfirm: boolean) => {
    this.isDeleteState = false;
    if (isConfirm && this.projectDeletionId) {
      this.projectService.deleteProject(this.projectDeletionId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.isDeleteState = false;
          this.projectDeletionId = null;
          this.authErrorHandler.handleSuccess(Constants.ProjectDeleted);
          this.onGetProjectData();
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.isDeleteState = false;
          this.projectDeletionId = null;
          this.authErrorHandler.handleError(err.message);
        }
      });
    }
  }
}
