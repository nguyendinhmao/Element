import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { DetailPreservationTabModel, PreservationModel, PreservationStatus, PreservationStatusColor, PreservationStatusEnum, SortExpression, TagPreservationFilter, TagPreservationStatusEnum } from 'src/app/shared/models/preservation-tab/preservation-tab.model';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { AuthErrorHandler, ClientState, DownloadStatusService, IdbService, ReloadSideMenuService } from 'src/app/shared/services';
import { MockPreservationTabApi } from 'src/app/shared/mocks/mock.preservation-tab';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { Configs, Constants, JwtTokenHelper, PermissionsViews } from 'src/app/shared/common';
import { ModuleProjectDefaultModel } from 'src/app/shared/models/module/module.model';
import { DataTagNoService } from 'src/app/shared/services/api/data-tab/data-tagno.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { TagLookUpModel } from 'src/app/shared/models/data-tab/data-tagno.model';
import { SystemLookUpModel } from 'src/app/shared/models/data-tab/data-system.model';
import { SubSystemLookUpModel } from 'src/app/shared/models/data-tab/data-subsystem.model';
import { EquipmentLookUpModel } from 'src/app/shared/models/equipment/equipment.model';
import { LocationLookUpModel } from 'src/app/shared/models/data-tab/data-location.model';
import { DisciplineLookUpModel } from 'src/app/shared/models/data-tab/data-discipline.model';
import { DownloadDetailStatus, SynchronizeDataCommand, TagTypeModel } from 'src/app/shared/models/tab-tag/tab-tag.model';
import { DataDisciplineService } from 'src/app/shared/services/api/data-tab/data-discipline.service';
import { DataLocationService } from 'src/app/shared/services/api/data-tab/data-location.service';
import { DataSubSystemService } from 'src/app/shared/services/api/data-tab/data-subsystem.service';
import { DataEquipmentService } from 'src/app/shared/services/api/data-tab/data-equipment.service';
import { DataSystemService } from 'src/app/shared/services/api/data-tab/data-system.service';
import { MockTabTypeApi } from 'src/app/shared/mocks/mock.tag-type';
import { PreservationTabServices } from 'src/app/shared/services/api/preservation-tab/preservation-tab.service';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { AuthInProjectDto } from 'src/app/shared/models/project-management/project-management.model';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { IndexRelatedSNs, ItemNeedSync, ReloadPageKey, ResponseKeys, ResponseSyncItem, StoreNames, TypeDownloadAndSync, TypeDownloadRequest } from 'src/app/shared/models/common/common.model';
import { ConveyData2SyncDetailService, RecheckDate, ReloadAfterSynchronizingService } from 'src/app/shared/services/utils/utils-sub.service';
import { TagTabService } from 'src/app/shared/services/api/tag-tab/tag-tab.service';
declare var $: any;

@Component({
  selector: 'preservation-tab',
  templateUrl: './preservation-tab.component.html',
  styleUrls: ['./preservation-tab.component.scss'],
})

export class PreservationTabComponent implements OnInit, AfterViewInit {
  @ViewChild("tableContainer") tableContainer: ElementRef;

  //--- Boolean
  isCollapse: boolean;
  isDeleteState: boolean;
  isToggleDropdown: boolean;
  isEnableDelete: boolean;
  isEnableApply: boolean;
  isEnableEdit: boolean;
  isApplyState: boolean;
  isShowAllocatedInfo: boolean;
  isShowWalkdownComplete: boolean;
  isShowConditionalAcceptance: boolean;
  isShowDisciplines: boolean;
  isShowAddPartial: boolean;
  isShowPinCode: boolean;
  isShowCreatePinCode: boolean;
  isShowAddPunchItem: boolean;
  isShowRemarkInfo: boolean;
  loadingSelection = {
    isLoadingTag: false,
  }
  isRevertState: boolean = false;
  hasValueIndexedDB: boolean = false;
  isSyncSelectedState: boolean;

  //--- Variables
  projectKey: string;
  defaultSort: string = "preservationStatus desc";
  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;
  totalItemCount: number = 0;
  statusColor = PreservationStatusColor;
  statusDisplay = PreservationStatus;
  sub: Subscription;
  typeDownloadAndSync = TypeDownloadAndSync;

