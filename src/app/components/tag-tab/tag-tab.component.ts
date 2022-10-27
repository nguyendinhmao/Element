import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ClientState } from "src/app/shared/services/client/client-state";
import { TabTagModel, TagTypeModel, DataApplyModel, SynchronizeDataCommand, TagDrawingModel, DownloadDetailStatus } from "src/app/shared/models/tab-tag/tab-tag.model";
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import { MatSort, Sort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { AuthErrorHandler } from "src/app/shared/services/auth/auth.error-handler";
import { DataTagNoModel, TagLookUpModel } from "src/app/shared/models/data-tab/data-tagno.model";
import { DataTagNoService } from "src/app/shared/services/api/data-tab/data-tagno.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { Configs, Constants, JwtTokenHelper, PermissionsViews } from "src/app/shared/common";
import { WorkPackLookUpModel } from "src/app/shared/models/data-tab/data-workpack.model";
import { LocationLookUpModel } from "src/app/shared/models/data-tab/data-location.model";
import { SubSystemLookUpModel } from "src/app/shared/models/data-tab/data-subsystem.model";
import { PackageLookUpModel } from "src/app/shared/models/package/package.model";
import { EquipmentLookUpModel } from "src/app/shared/models/equipment/equipment.model";
import { SystemLookUpModel } from "src/app/shared/models/data-tab/data-system.model";
import { AuthInProjectDto, ProjectLookupModel } from "src/app/shared/models/project-management/project-management.model";
import { MockTabTypeApi } from "src/app/shared/mocks/mock.tag-type";
import { DataWorkpackService } from "src/app/shared/services/api/data-tab/data-workpack.service";
import { DataLocationService } from "src/app/shared/services/api/data-tab/data-location.service";
import { DataSubSystemService } from "src/app/shared/services/api/data-tab/data-subsystem.service";
import { DataEquipmentService } from "src/app/shared/services/api/data-tab/data-equipment.service";
import { DataSystemService } from "src/app/shared/services/api/data-tab/data-system.service";
import { ProjectService } from "src/app/shared/services/api/projects/project.service";
import { DataDisciplineService } from "src/app/shared/services/api/data-tab/data-discipline.service";
import { DisciplineLookUpModel } from "src/app/shared/models/data-tab/data-discipline.model";
import { JobCardLookUpModel } from "src/app/shared/models/data-tab/data-jobcard.model";
import * as $ from "jquery";
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { DownloadStatusService, IdbService, ReloadSideMenuService, ReloadAfterSynchronizingService } from 'src/app/shared/services';
import { IndexRelatedSNs, ItemNeedSync, ReloadPageKey, ResponseKeys, ResponseSyncItem, StoreNames, TypeDownloadAndSync, TypeDownloadRequest } from 'src/app/shared/models/common/common.model';
import { TagTabService } from 'src/app/shared/services/api/tag-tab/tag-tab.service';

import { Plugins } from '@capacitor/core';
import { ItrRecordDetail } from 'src/app/shared/models/tab-tag/itr-record.model';
import { PunchPageListModel } from 'src/app/shared/models/punch-page/punch-page.model';
import { HttpEvent, HttpEventType } from "@angular/common/http";
import { DetailPreservationTabModel, PreservationModel } from "src/app/shared/models/preservation-tab/preservation-tab.model";
import { ConveyData2SyncDetailService } from "src/app/shared/services/utils/utils-sub.service";
const { Network } = Plugins;
@Component({
  selector: "tag-tab",
  templateUrl: "./tag-tab.component.html",
  styleUrls: ["./tag-tab.component.scss"],
})

export class TagTabComponent implements OnInit, AfterViewInit {
  @ViewChild("tableContainer") tableContainer: ElementRef;

  //--- Model
  tabTagModels: TabTagModel[] = [];
  dataTagNoModels: DataTagNoModel[] = [];
  packageLookUpModels: PackageLookUpModel[] = [];
  projectLookupModels: ProjectLookupModel[] = [];
  tagLookupModels: TagLookUpModel[] = [];
  dataTagTypeModels: TagTypeModel[] = [];
  dataApplyModel: DataApplyModel = new DataApplyModel();
  dataTagNoModelsTemp = [];
  tagParentLookupModels: TagLookUpModel[] = [];
  tagUpdateIds: string[] = [];

  msg = {
    notDownloadLocked: 'Can not download locked Tag',
    please: 'Please choose again.',
    someNotIn: 'Some preservation of tag not in local',
    notInLocal: 'Preservation of tag is not in local',
  }

  //--- Discipline Models
  disciplineModels: DisciplineLookUpModel[] = [];
  disciplineTempModels: DisciplineLookUpModel[] = [];

  //--- System Models
  systemModels: SystemLookUpModel[] = [];
  systemTemModels: SystemLookUpModel[] = [];

  //--- Subsystem Models
  subSystemLookUpModels: SubSystemLookUpModel[] = [];
  subSystemTempModel: SubSystemLookUpModel[] = [];

  //--- Workpack Models
  workPackLookUpModels: WorkPackLookUpModel[] = [];
  workPackTempModel: WorkPackLookUpModel[] = [];

  //--- Location Models
  locationLookUpModels: LocationLookUpModel[] = [];
  locationTempModel: LocationLookUpModel[] = [];

  //--- Equipment Models
  equipmentLookUpModel: EquipmentLookUpModel[] = [];
  equipmentTempModel: EquipmentLookUpModel[] = [];

  //--- Location Filter Models
  locationLookUpFilterModels: LocationLookUpModel[] = [];
  locationFilterTempModel: LocationLookUpModel[] = [];

  //--- Equipment Filter Models
  equipmentLookUpFilterModel: EquipmentLookUpModel[] = [];
  equipmentFilterTempModel: EquipmentLookUpModel[] = [];

  //--- Subsystem Filter Models
  subSystemLookUpFilterModels: SubSystemLookUpModel[] = [];
  subSystemFilterTempModel: SubSystemLookUpModel[] = [];

  //--- System Filter Models
  systemFilterModels: SystemLookUpModel[] = [];
  systemFilterTemModels: SystemLookUpModel[] = [];

  //--- Discipline Models
  disciplineFilterModels: DisciplineLookUpModel[] = [];
  disciplineFilterTempModels: DisciplineLookUpModel[] = [];

  //--- API
  private mockTabTypeApi = new MockTabTypeApi();

  //--- Boolean
  isCollapse: boolean;
  isDeleteState: boolean;
  isEditState: boolean = true;
  isApplyState: boolean;
  isApplyToAllState: boolean;
  isEnableApplyToAll: boolean;
  isEnableApply: boolean;
  isHaveData: boolean;
  isShowRightSideBar: boolean;
  isShowJobCardsInfo: boolean;
  isLoadingSelect: boolean;
  isLoadingSelectSystem: boolean;
  isLoadingSelectSubSystem: boolean;
  isLoadingSelectLocation: boolean;
  isLoadingSelectWorkPack: boolean;
  isLoadingSelectEquipment: boolean;
  isToggleDropdown: boolean;
  isLoadingSelectLocationFilter: boolean;
  isLoadingSelectEquipmentFilter: boolean;
  isLoadingSelectSubSystemFilter: boolean;
  isLoadingSelectSystemFilter: boolean;
  isLoadingDisciplineSelectFilter: boolean;
  isShowITRBuilder: boolean;
  isReleaseState: boolean;
  isSyncSelectedState: boolean;
  isLockedTag: boolean;
  isShowEditTagNo: boolean;
  isConfirmSaveTagNo: boolean;
  isShowAllocatedITRs: boolean;
  isLoadDetailChart: boolean;
  isLoadTagItrByTag: boolean;
  isShowAddPunch: boolean;
  isSyncAllState: boolean = false;
  isRevertState: boolean = false;
  hasValueIndexedDB: boolean = false;
  isToggleRightSide: boolean = false;
  isShowDrawings = false;

  //--- Variable
  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;
  defaultSortTagNo: string = "TagNo asc";
  projectKey: string;
  sub: Subscription;
  tagNoCount: number = 0;
  bufferSize = 100;
  tagNoDeletionId: string;
  tagNoSorting: string;
  releaseTag: DataTagNoModel;
  permissionsViews = PermissionsViews;
  authInProjectDto: AuthInProjectDto[] = [];
  drawings2Info = [];
  tagIdDrawing = '';
  selectionDownloading = [];
  tagLockedList = [];
  tagNeedSyncList: ItemNeedSync[] = new Array<ItemNeedSync>();
  typeDownloadAndSync = TypeDownloadAndSync;

  //--- Filter
  systemFilter: string;
  subSystemFilter: string;
  parentFilter: string;
  disciplineFilter: string;
  equipmentTypeFilter: string;
  statusFilter: string;
  locationFilter: string;
  tagTypeFilter: string;
  dataJobCards: JobCardLookUpModel[] = [];
  tagIdDetail: string;
  tagNoDetail: string;
  tagDescriptionDetail: string;
  _storeName: string;

  statusFilterModel: [
    {
      value: "true";
      label: "Active";
    },
    {
      value: "false";
      label: "InActive";
    }
  ];

  isApiPending: boolean;

  //--- Table datasource
  dataSource: MatTableDataSource<DataTagNoModel>;
  selection = new SelectionModel<DataTagNoModel>(true, []);
  displayedColumns: string[] = [
    "select",
    "tagNo",
    "locked",
    "tagName",
    "system",
    "subSystem",
    "parent",
    "drawings",
    "locationCode",
    "discipline",
    "tagType",
    "equipmentType",
    "workPackNo",
    "jobCardLookUpValueModels",
    "lockedBy",
    "lockedDate",
    "status",
    "delete",
  ];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  //--- itr
  idItrSelected: string = "";

  constructor(
    public clientState: ClientState,
    private authErrorHandler: AuthErrorHandler,
    private datatagNoService: DataTagNoService,
    private tagTabService: TagTabService,
    private workPackService: DataWorkpackService,
    private locationService: DataLocationService,
    private subSystemService: DataSubSystemService,
    private equipmentService: DataEquipmentService,
    private systemService: DataSystemService,
    private projectService: ProjectService,
    private dataDisciplineService: DataDisciplineService,
    private idbService: IdbService,
    private route: ActivatedRoute,
    private router: Router,
    private reloadSideMenuService: ReloadSideMenuService,
    private reloadAfterSyncS: ReloadAfterSynchronizingService,
    private downloadStatusService: DownloadStatusService,
    private conveyData2SDService: ConveyData2SyncDetailService,
  ) {
    this.selection.changed.subscribe((item) => {
      this.isEnableApply = this._isEnableApply(this.selection.selected);
      this.isEnableApplyToAll = this._isEnableApplyAll(this.selection.selected, this.dataSource.data);
    }),
      (this.sub = this.route.params.subscribe((params) => {
        this.projectKey = params["projectKey"];
        if (!this.projectKey) {
          this.router.navigate([""]);
        }
      }));
    this._storeName = StoreNames.tags;

    this.reloadAfterSyncS.getMessage().subscribe((res) => {
      if (res.key === ReloadPageKey.tag) {
        // this.onGetTagTab();
        this.resetStatusTagDownloadOff(this.typeDownloadAndSync.synchronizing, res.response[ResponseKeys.tags]);
      }
    });

    this.downloadStatusService.getMessage4Tags().subscribe((res) => {
      if (!res.isDownloading && res.requestAmount === 0) {
        this.selectionDownloading = new Array();
      }
    });
  }

  _isEnableApply(selectedTags: DataTagNoModel[]) {
    if (selectedTags.length === 0) { return false; }
    const _notLockedTags = selectedTags.filter(tag => !tag.locked);
    return _notLockedTags.length !== 0;
  }

  _isEnableApplyAll(selectedTags: DataTagNoModel[], dataSource: DataTagNoModel[]) {
    if (selectedTags.length === 0) { return false; }
    const _notLockedTags = selectedTags.filter(tag => !tag.locked);
    const _notLockedTagsOrigin = dataSource.filter(tag => !tag.locked);
    return _notLockedTags.length === _notLockedTagsOrigin.length;
  }

  onCheckPermission = (key: string) => {
    this.authInProjectDto = JwtTokenHelper.GetAuthProject()
      ? <AuthInProjectDto[]>[...JwtTokenHelper.GetAuthProject()]
      : [];
    return JwtTokenHelper.IsAuthInProject(key, this.authInProjectDto);
  };

  ngAfterViewInit(): void {
    const tableContainerHeight = $(window).height() - 230;
    if (tableContainerHeight > 0) {
      this.tableContainer.nativeElement.style.maxHeight = tableContainerHeight + "px";
    }
  }

  public ngOnInit() {
    this.statusFilterModel = [
      {
        value: "true",
        label: "Active",
      },
      {
        value: "false",
        label: "InActive",
      },
    ];
    if (!this.isOffline) { this.onGetAllDataRelate(); } //temporary
    this.onGetTagTab();
  }

  onGetAllDataRelate = () => {
    this.clientState.isBusy = true;
    Promise.all([
      this.onGetLookUpSystem(),
      this.onGetLookUpTag(),
      this.onGetDisciplineLookup(),
      this.onEquipmentTypeLookUp(),
      this.onGetWorkPackLookUp(),
      this.onGetLocationLookUp(),
      this.onGetProjectLookUp(),
      this.onGetTagType(),
      this.onGetLocationLookUpFilter(),
      this.onEquipmentTypeLookUpFilter(),
      this.onGetLookUpSystemFilter(),
      this.onGetDisciplineFilterLookup(),
      this.onGetLookUpTagParent(),
    ])
      .then((res) => {
        this.clientState.isBusy = false;
      })
      .catch((err: ApiError) => {
        this.clientState.isBusy = false;
      });
  };

  //--- Check info device
  get isTablet() {
    return InfoDevice.isTablet;
  }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  onGetTagTab = (
    pageNumber?: number,
    pageSize?: number,
    sortExpression?: string
  ) => {
    this.isToggleDropdown = false;
    this.selection.clear();
    this.onCheckValueIndexedDB();
    this.onHasSelectedTagInIndexedDB();

    if (pageNumber >= 0) {
      this.currentPageNumber = pageNumber;
      pageNumber = this.currentPageNumber + 1;
    }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;

    if (this.isOffline) {
      this.idbService.getAllData(this._storeName).then((res) => {
        const _softParts = sortExpression ? sortExpression.split(' ') : ["tagNo", "asc"];
        const _sortedData = this.sortTagOffline(res, _softParts[0], _softParts[1]);
        this.assignDataTag(_sortedData);
        this.tagNoCount = this.dataTagNoModels.length;
      }, (err) => { })
    } else {
      this.clientState.isBusy = true;
      this.datatagNoService
        .getDataTagPage(
          this.projectKey,
          pageNumber || Configs.DefaultPageNumber,
          pageSize || Configs.DefaultPageSize,
          sortExpression || this.defaultSortTagNo,
          this.systemFilter || "",
          this.subSystemFilter || "",
          this.parentFilter || "",
          this.disciplineFilter || "",
          this.equipmentTypeFilter || "",
          this.statusFilter || "",
          this.locationFilter || "",
          this.tagTypeFilter || ""
        )
        // this.mockTabListApi.getTagTypeData()
        .subscribe(
          (res) => {
            this.tagNoCount = res.totalItemCount;
            this.assignDataTag(res.items);
            this.clientState.isBusy = false;
          },
          (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
          }
        );
    }
  };

  resetStatusTagDownloadOff(fromType: string, source: any[]) {
    // update Type based on input
    switch (fromType) {
      case this.typeDownloadAndSync.synchronizing:
        this.tagNeedSyncList = this.tagNeedSyncList.map(_t => {
          if (source.some(_item => _item.id === _t.id && _item.isCompleted)) {
            return { ..._t, ...{ type: this.typeDownloadAndSync.syncSuccessful } };
          } else if (source.some(_item => _item.id === _t.id && !_item.isCompleted)) {
            return { ..._t, ...{ type: this.typeDownloadAndSync.syncFailed } };
          }
          return _t;
        });
        // remove syncing or reverting success on UI
        this.dataTagNoModels = this.dataTagNoModels.map(_t => {
          if (source.some(_item => _item.id === _t.tagId && _item.isCompleted)) {
            return {
              ..._t, ...{
                locked: false,
                lockedBy: null,
                lockedDate: null,
              }
            };
          }
          return _t;
        });
        break;
      case this.typeDownloadAndSync.reverting:
        this.tagNeedSyncList = this.tagNeedSyncList.map(_t => {
          if (source.some(_item => _item.id === _t.id)) {
            return { ..._t, ...{ type: this.typeDownloadAndSync.removed } };
          }
          return _t;
        });
        // remove syncing or reverting success on UI
        this.dataTagNoModels = this.dataTagNoModels.map(_t => {
          if (source.some(_item => _item.id === _t.tagId)) {
            return {
              ..._t, ...{
                locked: false,
                lockedBy: null,
                lockedDate: null,
              }
            };
          }
          return _t;
        });
        break;
    }
    this.selection.clear();
    if (this.dataTagNoModels.length > 0) this.isHaveData = true;
    this.getTagLockedList(this.dataTagNoModels);
    this.dataSource = new MatTableDataSource(this.dataTagNoModels);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    this.dataTagNoModelsTemp = [];
    this.dataTagNoModels.forEach((item) => {
      this.dataTagNoModelsTemp.push(Object.assign({}, item));
    });
  }

  toggleSelection(row: DataTagNoModel) {
    this.selection.toggle(row);
    if (this.selection.isSelected(row)) {
      this.onHasSelectedTagInIndexedDB();
    }
  }

  getTagNeedSyncList() {
    const _snTags = StoreNames.tags;
    this.tagNeedSyncList = new Array<ItemNeedSync>();
    this.idbService.getAllData(_snTags).then(_localTags => {
      _localTags.forEach(_t => this.tagNeedSyncList.push({ id: _t.tagId, isChanged: !!_t.isChanged, type: this.typeDownloadAndSync.downloaded }));
    });
  }

  getTagLockedList(tags) {
    this.tagLockedList = new Array();
    tags.forEach(_tag => (_tag.locked) && (this.tagLockedList.push(_tag.tagId)));
  }

  getTagInLocal(tagId: string) {
    if (!tagId) { return false; }
    return (this.tagNeedSyncList && this.tagNeedSyncList.length > 0 && this.tagNeedSyncList.some(_t => _t.id === tagId));
  }

  onCheckTagNeedSync(tagId: string) {
    if (!tagId) { return false; }
    const _tNeed = this.tagNeedSyncList.find(_t => _t.id === tagId);
    return _tNeed.isChanged;
  }

  onCheckType(positionType: string, tagId: string) {
    return this.tagNeedSyncList.some(_tag => _tag.id === tagId && _tag.type === positionType);
  }

  onShowDrawings(drawings: TagDrawingModel[], tagId: string) {
    this.drawings2Info = drawings;
    this.tagIdDrawing = tagId;
    this.isShowDrawings = true;
  }

  onPreviewDrawings(isConfirm: boolean) {
    this.drawings2Info = null;
    this.tagIdDrawing = '';
    this.isShowDrawings = false;
  }

  onCheckValueIndexedDB() {
    Promise.all([
      // check tags
      new Promise((resolve, reject) => {
        const _snTag = StoreNames.tags;
        this.idbService.getAllData(_snTag).then((res) => {
          resolve(res.length > 0);
        }, (err) => {
          reject(err);
        });
      }),
      // check punches
      new Promise((resolve, reject) => {
        const _snPunches = StoreNames.punches;
        this.idbService.getAllData(_snPunches).then((res) => {
          resolve(res.length > 0);
        }, (err) => {
          reject(err);
        });
      }),
    ]).then((listResult) => {
      this.hasValueIndexedDB = listResult.some(_r => _r === true);
      this.reloadSideMenuService.sendMessage(true);
    }, err => { });
  }

  onHasSelectedTagInIndexedDB() {
    // let _hasValue = false;
    // let _temp = (this.selection.selected).find(tag => {

    //   return this.idbService.getItem(this._storeName, tag.tagId).then((res) => {
    //     return !!res;
    //   }, (err) => { });
    // });

  }

  sortTagOffline(tagModels: DataTagNoModel[], column: string, order: string) {
    if (!this.isOffline) { return tagModels; }
    switch (order) {
      case 'asc':
        tagModels.sort((a, b) => ((a[column] || '').localeCompare(b[column] || '')));
        break;
      case 'desc':
        tagModels.sort((a, b) => (-1) * ((a[column] || '').localeCompare(b[column] || '')));
        break;
    }
    return tagModels;
  }

  assignDataTag(response, isPromise = false) {
    this.dataTagNoModels = response
      ? <DataTagNoModel[]>[...response]
      : [];
    if (this.dataTagNoModels.length > 0) this.isHaveData = true;
    this.getTagLockedList(this.dataTagNoModels);
    this.dataSource = new MatTableDataSource(this.dataTagNoModels);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    this.dataTagNoModelsTemp = [];
    this.dataTagNoModels.forEach((item) => {
      this.dataTagNoModelsTemp.push(Object.assign({}, item));
    });
    this.getTagNeedSyncList();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected = () => {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource && this.dataSource.data.length;
    return numSelected === numRows;
  };

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle = () => {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.isEnableApplyToAll = false;
      this.isEnableApply = false;
    } else {
      this.dataSource.data.forEach((row) => this.selection.select(row));
      this.isEnableApplyToAll = true;
      this.isEnableApply = true;
    }
  };

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: DataTagNoModel): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.tagNo + 1
      }`;
  }

  //--- Open right side bar
  openRightSideBar = (tag: DataTagNoModel) => {
    this.tagIdDetail = tag.tagId;
    this.tagNoDetail = tag.tagNo;
    this.tagDescriptionDetail = tag.tagName;
    this.isLockedTag = tag.locked;

    this.isShowRightSideBar = true;
    this.isShowITRBuilder = false;
    this.isConfirmSaveTagNo = false;
    this.isLoadDetailChart = false;
    this.isLoadTagItrByTag = false;
    this.isToggleRightSide = this.isTablet;
  };

  closeRightSideBar = () => {
    this.isShowRightSideBar = false;
    this.isToggleRightSide = false;
    if (!this.isShowITRBuilder) {
      this.onGetTagTab();
    }
  };

  openRightSide = () => {
    this.isShowRightSideBar = true;
  };

  //--- Collapse
  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  };

  //--- Edit
  onEditTagTab = () => {
    this.isToggleDropdown = false;
    this.isEditState = false;
  };

  //--- Cancel
  onCancelTagTab = () => {
    this.isEditState = true;
  };

  //--- Delete item
  onOpenDeleteModal = (id) => {
    this.tagNoDeletionId = id;
    this.isDeleteState = true;
  };

  onDeleteConfirm = (isConfirm: boolean) => {
    if (!isConfirm) {
      this.isDeleteState = false;
      return;
    }
    if (isConfirm && this.tagNoDeletionId) {
      this.clientState.isBusy = true;

      this.datatagNoService.deleteTagNo(this.tagNoDeletionId).subscribe({
        complete: () => {
          this.tagNoDeletionId = null;
          this.isDeleteState = false;
          this.onGetTagTab();
          this.clientState.isBusy = false;
          this.authErrorHandler.handleSuccess(Constants.TagNoDeleted);
        },
        error: (err: ApiError) => {
          this.tagNoDeletionId = null;
          this.isDeleteState = false;
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        },
      });
    }
  };

  //--- Apply item
  onOpenApplyModal = () => {
    this.isApplyState = true;
  };

  onApplyData = (isConfirm: boolean) => {
    let dataTagModify = [];
    if (isConfirm && this.selection && this.selection.selected.length > 0) {
      this.selection.selected.forEach((item) => {
        if (item.locked) { return; }
        dataTagModify.push(item);
      });
      if (dataTagModify.length > 0) {
        this.clientState.isBusy = true;
        this.datatagNoService
          .applyTagList(dataTagModify, {
            ...this.dataApplyModel,
            systemName:
              this.dataApplyModel.systemId &&
              this.onGetObjectFromId(
                this.systemModels,
                this.dataApplyModel.systemId.toString()
              ),
            subSystemName:
              this.dataApplyModel.subSystemId &&
              this.onGetObjectFromId(
                this.subSystemLookUpModels,
                this.dataApplyModel.subSystemId.toString()
              ),
            parent:
              this.dataApplyModel.parentId &&
              this.onGetObjectFromId(
                this.tagLookupModels,
                this.dataApplyModel.parentId.toString()
              ),
            locationCode:
              this.dataApplyModel.locationId &&
              this.onGetObjectFromId(
                this.locationLookUpModels,
                this.dataApplyModel.locationId.toString()
              ),
            disciplineName:
              this.dataApplyModel.disciplineId &&
              this.onGetObjectFromId(
                this.disciplineModels,
                this.dataApplyModel.disciplineId.toString()
              ),
            tagTypeName:
              this.dataApplyModel.tagType &&
              this.onGetObjectFromId(
                this.dataTagTypeModels,
                this.dataApplyModel.tagType.toString()
              ),
            equipmentTypeName:
              this.dataApplyModel.equipmentTypeId &&
              this.onGetObjectFromId(
                this.equipmentLookUpModel,
                this.dataApplyModel.equipmentTypeId.toString()
              ),
            workPackName:
              this.dataApplyModel.workPackId &&
              this.onGetObjectFromId(
                this.workPackLookUpModels,
                this.dataApplyModel.workPackId.toString()
              ),
          })
          .subscribe(
            (res) => {
              let dataTemp = res.content
                ? <DataTagNoModel[]>[...res.content]
                : [];
              if (dataTemp && dataTemp.length > 0)
                dataTemp.map((tagNoTempItem) => {
                  this.dataTagNoModels.map((tagNoItem, index) => {
                    Object.assign(this.dataTagNoModelsTemp[index], tagNoItem);
                    if (tagNoItem.tagId == tagNoTempItem.tagId) {
                      Object.assign(this.dataTagNoModels[index], tagNoTempItem);
                    }
                  });
                });
              this.dataApplyModel = new DataApplyModel();
              this.isApplyState = false;
              this.isApplyToAllState = false;
              this.selection.clear();
              this.clientState.isBusy = false;
              this.authErrorHandler.handleSuccess(
                "Tag Changed"
              );
            },
            (err: ApiError) => {
              this.isApplyState = false;
              this.isApplyToAllState = false;
              this.clientState.isBusy = false;
              this.authErrorHandler.handleError(err.message);
            }
          );
      }
    }
  };

  onApplyConfirm = (isConfirm: boolean) => {
    if (!isConfirm) {
      this.isApplyState = false;
      return;
    }
    this.onApplyData(isConfirm);
  };

  onGetObjectFromId = (arr: any[], id: string) => {
    let result = arr.filter((x) => x.id == id);
    return result && result.length > 0 ? result[0].value : null;
  };

  //--- Apply item
  onOpenApplyToAllModal = () => {
    this.isApplyToAllState = true;
  };

  onApplyToAllConfirm = (isConfirm: boolean) => {
    if (!isConfirm) {
      this.isApplyToAllState = false;
      return;
    }
    this.onApplyData(isConfirm);
  };

  //Look up
  onChangeTagNoCode = (event) => {
    const regex = /r'^[a-zA-Z0-9\+]*$'/;
    let codeMatch = regex.test(event.target.value);
    if (codeMatch && event.target.value.length > 10) {
      this.authErrorHandler.handleError("Tag No Code maximum 10 characters");
      return;
    }
    if (!codeMatch && event.target.value.length > 1) {
      this.authErrorHandler.handleError(
        "TagNo Code which allows only the a-zA-Z0-9 characters"
      );
      return;
    }
    return;
  };

  onGetWorkPackLookUp = () => {
    return new Promise((resolve, reject) => {
      this.workPackService.getWorkPackLookUp(this.projectKey).subscribe(
        (res) => {
          this.workPackLookUpModels = res.content
            ? <WorkPackLookUpModel[]>[...res.content]
            : [];
          this.workPackTempModel = this.workPackLookUpModels.slice(
            0,
            this.bufferSize
          );
          resolve(res.content);
        },
        (err: ApiError) => {
          reject(err.message);
          this.authErrorHandler.handleError(err.message);
        }
      );
    });
  };

  onScrollToWorkPack = () => {
    if (this.workPackLookUpModels.length > this.bufferSize) {
      const len = this.workPackTempModel.length;
      const more = this.workPackLookUpModels.slice(len, this.bufferSize + len);
      this.isLoadingSelectWorkPack = true;
      setTimeout(() => {
        this.isLoadingSelectWorkPack = false;
        this.workPackTempModel = this.workPackTempModel.concat(more);
      }, 500);
    }
  };

  onSearchWorkPack = ($event) => {
    this.isLoadingSelectWorkPack = true;
    if ($event.term == "") {
      this.workPackTempModel = this.workPackLookUpModels.slice(
        0,
        this.bufferSize
      );
      this.isLoadingSelectWorkPack = false;
    } else {
      this.workPackTempModel = this.workPackLookUpModels;
      this.isLoadingSelectWorkPack = false;
    }
  };

  onClearWorkPack = () => {
    this.workPackTempModel = this.workPackLookUpModels.slice(
      0,
      this.bufferSize
    );
  };

  //--- Location
  onGetLocationLookUp = () => {
    return new Promise((resolve, reject) => {
      this.locationService.getLocationLookUp(this.projectKey).subscribe(
        (res) => {
          this.locationLookUpModels = res.content
            ? <LocationLookUpModel[]>[...res.content]
            : [];
          this.locationTempModel = this.locationLookUpModels.slice(
            0,
            this.bufferSize
          );
          resolve(res.content);
        },
        (err: ApiError) => {
          reject(err.message);
          this.authErrorHandler.handleError(err.message);
        }
      );
    });
  };

  onScrollToLocation = () => {
    if (this.locationLookUpModels.length > this.bufferSize) {
      const len = this.locationTempModel.length;
      const more = this.locationLookUpModels.slice(len, this.bufferSize + len);
      this.isLoadingSelectLocation = true;
      setTimeout(() => {
        this.isLoadingSelectLocation = false;
        this.locationTempModel = this.locationTempModel.concat(more);
      }, 500);
    }
  };

  onSearchLocation = ($event) => {
    this.isLoadingSelectLocation = true;
    if ($event.term == "") {
      this.locationTempModel = this.locationLookUpModels.slice(
        0,
        this.bufferSize
      );
      this.isLoadingSelectLocation = false;
    } else {
      this.locationTempModel = this.locationLookUpModels;
      this.isLoadingSelectLocation = false;
    }
  };

  onClearLocation = () => {
    this.locationTempModel = this.locationLookUpModels.slice(
      0,
      this.bufferSize
    );
  };
  //--- /Location

  //--- Equipment
  onEquipmentTypeLookUp = () => {
    return new Promise((resolve, reject) => {
      this.equipmentService.getEquipmentTypeLookUp(this.projectKey).subscribe(
        (res) => {
          this.equipmentLookUpModel = res.content
            ? <EquipmentLookUpModel[]>[...res.content]
            : [];
          this.equipmentTempModel = this.equipmentLookUpModel.slice(
            0,
            this.bufferSize
          );
          resolve(res.content);
        },
        (err: ApiError) => {
          reject(err.message);
          this.authErrorHandler.handleError(err.message);
        }
      );
    });
  };

  onScrollToEquipmentType = () => {
    if (this.equipmentLookUpModel.length > this.bufferSize) {
      const len = this.equipmentTempModel.length;
      const more = this.equipmentLookUpModel.slice(len, this.bufferSize + len);
      this.isLoadingSelectEquipment = true;
      setTimeout(() => {
        this.isLoadingSelectEquipment = false;
        this.equipmentTempModel = this.equipmentTempModel.concat(more);
      }, 500);
    }
  };

  onSearchEquipmentType = ($event) => {
    this.isLoadingSelectEquipment = true;
    if ($event.term == "") {
      this.equipmentTempModel = this.equipmentLookUpModel.slice(
        0,
        this.bufferSize
      );
      this.isLoadingSelectEquipment = false;
    } else {
      this.equipmentTempModel = this.equipmentLookUpModel;
      this.isLoadingSelectEquipment = false;
    }
  };

  onClearEquipmentType = () => {
    this.equipmentTempModel = this.equipmentLookUpModel.slice(
      0,
      this.bufferSize
    );
  };
  // --- /Equipment

  //--- SubSystem
  onGetSubSytemLookUp(systemId?: string) {
    this.clientState.isBusy = true;
    this.subSystemService
      .getSubSystemLookUp(this.projectKey, systemId || "")
      .subscribe(
        (res) => {
          this.subSystemLookUpModels = res.content
            ? <SubSystemLookUpModel[]>[...res.content]
            : [];
          this.subSystemTempModel = this.subSystemLookUpModels.slice(
            0,
            this.bufferSize
          );
          this.clientState.isBusy = false;
        },
        (err: ApiError) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        }
      );
  }

  onScrollToEndSubSystem = () => {
    if (this.subSystemLookUpModels.length > this.bufferSize) {
      const len = this.subSystemTempModel.length;
      const more = this.subSystemLookUpModels.slice(len, this.bufferSize + len);
      this.isLoadingSelectSubSystem = true;
      setTimeout(() => {
        this.isLoadingSelectSubSystem = false;
        this.subSystemTempModel = this.subSystemTempModel.concat(more);
      }, 500);
    }
  };

  onSearchSubSystem = ($event) => {
    this.isLoadingSelectSubSystem = true;
    if ($event.term == "") {
      this.subSystemTempModel = this.subSystemLookUpModels.slice(
        0,
        this.bufferSize
      );
      this.isLoadingSelectSubSystem = false;
    } else {
      this.subSystemTempModel = this.subSystemLookUpModels;
      this.isLoadingSelectSubSystem = false;
    }
  };

  onClearSubSystem = () => {
    this.subSystemTempModel = this.subSystemLookUpModels.slice(
      0,
      this.bufferSize
    );
  };
  //--- /SubSystem

  onGetProjectLookUp = () => {
    return new Promise((resolve, reject) => {
      this.projectService.getProjectLookup().subscribe(
        (res) => {
          this.projectLookupModels = res.content
            ? <ProjectLookupModel[]>[...res.content]
            : [];
          resolve(res.content);
        },
        (err: ApiError) => {
          reject(err.message);
          this.authErrorHandler.handleError(err.message);
        }
      );
    });
  };

  //--- System
  onGetLookUpSystem = () => {
    return new Promise((resolve, reject) => {
      this.systemService.getElementSystemLookUp(this.projectKey).subscribe(
        (res) => {
          this.systemModels = res.content
            ? <SystemLookUpModel[]>[...res.content]
            : [];
          this.systemTemModels = this.systemModels.slice(0, this.bufferSize);
          resolve(res.content);
        },
        (err: ApiError) => {
          reject(err.message);
          this.authErrorHandler.handleError(err.message);
        }
      );
    });
  };

  onScrollToEndSystem = () => {
    if (this.systemModels.length > this.bufferSize) {
      const len = this.systemTemModels.length;
      const more = this.systemModels.slice(len, this.bufferSize + len);
      this.isLoadingSelectSystem = true;
      setTimeout(() => {
        this.isLoadingSelectSystem = false;
        this.systemTemModels = this.systemTemModels.concat(more);
      }, 500);
    }
  };

  onSearchSystem = ($event) => {
    this.isLoadingSelectSystem = true;
    if ($event.term == "") {
      this.systemTemModels = this.systemModels.slice(0, this.bufferSize);
      this.isLoadingSelectSystem = false;
    } else {
      this.systemTemModels = this.systemModels;
      this.isLoadingSelectSystem = false;
    }
  };

  onClearSystem = () => {
    this.systemTemModels = this.systemModels.slice(0, this.bufferSize);
  };
  //--- /System

  //--- Tag
  onGetLookUpTag = () => {
    return new Promise((resolve, reject) => {
      this.datatagNoService.getTagLookUp(this.projectKey).subscribe(
        (res) => {
          this.tagLookupModels = res.content
            ? <TagLookUpModel[]>[...res.content]
            : [];
          resolve(res.content);
        },
        (err: ApiError) => {
          reject(err.message);
          this.authErrorHandler.handleError(err.message);
        }
      );
    });
  };

  onGetTagType = () => {
    return new Promise((resolve, reject) => {
      this.mockTabTypeApi.getTagTypeData().subscribe(
        (res) => {
          this.dataTagTypeModels = res.content
            ? <TagTypeModel[]>[...res.content]
            : [];
          resolve(res.content);
        },
        (err: ApiError) => {
          reject(err.message);
          this.authErrorHandler.handleError(err.message);
        }
      );
    });
  };
  //--- /Tag

  //--- Discipline
  onGetDisciplineLookup = () => {
    return new Promise((resolve, reject) => {
      this.dataDisciplineService.getDisciplineLookUp(this.projectKey).subscribe(
        (res) => {
          this.disciplineModels = res.content
            ? <TagLookUpModel[]>[...res.content]
            : [];
          this.disciplineTempModels = this.disciplineModels.slice(
            0,
            this.bufferSize
          );
          resolve(res.content);
        },
        (err: ApiError) => {
          reject(err.message);
          this.authErrorHandler.handleError(err.message);
        }
      );
    });
  };

  onScrollToEndDiscipline = () => {
    if (this.disciplineModels.length > this.bufferSize) {
      const len = this.disciplineTempModels.length;
      const more = this.disciplineModels.slice(len, this.bufferSize + len);
      this.isLoadingSelect = true;
      setTimeout(() => {
        this.isLoadingSelect = false;
        this.disciplineTempModels = this.disciplineTempModels.concat(more);
      }, 500);
    }
  };

  onSearchDiscipline = ($event) => {
    this.isLoadingSelect = true;
    if ($event.term == "") {
      this.disciplineTempModels = this.disciplineModels.slice(
        0,
        this.bufferSize
      );
      this.isLoadingSelect = false;
    } else {
      this.disciplineTempModels = this.disciplineModels;
      this.isLoadingSelect = false;
    }
  };

  onClearDiscipline = () => {
    this.disciplineTempModels = this.disciplineModels.slice(0, this.bufferSize);
  };
  //--- /Discipline

  //--- LocationFilter
  onGetLocationLookUpFilter = () => {
    return new Promise((resolve, reject) => {
      this.locationService.getLocationLookUpTagPage(this.projectKey).subscribe(
        (res) => {
          this.locationLookUpFilterModels = res.content
            ? <LocationLookUpModel[]>[...res.content]
            : [];
          this.locationFilterTempModel = this.locationLookUpFilterModels.slice(
            0,
            this.bufferSize
          );
          resolve(res.content);
        },
        (err: ApiError) => {
          reject(err.message);
          this.authErrorHandler.handleError(err.message);
        }
      );
    });
  };

  onScrollToLocationFilter = () => {
    if (this.locationLookUpFilterModels.length > this.bufferSize) {
      const len = this.locationFilterTempModel.length;
      const more = this.locationLookUpFilterModels.slice(
        len,
        this.bufferSize + len
      );
      this.isLoadingSelectLocationFilter = true;
      setTimeout(() => {
        this.isLoadingSelectLocationFilter = false;
        this.locationFilterTempModel = this.locationFilterTempModel.concat(
          more
        );
      }, 500);
    }
  };

  onSearchLocationFilter = ($event) => {
    this.isLoadingSelectLocationFilter = true;
    if ($event.term == "") {
      this.locationFilterTempModel = this.locationLookUpFilterModels.slice(
        0,
        this.bufferSize
      );
      this.isLoadingSelectLocationFilter = false;
    } else {
      this.locationFilterTempModel = this.locationLookUpFilterModels;
      this.isLoadingSelectLocationFilter = false;
    }
  };

  onClearLocationFilter = () => {
    this.locationFilterTempModel = this.locationLookUpFilterModels.slice(
      0,
      this.bufferSize
    );
  };
  //--- /LocationFilter

  //--- EquipmentFilter
  onEquipmentTypeLookUpFilter = () => {
    return new Promise((resolve, reject) => {
      this.equipmentService
        .getEquipmentTypeLookUpTagPage(this.projectKey)
        .subscribe(
          (res) => {
            this.equipmentLookUpFilterModel = res.content
              ? <EquipmentLookUpModel[]>[...res.content]
              : [];
            this.equipmentFilterTempModel = this.equipmentLookUpFilterModel.slice(
              0,
              this.bufferSize
            );
            resolve(res.content);
          },
          (err: ApiError) => {
            reject(err.message);
            this.authErrorHandler.handleError(err.message);
          }
        );
    });
  };

  onScrollToEquipmentTypeFilter = () => {
    if (this.equipmentLookUpFilterModel.length > this.bufferSize) {
      const len = this.equipmentFilterTempModel.length;
      const more = this.equipmentLookUpFilterModel.slice(
        len,
        this.bufferSize + len
      );
      this.isLoadingSelectEquipmentFilter = true;
      setTimeout(() => {
        this.isLoadingSelectEquipmentFilter = false;
        this.equipmentFilterTempModel = this.equipmentFilterTempModel.concat(
          more
        );
      }, 500);
    }
  };

  onSearchEquipmentTypeFilter = ($event) => {
    this.isLoadingSelectEquipmentFilter = true;
    if ($event.term == "") {
      this.equipmentFilterTempModel = this.equipmentLookUpFilterModel.slice(
        0,
        this.bufferSize
      );
      this.isLoadingSelectEquipmentFilter = false;
    } else {
      this.equipmentFilterTempModel = this.equipmentLookUpFilterModel;
      this.isLoadingSelectEquipmentFilter = false;
    }
  };

  onClearEquipmentTypeFilter = () => {
    this.equipmentFilterTempModel = this.equipmentLookUpFilterModel.slice(
      0,
      this.bufferSize
    );
  };
  // --- /EquipmentFilter

  //--- SubSystemFilter
  onGetSubSystemLookUpFilter(systemId: string) {
    this.clientState.isBusy = true;
    this.subSystemService.getSubSystemLookUpTagPage(systemId).subscribe(
      (res) => {
        this.subSystemLookUpFilterModels = res.content
          ? <SubSystemLookUpModel[]>[...res.content]
          : [];
        this.subSystemFilterTempModel = this.subSystemLookUpFilterModels.slice(
          0,
          this.bufferSize
        );
        this.clientState.isBusy = false;
      },
      (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      }
    );
  }

  onScrollToEndSubSystemFilter = () => {
    if (this.subSystemLookUpFilterModels.length > this.bufferSize) {
      const len = this.subSystemFilterTempModel.length;
      const more = this.subSystemLookUpFilterModels.slice(
        len,
        this.bufferSize + len
      );
      this.isLoadingSelectSubSystemFilter = true;
      setTimeout(() => {
        this.isLoadingSelectSubSystemFilter = false;
        this.subSystemFilterTempModel = this.subSystemFilterTempModel.concat(
          more
        );
      }, 500);
    }
  };

  onSearchSubSystemFilter = ($event) => {
    this.isLoadingSelectSubSystemFilter = true;
    if ($event.term == "") {
      this.subSystemFilterTempModel = this.subSystemLookUpFilterModels.slice(
        0,
        this.bufferSize
      );
      this.isLoadingSelectSubSystemFilter = false;
    } else {
      this.subSystemFilterTempModel = this.subSystemLookUpFilterModels;
      this.isLoadingSelectSubSystemFilter = false;
    }
  };

  onClearSubSystemFilter = () => {
    this.subSystemFilterTempModel = this.subSystemLookUpFilterModels.slice(
      0,
      this.bufferSize
    );
  };
  //--- /SubSystemFilter

  //--- SystemFilter
  onGetLookUpSystemFilter = () => {
    return new Promise((resolve, reject) => {
      this.systemService
        .getElementSystemLookUpTagPage(this.projectKey)
        .subscribe(
          (res) => {
            this.systemFilterModels = res.content
              ? <SystemLookUpModel[]>[...res.content]
              : [];
            this.systemFilterTemModels = this.systemFilterModels.slice(
              0,
              this.bufferSize
            );
            resolve(res.content);
          },
          (err: ApiError) => {
            reject(err.message);
            this.authErrorHandler.handleError(err.message);
          }
        );
    });
  };

  onScrollToEndSystemFilter = () => {
    if (this.systemFilterModels.length > this.bufferSize) {
      const len = this.systemFilterTemModels.length;
      const more = this.systemFilterModels.slice(len, this.bufferSize + len);
      this.isLoadingSelectSystemFilter = true;
      setTimeout(() => {
        this.isLoadingSelectSystemFilter = false;
        this.systemFilterTemModels = this.systemFilterTemModels.concat(more);
      }, 500);
    }
  };

  onSearchSystemFilter = ($event) => {
    this.isLoadingSelectSystemFilter = true;
    if ($event.term == "") {
      this.systemFilterTemModels = this.systemFilterModels.slice(
        0,
        this.bufferSize
      );
      this.isLoadingSelectSystemFilter = false;
    } else {
      this.systemFilterTemModels = this.systemFilterModels;
      this.isLoadingSelectSystemFilter = false;
    }
  };

  onClearSystemFilter = () => {
    this.systemFilterTemModels = this.systemFilterModels.slice(
      0,
      this.bufferSize
    );
  };
  //--- /SystemFilter

  //--- DisciplineFilter
  onGetDisciplineFilterLookup = () => {
    return new Promise((resolve, reject) => {
      this.dataDisciplineService
        .getDisciplineLookUpTagPage(this.projectKey)
        .subscribe(
          (res) => {
            this.disciplineFilterModels = res.content
              ? <TagLookUpModel[]>[...res.content]
              : [];
            this.disciplineFilterTempModels = this.disciplineFilterModels.slice(
              0,
              this.bufferSize
            );
            resolve(res.content);
          },
          (err: ApiError) => {
            reject(err.message);
            this.authErrorHandler.handleError(err.message);
          }
        );
    });
  };

  onScrollToEndDisciplineFilter = () => {
    if (this.disciplineFilterModels.length > this.bufferSize) {
      const len = this.disciplineFilterTempModels.length;
      const more = this.disciplineFilterModels.slice(
        len,
        this.bufferSize + len
      );
      this.isLoadingDisciplineSelectFilter = true;
      setTimeout(() => {
        this.isLoadingDisciplineSelectFilter = false;
        this.disciplineFilterTempModels = this.disciplineFilterTempModels.concat(
          more
        );
      }, 500);
    }
  };

  onSearchDisciplineFilter = ($event) => {
    this.isLoadingDisciplineSelectFilter = true;
    if ($event.term == "") {
      this.disciplineFilterTempModels = this.disciplineFilterModels.slice(
        0,
        this.bufferSize
      );
      this.isLoadingDisciplineSelectFilter = false;
    } else {
      this.disciplineFilterTempModels = this.disciplineFilterModels;
      this.isLoadingDisciplineSelectFilter = false;
    }
  };

  onClearDisciplineFilter = () => {
    this.disciplineFilterTempModels = this.disciplineFilterModels.slice(
      0,
      this.bufferSize
    );
  };
  //--- /DisciplineFilter

  onGetLookUpTagParent = () => {
    return new Promise((resolve, reject) => {
      this.datatagNoService.getTagParentLookUp(this.projectKey).subscribe(
        (res) => {
          this.tagParentLookupModels = res.content
            ? <TagLookUpModel[]>[...res.content]
            : [];
          resolve(res.content);
        },
        (err: ApiError) => {
          reject(err.message);
          this.authErrorHandler.handleError(err.message);
        }
      );
    });
  };

  onGetSubSystemBySystem(event) {
    if (!event || !event.id) {
      return;
    }
    this.onGetSubSytemLookUp(event.id);
  }

  onGetSubSystemBySystemFilter(event) {
    if (!event || !event.id) {
      return;
    }
    this.onGetSubSystemLookUpFilter(event.id);
  }

  onClearData = () => {
    this.systemFilter = null;
    this.subSystemFilter = null;
    this.parentFilter = null;
    this.disciplineFilter = null;
    this.equipmentTypeFilter = null;
    this.statusFilter = null;
    this.equipmentTypeFilter = null;
    this.tagTypeFilter = null;
    this.locationFilter = null;
  };

  onCancelFilter = () => {
    this.onClearData();
    this.onGetTagTab();
  };

  //--- Job Cards Info
  onOpenJobCardsInfoModal = (data) => {
    if (this.dataJobCards && this.dataJobCards.length > 0) {
      this.dataJobCards = [];
    }
    this.dataJobCards = data;
    this.isShowJobCardsInfo = true;
  };

  onJobCardsInfoToAllConfirm = (isConfirm: boolean) => {
    this.isShowJobCardsInfo = isConfirm;
  };

  isChangeData = (index, item, fieldName) => {
    return (
      this.dataTagNoModelsTemp[index].tagId == item.tagId &&
      JSON.stringify(this.dataTagNoModelsTemp[index][fieldName]) !=
      JSON.stringify(item[fieldName])
    );
  };

  //--- Sort data
  onSortData(sort: Sort) {
    let sortExpressionData: string;
    if (sort) {
      sortExpressionData = sort.active + " " + sort.direction;
      this.tagNoSorting = sortExpressionData;
      this.onGetTagTab(
        this.currentPageNumber,
        this.currentPageSize,
        sortExpressionData
      );
    }
  }

  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
    if (this.isToggleDropdown) {
      $(".mat-drawer-content").addClass("overflow-hidden");
    } else {
      $(".mat-drawer-content").removeClass("overflow-hidden");
    }
  };

  toggleRightSide = () => {
    if (!this.isTablet) return;
    // this.isToggleRightSide = !this.isToggleRightSide;
    if (this.isToggleRightSide) {
      $(".mat-drawer-content").addClass("overflow-hidden");
      this.isToggleRightSide = !this.isToggleRightSide;
      this.isShowRightSideBar = false;
    } else {
      $(".mat-drawer-content").removeClass("overflow-hidden");
    }
  };

  //--- Show ITR Builder
  onShowITRBuilder = (itrId: string) => {
    this.idItrSelected = itrId;
    this.isShowITRBuilder = true;
  };

  handleGoBackTagList = () => {
    this.isShowITRBuilder = false;
    this.isShowRightSideBar = false;
  };

  checkDownloading(tagId: string) {
    if (!this.selectionDownloading || this.selectionDownloading.length < 1) { return false; }
    return this.selectionDownloading.some(_tagId => _tagId === tagId);
  }

  reduceSelectionDownloading(tagIds: string[]) {
    this.selectionDownloading = this.selectionDownloading.filter((e) => (tagIds.indexOf(e) < 0));
  }

  checkTagNotLocked(tagIds: string[]) {
    return this.tagLockedList.every((e) => (tagIds.indexOf(e) < 0));
  }

  assignTagLocked(tagIds: string[]) {
    this.dataTagNoModels.map((e) => (tagIds.indexOf(e.tagId) >= 0) && (Object.assign(e, { ...this.createLockProperties() })));
  }

  createLockProperties = () => {
    const _userInfo = JwtTokenHelper.GetUserInfo();
    return {
      locked: true,
      lockedBy: _userInfo.userName,
      lockedDate: (new Date())
    }
  }

  onDownloadTagTab() {
    // real api
    const _newObj = this.getTagIds({ tags: this.selection.selected, getDownload: true, isLoading: true });
    if (!this.checkTagNotLocked(_newObj.tagIds)) {
      this.selection.clear();
      this.authErrorHandler.handleError(this.msg.notDownloadLocked);
    } else {
      this.downloadStatusService.sendMessage4Tags({ isDownloading: true, items: _newObj.tagDownloadStatus });
      this.selectionDownloading = this.selectionDownloading.concat([..._newObj.tagIds]);
      this.selection.clear();
      this.tagTabService.downloadTagData(this.projectKey, _newObj.tagIds)
        .subscribe((event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.Response:
              console.log('😺 Done!');
              const result = event.body;
              if (result && result.content) {
                const _tags = result.content.tags;
                this.assignTag2Storage(_tags);
                this.assignRecord2Storage(result.content.records);
                this.assignPunches2Storage(result.content.punches);
                this.assignDrawings2Storage(result.content.drawings);
                this.assignTagPreservation2Storage(result.content.tagPreservations);
                this.assignPreservation2Storage(result.content.preservations);
                // Execute logic UI
                const _resObj = this.getTagIds({ tags: _tags, getDownload: true, isDone: true });
                this.tagLockedList = this.tagLockedList.concat([..._resObj.tagIds]);
                this.assignTagLocked(_resObj.tagIds);
                this.reduceSelectionDownloading(_resObj.tagIds);
                this.onCheckValueIndexedDB();
                let _newA = new Array<ItemNeedSync>();
                _newA = _resObj.tagIds.map(_id => ({ id: _id, isChanged: false, type: this.typeDownloadAndSync.downloaded }));
                this.tagNeedSyncList = [...this.tagNeedSyncList.filter(_tag => (!_newA.some(_t => _t.id === _tag.id))), ..._newA];
                this.downloadStatusService.sendMessage4Tags({ isDownloading: false, items: _resObj.tagDownloadStatus });
              } else {
                this.downloadStatusService.sendMessage4Tags({ isDownloading: false, items: [] });
              }
              break;
          }
        }, (err) => {
          this.reduceSelectionDownloading(_newObj.tagIds);
          this.downloadStatusService.reset(TypeDownloadRequest.tags, true);
          this.authErrorHandler.handleError(err.message);
        });
    }
  }

  getTagIds({ tags = new Array(), getDownload = false, isLoading = false, isDone = false }): any {
    let _newTagIds = new Array();
    if (getDownload) {
      let _newDownloadStatus = new Array();
      (tags).forEach(_tag => {
        _newTagIds.push(_tag.tagId);
        _newDownloadStatus.push({ ...(new DownloadDetailStatus()), ...{ tagId: _tag.tagId, tagNo: _tag.tagNo, isLoading: isLoading, isDone: isDone } });
      });
      return {
        tagIds: _newTagIds,
        tagDownloadStatus: _newDownloadStatus,
      }
    }
    if (tags) {
      (tags).forEach(_tag => _newTagIds.push(_tag.tagId));
    } else {
      (this.selection.selected).forEach(_tag => _newTagIds.push(_tag.tagId));
    }
    return _newTagIds;
  }

  assignTag2Storage(tags) {
    this.idbService.addTags(this._storeName, tags);
  }

  assignRecord2Storage(records) {
    const _sn = StoreNames.records;
    this.idbService.addRecords(_sn, records);
  }

  assignPunches2Storage(punches) {
    const _sn = StoreNames.punches;
    this.idbService.addPunches(_sn, punches);
  }

  assignDrawings2Storage(drawings) {
    const _sn = StoreNames.drawings;
    this.idbService.addDrawings(_sn, drawings);
  }

  assignTagPreservation2Storage(tagPreservation) {
    const _sn = StoreNames.tagPreservation;
    this.idbService.addTagPreservation(_sn, tagPreservation);
  }

  assignPreservation2Storage(preservation) {
    const _sn = StoreNames.preservation;
    this.idbService.addPreservation(_sn, preservation);
  }

  isDisableLockedTag(tag: DataTagNoModel) {
    return !!(tag.locked);
  }

  isDisableDownload() {
    if (!this.isEditState) {
      return true;
    }
    let _disable = true;
    (this.selection.selected).forEach(tag => {
      if (!tag.locked) {
        _disable = false;
        return;
      }
    })
    return _disable;
  }

  convertDateString(dateString) {
    if (dateString) {
      return (new Date(dateString)).toLocaleDateString('es-ES');
    }
    return null;
  }

  onSyncSelectedTag() {
    this.isSyncSelectedState = true;
  }

  onSyncSelectedConfirm(isConfirm: boolean) {
    if (isConfirm) {
      const _snTags = StoreNames.tags, _snRecords = StoreNames.records, _snPunches = StoreNames.punches, _snPreservation = StoreNames.preservation, _snTagPreservation = StoreNames.tagPreservation;
      const _selection = [...this.selection.selected];
      const _tagIds = new Array<string>();//this.getTagIds({ tags: _selection });
      let _tagNoErrors = new Array<string>();
      let _syncData: SynchronizeDataCommand = new SynchronizeDataCommand();
      let _records2Sync: ItrRecordDetail[] = [];
      let _punches2Sync: PunchPageListModel[] = [];
      let _preservation2Sync: DetailPreservationTabModel[] = [];
      let _tagPreservationIds: string[] = new Array<string>();

      Promise.all([
        new Promise(resolve => {
          this.idbService.getAllData(_snRecords).then((_records) => {
            resolve(_records);
          });
        }),
        new Promise(resolve => {
          this.idbService.getAllData(_snPunches).then((_punches) => {
            resolve(_punches);
          });
        }),
        new Promise(resolve => {
          this.idbService.getAllData(_snPreservation).then((_preservationL) => {
            resolve(_preservationL);
          });
        }),
        new Promise(resolve => {
          this.idbService.getAllData(_snTagPreservation).then((_tagPreservationL) => {
            resolve(_tagPreservationL);
          });
        }),
        new Promise(resolve => {
          this.idbService.getAllData(_snTags).then((_tags) => {
            resolve(_tags);
          });
        }),
      ])
        .then(result => {
          // get value records
          const _records: ItrRecordDetail[] = result[0] as ItrRecordDetail[];
          _tagIds.forEach(id => {
            _records2Sync.push(..._records.filter(_r => (_r.fieldData.tagId === id && _r.isEdited)));
          })
          // get value Punches
          const _punches: PunchPageListModel[] = result[1] as PunchPageListModel[];
          _tagIds.forEach(id => {
            _punches2Sync.push(..._punches.filter(_p => ((_p.tagId === id && _p.isEdited) || (_p.tagId === id && _p.isDeleted) || _p.isAdded)));
          })
          // get value Preservation
          const _preservationL: DetailPreservationTabModel[] = result[2] as DetailPreservationTabModel[];
          _tagIds.forEach(id => {
            _preservation2Sync.push(..._preservationL.filter(_pres => ((_pres.tagId === id && _pres.preservationNo === '') || (_pres.tagId === id && _pres.isUpdated) || (_pres.tagId === id && _pres.isDeleted))));
          })
          // get value Tag Preservation
          const _tagPreservationL: PreservationModel[] = result[3] as PreservationModel[];
          let _syncPresBefore: ResponseSyncItem[] = new Array();
          _tagPreservationL.forEach(_tP => {
            if (_tagIds.some(_id => _id === _tP.tagId)) {
              _tagPreservationIds.push(_tP.tagId);
              _syncPresBefore.push(new ResponseSyncItem(_tP.tagId, _tP.tagNo));
            }
          });
          // get value Tags
          const _tags: DataTagNoModel[] = result[4] as DataTagNoModel[];
          let _syncTagsBefore: ResponseSyncItem[] = new Array();
          _tags.forEach(_tag => {
            if (_selection.some(_t => _t.tagId === _tag.tagId)) {
              _tagIds.push(_tag.tagId);
              _syncTagsBefore.push(new ResponseSyncItem(_tag.tagId, _tag.tagNo));
            }
          });
          // get error tags
          _selection.forEach(_tag => {
            if (!_tagIds.some(_id => _id === _tag.tagId)) {
              _tagNoErrors.push(_tag.tagNo);
            }
          });
          const _syncPunches = _punches2Sync && _punches2Sync.length > 0 ? [..._punches2Sync.map(_punch => (new ResponseSyncItem(_punch.punchId, _punch.punchNo)))] : [];
          // call event sync detail
          const _dataSyncBefore = {
            dataRequest: {
              syncTags: _syncTagsBefore,
              syncPunches: _syncPunches,
              syncPreservation: _syncPresBefore,
              syncHandovers: null,
            },
            dataResponse: null,
          };

          if (
            ((_syncTagsBefore && _syncTagsBefore.length > 0)
              || (_syncPresBefore && _syncPresBefore.length > 0)
              || (_syncPunches && _syncPunches.length > 0))
            && (!_tagNoErrors || _tagNoErrors.length < 1)
          ) {
            this.conveyData2SDService.sendMessage(_dataSyncBefore, true);
            // call sync api
            _syncData.projectKey = this.projectKey;
            _syncData.tagIds = _tagIds;
            _syncData.records = _records2Sync;
            _syncData.punches = _punches2Sync;
            _syncData.preservations = _preservation2Sync;
            _syncData.tagPreservationIds = _tagPreservationIds;
            this.tagTabService.synchronizeDownloadedData(_syncData).subscribe((response) => {
              // remove tags
              _tagIds.forEach(id => {
                this.idbService.removeItem(_snTags, id);
              });
              // remove records
              _records2Sync.forEach(record => {
                this.idbService.removeItem(_snRecords, record.recordId);
              });
              // remove punches
              _punches2Sync.forEach(punch => {
                this.idbService.removeItem(_snPunches, punch.punchId);
              });
              // remove tagPreservation
              const _snTagPreservation = StoreNames.tagPreservation;
              this.idbService.removeItems(_snTagPreservation, IndexRelatedSNs.tagPreservation.tagId, _tagIds);
              // remove preservation
              this.idbService.removeItems(_snPreservation, IndexRelatedSNs.preservation.tagId, _tagIds);
              // ------------------
              // this.onGetTagTab();
              this.conveyData2SDService.sendMessage({ ..._dataSyncBefore, ...{ dataResponse: { ...response.content } } });
              this.resetStatusTagDownloadOff(this.typeDownloadAndSync.synchronizing, (response.content)[ResponseKeys.tags]);
              this.authErrorHandler.handleSuccess(Constants.TagTabSyncSelectedSuccess);
            }, (err) => {
              this.authErrorHandler.handleError(err.message);
            });
          } else if (
            (_syncTagsBefore && _syncTagsBefore.length > 0)
            && (_syncPresBefore && _syncPresBefore.length > 0)
            && (_syncPunches && _syncPunches.length > 0)
            && (_tagNoErrors && _tagNoErrors.length > 0)
          ) {
            this.selection.clear();
            this.authErrorHandler.handleError(`${this.msg.someNotIn}: ${_tagNoErrors.join(', ')}. ${this.msg.please}`);
          } else {
            this.selection.clear();
            this.authErrorHandler.handleError(`${this.msg.notInLocal}: ${_tagNoErrors.join(', ')}. ${this.msg.please}`);
          }
        });
    }
    this.isSyncSelectedState = false;
  }

  isDisableRevert() {
    if (!this.isEditState) {
      return true;
    }
    let _hasLockedTag = false;
    (this.selection.selected).forEach(tag => {
      if (tag.locked) {
        _hasLockedTag = true;
        return;
      }
    });
    return !_hasLockedTag;
  }

  isDisableSyncSelected() {
    if (!this.isEditState) {
      return true;
    }
    const _userInfo = JwtTokenHelper.GetUserInfo();
    let _hasLockedTag = (this.selection.selected).some(_tag => (_tag.locked && _tag.lockedBy === _userInfo.userName));
    return !(_hasLockedTag && this.hasValueIndexedDB);
  }

  onLockTagTab() {
    this.clientState.isBusy = true
    const _tagIds = this.getTagIds({ tags: this.selection.selected });
    this.tagTabService.lockTags(this.projectKey, _tagIds).subscribe((res) => {
      this.clientState.isBusy = false;
      this.onGetTagTab();
    }, (err) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onRevertTag() {
    this.isRevertState = true;
  }

  onRevertTagConfirm(isConfirm: boolean) {
    if (isConfirm) {
      this.clientState.isBusy = true;
      const _tagIds = this.getTagIds({ tags: this.selection.selected });
      this.tagTabService.unlockTags(this.projectKey, _tagIds).subscribe((res) => {
        // remove tags
        this.idbService.removeItems(this._storeName, IndexRelatedSNs.tags.tagId, _tagIds);
        // remove punches related tags
        const _snPunches = StoreNames.punches;
        this.idbService.removeItems(_snPunches, IndexRelatedSNs.punches.tagId, _tagIds);
        // remove records related tags
        const _snRecords = StoreNames.records;
        this.idbService.removeItems(_snRecords, IndexRelatedSNs.records.tagId, _tagIds);
        // remove tagPreservation
        const _snTagPreservation = StoreNames.tagPreservation;
        this.idbService.removeItems(_snTagPreservation, IndexRelatedSNs.tagPreservation.tagId, _tagIds);
        // remove preservation
        const _snPreservation = StoreNames.preservation;
        this.idbService.removeItems(_snPreservation, IndexRelatedSNs.preservation.tagId, _tagIds);
        // ---------------------------
        this.clientState.isBusy = false;
        // this.onGetTagTab();
        // support for testing
        const _source = _tagIds.map(_id => ({ id: _id }));
        // --------------------
        this.resetStatusTagDownloadOff(this.typeDownloadAndSync.reverting, _source);
        this.downloadStatusService.reloadDownloadDetail(true);
        this.reloadSideMenuService.sendMessage(true);
        this.authErrorHandler.handleSuccess(Constants.TagTabRevertSuccess);
      }, (err) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      });
    }
    this.isRevertState = false;
  }

  //--- Edit tag no
  onShowEditTagNo = (event: any) => {
    this.isShowEditTagNo = event;
    this.isConfirmSaveTagNo = false;
  }

  onSaveTagNoConfirm = (event: any) => {
    this.isShowEditTagNo = false;
    this.isConfirmSaveTagNo = event;
  }

  //--- Edit allocated itrs
  onShowEditAllocatedITRs = (event: any) => {
    this.isShowAllocatedITRs = event;
    this.isLoadDetailChart = false;
    this.isLoadTagItrByTag = false;
    this.isConfirmSaveTagNo = false;
  }

  onSuccessEditAllocatedITRs = (event: any) => {
    this.isShowAllocatedITRs = false;
    this.isLoadDetailChart = event;
    this.isConfirmSaveTagNo = false;
  }

  onTagUpdateSuccess = (tagId: any) => {
    this.tagUpdateIds = tagId;
    this.isLoadTagItrByTag = true;
    this.isConfirmSaveTagNo = false;
  }

  //--- Add punch
  onShowAddPunch = (event: any) => {
    this.isShowAddPunch = event;
    this.isLoadDetailChart = false;
    this.isConfirmSaveTagNo = false;
  }

  onSuccessAddPunchModal = (event: any) => {
    this.isShowAddPunch = false;
    this.isLoadDetailChart = event;
    this.isConfirmSaveTagNo = false;
  }
}
