import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ITRAllocationModel } from 'src/app/shared/models/itr-tab/itr-allocation.model';
import { EquipmentLookUpModel } from 'src/app/shared/models/equipment/equipment.model';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { JwtTokenHelper } from 'src/app/shared/common/jwt-token-helper/jwt-token-helper';
import { ModuleProjectDefaultModel } from 'src/app/shared/models/module/module.model';
import { Configs } from 'src/app/shared/common/configs/configs';
import { ITRService } from 'src/app/shared/services/api/itr/itr.service';
import { Constants } from 'src/app/shared/common';
import { DataEquipmentService } from 'src/app/shared/services/api/data-tab/data-equipment.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'itr-allocation',
  templateUrl: './itr-allocation.component.html'
})

export class ITRAllocationComponent implements OnInit {
  isAddNewState: boolean;
  isEditState: boolean;
  isDeleteState: boolean;
  isDeleteAllState: boolean;
  isCollapse: boolean = false;
  isToggleDropdown: boolean = false;

  equipmentIdEditing: string;
  equipmentDeletionId: string;
  listEquipmentDeletionId: string;

  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;

  isHaveData: boolean = false;
  equipmentFilterCode: string[];
  descriptionFilter: string;

  isEnableDeleteAll: boolean = true;
  itrAllocationCount: number;

  itrAllocationModels: ITRAllocationModel[] = [];
  equipmentModels: EquipmentLookUpModel[] = [];
  moduleProjectDefaultModel: ModuleProjectDefaultModel = new ModuleProjectDefaultModel();
  projectKey: string;
  sub: any;
  moduleKey: string;

