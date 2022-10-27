import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { HandoverLookUpModel, MilestonesTabModel, UpdateMilestonesTabModel, MilestoneFilterModel, StatusColorMilestone, StatusDisplayMilestone, MilestoneTabSignOffCommand, HandoverDownloadStatus, WalkdownStatusEnum, HandoverStatusEnum, HandoverStatus, WalkdownSignature, MilestoneTags } from 'src/app/shared/models/milestones-tab/milestones-tab.model';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { MilestonesProjectSettingsModel } from 'src/app/shared/models/project-settings/project-settings.model';
import { MilestonesTabService } from 'src/app/shared/services/api/milestones-tab/milestones-tab.service';
import { Configs } from 'src/app/shared/common/configs/configs';
import { Subscription } from 'rxjs/internal/Subscription';
import { ActivatedRoute, Router } from '@angular/router';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/shared/directives/format-datepicker/format-datepicker';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { Sort } from '@angular/material/sort/typings/sort';
import { Constants } from 'src/app/shared/common/constants/constants';
import { DisciplineLookUpModel } from 'src/app/shared/models/data-tab/data-discipline.model';
import { SystemLookUpModel } from 'src/app/shared/models/data-tab/data-system.model';
import { SubSystemLookUpModel } from 'src/app/shared/models/data-tab/data-subsystem.model';
import { MilestoneLookUpModel } from 'src/app/shared/models/data-tab/data-milestone.model';
import { DataSubSystemService } from 'src/app/shared/services/api/data-tab/data-subsystem.service';
import { DataMilestoneService } from 'src/app/shared/services/api/data-tab/data-milestone.service';
import { DataSystemService } from 'src/app/shared/services/api/data-tab/data-system.service';
import { ModuleProjectDefaultModel } from 'src/app/shared/models/module/module.model';
import { JwtTokenHelper, PermissionsViews } from 'src/app/shared/common';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { MatDialog } from '@angular/material/dialog';
import { AddPunchWalkdownComponent } from './add-punch-walkdown/add-punch-walkdown.component';
import { WalkdownCompleteMilestonesComponent } from './walkdown-complete-milestones/walkdown-complete-milestones.component';
import { AuthInProjectDto } from 'src/app/shared/models/project-management/project-management.model';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { DownloadStatusService, IdbService, ReloadAfterSynchronizingService, ReloadSideMenuService } from 'src/app/shared/services';
import { IndexRelatedSNs, ItemNeedSync, ReloadPageKey, ResponseKeys, ResponseSyncItem, StoreNames, TypeDownloadAndSync, TypeDownloadRequest } from 'src/app/shared/models/common/common.model';
import { BCryptHelper } from 'src/app/shared/common/bcrypt/bcrypt';
import { KeyLookups } from 'src/app/shared/models/punch-item/punch-item.model';
import { TagTabService } from 'src/app/shared/services/api/tag-tab/tag-tab.service';
import { SynchronizeDataCommand } from 'src/app/shared/models/tab-tag/tab-tag.model';
import { ConveyData2SyncDetailService } from 'src/app/shared/services/utils/utils-sub.service';
declare var $: any;

