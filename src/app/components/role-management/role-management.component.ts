import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { ClientState } from "src/app/shared/services/client/client-state";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { MatSort, Sort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { SelectionModel } from "@angular/cdk/collections";
import { RoleManagementModel, UpdateRoleManagementModel } from "src/app/shared/models/role-management/role-management.model";
import { RoleService } from "src/app/shared/services/api/role/role.service";
import { UserModel } from "src/app/shared/models/user/user.model";
import { AuthErrorHandler } from "src/app/shared/services/auth/auth.error-handler";
import { JwtTokenHelper } from "src/app/shared/common/jwt-token-helper/jwt-token-helper";
import { Router } from "@angular/router";
import { Constants, Configs } from "src/app/shared/common";
import { ExportParamModel, ExportModel } from "src/app/shared/models/data-tab/data-tab.model";
import * as $ from "jquery";

@Component({
  selector: "role-management",
  styleUrls: ["./role-management.component.scss"],
  templateUrl: "./role-management.component.html",
})

export class RoleManagementComponent implements OnInit {
  //--- Boolean
  isAddNewState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;
  isDeleteMultiState: boolean;
  isImportState: boolean;
  isCollapse: boolean = false;
  isFilter: boolean = false;
  isToggleDropdown: boolean = false;

  //--- Model
  userInfo: UserModel = new UserModel();
  roleManagementModels: RoleManagementModel[] = [];
  addRoleManagementModels: RoleManagementModel[] = [];
  updateRoleManagementModel: UpdateRoleManagementModel = new UpdateRoleManagementModel();
  exportRoleModel: ExportParamModel = new ExportParamModel();
  exportModel: ExportModel = new ExportModel();

  //--- Variables
  roleIdDelete: number;
  totalItems: number = 0;
  currentPageSize: number = Configs.DefaultPageSize;
  currentPageNumber: number = Configs.DefaultPageNumber;
  currentSortExpression: string;
  defaultSort: string = "name asc";
  roleSorting: string;
  searchKey: string;

  //--- Datatable
  dataSource: MatTableDataSource<RoleManagementModel>;
  selection = new SelectionModel<RoleManagementModel>(true, []);
  displayedColumns: string[] = ["select", "name", "code", "edit"];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatPaginator) paginator2: MatPaginator;

  constructor(
    public clientState: ClientState,
    private roleService: RoleService,
    private authErrorHandler: AuthErrorHandler,
    private router: Router
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
      this.onGetListRole();
    } else {
      this.router.navigate(["access-denied"]);
    }
  }

  //--- Collapse
  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  };

  // Lookup List User
  onGetListRole(
    searchKey?: string,
    sortExpression?: string,
    pageNumber?: number,
    pageSize?: number
  ) {
    if (searchKey) this.searchKey = searchKey;
    if (sortExpression) this.currentSortExpression = sortExpression;
    if (pageNumber >= 0) {
      this.currentPageNumber = pageNumber;
      pageNumber = this.currentPageNumber + 1;
    }
    if (pageSize > 0) this.currentPageSize = pageSize;

    this.isToggleDropdown = false;
    this.clientState.isBusy = true;
    this.isFilter = true;

    this.roleService
      .getRoleList(
        searchKey || "",
        sortExpression || this.defaultSort,
        pageNumber || Configs.DefaultPageNumber,
        pageSize || Configs.DefaultPageSize
      )
      .subscribe(
        (res) => {
          this.roleManagementModels = res.items
            ? <RoleManagementModel[]>[...res.items]
            : [];
          this.totalItems = res.totalItemCount;
          this.dataSource = new MatTableDataSource(this.roleManagementModels);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.clientState.isBusy = false;
        },
        (err: ApiError) => {
          this.clientState.isBusy = false;
          this.isFilter = false;
          this.authErrorHandler.handleError(err.message);
        }
      );
  }

  //--- Add item
  onOpenAddModal = () => {
    this.isAddNewState = true;
  };

  onSuccessAddModal = (isConfirm: boolean) => {
    this.isAddNewState = false;
    if (isConfirm) {
      this.authErrorHandler.handleSuccess(Constants.RoleManagementCreated);
      this.onRefreshData();
    }
  };

  //--- Edit item
  onOpenEditModal = (roleId: number) => {
    this.clientState.isBusy = true;
    this.isEditState = true;

    this.roleService.detailRole(roleId).subscribe(
      (res) => {
        this.updateRoleManagementModel = res
          ? <UpdateRoleManagementModel>{ ...res }
          : null;
        this.clientState.isBusy = false;
      },
      (err: ApiError) => {
        this.isEditState = false;
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      }
    );
  };

  onSuccessEditModal = (isConfirm: boolean) => {
    this.isEditState = false;
    if (isConfirm) {
      this.authErrorHandler.handleSuccess(Constants.RoleManagementUpdated);
      this.onGetListRole(
        this.searchKey,
        this.currentSortExpression,
        this.currentPageNumber,
        this.currentPageSize
      );
    }
  };

  //--- Delete item
  onOpenDeleteModal = (roleId?: number) => {
    if (roleId) {
      this.roleIdDelete = roleId;
      this.isDeleteState = true;
    }
  };

  onSuccessDeleteModal = (isConfirm: boolean) => {
    if (isConfirm && this.roleIdDelete) {
      this.clientState.isBusy = true;

      let listDeleted = [this.roleIdDelete];

      this.roleService.deleteRole(listDeleted).subscribe({
        complete: () => {
          this.roleIdDelete = null;
          this.isDeleteState = false;
          this.authErrorHandler.handleSuccess(Constants.RoleManagementDeleted);
          this.onRefreshData();
        },
        error: (err: ApiError) => {
          this.roleIdDelete = null;
          this.isDeleteState = false;
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        },
      });
    }
  };

  onOpenDeleteMultiModal = () => {
    this.isDeleteMultiState = true;
  };

  onSuccessDeleteMultiModal = (isConfirm: boolean) => {
    if (isConfirm && this.selection.selected.length > 0) {
      this.clientState.isBusy = true;

      let listDeleted = [];
      this.selection.selected.map(
        (role) => role.id && listDeleted.push(role.id)
      );

      this.roleService.deleteRole(listDeleted).subscribe({
        complete: () => {
          this.selection.clear();
          this.isDeleteMultiState = false;
          this.authErrorHandler.handleSuccess(Constants.RoleManagementDeleted);
          this.onRefreshData();
        },
        error: (err: ApiError) => {
          this.selection.clear();
          this.isDeleteMultiState = false;
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        },
      });
    }
  };

  //--- Import
  onOpenImportModal = () => {
    this.isImportState = true;
  };

  onSuccessImportModal = (isConfirm: boolean) => {
    this.isImportState = false;
    if (isConfirm) {
      this.authErrorHandler.handleSuccess(Constants.RoleManagementImported);
      this.onRefreshData();
    }
  };

  onExportExcel = () => {
    this.clientState.isBusy = true;
    this.exportRoleModel.module = "Role";
    this.exportRoleModel.filter = this.searchKey;
    this.exportRoleModel.sortExpression = this.currentSortExpression;
    this.roleService.exportToExcel(this.exportRoleModel).subscribe(
      (res) => {
        this.exportModel = res ? <ExportModel>{ ...res } : null;
        this.onSaveFile();
        this.authErrorHandler.handleSuccess(Constants.ChangeTypeExported);
        this.clientState.isBusy = false;
      },
      (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      }
    );
  };

  onSaveFile() {
    if (this.exportModel == undefined || this.exportModel == null) return;

    var bytes = this.base64ToArrayBuffer(this.exportModel.fileContent);
    var blob = new Blob([bytes], { type: this.exportModel.contentType });

    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    var edge = ua.indexOf("Edge");
    if (
      msie > 0 ||
      edge > 0 ||
      !!navigator.userAgent.match(/Trident.*rv\:11\./)
    ) {
      window.navigator.msSaveOrOpenBlob(blob, this.exportModel.fileName);
    } else {
      var url = window.URL;
      var downloadUrl = url.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = downloadUrl;
      a.download = this.exportModel.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  onSortData(sort: Sort) {
    let sortExpressionData: string;
    if (sort) {
      sortExpressionData = sort.active + " " + sort.direction;
      this.currentSortExpression = sortExpressionData;
      this.onGetListRole(
        this.searchKey,
        this.currentSortExpression,
        this.currentPageNumber,
        this.currentPageSize
      );
    }
  }

  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
  };

  onChangeSearch = () => {
    this.searchKey = this.searchKey
      ? this.onRemoveSpecialCharactersCode(this.searchKey)
      : this.searchKey;
  };

  onRemoveSpecialCharactersName = (str: string) => {
    return str && str.replace(/[^a-zA-Z0-9- ]/g, "");
  };

  onRemoveSpecialCharactersCode = (str: string) => {
    return (
      str &&
      str
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLocaleUpperCase()
        .substring(0, 15)
    );
  };

  onClearFilter() {
    this.searchKey = "";
  }

  onRefreshData() {
    if (this.userInfo) {
      this.onClearFilter();
      this.selection.clear();
      this.currentPageNumber = Configs.DefaultPageNumber;
      this.currentPageSize = Configs.DefaultPageSize;
      if (this.paginator2 && this.paginator2.pageIndex) {
        this.paginator2.pageIndex = Configs.DefaultPageNumber;
      }
      this.onGetListRole();
    } else {
      this.router.navigate(["access-denied"]);
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  checkboxLabel(row?: RoleManagementModel): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.id + 1
      }`;
  }
}