  defaultSortEquipment: string = "EquipmentCode desc";
  equipmentCode: string;
  description: string;
  dataSource: MatTableDataSource<ITRAllocationModel>;
  selection = new SelectionModel<ITRAllocationModel>(true, []);
  displayedColumns: string[] = ['select', 'equipmentTypeCode', 'description', 'noOfAssociatedTags', 'edit', 'delete'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  bufferSize = 100;
  equipmentTempModels: EquipmentLookUpModel[] = [];
  isEquipmentLoadingSelect: boolean;

  constructor(
    public clientState: ClientState,
    private authErrorHandler: AuthErrorHandler,
    private itrService: ITRService,
    private dataEquipmentService: DataEquipmentService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.sub = this.route.params.subscribe(params => {
      this.projectKey = params['projectKey'];
      this.moduleKey = params["moduleKey"];
      if (!this.projectKey || !this.moduleKey) {
        this.router.navigate([""]);
      }
    });
    this.selection.changed.subscribe(item => {
      this.isEnableDeleteAll = this.selection.selected.length == 0;
    })
  }

  public ngOnInit() {
    this.onGetITRAllocation(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSortEquipment);
    this.onGetLookUpEquipment();

    //--- Get module by user
    this.moduleProjectDefaultModel = JwtTokenHelper.GetModuleProjectDefault();
  }

  public reloadData(isAdd: boolean = false, itrItem: ITRAllocationModel = new ITRAllocationModel) {
    this.onGetITRAllocation(this.currentPageNumber, this.currentPageSize, this.currentSortExpression, "", "", isAdd, itrItem);
    this.onGetLookUpEquipment();
  }

  //--- Get itr data
  onGetITRAllocation = (pageNumber?: number, pageSize?: number, sortExpression?: string, equipmentCode?: string, description?: string, isAdd: boolean = false, itrItem: ITRAllocationModel = new ITRAllocationModel) => {
    this.isToggleDropdown = false;
    this.clientState.isBusy = true;

    if (isAdd) pageSize = pageSize ? pageSize - 1 : 49;

    if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;
    var codeList = [];
    if (this.equipmentFilterCode) {
      if (this.equipmentFilterCode instanceof Array && this.equipmentFilterCode.length > 0) {
        this.equipmentFilterCode.forEach(item => {
          codeList.push("'" + item + "'");
        });
        equipmentCode = codeList.toString();
      } else {
        equipmentCode = this.equipmentFilterCode.length > 0 ? "'" + this.equipmentFilterCode.toString() + "'" : '';
      }
    }
    if (this.descriptionFilter) description = this.descriptionFilter.trim();


    this.itrService.getEquipmentItrList(pageNumber || 1, pageSize || 50, this.projectKey, equipmentCode, description).subscribe(res => {
      this.itrAllocationModels = res.items ? <ITRAllocationModel[]>[...res.items] : [];
      if (isAdd) {
        this.itrAllocationModels = this.itrAllocationModels.filter(item => item.equipmentTypeId != itrItem.equipmentTypeId);
        this.itrAllocationModels = [itrItem].concat(this.itrAllocationModels);
      }
      if (this.itrAllocationModels.length > 0) this.isHaveData = true;
      this.dataSource = new MatTableDataSource(this.itrAllocationModels);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.itrAllocationCount = res.totalItemCount;

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Get equipment code
  // onGetEquipmentCode = () => {
  //   this.clientState.isBusy = true;
  //   this.dataEquipmentService.getEquipmentTypeLookUp().subscribe(res => {
  //     this.equipmentModels = res.content ? <EquipmentLookUpModel[]>[...res.content] : [];
  //     this.clientState.isBusy = false;
  //   }, (err: ApiError) => {
  //     this.clientState.isBusy = false;
  //     this.authErrorHandler.handleError(err.message);
  //   });
  // }

  //---Equipment
  onGetLookUpEquipment = () => {
    this.clientState.isBusy = true;
    this.dataEquipmentService.getEquipmentTypeLookUp(this.projectKey).subscribe(res => {
      this.equipmentModels = res.content ? <EquipmentLookUpModel[]>[...res.content] : [];
      this.equipmentTempModels = this.equipmentModels.slice(0, this.bufferSize);
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onScrollToEndEquipment = () => {
    if (this.equipmentModels.length > this.bufferSize) {
      const len = this.equipmentTempModels.length;
      const more = this.equipmentModels.slice(len, this.bufferSize + len);
      this.isEquipmentLoadingSelect = true;
      setTimeout(() => {
        this.isEquipmentLoadingSelect = false;
        this.equipmentTempModels = this.equipmentTempModels.concat(more);
      }, 500)
    }
  }

  onSearchEquipment = ($event) => {
    this.isEquipmentLoadingSelect = true;
    if ($event.term == '') {
      this.equipmentTempModels = this.equipmentModels.slice(0, this.bufferSize);
      this.isEquipmentLoadingSelect = false;
    } else {
      this.equipmentTempModels = this.equipmentModels;
      this.isEquipmentLoadingSelect = false;
    }
  }

  onClearEquipment = () => {
    this.equipmentTempModels = this.equipmentModels.slice(0, this.bufferSize);
  }
  //-----


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
      this.authErrorHandler.handleSuccess(Constants.EquipmentCreated);
      // this.reloadData();
    }
  }

  onAddSuccess = (itrItem: ITRAllocationModel) => {
    if (itrItem) {
      itrItem.isAddOrEdit = true;
      this.reloadData(true, itrItem);
    }
  }

  //--- Edit item
  onOpenEditModal = (equipmentId: string) => {
    this.isEditState = true;
    this.equipmentIdEditing = equipmentId;
  }

  onSuccessEditModal = (isSuccess: boolean) => {
    this.isEditState = false;
    this.equipmentIdEditing = null;
    if (isSuccess) {
      this.authErrorHandler.handleSuccess(Constants.EquipmentUpdated);
      // this.reloadData();
    }
  }

  onEditSuccess = (itrItem: ITRAllocationModel) => {
    if (itrItem) {
      itrItem.isAddOrEdit = true;
      this.itrAllocationModels.map(item => {
        if (itrItem.equipmentTypeId && item.equipmentTypeId == itrItem.equipmentTypeId) {
          Object.assign(item, itrItem);
        } else {
          item.isAddOrEdit = false;
        }
      })
    }
  }

  //--- Delete item
  onOpenDeleteModal = (equipmentId: string) => {
    this.equipmentDeletionId = equipmentId;
    this.isDeleteState = true;
  }

  onOpenDeleteAllModal() {
    if (this.selection && this.selection.selected.length > 0)
      this.isDeleteAllState = true;
    else this.authErrorHandler.handleError(Constants.ListEmpty + "Equipment!")
  }

  onDeleteAllConfirm(isConfirm: boolean) {
    if (!isConfirm) {
      this.isDeleteAllState = false;
      return;
    }

    var listIdDetelte = []
    if (isConfirm && this.selection && this.selection.selected.length > 0) {
      this.selection.selected.forEach(item => {
        listIdDetelte.push(item.equipmentTypeId)
      });

      this.listEquipmentDeletionId = listIdDetelte.toString();

      this.clientState.isBusy = true;
      this.itrService.deleteListEquipmet(this.listEquipmentDeletionId).subscribe({
        complete: () => {
          this.selection.clear();
          this.clientState.isBusy = false;
          this.isDeleteAllState = false;
          this.authErrorHandler.handleSuccess(Constants.EquipmentDeleted);
          this.reloadData();
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.isDeleteAllState = false;
          this.authErrorHandler.handleError(err.message);
        },
      });

    }
  }

  onLookup() {

  }

  onCancelLookup() {
    // this.isFilter = false;
    this.equipmentFilterCode = null;
    this.descriptionFilter = null;
  }


  onDeleteConfirm = (isConfirm: boolean) => {
    if (!isConfirm) {
      this.isDeleteState = false;
      return;
    }

    if (isConfirm && this.equipmentDeletionId) {
      this.clientState.isBusy = true;

      this.dataEquipmentService.deleteEquipment(this.equipmentDeletionId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.equipmentDeletionId = null;
          this.isDeleteState = false;
          this.authErrorHandler.handleSuccess(Constants.EquipmentDeleted);
          this.reloadData();
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.equipmentDeletionId = null;
          this.isDeleteState = false;
          this.authErrorHandler.handleError(err.message);
        },
      });
    }
  }

  onSortData(sort: Sort) {
    let sortExpressionData: string;
    if (sort) {
      sortExpressionData = sort.active + " " + sort.direction;
      this.onGetITRAllocation(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }

  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
  }

  onClearSearch() {
    this.equipmentFilterCode = [];
    this.descriptionFilter = null;
  }

  onRefreshData() {
    this.onClearSearch();
    this.onGetITRAllocation();
  }
}