@Component({
  selector: 'milestones-tab',
  templateUrl: './milestones-tab.component.html',
  styleUrls: ['./milestones-tab.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})

export class MilestonesTabComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("tableContainer") tableContainer: ElementRef;

  //--- Boolean
  isCollapse: boolean;
  isEditState: boolean = true;
  isDeleteState: boolean;
  isToggleDropdown: boolean;
  isEnableDelete: boolean;
  isEnableApply: boolean;
  isEnableEdit: boolean;
  isApplyState: boolean;
  isShowAllocatedInfo: boolean;
  isShowConditionalAcceptance: boolean;
  isShowDisciplines: boolean;
  isShowAddPartial: boolean;
  isShowPinCode: boolean;
  isShowCreatePinCode: boolean;
  isShowRemarkInfo: boolean;
  hasShowLoginModal = false;
  isCAAccepted = false;
  isRevertState: boolean = false;
  hasValueIndexedDB: boolean = false;
  isSyncSelectedState: boolean;

  //--- Model
  milestonesProjectSettingsModels: MilestonesProjectSettingsModel[] = [];
  milestonesTabModels: MilestonesTabModel[] = [];
  updateMilestonesTabModel: UpdateMilestonesTabModel = new UpdateMilestonesTabModel();
  handoverLookUpModels: HandoverLookUpModel[] = [];
  remarkModels: string[] = [];
  disciplineLookUpModel: DisciplineLookUpModel[];
  systemLookUpModel: SystemLookUpModel[] = [];
  subSystemLookUpModel: SubSystemLookUpModel[] = [];
  milestoneLookUpModel: MilestoneLookUpModel[] = [];
  moduleProjectDefaultModel: ModuleProjectDefaultModel = new ModuleProjectDefaultModel();
  permissionsViews = PermissionsViews;
  authInProjectDto: AuthInProjectDto[] = [];
  handoverLockedList = [];
  selectionDownloading = [];
  handoverNeedSyncList: ItemNeedSync[] = new Array<ItemNeedSync>();

  //--- Filter
  systemFilter: string;
  subSystemFilter: string;
  milestoneFilter: string;
  handoverNoFiler: string;
  milestoneFilterModel: MilestoneFilterModel = new MilestoneFilterModel();

  //--- Variable
  sub: Subscription;
  projectKey: string;
  defaultSort: string = "MilestoneName desc";
  currentPageNumber: number;
  currentPageSize: number;
  currentSortExpression: string;
  totalItemCount: number = 0;
  milestoneNoSorting: string;
  allocatedHeader: string;
  listHandoverDeleteId: Array<string>;
  handoverId: string;
  StatusColor = StatusColorMilestone;
  StatusDisplay = StatusDisplayMilestone;
  relatedPunch: MilestonesTabModel;
  walkdownStatusEnum = WalkdownStatusEnum;
  handoverStatusEnum = HandoverStatusEnum;
  typeDownloadAndSync = TypeDownloadAndSync;

  OSTypes = {
    itrs: 'ITRs',
    punches: 'Punches',
    changes: 'Changes',
  }

  msg = {
    invalid: 'Username or password invalid.',
    notPermission: "You don't have permission",
    saveNSub: 'Save and Submit success',
    notDownloadLocked: 'Can not download locked Tag',
    please: 'Please choose again.',
    notInLocal: 'Handover is not in local',
    someNotIn: 'Some handovers are not in local',
  }

  //--- Table datasource
  dataSource: MatTableDataSource<MilestonesTabModel>;
  selection = new SelectionModel<MilestonesTabModel>(true, []);
  displayedColumns: string[] = [
    'select',
    'handoverNo',
    'locked',
    'systemNo',
    'subSystemNo',
    'description',
    'milestoneName',
    'type',
    'disciplines',
    'osITRs',
    'osPunches',
    'osChanges',
    'lockedBy',
    'lockedDate',
    'dateStartPlanned',
    'dateEndPlanned',
    'dateStartActual',
    'dateEndActual',
    'remarks',
    'addPartial',
    'walkDownComplete',
    'conditionalAcceptance',
    'status'
  ];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    public clientState: ClientState,
    private route: ActivatedRoute,
    private router: Router,
    private milestonesTabService: MilestonesTabService,
    private authErrorHandler: AuthErrorHandler,
    private subSystemService: DataSubSystemService,
    private milestoneService: DataMilestoneService,
    private systemService: DataSystemService,
    public dialog: MatDialog,
    private downloadStatusService: DownloadStatusService,
    private reloadSideMenuService: ReloadSideMenuService,
    private idbService: IdbService,
    private reloadAfterSyncS: ReloadAfterSynchronizingService,
    private tagTabService: TagTabService,
    private conveyData2SDService: ConveyData2SyncDetailService,
  ) {
    this.sub = this.route.params.subscribe(params => {
      this.projectKey = params['projectKey'];
      if (!this.projectKey) {
        this.router.navigate(['']);
      }
    });

    this.selection.changed.subscribe((item) => {
      this.isEnableApply = !(this.selection.selected.length == 0);
      this.isEnableEdit = !(this.selection.selected.length == 0);
      this.isEnableDelete = !(this.selection.selected.length == 0);
    });

    this.reloadAfterSyncS.getMessage().subscribe((res) => {
      if (res.key === ReloadPageKey.milestones) {
        // this.onGetMilestones(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSort);
        this.resetStatusHandoverDownloadOff(this.typeDownloadAndSync.synchronizing, res.response[ResponseKeys.milestones]);
      }
    });
  }

  ngAfterViewInit(): void {
    //--- Set height table container
    const tableContainerHeight = $(window).height() - 230;
    if (tableContainerHeight > 0) {
      this.tableContainer.nativeElement.style.maxHeight = tableContainerHeight + "px";
    }
  }

  public ngOnInit() {
    if (!this.isOffline) { this.onGetLookUps(); }
    //--- Get milestones data
    this.route.queryParams.subscribe(params => {
      if (params['handoverNo'] && !this.isOffline) { this.milestoneFilterModel.handoverNoFiler = params['handoverNo']; }
      this.onGetMilestones(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSort);
    });

    //--- Get module by user
    this.moduleProjectDefaultModel = JwtTokenHelper.GetModuleProjectDefault();
  }

  //--- Check info device
  get isTablet() {
    return InfoDevice.isTablet;
  }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  openDialogAddPunch() {
    const dialogRef = this.dialog.open(AddPunchWalkdownComponent, {
      data: {
        projectKey: this.projectKey,
        relatedPunch: this.relatedPunch,
        handoverId: this.handoverId,
      },
      panelClass: 'custom-modalbox',
      minWidth: '55vw',
      maxWidth: '95vw',
    });

    dialogRef.afterClosed().subscribe(_isConfirm => {
      // console.log(`Dialog result: ${_isConfirm}`);
      if (_isConfirm) {
        this.openDialogWalkdown();
        this.onConfirmAddPunchItem();
      }
    });
  }

  openDialogWalkdown() {
    const dialogRef = this.dialog.open(WalkdownCompleteMilestonesComponent, {
      data: {
        projectKey: this.projectKey,
        handoverId: this.handoverId,
      },
      hasBackdrop: true,
      panelClass: 'custom-modalbox',
      minWidth: '55vw',
      maxWidth: '95vw',
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result walkdown: ${result}`);

      switch (result) {
        case 'onSuccess':
          this.onConfirmWalkdownComplete(true);
          break;
        case 'onSignOff':
          this.hasShowLoginModal = false;
          this.onConfirmSignOff(true);
          break;
        case 'onAnotherSignOff':
          this.isShowPinCode = false;
          this.onConfirmAnotherSignOff(true);
          break;
        case 'onShowAddPunchItem':
          this.onConfirmShowAddPunchItem();
          break;
        default:
          this.isShowPinCode = false;
          this.hasShowLoginModal = false;
          break;
      }
    });
  }

  getHandoverNeedSyncList() {
    const _snHandovers = StoreNames.handovers;
    this.handoverNeedSyncList = new Array<ItemNeedSync>();
    this.idbService.getAllData(_snHandovers).then(_localHandovers => {
      _localHandovers.forEach(_t => this.handoverNeedSyncList.push({ id: _t.handoverId, isChanged: !!_t.isChanged, type: this.typeDownloadAndSync.downloaded }));
    });
  }

  getHandoverInLocal(handoverId: string) {
    if (!handoverId) { return false; }
    return (this.handoverNeedSyncList && this.handoverNeedSyncList.length > 0 && this.handoverNeedSyncList.some(_t => _t.id === handoverId));
  }

  onCheckHandoverNeedSync(handoverId: string) {
    if (!handoverId) { return false; }
    const _tNeed = this.handoverNeedSyncList.find(_t => _t.id === handoverId);
    return _tNeed.isChanged;
  }

  onGetLookUps() {
    this.clientState.isPopupBusy = true;
    Promise.all([
      this.onGetLookUpMilestone(),
      this.onGetLookUpSystem(),
      this.onGetLookUpSubsystem()
    ]).then((res) => {
      this.clientState.isPopupBusy = false;
    })
      .catch((err) => {
        this.clientState.isPopupBusy = false;
      });

  }

  onGetLookUpMilestone() {
    return new Promise((resolve, reject) => {
      this.milestoneService.getMilestoneLookUp(this.projectKey).subscribe(res => {
        this.milestoneLookUpModel = res.content ? <MilestoneLookUpModel[]>[...res.content] : [];
        resolve(res.content);
      }, (err: ApiError) => {
        this.authErrorHandler.handleError(err.message);
        reject(err.message);
      });
    })

  }

  onGetLookUpSubsystem(systemId?: string) {
    return new Promise((resolve, reject) => {
      this.subSystemService.getSubSystemLookUp(this.projectKey, systemId || "").subscribe(res => {
        this.subSystemLookUpModel = res.content ? <SubSystemLookUpModel[]>[...res.content] : [];
        resolve(res.content)
      }, (err: ApiError) => {
        this.authErrorHandler.handleError(err.message);
        reject(err.message);
      });
    })
  }

  onGetLookUpSystem() {
    return new Promise((resolve, reject) => {
      this.systemService.getElementSystemLookUp(this.projectKey).subscribe(res => {
        this.systemLookUpModel = res.content ? <SystemLookUpModel[]>[...res.content] : [];
        resolve(res.content);
      }, (err: ApiError) => {
        this.authErrorHandler.handleError(err.message);
        reject(err.message);
      });
    })
  }

  //--- Get milestones data
  onGetMilestones = (pageNumber?: number, pageSize?: number, sortExpression?: string) => {
    this.clientState.isBusy = true;
    this.selection.clear();
    this.onCheckValueIndexedDB();

    if (this.isOffline) {
      const _snHandovers = StoreNames.handovers;
      this.idbService.getAllData(_snHandovers).then((res) => {
        const _items = res && res ? <MilestonesTabModel[]>[...res] : [];
        this.assignMilestoneList(_items);
        this.totalItemCount = res.length;
        this.clientState.isBusy = false;
      }).catch((err) => {
        this.clientState.isBusy = false;
      });
    } else {
      if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
      if (pageSize > 0) this.currentPageSize = pageSize;
      if (sortExpression) this.currentSortExpression = sortExpression;

      this.milestonesTabService.getMilestonesList(this.projectKey, this.milestoneFilterModel.systemFilter || "", this.milestoneFilterModel.subSystemFilter || "", this.milestoneFilterModel.milestoneFilter || "", pageNumber || Configs.DefaultPageNumber, pageSize || Configs.DefaultPageSize, sortExpression || this.defaultSort, this.milestoneFilterModel.handoverNoFiler || "").subscribe(res => {
        const _items = res && res.items ? <MilestonesTabModel[]>[...res.items] : [];
        this.assignMilestoneList(_items);
        this.totalItemCount = res.totalItemCount;
        this.isToggleDropdown = false;
        this.clientState.isBusy = false;
      }, (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      });
    }
  }

  assignMilestoneList(milestones: MilestonesTabModel[]) {
    this.milestonesTabModels = milestones ? <MilestonesTabModel[]>[...milestones] : [];
    this.getHandoverLockedList(this.milestonesTabModels);

    if (this.milestonesTabModels.length > 0) {
      this.milestonesTabModels.map(item => {
        item.dateStartPlanned = item.dateStartPlanned ? new Date(item.dateStartPlanned) : null;
        item.dateEndPlanned = item.dateEndPlanned ? new Date(item.dateEndPlanned) : null;
        item.dateStartActual = item.dateStartActual ? new Date(item.dateStartActual) : null;
        item.dateEndActual = item.dateEndActual ? new Date(item.dateEndActual) : null;
        item.walkDownCompleteDate = item.walkDownCompleteDate ? new Date(item.walkDownCompleteDate) : null;
      })
    }

    this.dataSource = new MatTableDataSource(this.milestonesTabModels);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.getHandoverNeedSyncList();
  }

  resetStatusHandoverDownloadOff(fromType: string, source: any[]) {
    // update Type based on input
    switch (fromType) {
      case this.typeDownloadAndSync.synchronizing:
        this.handoverNeedSyncList = this.handoverNeedSyncList.map(_t => {
          if (source.some(_item => _item.id === _t.id && _item.isCompleted)) {
            return { ..._t, ...{ type: this.typeDownloadAndSync.syncSuccessful } };
          } else if (source.some(_item => _item.id === _t.id && !_item.isCompleted)) {
            return { ..._t, ...{ type: this.typeDownloadAndSync.syncFailed } };
          }
          return _t;
        });
        // remove syncing or reverting success on UI
        this.milestonesTabModels = this.milestonesTabModels.map(_t => {
          if (source.some(_item => _item.id === _t.handoverId && _item.isCompleted)) {
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
        this.handoverNeedSyncList = this.handoverNeedSyncList.map(_t => {
          if (source.some(_item => _item.id === _t.id)) {
            return { ..._t, ...{ type: this.typeDownloadAndSync.removed } };
          }
          return _t;
        });
        // remove syncing or reverting success on UI
        this.milestonesTabModels = this.milestonesTabModels.map(_t => {
          if (source.some(_item => _item.id === _t.handoverId)) {
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
    this.getHandoverLockedList(this.milestonesTabModels);

    if (this.milestonesTabModels.length > 0) {
      this.milestonesTabModels.map(item => {
        item.dateStartPlanned = item.dateStartPlanned ? new Date(item.dateStartPlanned) : null;
        item.dateEndPlanned = item.dateEndPlanned ? new Date(item.dateEndPlanned) : null;
        item.dateStartActual = item.dateStartActual ? new Date(item.dateStartActual) : null;
        item.dateEndActual = item.dateEndActual ? new Date(item.dateEndActual) : null;
        item.walkDownCompleteDate = item.walkDownCompleteDate ? new Date(item.walkDownCompleteDate) : null;
      })
    }

    this.dataSource = new MatTableDataSource(this.milestonesTabModels);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  onCheckType(positionType: string, handoverId: string) {
    return this.handoverNeedSyncList.some(_handover => _handover.id === handoverId && _handover.type === positionType);
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
  checkboxLabel(row?: MilestonesTabModel): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.handoverId + 1}`;
  }

  //--- Sort data
  onSortData(sort: Sort) {
    let sortExpressionData: string;
    if (sort) {
      sortExpressionData = sort.active + " " + sort.direction;
      this.onGetMilestones(this.currentPageNumber, this.currentPageSize, sortExpressionData);
    }
  }

  //--- Collapse
  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  }

  //--- Edit item
  onEditMilestonesTab = () => {
    this.isToggleDropdown = false;
    this.isEditState = false;
  }

  onCancelMilestonesTab = () => {
    this.isEditState = true;
  }

  //--- Delete item
  onOpenDeleteModal = () => {
    this.isDeleteState = true;
    var listIdDelete = [];
    if (this.selection && this.selection.selected.length > 0) {
      this.selection.selected.forEach(item => {
        listIdDelete.push(item.handoverId)
      });
    }
    this.listHandoverDeleteId = listIdDelete;
  }

  onDeleteConfirm = (isConfirm: boolean) => {
    if (!isConfirm) {
      this.isDeleteState = false;
      return;
    }

    if (this.listHandoverDeleteId.length > 0) {
      this.clientState.isBusy = true;
      if (this.isOffline) {
        const _snHandovers = StoreNames.handovers;
        this.idbService.getAllData(_snHandovers).then(res => {
          const _allHandovers = res ? <MilestonesTabModel[]>[...res] : [];
          const _selectedHandovers = [...(this.selection.selected)];
          // check isInitialHo
          if (_selectedHandovers.some(_h => _h.isInitialHO) || _selectedHandovers.some(_h => _h.isInitialHO === false && _h.isAddNew === false)) {
            this.clientState.isBusy = false;
            this.listHandoverDeleteId = null;
            this.selection.clear();
            this.authErrorHandler.handleError('Cannot delete Initial Handover. Please choose again.');
          } else {
            const _selectedHandoversLen = _selectedHandovers.length
            _selectedHandovers.forEach((_h, i) => {
              // find parent
              let _vSysId = _h.systemId ? _h.systemId : null;
              let _vSubSysId = _h.subSystemId ? _h.subSystemId : null;
              let _milestoneId = _h.milestoneId ? _h.milestoneId : null;
              let _parent = _allHandovers.find(_handover => _handover.isInitialHO && ((_vSysId && _milestoneId && _handover.systemId === _vSysId && _handover.milestoneId === _milestoneId)
                || (_vSubSysId && _milestoneId && _handover.subSystemId === _vSubSysId && _handover.milestoneId === _milestoneId)));
              // merge tags related
              _parent.tagsRelated = _parent.tagsRelated.concat(..._h.tagsRelated);
              // merge disciplines
              _parent.disciplines = _parent.disciplines.concat(..._h.disciplines);
              _parent.isChanged = true;
              // save parent to storage
              this.idbService.updateItem(_snHandovers, _parent, _parent.handoverId);
              // remove child from store
              this.idbService.removeItem(_snHandovers, _h.handoverId);
              // prompt message
              if (i === _selectedHandoversLen - 1) {
                this.clientState.isBusy = false;
                this.listHandoverDeleteId = null;
                this.authErrorHandler.handleSuccess(Constants.MilestonesTabDeleted);
                this.onGetMilestones(Configs.DefaultPageNumber, this.currentPageSize, this.currentSortExpression);
              }
            });
          }
        }, err => { });
      } else {
        this.milestonesTabService.deletePartialHandover(this.listHandoverDeleteId).subscribe({
          complete: () => {
            this.clientState.isBusy = false;
            this.listHandoverDeleteId = null;
            this.authErrorHandler.handleSuccess(Constants.MilestonesTabDeleted);
            this.onGetMilestones(Configs.DefaultPageNumber, this.currentPageSize, this.currentSortExpression);
          },
          error: (err: ApiError) => {
            this.clientState.isBusy = false;
            this.listHandoverDeleteId = null;
            this.authErrorHandler.handleError(err.message);
          },
        });
      }
    }

    this.isDeleteState = false;
  }

  //--- Apply item
  onOpenApplyModal = () => {
    this.isApplyState = true;
  };

  onApplyConfirm = (isConfirm: boolean) => {
    if (!isConfirm) {
      this.isApplyState = false;
      return;
    }

    let dataHandoverId = [];
    if (this.selection && this.selection.selected.length > 0) {
      this.selection.selected.forEach((item) => {
        dataHandoverId.push(item.handoverId);
      });

      if (dataHandoverId.length > 0) {
        this.clientState.isBusy = true;

        let milestonesTabUpdateModel = <UpdateMilestonesTabModel>{
          ...this.updateMilestonesTabModel
        };
        milestonesTabUpdateModel.ids = dataHandoverId;
        milestonesTabUpdateModel.dateStartPlanned = milestonesTabUpdateModel.dateStartPlanned ? (new Date(milestonesTabUpdateModel.dateStartPlanned)).toDateString() : null;
        milestonesTabUpdateModel.dateEndPlanned = milestonesTabUpdateModel.dateEndPlanned ? (new Date(milestonesTabUpdateModel.dateEndPlanned)).toDateString() : null;

        this.milestonesTabService.applyMilestones(milestonesTabUpdateModel).subscribe({
          complete: () => {
            this.updateMilestonesTabModel = new UpdateMilestonesTabModel();
            this.isApplyState = false;
            this.isApplyState = false;
            this.selection.clear();
            this.clientState.isBusy = false;
            this.onGetMilestones(this.currentPageNumber, this.currentPageSize, this.currentSortExpression)
            this.authErrorHandler.handleSuccess("Milestone updated");
          },
          error: (err: ApiError) => {
            this.isApplyState = false;
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
          }
        })
      }
    }
  }

  //--- Allocated Info
  onShowOsITR = (handoverId: string) => {
    this.allocatedHeader = "O/S ITRs";
    this.isShowAllocatedInfo = true;
    this.clientState.isBusy = true;

    if (this.isOffline) {
      const _snHandovers = StoreNames.handovers;
      this.idbService.getItem(_snHandovers, handoverId).then(res => {
        const _handover: MilestonesTabModel = res ? { ...res } : null;
        if (_handover) {
          this.handoverLookUpModels = this.sumOS(_handover.tagsRelated, this.OSTypes.itrs).content;
        }
        this.clientState.isBusy = false;
      }, err => {
        this.clientState.isBusy = false;
      })
    } else {
      this.milestonesTabService.getItrHandoverLookUp(handoverId).subscribe(res => {
        this.handoverLookUpModels = res.content ? <HandoverLookUpModel[]>[...res.content] : [];
        this.clientState.isBusy = false;
      }, (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      });
    }
  }

  onShowOsPunches = (handoverId: string) => {
    this.allocatedHeader = "O/S Punches";
    this.isShowAllocatedInfo = true;
    this.clientState.isBusy = true;

    if (this.isOffline) {
      const _snHandovers = StoreNames.handovers;
      this.idbService.getItem(_snHandovers, handoverId).then(res => {
        const _handover: MilestonesTabModel = res ? { ...res } : null;
        if (_handover) {
          this.handoverLookUpModels = this.sumOS(_handover.tagsRelated, this.OSTypes.punches).content;
        }
        this.clientState.isBusy = false;
      }, err => {
        this.clientState.isBusy = false;
      })
    } else {
      this.milestonesTabService.getPunchHandoverLookUp(handoverId).subscribe(res => {
        this.handoverLookUpModels = res.content ? <HandoverLookUpModel[]>[...res.content] : [];
        this.clientState.isBusy = false;
      }, (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      });
    }
  }

  onShowOsChanges = (handoverId: string) => {
    this.allocatedHeader = "O/S Changes";
    this.isShowAllocatedInfo = true;
    this.clientState.isBusy = true;

    if (this.isOffline) {
      const _snHandovers = StoreNames.handovers;
      this.idbService.getItem(_snHandovers, handoverId).then(res => {
        const _handover: MilestonesTabModel = res ? { ...res } : null;
        if (_handover) {
          this.handoverLookUpModels = this.sumOS(_handover.tagsRelated, this.OSTypes.changes).content;
        }
        this.clientState.isBusy = false;
      }, err => {
        this.clientState.isBusy = false;
      })
    } else {
      this.milestonesTabService.getChangeHandoverLookUp(handoverId).subscribe(res => {
        this.handoverLookUpModels = res.content ? <HandoverLookUpModel[]>[...res.content] : [];
        this.clientState.isBusy = false;
      }, (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      });
    }
  }

  getOSAmount(type: string, index: number, osValue: number) {
    if (this.isOffline) {
      switch (type) {
        case this.OSTypes.itrs:
          return this.sumOS(this.milestonesTabModels[index].tagsRelated, this.OSTypes.itrs).len;
        case this.OSTypes.punches:
          return this.sumOS(this.milestonesTabModels[index].tagsRelated, this.OSTypes.punches).len;
        case this.OSTypes.changes:
          return this.sumOS(this.milestonesTabModels[index].tagsRelated, this.OSTypes.changes).len;
      }
    } else {
      return osValue;
    }
  }

  onShowRemarks = (remarks: string[]) => {
    this.isShowRemarkInfo = true;
    this.remarkModels = remarks;
  }

  onConfirmAllocatedInfo = (isConfirm: boolean) => {
    this.isShowAllocatedInfo = isConfirm;
    this.handoverLookUpModels = [];
  }

  onConfirmRemarkInfo = (isConfirm: boolean) => {
    this.isShowRemarkInfo = isConfirm;
    this.remarkModels = [];
  }

  //--- Show disciplines
  onShowDisciplines = (disciplines: DisciplineLookUpModel[]) => {
    this.disciplineLookUpModel = disciplines;
    this.isShowDisciplines = true;
  }

  onConfirmDisciplines = (isConfirm: boolean) => {
    this.isShowDisciplines = isConfirm;
    this.disciplineLookUpModel = [];
  }

  //--- Add partial
  onShowAddPartialModal = (handoverId: string) => {
    this.isShowAddPartial = true;
    this.handoverId = handoverId;
  }

  onConfirmAddPartial = (isConfirm: boolean) => {
    if (isConfirm) {
      this.onGetMilestones(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
    this.handoverId = "";
    this.isShowAddPartial = false;
  }

  //--- Show walkdown complete
  onShowWalkdownComplete = (handover: MilestonesTabModel) => {
    this.handoverId = handover.handoverId;
    this.relatedPunch = handover;
    this.isShowPinCode = true;
    this.hasShowLoginModal = true;
    this.openDialogWalkdown();
  }

  onConfirmWalkdownComplete = (isConfirm: boolean) => {
    if (isConfirm) {
      this.onGetMilestones(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
    this.handoverId = "";
  }

  //--- Sign off
  onConfirmSignOff = (isConfirm: boolean) => {
    if (isConfirm) {
      if (this.isOffline) {
        this.onShowPinCodeModal();
      } else {
        this.milestonesTabService.signValidate(this.projectKey, this.handoverId).subscribe({
          complete: () => {
            this.clientState.isBusy = false;
            this.onShowPinCodeModal();
          },
          error: (err: ApiError) => {
            this.clientState.isBusy = false;
            if (err.type == Constants.PinCodeNotExistsException) {
              this.onShowPinCodeModal(true);
            } else {
              this.authErrorHandler.handleError(err.message);
            }
          },
        });
      }
    }
  }

  //--- Pin Code
  onShowPinCodeModal = (isCreatePinCode: boolean = false) => {
    this.isShowPinCode = true;
    this.hasShowLoginModal = false;
    if (isCreatePinCode && !this.isOffline) {
      this.onShowCreatePinCodeModal();
    }
  };

  onPinCodeConfirmModal = (code: string) => {
    this.isShowPinCode = false;
    this.isShowCreatePinCode = false;

    if (code) {
      if (code == "CREATE" && !this.isOffline) {
        this.onCreatePinCodeConfirmModal(true);
        return;
      }
      this.clientState.isBusy = true;
      if (this.isOffline) {
        const _snLookup = StoreNames.lookups;
        this.idbService.getItem(_snLookup, KeyLookups.pinCode).then((_pc) => {
          if (BCryptHelper.comparison(code, _pc)) {
            const _snHandovers = StoreNames.handovers;
            const _userInfo = JwtTokenHelper.GetUserInfo();
            const _infoProject = JwtTokenHelper.GetAuthSignInProject();
            this.idbService.getItem(_snHandovers, this.handoverId).then((res) => {
              const _handover: MilestonesTabModel = res ? { ...res } : null;
              const _walkdownSignTemp: Array<WalkdownSignature> = _handover ? [..._handover.walkDownSignatures] as Array<WalkdownSignature> : null;
              // check signature permission
              const index = _walkdownSignTemp && Array.isArray(_walkdownSignTemp) ? _walkdownSignTemp.findIndex(_s => _s.isTurn) : null;
              if (_walkdownSignTemp[index].authorizationLevel >= _infoProject.authLevel) {
                // next step
                const _signNo1 = _walkdownSignTemp[index].number,
                  _signNo2 = _signNo1 + 1;
                let _currentIndex = index, _nextIndex;
                if (_walkdownSignTemp && _walkdownSignTemp.length > 0) {
                  const _temp = {
                    signDate: new Date(),
                    signedName: _userInfo.userName,
                    signUserId: _userInfo.userId,
                    isTurn: false,
                  };
                  Object.assign(_walkdownSignTemp[_currentIndex], _temp);

                  if (_walkdownSignTemp.length === 1 || _signNo2 > _walkdownSignTemp.length) {
                    _handover.walkDownComplete = true;
                    _handover.walkDownStatus = WalkdownStatusEnum.Completed;
                    _handover.walkDownCompleteDate = new Date();
                    _handover.status = HandoverStatus.Ready;
                    _handover.statusId = HandoverStatusEnum.Ready;
                  } else {
                    _nextIndex = _walkdownSignTemp.findIndex(
                      (sign) => sign.number === _signNo2
                    );
                    _walkdownSignTemp[_nextIndex].isTurn = true;
                    _handover.walkDownStatus = WalkdownStatusEnum.Inprogress;
                  }
                }

                const _editedHandover = { ..._handover, ...{ walkDownSignatures: [..._walkdownSignTemp], isChanged: true } };
                this.idbService
                  .updateItem(_snHandovers, _editedHandover, this.handoverId).then((res) => {
                    this.clientState.isBusy = false;
                    this.handoverId = '';
                    this.onGetMilestones(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
                    this.authErrorHandler.handleSuccess(
                      Constants.TagTabSignAndSubmitItrTag
                    );
                  }, (err) => {
                    this.clientState.isBusy = false;
                  });
              } else {
                this.clientState.isBusy = false;
                this.authErrorHandler.handleError(this.msg.notPermission);
              }
            }, (err) => { })

          } else {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(
              Constants.InvalidPinCode
            );
          }

        }, (err) => { })
      } else {
        const _command: MilestoneTabSignOffCommand = {
          handoverId: this.handoverId,
          projectKey: this.projectKey,
          isDifferentUser: false,
          pinCode: code,
        }

        this.milestonesTabService.signOffWalkDown(_command).subscribe({
          complete: () => {
            this.authErrorHandler.handleSuccess(Constants.SignSuccess);
            this.onGetMilestones(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
            this.handoverId = "";
          },
          error: (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
          },
        });
      }
    }
  };

  onLoginModalRes(isSign: boolean) {
    if (isSign) {
      this.handoverId = '';
      this.onGetMilestones();
    }
    this.hasShowLoginModal = false;
  }

  //--- Create Pin Code
  onShowCreatePinCodeModal = () => {
    this.isShowCreatePinCode = true;
  };

  onCreatePinCodeConfirmModal = (isConfirm: boolean) => {
    this.isShowCreatePinCode = false;
    if (isConfirm) {
      this.router.navigate(["/change-pincode"]);
    }
  };

  //--- Another sign off
  onConfirmAnotherSignOff(isConfirm: boolean) {
    if (isConfirm) {
      this.isShowPinCode = false;
      $("#loginAnotherUserWalkdownSection").modal("show");
    }
  }

  //--- Add punch item
  onConfirmShowAddPunchItem = () => {
    this.openDialogAddPunch();
  }

  onConfirmAddPunchItem = () => {
    this.onGetMilestones(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
  }

  //--- Conditional acceptance
  onOpenConditionalAcceptanceModal = (handoverId: string, accepted: boolean) => {
    this.handoverId = handoverId;
    this.isCAAccepted = accepted;
    this.isShowConditionalAcceptance = true;
  }

  onConfirmConditionalAcceptance = (isConfirm: boolean) => {
    this.isShowConditionalAcceptance = false;
    this.handoverId = "";
    $(".modal").modal("hide");
    if (isConfirm) {
      this.onGetMilestones(this.currentPageNumber, this.currentPageSize, this.currentSortExpression);
    }
  }

  //--- Refresh data
  onClearFilter = () => {
    this.milestoneFilterModel = new MilestoneFilterModel();
  }
  onRefreshData() {
    this.onClearFilter();
    this.selection.clear();
    this.currentPageNumber = Configs.DefaultPageNumber;
    this.currentPageSize = Configs.DefaultPageSize;
    this.onGetMilestones();
  }

  //--- Toggle Dropdown
  toggleDropdown = () => {
    this.isToggleDropdown = !this.isToggleDropdown;
  }

  //--- Number To Array
  numberToArray = (length: number) => {
    let arr = [];
    for (let i = 0; i < length; i++) {
      arr.push(i);
    }
    return arr;
  };

  //#region  Download functions


  onRevertTag() {
    this.isRevertState = true;
  }

  onRevertTagConfirm(isConfirm: boolean) {
    if (isConfirm) {
      this.clientState.isBusy = true;
      const _handoverIds = this.getHandoverIds({ handovers: this.selection.selected });
      this.milestonesTabService.unlockHandovers(this.projectKey, _handoverIds).subscribe((res) => {
        // remove handovers
        const _snHandovers = StoreNames.handovers;
        this.idbService.removeItems(_snHandovers, IndexRelatedSNs.handovers.handoverId, _handoverIds);
        // ---------------------------
        this.clientState.isBusy = false;
        // this.onGetMilestones();
        // support for testing
        const _source = _handoverIds.map(_id => ({ id: _id }));
        // --------------------
        this.resetStatusHandoverDownloadOff(this.typeDownloadAndSync.reverting, _source);
        this.downloadStatusService.reloadDownloadDetail(true);
        this.reloadSideMenuService.sendMessage(this.hasValueIndexedDB);
        this.authErrorHandler.handleSuccess(Constants.HandoverRevertSuccess);
      }, (err) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      });
    }
    this.isRevertState = false;
  }

  isDisableRevert() {
    if (!this.isEditState) {
      return true;
    }
    let _hasLockedTag = false;
    (this.selection.selected).forEach(_handover => {
      if (_handover.locked) {
        _hasLockedTag = true;
        return;
      }
    });
    return !_hasLockedTag;
  }

  onCheckPermission = (key: string) => {
    this.authInProjectDto = JwtTokenHelper.GetAuthProject()
      ? <AuthInProjectDto[]>[...JwtTokenHelper.GetAuthProject()]
      : [];
    return JwtTokenHelper.IsAuthInProject(key, this.authInProjectDto);
  };


  onLockHandover() {
    this.clientState.isBusy = true
    const _handoverIds = this.getHandoverIds({ handovers: this.selection.selected });
    this.milestonesTabService.lockHandovers(this.projectKey, _handoverIds).subscribe((res) => {
      this.clientState.isBusy = false;
      this.onGetMilestones(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSort);
    }, (err) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  isDisableDownload() {
    if (!this.isEditState) {
      return true;
    }
    let _disable = true;
    (this.selection.selected).forEach(_handover => {
      if (!_handover.locked) {
        _disable = false;
        return;
      }
    })
    return _disable;
  }

  onDownloadTagTab() {
    // real api
    const _newObj = this.getHandoverIds({ handovers: this.selection.selected, getDownload: true, isLoading: true });
    if (!this.checkHandoverNotLocked(_newObj.handoverIds)) {
      this.selection.clear();
      this.authErrorHandler.handleError(this.msg.notDownloadLocked);
    } else {
      this.downloadStatusService.sendMessage4Milestones({ isDownloading: true, items: _newObj.handoverDownloadStatus });
      this.selectionDownloading = this.selectionDownloading.concat([..._newObj.handoverIds]);
      this.selection.clear();
      this.milestonesTabService.downloadHandoverData(this.projectKey, _newObj.handoverIds)
        .subscribe((event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.Response:
              console.log('😺 Done!');
              const result = event.body;
              if (result && result.content) {
                const _handovers = result.content.handovers;
                this.assignHandover2Storage(_handovers);
                // Execute logic UI
                const _resObj = this.getHandoverIds({ handovers: _handovers, getDownload: true, isDone: true });
                this.handoverLockedList = this.handoverLockedList.concat([..._resObj.handoverIds]);
                this.assignTagLocked(_resObj.handoverIds);
                this.reduceSelectionDownloading(_resObj.handoverIds);
                this.onCheckValueIndexedDB();
                // this.handoverNeedSyncList.push(..._resObj.handoverIds.map(_id => ({ id: _id, isChanged: false, type: this.typeDownloadAndSync.downloaded })));
                let _newA = new Array<ItemNeedSync>();
                _newA = _resObj.handoverIds.map(_id => ({ id: _id, isChanged: false, type: this.typeDownloadAndSync.downloaded }));
                this.handoverNeedSyncList = [...this.handoverNeedSyncList.filter(_handover => (!_newA.some(_h => _h.id === _handover.id))), ..._newA];
                this.downloadStatusService.sendMessage4Milestones({ isDownloading: false, items: _resObj.handoverDownloadStatus });
              } else {
                this.downloadStatusService.sendMessage4Milestones({ isDownloading: false, items: [] });
              }
              break;
          }
        }, (err) => {
          this.reduceSelectionDownloading(_newObj.handoverIds);
          this.downloadStatusService.reset(TypeDownloadRequest.milestones, true);
          this.authErrorHandler.handleError(err.message);
        });
    }
  }

  assignHandover2Storage(handovers) {
    const _sn = StoreNames.handovers;
    if (!handovers) { return; }
    this.idbService.addHandovers(_sn, handovers);
  }
  //#endregion

  //--- On Destroy
  ngOnDestroy(): void {
    this.selection.changed.unsubscribe();
  }

  // Utils
  onCheckValueIndexedDB() {
    Promise.all([
      // check punches
      new Promise((resolve, reject) => {
        const _snPunches = StoreNames.punches;
        this.idbService.getAllData(_snPunches).then((res) => {
          resolve(res.length > 0);
        }, (err) => {
          reject(err);
        });
      }),
      // check handovers
      new Promise((resolve, reject) => {
        const _snHandovers = StoreNames.handovers;
        this.idbService.getAllData(_snHandovers).then((res) => {
          resolve(res.length > 0);
        }, (err) => {
          reject(err);
        });
      }),
    ]).then((listResult) => {
      this.hasValueIndexedDB = listResult.some(_r => _r === true);
      this.reloadSideMenuService.sendMessage(this.hasValueIndexedDB);
    }, err => { });
  }

  isDisableSyncSelected() {
    if (!this.isEditState) {
      return true;
    }
    const _userInfo = JwtTokenHelper.GetUserInfo();
    let _hasLockedHandover = (this.selection.selected).some(_handover => (_handover.locked && _handover.lockedBy === _userInfo.userName));
    return !(_hasLockedHandover && this.hasValueIndexedDB);
  }

  onSyncSelectedTag() {
    this.isSyncSelectedState = true;
  }

  onSyncSelectedConfirm(isConfirm: boolean) {
    if (isConfirm) {
      const _snHandovers = StoreNames.handovers;
      const _selection = [...this.selection.selected];
      const _handoverIds = new Array<string>();//this.getHandoverIds({ handovers: _selection });
      let _handoverNoErrors = new Array<string>();
      let _syncData: SynchronizeDataCommand = new SynchronizeDataCommand();
      let _handovers2Sync: MilestonesTabModel[] = new Array();

      this.idbService.getAllData(_snHandovers).then((_handovers) => {
        // get value Handovers
        _handovers.forEach(_handover => {
          if (_selection.some(_h => _h.handoverId === _handover.handoverId)) {
            _handoverIds.push(_handover.handoverId);
            _handovers2Sync.push(_handover);
          }
        });
        // get error handovers
        _selection.forEach(_h => {
          if (!_handoverIds.some(_id => _id === _h.handoverId)) {
            _handoverNoErrors.push(_h.handoverNo);
          }
        });
        const _syncHandovers = _handovers2Sync && _handovers2Sync.length > 0 ? [..._handovers2Sync.map(_handover => (new ResponseSyncItem(_handover.handoverId, _handover.handoverNo)))] : [];
        // call event sync detail
        const _dataSyncBefore = {
          dataRequest: {
            syncTags: null,
            syncPunches: null,
            syncPreservation: null,
            syncHandovers: _syncHandovers,
          },
          dataResponse: null,
        };
        if (_syncHandovers && _syncHandovers.length > 0 && (!_handoverNoErrors || _handoverNoErrors.length < 1)) {
          this.conveyData2SDService.sendMessage(_dataSyncBefore, true);
          // call sync api
          _syncData.projectKey = this.projectKey;
          _syncData.handovers = _handovers2Sync;
          this.tagTabService.synchronizeDownloadedData(_syncData).subscribe((response) => {
            // remove handovers
            this.idbService.removeItems(_snHandovers, IndexRelatedSNs.handovers.handoverId, _handoverIds);
            // ------------------
            // this.onGetMilestones(Configs.DefaultPageNumber, Configs.DefaultPageSize, this.defaultSort);
            this.conveyData2SDService.sendMessage({ ..._dataSyncBefore, ...{ dataResponse: { ...response.content } } });
            this.resetStatusHandoverDownloadOff(this.typeDownloadAndSync.synchronizing, (response.content)[ResponseKeys.milestones]);
            this.authErrorHandler.handleSuccess(Constants.MilestoneSyncSelectedSuccess);
          }, (err) => {
            this.authErrorHandler.handleError(err.message);
          });
        } else if (_syncHandovers && _syncHandovers.length > 0 && (_handoverNoErrors && _handoverNoErrors.length > 0)) {
          this.selection.clear();
          this.authErrorHandler.handleError(`${this.msg.someNotIn}: ${_handoverNoErrors.join(', ')}. ${this.msg.please}`);
        } else {
          this.selection.clear();
          this.authErrorHandler.handleError(`${this.msg.notInLocal}: ${_handoverNoErrors.join(', ')}. ${this.msg.please}`);
        }
      });
    }
    this.isSyncSelectedState = false;
  }

  getHandoverIds({ handovers = new Array(), getDownload = false, isLoading = false, isDone = false }): any {
    let _newHandoverIds = new Array();
    if (getDownload) {
      let _newDownloadStatus = new Array();
      (handovers).forEach(_handover => {
        _newHandoverIds.push(_handover.handoverId);
        _newDownloadStatus.push({ ...(new HandoverDownloadStatus()), ...{ handoverId: _handover.handoverId, handoverNo: _handover.handoverNo, isLoading: isLoading, isDone: isDone } });
      });
      return {
        handoverIds: _newHandoverIds,
        handoverDownloadStatus: _newDownloadStatus,
      }
    }
    if (handovers) {
      (handovers).forEach(_handover => _newHandoverIds.push(_handover.handoverId));
    } else {
      (this.selection.selected).forEach(_handover => _newHandoverIds.push(_handover.handoverId));
    }
    return _newHandoverIds;
  }

  checkHandoverNotLocked(handoverIds: string[]) {
    return this.handoverLockedList.every((e) => (handoverIds.indexOf(e) < 0));
  }

  getHandoverLockedList(handovers) {
    this.handoverLockedList = new Array();
    handovers.forEach(_handover => (_handover.locked) && (this.handoverLockedList.push(_handover.handoverId)));
  }

  reduceSelectionDownloading(handoverIds: string[]) {
    this.selectionDownloading = this.selectionDownloading.filter((e) => (handoverIds.indexOf(e) < 0));
  }

  assignTagLocked(handoverIds: string[]) {
    this.milestonesTabModels.map((e) => (handoverIds.indexOf(e.handoverId) >= 0) && (Object.assign(e, { ...this.createLockProperties() })));
  }

  checkDownloading(handoverId: string) {
    if (!this.selectionDownloading || this.selectionDownloading.length < 1) { return false; }
    return this.selectionDownloading.some(_handoverId => _handoverId === handoverId);
  }

  createLockProperties = () => {
    const _userInfo = JwtTokenHelper.GetUserInfo();
    return {
      locked: true,
      lockedBy: _userInfo.userName,
      lockedDate: (new Date())
    }
  }

  convertDateString(dateString) {
    if (dateString) {
      return (new Date(dateString)).toLocaleDateString('es-ES');
    }
    return null;
  }

  sumOS(tagRelated: Array<MilestoneTags>, type: string) {
    let _resultLen = new Array();
    let _resultA = new Array();
    switch (type) {
      case this.OSTypes.itrs:
        tagRelated.forEach(_tag => _tag.itrs && _tag.itrs.length > 0 && (_resultA.push(..._tag.itrs)));
        _resultLen = _resultA.filter(_itr => _itr.status !== 'Deleted' && _itr.status !== 'Completed');
        break;
      case this.OSTypes.punches:
        tagRelated.forEach(_tag => _tag.punches && _tag.punches.length > 0 && (_resultA.push(..._tag.punches)));
        _resultLen = _resultA.filter(_punch => _punch.status !== 'Deleted' && _punch.status !== 'Done');
        break;
      case this.OSTypes.changes:
        let _changesTemp = new Array();
        tagRelated.forEach(_tag => _tag.changes && _tag.changes.length > 0 && (_changesTemp.push(..._tag.changes)));
        _changesTemp.forEach((_change: HandoverLookUpModel) => {
          if (!(_resultA.some(_c => _c.id === _change.id))) {
            _resultA.push(_change);
          }
        });
        _resultLen = _resultA.filter(_change => _change.status !== 'Deleted' && _change.status !== 'Complete');
        break;
    }
    return {
      len: _resultLen.length,
      content: _resultA
    };
  }

  removeDuplicates(array) {
    let a = []
    array.map(x => {

      return a
    });
  };
}
