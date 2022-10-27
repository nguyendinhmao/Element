import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { UserManagementModel } from 'src/app/shared/models/user-management/user-management.model';
import { UserService } from 'src/app/shared/services/api/user/user.service';
import { UserUpdationModel, UserFilterModel, UserModel } from 'src/app/shared/models/user/user.model';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { JwtTokenHelper } from 'src/app/shared/common/jwt-token-helper/jwt-token-helper';
import { Router } from '@angular/router';
import { Constants, Configs } from 'src/app/shared/common';
import * as $ from "jquery";

@Component({
  selector: 'user-management',
  styleUrls: ['./user-management.component.scss'],
  templateUrl: './user-management.component.html'
})

export class UserManagementComponent implements OnInit {
  //--- Boolean
  isAddNewState: boolean;
  isEditState: boolean;
  isDeactivateState: boolean;
  isActivateState: boolean;
  isResetPasswordState: boolean;
  isCollapse: boolean = false;
  isFilter: boolean = false;
  isToggleDropdown: boolean = false;

  //--- Model
  userManagementModels: UserManagementModel[] = [];
  userUpdationModel: UserUpdationModel;
  userFilterModel: UserFilterModel = new UserFilterModel();
  userInfo: UserModel = new UserModel();

  //--- Variables
  totalItems: number = 0;
  userActivateId: string;
  userDeactiveId: string;
  userResetPasswordId: string;
  currentPageSize: number;
  currentPageNumber: number;
  currentSortExpression: string;
  defaultSortUser: string = "FirstName desc";
  userSorting: string;

  //--- Datatable
  dataSource: MatTableDataSource<UserManagementModel>;
  selection = new SelectionModel<UserManagementModel>(true, []);
  displayedColumns: string[] = ['firstName', 'surname', 'email', 'company', 'status', 'edit', 'delete', 'resetpass'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    public clientState: ClientState,
    private userService: UserService,
    private authErrorHandler: AuthErrorHandler,
    private router: Router,
  ) {
    //--- Hide left menu
//    $("#top-header .project-name").hide();
//    $("#matSideNavMenu").hide();
//    $(".toggle-nav").hide();
 }

  public ngOnInit() {
    //--- Load data
    this.userInfo = JwtTokenHelper.GetUserInfo();
    if (this.userInfo) {
      if (this.userInfo.userType === "Admin") {
        this.onGetListUserData();
      } else {
        this.router.navigate(['access-denied']);
      }
    }
  }

  //--- Collapse
  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  }
  // Lookup List User
  onGetListUserData(pageIndex?: number, pageSize?: number, sortExpression?: string) {
    if (pageIndex >= 0) { this.currentPageNumber = pageIndex; pageIndex = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;

    this.isToggleDropdown = false;
    this.clientState.isBusy = true;
    this.isFilter = true;

    const firstName = this.userFilterModel.firstName;
    const surName = this.userFilterModel.surName;
    const email = this.userFilterModel.email;
    const role = this.userFilterModel.role;

    this.userService.getUserList(firstName, surName, email, role, pageIndex || 1, pageSize || Configs.DefaultPageSize, sortExpression || this.defaultSortUser).subscribe(res => {
      this.userManagementModels = res.items ? <UserManagementModel[]>[...res.items] : [];
      this.totalItems = res.totalItemCount;
      this.dataSource = new MatTableDataSource(this.userManagementModels);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.isFilter = false;
      this.authErrorHandler.handleError(err.message);
    });
  }
  onCancelLookup() {
    this.userFilterModel.firstName = "";
    this.userFilterModel.surName = "";
    this.userFilterModel.email = "";
  }
  //--- Add item
  onOpenAddModal = () => {
    this.isAddNewState = true;
  }

  onSuccessAddModal = (isSuccess: boolean) => {
    if (isSuccess) {
      this.isAddNewState = false;
      this.authErrorHandler.handleSuccess(Constants.AccountAdded);
      this.onGetListUserData();
    }
  }

  //--- Edit item
  onOpenEditModal = (id: string) => {
    this.clientState.isBusy = true;
    this.isEditState = true;

    this.userService.getUserById(id).subscribe(res => {
      this.clientState.isBusy = false;
      this.userUpdationModel = res;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.isEditState = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onSuccessEditModal = (isSuccess: boolean) => {
    if (isSuccess) {
      this.isEditState = false;
      this.authErrorHandler.handleSuccess(Constants.AccountUpdated);
      this.onGetListUserData();
    }
  }

  //--- Activate item
  onOpenActivateModal = (id: string) => {
    this.userActivateId = id;
    this.isActivateState = true;
  }

  onActivateConfirm = (isConfirm: boolean) => {
    if (isConfirm && this.userActivateId) {
      this.clientState.isBusy = true;

      this.userService.activateUser(this.userActivateId, '/login').subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.userActivateId = null;
          this.isActivateState = false;
          this.authErrorHandler.handleSuccess(Constants.AccountActivate);
          this.onGetListUserData();
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.userActivateId = null;
          this.isActivateState = false;
          this.authErrorHandler.handleError(err.message);
        },
      });
    }
  }

  //--- Deactivate item
  onOpenDeactivateModal = (id: string) => {
    this.userDeactiveId = id;
    this.isDeactivateState = true;
  }

  onDeactivateConfirm = (isConfirm: boolean) => {
    if (isConfirm && this.userDeactiveId) {
      this.clientState.isBusy = true;

      this.userService.deactivateUser(this.userDeactiveId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.userDeactiveId = null;
          this.isDeactivateState = false;
          this.authErrorHandler.handleSuccess(Constants.AccountDeactivate);
          this.onGetListUserData();
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.userDeactiveId = null;
          this.isDeactivateState = false;
          this.authErrorHandler.handleError(err.message);
        },
      });
    }
  }

  //--- Reset password
  onOpenResetPasswordModal = (id: string) => {
    this.userResetPasswordId = id;
    this.isResetPasswordState = true;
  }

  onResetPasswordConfirm = (isConfirm: boolean) => {
    if (isConfirm && this.userResetPasswordId) {
      this.clientState.isBusy = true;

      this.userService.resetAccountPassword(this.userResetPasswordId, '/reset-password').subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.userResetPasswordId = null;
          this.isResetPasswordState = false;
          this.authErrorHandler.handleSuccess(Constants.AccountResetPassword);
          this.onGetListUserData();
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.userResetPasswordId = null;
          this.isResetPasswordState = false;
          this.authErrorHandler.handleError(err.message);
        },
      });
    }
  }
  onSortData(sort: Sort) {
    let sortExpressionData: string;
    if (sort) {
      sortExpressionData = sort.active + " " + sort.direction;
      this.userSorting = sortExpressionData;
      this.onGetListUserData(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }

  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
  }

  onRefreshData() {
    this.onCancelLookup();
    if (this.userInfo) {
      if (this.userInfo.userType === "Admin") {
        this.onGetListUserData();
      } else {
        this.router.navigate(['access-denied']);
      }
    }
  }
}