  //--- Models
  preservationTabModels: PreservationModel[] = [];
  moduleProjectDefaultModel: ModuleProjectDefaultModel = new ModuleProjectDefaultModel();
  selectionDownloading = new Array();
  permissionsViews = PermissionsViews;
  authInProjectDto: AuthInProjectDto[] = new Array();
  tagLockedList = new Array();
  tagNeedSyncList: ItemNeedSync[] = new Array<ItemNeedSync>();

  msg = {
    someNotIn: 'Some preservation of tag not in local',
    notInLocal: 'Preservation of tag is not in local',
    notDownloadLocked: 'Can not download locked Tag',
    please: 'Please choose again.',
  }

  //--- Datatable
  dataSource: MatTableDataSource<PreservationModel>;
  selection = new SelectionModel<PreservationModel>(true, []);
  displayedColumns: string[] = [
    'select',
    'tagNo',
    'preservationLocked',
    'description',
    'systemNo',
    'subSystemNo',
    'location',
    'discipline',
    'equipmentTypePresTab',
    'preservationLockedBy',
    'preservationLockedDate',
    'status'
  ];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  mockPreservationTabApi: MockPreservationTabApi = new MockPreservationTabApi();

  constructor(
    public clientState: ClientState,
    private route: ActivatedRoute,
    private router: Router,
    // private milestonesTabService: MilestonesTabService,
    private authErrorHandler: AuthErrorHandler,
    private datatagNoService: DataTagNoService,
    private preservationTabServices: PreservationTabServices,
    private downloadStatusService: DownloadStatusService,
    private idbService: IdbService,
    private reloadSideMenuService: ReloadSideMenuService,
    private reloadAfterSyncS: ReloadAfterSynchronizingService,
    private tagTabService: TagTabService,
    // private subSystemService: DataSubSystemService,
    // private milestoneService: DataMilestoneService,
    // private systemService: DataSystemService,
    //--- Services for filter
    private dataDisciplineService: DataDisciplineService,
    private locationService: DataLocationService,
    private subSystemService: DataSubSystemService,
    private equipmentService: DataEquipmentService,
    private systemService: DataSystemService,
    private conveyData2SDService: ConveyData2SyncDetailService,

  ) {
    (this.sub = this.route.params.subscribe((params) => {
      this.projectKey = params["projectKey"];
      if (!this.projectKey) {
        this.router.navigate([""]);
      }
    }));

    this.reloadAfterSyncS.getMessage().subscribe((res) => {
      if (res.key === ReloadPageKey.preservation) {
        // this.onGetPreservations(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSort);
        this.resetStatusTagDownloadOff(this.typeDownloadAndSync.synchronizing, res.response[ResponseKeys.preservation]);
      }
    });
  }

  //--- Check info device
  get isTablet() {
    return InfoDevice.isTablet;
  }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  ngAfterViewInit() {
    //--- Set height table container
    const tableContainerHeight = $(window).height() - 230;
    if (tableContainerHeight > 0) {
      this.tableContainer.nativeElement.style.maxHeight = tableContainerHeight + "px";
    }
  }
  ngOnInit() {
    this.onGetPreservations(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSort);

    if (!this.isOffline) {
      //--- Get module by user
      this.moduleProjectDefaultModel = JwtTokenHelper.GetModuleProjectDefault();
      this.onGetAllDataRelate();
    }
  }

  checkDownloading(tagId: string) {
    if (!this.selectionDownloading || this.selectionDownloading.length < 1) { return false; }
    return this.selectionDownloading.some(_tagId => _tagId === tagId);
  }

  toggleSelection(row: PreservationModel) {
    this.selection.toggle(row);
    // if (this.selection.isSelected(row)) {
    //   this.onHasSelectedTagInIndexedDB();
    // }
  }

