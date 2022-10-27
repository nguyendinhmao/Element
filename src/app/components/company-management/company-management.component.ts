import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { CompanyUpdationModel, CompanyColorModel, CompanyManagementModel } from 'src/app/shared/models/company-management/company-management.model';
import { CompanyService } from 'src/app/shared/services/api/companies/company.service';
import { Configs } from 'src/app/shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { UserModel } from 'src/app/shared/models/user/user.model';
import { JwtTokenHelper } from 'src/app/shared/common/jwt-token-helper/jwt-token-helper';
import { Router } from '@angular/router';
import { Constants } from 'src/app/shared/common';
import * as $ from "jquery";

@Component({
  selector: 'company-management',
  templateUrl: './company-management.component.html'
})

export class CompanyManagementComponent implements OnInit {
  //--- Boolean
  isAddNewState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;

  //--- Model
  companyManagementModels: CompanyManagementModel[] = [];
  companyUpdationModel: CompanyUpdationModel;
  userInfo: UserModel = new UserModel();

  //--- Variables
  companyDeletionId: string;
  companyColorModel: CompanyColorModel = new CompanyColorModel();
  totalItems: number = 0;

  //--- Datatable
  dataSource: MatTableDataSource<CompanyManagementModel>;
  displayedColumns: string[] = ['companyName', 'edit', 'delete'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    public clientState: ClientState,
    private companyService: CompanyService,
    private authErrorHandler: AuthErrorHandler,
    private router: Router,
  ) {
    //--- Hide left menu
  //  $("#top-header .project-name").hide();
  //  $("#matSideNavMenu").hide();
  //  $(".toggle-nav").hide();
  }

  public ngOnInit() {
    //--- Load data
    this.userInfo = JwtTokenHelper.GetUserInfo();
    if (this.userInfo) {
      if (this.userInfo.userType === "Admin") {
        this.onGetCompanyManagementData();
      } else {
        this.router.navigate(['access-denied']);
      }
    }
  }

  //--- Get company management data
  onGetCompanyManagementData = (pageIndex?: number, pageSize?: number) => {
    if (pageIndex) pageIndex = pageIndex + 1;
    this.clientState.isBusy = true;

    this.companyService.getCompanyList(pageIndex || 1, pageSize || 50).subscribe(res => {
      this.companyManagementModels = res.items ? <CompanyManagementModel[]>[...res.items] : [];
      this.totalItems = res.totalItemCount;
      this.companyManagementModels.forEach(function (item) {
        if (item.logoUrl) item.logoUrl = Configs.BaseSitePath + item.logoUrl;
      });
      this.dataSource = new MatTableDataSource(this.companyManagementModels);
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
      this.authErrorHandler.handleSuccess(Constants.CompanyCreated);
      this.onGetCompanyManagementData();
    }
  }

  //--- Edit item
  onOpenEditModal = (companyId: string) => {
    this.isEditState = true;
    this.clientState.isBusy = true;
    this.companyService.getCompanyById(companyId).subscribe(res => {
      this.companyUpdationModel = res ? <CompanyUpdationModel>{ ...res } : null;

      if (this.companyUpdationModel.logoUrl) {
        this.companyUpdationModel.fullPathLogoUrl = Configs.BaseSitePath + this.companyUpdationModel.logoUrl;
      } else {
        this.companyUpdationModel.fullPathLogoUrl = Configs.DefaultClientLogo;
      }

      if (this.companyUpdationModel.colorBranding) {
        let colorBrandingArr = this.companyUpdationModel.colorBranding.toString().split(";");
        this.companyColorModel.colorHeader = colorBrandingArr[0];
        this.companyColorModel.colorMainBackground = colorBrandingArr[1];
        this.companyColorModel.colorSideBar = colorBrandingArr[2];
        this.companyColorModel.colorTextColour1 = colorBrandingArr[3];
        this.companyColorModel.colorTextColour2 = colorBrandingArr[4];
      }

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onSuccessEditModal = (isSuccess: boolean) => {
    this.isEditState = false;

    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.CompanyUpdated);
      this.onGetCompanyManagementData();
    }
  }

  //--- Delete item
  onOpenDeleteModal = (id: string) => {
    this.companyDeletionId = id;
    this.isDeleteState = true;
  }

  onDeleteConfirm = (isConfirm: boolean) => {
    if (isConfirm && this.companyDeletionId) {
      this.clientState.isBusy = true;

      this.companyService.deleteCompany(this.companyDeletionId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.companyDeletionId = null;
          this.isDeleteState = false;
          this.authErrorHandler.handleSuccess(Constants.CompanyDeleted);
          this.onGetCompanyManagementData();
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.companyDeletionId = null;
          this.isDeleteState = false;
          this.authErrorHandler.handleError(err.message);
        },
      });
    }
  }
}