  onGetAllDataRelate = () => {
    this.clientState.isBusy = true;
    Promise.all([
      this.onGetLocationLookUpFilter(),
      this.onEquipmentTypeLookUpFilter(),
      this.onGetLookUpSystemFilter(),
      this.onGetDisciplineFilterLookup(),
      this.onGetTagLookUp(),
    ])
      .then((res) => {
        this.statusFilterModel = [
          {
            value: 1,
            label: "InActive",
          },
          {
            value: 2,
            label: "NotDue",
          },
          {
            value: 3,
            label: "Completed",
          },
          {
            value: 4,
            label: "Paused",
          },
          {
            value: 5,
            label: "Stopped",
          },
          {
            value: 6,
            label: "Due",
          },
          {
            value: 7,
            label: "OverDue",
          }
        ];
        this.clientState.isBusy = false;
      })
      .catch((err: ApiError) => {
        this.clientState.isBusy = false;
      });
  };

  //--- Get preservations data
  onGetPreservations = (pageNumber?: number, pageSize?: number, sortExpression?: string) => {
    this.clientState.isBusy = true;
    this.selection.clear();
    this.onCheckValueIndexedDB();

    if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
    if (pageSize > 0) this.currentPageSize = pageSize;
    if (sortExpression) this.currentSortExpression = sortExpression;

    // this.mockPreservationTabApi.getPreservationTabData().subscribe(res => {
    //--- Using Tag Tab API
    if (this.isOffline) {
      const _snTagPreservation = StoreNames.tagPreservation;
      this.idbService.getAllData(_snTagPreservation).then(res => {
        const _softParts = ["tagNo", "asc"];
        const _sortedData = this.sortTagOffline(res, _softParts[0], _softParts[1]);
        // check preservation to update tag preservation
        let _finalResult = new Array();
        let _aFuncs = new Array();
        _sortedData.forEach(_tP => {
          _aFuncs.push(this.wrapperCheck(_tP.tagNo));
        });

        Promise.all([..._aFuncs]).then((statuses) => {
          _finalResult = _sortedData.map((_tP, i) => ({ ..._tP, ...{ preservationStatusString: statuses[i].toUpperCase() } }));
          this.assignPreservationList(_finalResult);
          this.totalItemCount = this.preservationTabModels.length;
          this.clientState.isBusy = false;
        }).catch(reason => {
          this.clientState.isBusy = false;
        });
      }, err => {
        this.clientState.isBusy = false;
      });
    } else {
      this.preservationTabServices
        .getDataTagPreservationPage(
          this.projectKey,
          pageNumber || Configs.DefaultPageNumber,
          pageSize || Configs.DefaultPageSize,
          sortExpression || this.defaultSort,
          this.systemFilter || "",
          this.subSystemFilter || "",
          this.descriptionFilter || "",
          this.disciplineFilter || "",
          this.equipmentTypeFilter || "",
          this.statusFilter || "",
          this.locationFilter || "",
          this.tagFilter || [],
        )
        .subscribe(
          (res) => {
            this.assignPreservationList(res.items || []);
            this.totalItemCount = res.totalItemCount;

            this.clientState.isBusy = false;
            this.isToggleDropdown = false;
          }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
          });
    }
  }

  wrapperCheck(tagNo: string) {
    return new Promise((resolve, reject) => {
      const _snPreservation = StoreNames.preservation;
      const _iPreservation = IndexRelatedSNs.preservation.tagNo;
      this.idbService.getAllDataFromIndex(_snPreservation, _iPreservation, tagNo).then(_preservationL => {
        const _status = _preservationL ? this.getHighestStatus(_preservationL) : null;
        resolve(_status);
      }, err => {
        reject(err);
      });
    })
  }

  getHighestStatus(pList: DetailPreservationTabModel[]) {
    if (!pList) { return null; }
    let _updateA = new Array();
    let _level = null;
    let _status = '';
    _updateA = pList.map(_p => {
      const _newPS = {
        ..._p,
        ...this.updateNewStatus(_p.dateDue, _p.status),
      };
      const _snPreservation = StoreNames.preservation;
      this.idbService.updateItem(_snPreservation, _newPS, _p.preservationId);
      return _newPS
    });
    _updateA.forEach(_p => TagPreservationStatusEnum[_p.status.toUpperCase()] > _level && (_level = TagPreservationStatusEnum[_p.status.toUpperCase()]) && (_status = _p.status));
    return _status;
  }

  updateNewStatus(dueDate, status: string) {
    const _currentD = new Date();
    const _dueDate = new Date(dueDate);
    const days = RecheckDate(_currentD, _dueDate);
    if (PreservationStatusEnum[status] !== PreservationStatusEnum.ACTIVE) {
      return {};
    }
    if (days > 0 && days >= 3) {
      return {
        status: PreservationStatus.NOTDUE4Value.toUpperCase(),
        statusId: PreservationStatusEnum.ACTIVE,
      }
    } else if (days === 0) {
      return {
        status: PreservationStatus.DUE.toUpperCase(),
        statusId: PreservationStatusEnum.ACTIVE,
      }
    } else {
      return {
        status: PreservationStatus.OVERDUE.toUpperCase(),
        statusId: PreservationStatusEnum.ACTIVE,
      }
    }
  }

  assignPreservationList(response) {
    this.preservationTabModels = response ? <PreservationModel[]>[...response] : [];
    this.getTagLockedList(this.preservationTabModels);
    this.dataSource = new MatTableDataSource(this.preservationTabModels);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.getTagNeedSyncList();
  }

  sortTagOffline(preservationTabModels: PreservationModel[], column: string, order: string) {
    if (!this.isOffline) { return preservationTabModels; }
    switch (order) {
      case 'asc':
        preservationTabModels.sort((a, b) => ((a[column] || '').localeCompare(b[column] || '')));
        break;
      case 'desc':
        preservationTabModels.sort((a, b) => (-1) * ((a[column] || '').localeCompare(b[column] || '')));
        break;
    }
    return preservationTabModels;
  }

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
        this.preservationTabModels = this.preservationTabModels.map(_t => {
          if (source.some(_item => _item.id === _t.tagId && _item.isCompleted)) {
            return {
              ..._t, ...{
                preservationLocked: false,
                preservationLockedBy: null,
                preservationLockedDate: null,
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
        this.preservationTabModels = this.preservationTabModels.map(_t => {
          if (source.some(_item => _item.id === _t.tagId)) {
            return {
              ..._t, ...{
                preservationLocked: false,
                preservationLockedBy: null,
                preservationLockedDate: null,
              }
            };
          }
          return _t;
        });
        break;
    }
    this.selection.clear();
    this.getTagLockedList(this.preservationTabModels);
    this.dataSource = new MatTableDataSource(this.preservationTabModels);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  getTagNeedSyncList() {
    const _snTagPreservation = StoreNames.tagPreservation;
    this.tagNeedSyncList = new Array<ItemNeedSync>();
    this.idbService.getAllData(_snTagPreservation).then(_localTP => {
      _localTP.forEach(_tP => this.tagNeedSyncList.push({ id: _tP.tagId, isChanged: !!_tP.isChanged, type: this.typeDownloadAndSync.downloaded }));
    });
  }

  getTagInLocal(tagId: string) {
    if (!tagId) { return false; }
    return (this.tagNeedSyncList && this.tagNeedSyncList.length > 0 && this.tagNeedSyncList.some(_tP => _tP.id === tagId));
  }

  onCheckTagNeedSync(tagId: string) {
    if (!tagId) { return false; }
    const _tNeed = this.tagNeedSyncList.find(_tP => _tP.id === tagId);
    return _tNeed.isChanged;
  }

  onCheckType(positionType: string, tagId: string) {
    return this.tagNeedSyncList.some(_tag => _tag.id === tagId && _tag.type === positionType);
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
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: PreservationModel): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.tagId + 1}`;
  }

  //--- Sort data
  onSortData(sort: Sort) {
    let sortExpressionData: string;
    if (sort) {
      sortExpressionData = SortExpression[sort.active] + " " + sort.direction;
      this.onGetPreservations(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }

  //--- Collapse
  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  }

  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
  }

  onRefreshData = () => {
    this.onClearData();
    this.onGetPreservations();
  }

  //#region download
  getTagLockedList(tags) {
    this.tagLockedList = new Array();
    tags.forEach(_tag => (_tag.preservationLocked) && (this.tagLockedList.push(_tag.tagId)));
  }

  onCheckPermission = (key: string) => {
    this.authInProjectDto = JwtTokenHelper.GetAuthProject()
      ? <AuthInProjectDto[]>[...JwtTokenHelper.GetAuthProject()]
      : [];
    return JwtTokenHelper.IsAuthInProject(key, this.authInProjectDto);
  };

  onRevertTag() {
    this.isRevertState = true;
  }

  onRevertTagConfirm(isConfirm: boolean) {
    if (isConfirm) {
      this.clientState.isBusy = true;
      const _tagPreservationIds = this.getTagIds({ tags: this.selection.selected });
      const _snTagPreservation = StoreNames.tagPreservation;
      const _snPreservation = StoreNames.preservation;
      this.preservationTabServices.unlockPreservation(this.projectKey, _tagPreservationIds).subscribe((res) => {
        // remove tagPreservation
        this.idbService.removeItems(_snTagPreservation, IndexRelatedSNs.tagPreservation.tagId, _tagPreservationIds);
        // remove preservation
        this.idbService.removeItems(_snPreservation, IndexRelatedSNs.preservation.tagId, _tagPreservationIds);
        // --------------------
        this.clientState.isBusy = false;
        // this.onGetPreservations(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSort);
        // support for testing
        const _source = _tagPreservationIds.map(_id => ({ id: _id }));
        // -------------------
        this.resetStatusTagDownloadOff(this.typeDownloadAndSync.reverting, _source);
        this.downloadStatusService.reloadDownloadDetail(true);
        this.authErrorHandler.handleSuccess(Constants.PreservationTabRevertSuccess);
      }, (err) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      });
    }
    this.isRevertState = false;
  }

  isDisableRevert() {
    let _hasLockedTag = false;
    (this.selection.selected).forEach(tag => {
      if (tag.preservationLocked) {
        _hasLockedTag = true;
        return;
      }
    });
    return !_hasLockedTag;
  }

  onLockTagTab() {
    this.clientState.isBusy = true
    const _tagIds = this.getTagIds({ tags: this.selection.selected });
    this.preservationTabServices.lockPreservation(this.projectKey, _tagIds).subscribe((res) => {
      this.clientState.isBusy = false;
      this.onGetPreservations(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSort);
    }, (err) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  isDisableSyncSelected() {
    const _userInfo = JwtTokenHelper.GetUserInfo();
    let _hasLockedTag = (this.selection.selected).some(_tag => (_tag.preservationLocked && _tag.preservationLockedBy === _userInfo.userName));
    return !(_hasLockedTag && this.hasValueIndexedDB);
  }

  onSyncSelectedTag() {
    this.isSyncSelectedState = true;
  }

  onSyncSelectedConfirm(isConfirm: boolean) {
    if (isConfirm) {
      const _snPreservation = StoreNames.preservation;
      const _selection = [...this.selection.selected];
      let _tagPreservationIds = new Array<string>();
      let _tagNoErrors = new Array<string>();
      let _syncData: SynchronizeDataCommand = new SynchronizeDataCommand();
      let _preservation2Sync: DetailPreservationTabModel[] = [];
      let _aFuncs = new Array();
      _tagPreservationIds.forEach(id => {
        _aFuncs.push(this.getPreservationFrom(id));
      });

      Promise.all([
        ..._aFuncs,
        new Promise(resolve => {
          const _snTagPreservation = StoreNames.tagPreservation;
          this.idbService.getAllData(_snTagPreservation).then(_tagPreservation => {
            resolve(_tagPreservation);
          })
        }),
      ])
        .then(res => {
          let _syncPresBefore: ResponseSyncItem[] = new Array();
          // get preservation
          res.forEach((_pL, i) => {
            if (i === res.length - 1) { return; }
            if (_pL && _pL.length > 0) {
              _preservation2Sync.push(..._pL);
            }
          });
          // get tag preservation
          res[res.length - 1].forEach(_tagP => {
            if (_selection.some(_tP => _tP.tagId === _tagP.tagId)) {
              _tagPreservationIds.push(_tagP.tagId);
              _syncPresBefore.push(new ResponseSyncItem(_tagP.tagId, _tagP.tagNo));
            }
          });
          // get error tag preservation
          _selection.forEach(_tagP => {
            if (!_tagPreservationIds.some(_id => _id === _tagP.tagId)) {
              _tagNoErrors.push(_tagP.tagNo);
            }
          })
          // call event sync detail
          const _dataSyncBefore = {
            dataRequest: {
              syncTags: null,
              syncPunches: null,
              syncPreservation: _syncPresBefore,
              syncHandovers: null,
            },
            dataResponse: null,
          };
          if (_syncPresBefore && _syncPresBefore.length > 0 && (!_tagNoErrors || _tagNoErrors.length < 1)) {
            this.conveyData2SDService.sendMessage(_dataSyncBefore, true);
            // call sync api
            _syncData.projectKey = this.projectKey;
            _syncData.preservations = _preservation2Sync;
            _syncData.tagPreservationIds = _tagPreservationIds;
            this.tagTabService.synchronizeDownloadedData(_syncData).subscribe((response) => {
              // remove tagPreservation
              const _snTagPreservation = StoreNames.tagPreservation;
              this.idbService.removeItems(_snTagPreservation, IndexRelatedSNs.tagPreservation.tagId, _tagPreservationIds);
              // remove preservation
              this.idbService.removeItems(_snPreservation, IndexRelatedSNs.preservation.tagId, _tagPreservationIds);
              // ------------------
              // this.onGetPreservations(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSort);
              this.conveyData2SDService.sendMessage({ ..._dataSyncBefore, ...{ dataResponse: { ...response.content } } });
              this.resetStatusTagDownloadOff(this.typeDownloadAndSync.synchronizing, (response.content)[ResponseKeys.preservation]);
              this.authErrorHandler.handleSuccess(Constants.PreservationTabSyncSelectedSuccess);
            }, (err) => {
              this.authErrorHandler.handleError(err.message);
            });
          } else if (_tagNoErrors && _tagNoErrors.length > 0 && _syncPresBefore && _syncPresBefore.length > 0) {
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

  getPreservationFrom(tagPreservationId: string) {
    return new Promise((resolve, reject) => {
      const _snPreservation = StoreNames.preservation;
      const _iPreservation = IndexRelatedSNs.preservation.tagId;
      this.idbService.getAllDataFromIndex(_snPreservation, _iPreservation, tagPreservationId).then(res => {
        resolve(res);
      }, err => {
        reject(err)
      });
    });
  }

  isDisableDownload() {
    let _disable = true;
    (this.selection.selected).forEach(tag => {
      if (!tag.preservationLocked) {
        _disable = false;
        return;
      }
    })
    return _disable;
  }

  checkTagNotLocked(tagIds: string[]) {
    return this.tagLockedList.every((e) => (tagIds.indexOf(e) < 0));
  }

  reduceSelectionDownloading(tagIds: string[]) {
    this.selectionDownloading = this.selectionDownloading.filter((e) => (tagIds.indexOf(e) < 0));
  }

  assignTagLocked(tagIds: string[]) {
    this.preservationTabModels.map((e) => (tagIds.indexOf(e.tagId) >= 0) && (Object.assign(e, { ...this.createLockProperties() })));
  }

  createLockProperties = () => {
    const _userInfo = JwtTokenHelper.GetUserInfo();
    return {
      preservationLocked: true,
      preservationLockedBy: _userInfo.userName,
      preservationLockedDate: (new Date())
    }
  }

  onCheckValueIndexedDB() {
    const _snTagsPreservation = StoreNames.tagPreservation;
    this.idbService.getAllData(_snTagsPreservation).then((res) => {
      this.hasValueIndexedDB = res && res.length > 0;
      this.reloadSideMenuService.sendMessage(this.hasValueIndexedDB);
    });
  }

  onDownloadTagTab() {
    // real api
    const _newObj = this.getTagIds({ tags: this.selection.selected, getDownload: true, isLoading: true });
    if (!this.checkTagNotLocked(_newObj.tagIds)) {
      this.selection.clear();
      this.authErrorHandler.handleError(this.msg.notDownloadLocked);
    } else {
      this.downloadStatusService.sendMessage4Preservation({ isDownloading: true, items: _newObj.tagDownloadStatus });
      this.selectionDownloading = this.selectionDownloading.concat([..._newObj.tagIds]);
      this.selection.clear();
      this.preservationTabServices.downloadPreservationData(this.projectKey, _newObj.tagIds)
        .subscribe((event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.Response:
              console.log('😺 Done!');
              const result = event.body;
              if (result && result.content) {
                const _tagPreservation = result.content.tagPreservations;
                this.assignTagPreservation2Storage(_tagPreservation);
                this.assignPreservation2Storage(result.content.preservations);
                // Execute logic UI
                const _resObj = this.getTagIds({ tags: _tagPreservation, getDownload: true, isDone: true });
                this.tagLockedList = this.tagLockedList.concat([..._resObj.tagIds]);
                this.assignTagLocked(_resObj.tagIds);
                this.reduceSelectionDownloading(_resObj.tagIds);
                this.onCheckValueIndexedDB();
                let _newA = new Array<ItemNeedSync>();
                _newA = _resObj.tagIds.map(_id => ({ id: _id, isChanged: false, type: this.typeDownloadAndSync.downloaded }));
                this.tagNeedSyncList = [...this.tagNeedSyncList.filter(_tag => (!_newA.some(_t => _t.id === _tag.id))), ..._newA];
                // this.tagNeedSyncList.push(..._resObj.tagIds.map(_id => ({ id: _id, isChanged: false, type: this.typeDownloadAndSync.downloaded })));
                this.downloadStatusService.sendMessage4Preservation({ isDownloading: false, items: _resObj.tagDownloadStatus });
              } else {
                this.downloadStatusService.sendMessage4Preservation({ isDownloading: false, items: [] });
              }
              break;
          }
        }, (err) => {
          this.reduceSelectionDownloading(_newObj.tagIds);
          this.downloadStatusService.reset(TypeDownloadRequest.preservation, true);
          this.authErrorHandler.handleError(err.message);
        });
    }
  }

  assignTagPreservation2Storage(tagPreservation) {
    const _snTagPreservation = StoreNames.tagPreservation;
    this.idbService.addTagPreservation(_snTagPreservation, tagPreservation);
  }

  assignPreservation2Storage(preservation) {
    const _snPreservation = StoreNames.preservation;
    this.idbService.addPreservation(_snPreservation, preservation);
  }

  //#endregion download

  //#region Filter

  // starting declaration
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

  //--- Tag Models
  tagLookUpFilterModels: TagPreservationFilter[] = [];
  tagLookUpFilterTempModels: TagPreservationFilter[] = [];

  dataTagTypeModels: TagTypeModel[] = [];
  tagParentLookupModels: TagLookUpModel[] = [];
  statusFilterModel: [
    {
      value: 1,
      label: "InActive",
    },
    {
      value: 2,
      label: "NotDue",
    },
    {
      value: 3,
      label: "Completed",
    },
    {
      value: 4,
      label: "Paused",
    },
    {
      value: 5,
      label: "Stopped",
    },
    {
      value: 6,
      label: "Due",
    },
    {
      value: 7,
      label: "OverDue",
    }
  ];

  //--- Variables
  bufferSize = 100;
  systemFilter: string;
  subSystemFilter: string;
  disciplineFilter: string;
  equipmentTypeFilter: string;
  statusFilter: string;
  locationFilter: string;
  tagFilter: string[];
  descriptionFilter: string;

  //--- Boolean
  isLoadingSelectLocationFilter: boolean;
  isLoadingSelectEquipmentFilter: boolean;
  isLoadingSelectSubSystemFilter: boolean;
  isLoadingSelectSystemFilter: boolean;
  isLoadingDisciplineSelectFilter: boolean;

  //--- API
  private mockTabTypeApi = new MockTabTypeApi();

  // ending declaration

  onClearData = () => {
    this.systemFilter = null;
    this.subSystemFilter = null;
    this.tagFilter = null;
    this.disciplineFilter = null;
    this.equipmentTypeFilter = null;
    this.statusFilter = null;
    this.equipmentTypeFilter = null;
    this.descriptionFilter = null;
    this.locationFilter = null;
    this.onGetTagLookUp();
  }

  onGetLookUpTagParent = () => {
    return new Promise((resolve, reject) => {
      this.datatagNoService.getTagParentLookUp(this.projectKey).subscribe(
        (res) => {
          this.tagParentLookupModels = res.content
            ? <TagLookUpModel[]>[...res.content]
            : [];
          this.clientState.isBusy = true;
          resolve(res.content);
        },
        (err: ApiError) => {
          this.clientState.isBusy = true;
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
          this.clientState.isBusy = true;
          resolve(res.content);
        },
        (err: ApiError) => {
          this.clientState.isBusy = true;
          reject(err.message);
          this.authErrorHandler.handleError(err.message);
        }
      );
    });
  };

  //--- TagFilter
  onGetTagLookUp = () => {
    this.clientState.isBusy = true;
    this.tagFilter = null;
    this.preservationTabServices
      .lookupTagsPreservationPage(
        this.projectKey,
        this.systemFilter || "",
        this.subSystemFilter || "",
        this.descriptionFilter || "",
        this.disciplineFilter || "",
        this.equipmentTypeFilter || "",
        this.statusFilter || "",
        this.locationFilter || "",
      )
      .subscribe(
        (res) => {
          this.tagLookUpFilterModels = res.content ? <TagPreservationFilter[]>[...res.content] : null;
          this.tagLookUpFilterTempModels = this.tagLookUpFilterModels.slice(
            0,
            this.bufferSize
          );
          this.clientState.isBusy = false;
        }, (err: ApiError) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        });
  }

  onScrollToEndSelectTagFilter() {
    if (this.tagLookUpFilterModels.length > this.bufferSize) {
      this.loadingSelection.isLoadingTag = true;
      const len = this.tagLookUpFilterTempModels.length;
      const more = this.tagLookUpFilterModels.slice(len, this.bufferSize + len);
      setTimeout(() => {
        this.loadingSelection.isLoadingTag = false;
        this.tagLookUpFilterTempModels = this.tagLookUpFilterTempModels.concat(more);
      }, 500);
    }
  }

  onSearchSelectTagFilter(event) {
    this.loadingSelection.isLoadingTag = true;
    if (event.term == "") {
      this.tagLookUpFilterTempModels = this.tagLookUpFilterModels.slice(
        0,
        this.bufferSize
      );
      this.loadingSelection.isLoadingTag = false;
    } else {
      this.tagLookUpFilterTempModels = this.tagLookUpFilterModels;
      this.loadingSelection.isLoadingTag = false;
    }
  }

  onClearSelect() {
    this.tagLookUpFilterTempModels = this.tagLookUpFilterModels.slice(0, this.bufferSize);
  }

  onClearTagSelect(tag: TagLookUpModel) {
    if (
      tag &&
      tag.id &&
      this.tagFilter &&
      this.tagFilter.length > 0
    ) {
      this.tagFilter = this.tagFilter.filter(
        (item) => item != tag.id
      );
    }
  }
  //--- /TagFilter

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
          this.clientState.isBusy = true;
          resolve(res.content);
        },
        (err: ApiError) => {
          this.clientState.isBusy = true;
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
    this.onGetTagLookUp();
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
            this.clientState.isBusy = true;
            resolve(res.content);
          },
          (err: ApiError) => {
            this.clientState.isBusy = true;
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
    this.onGetTagLookUp();
  };
  // --- /EquipmentFilter

  //--- SubSystemFilter
  onGetSubSystemLookUpFilter = (systemId: string) => {
    this.clientState.isBusy = true;
    this.subSystemFilter = null;
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
    this.onGetTagLookUp();
  };

  onGetSubSystemBySystemFilter = (event) => {
    if (!event || !event.id) {
      return;
    }
    this.onGetSubSystemLookUpFilter(event.id);
    this.onGetTagLookUp();
  }

  resetSubSystemFilter() {
    this.subSystemFilter = null;
    this.subSystemLookUpFilterModels = null;
    this.subSystemFilterTempModel = null;
  }
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
            this.clientState.isBusy = true;
            resolve(res.content);
          },
          (err: ApiError) => {
            this.clientState.isBusy = true;
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
    this.resetSubSystemFilter();
    this.onGetTagLookUp();
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
            this.clientState.isBusy = true;
            resolve(res.content);
          },
          (err: ApiError) => {
            this.clientState.isBusy = true;
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


  //#endregion Filter

  //#region Utils
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

  convertDateString(dateString) {
    if (dateString) {
      return (new Date(dateString)).toLocaleDateString('es-ES');
    }
    return null;
  }
  //#endregion Utils
}