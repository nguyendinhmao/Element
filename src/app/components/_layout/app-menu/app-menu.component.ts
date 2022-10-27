import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { JwtTokenHelper } from "src/app/shared/common/jwt-token-helper/jwt-token-helper";
import { ClientState } from "src/app/shared/services/client/client-state";
import { ProjectSettingsModel } from "src/app/shared/models/project-settings/project-settings.model";
import { Router, NavigationEnd } from "@angular/router";
import { CompanyUpdationModel, CompanyColorModel, CompanyManagementModel, } from "src/app/shared/models/company-management/company-management.model";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { PermissionsViews } from "src/app/shared/common/constants/permissions";
import { AuthErrorHandler } from "src/app/shared/services/auth/auth.error-handler";
import { UserModel } from "src/app/shared/models/user/user.model";
import { ModuleByUserModel, ModuleProjectDefaultModel } from "src/app/shared/models/module/module.model";
import { ModuleService } from "src/app/shared/services/api/module/module.service";
import { ProjectByUserAndModuleModel, ProjectUpdatingModel, AuthInProjectDto, ManagerInProject } from "src/app/shared/models/project-management/project-management.model";
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { DownloadStatusService, IdbService, ReloadSideMenuService, ReloadAfterSynchronizingService } from "src/app/shared/services";
import { DataTagNoModel } from "src/app/shared/models/data-tab/data-tagno.model";
import { ItrRecordDetail } from "src/app/shared/models/tab-tag/itr-record.model";
import { PunchPageListModel } from "src/app/shared/models/punch-page/punch-page.model";
import { ResponseSyncItem, StoreNames } from "src/app/shared/models/common/common.model";
import { SynchronizeDataCommand } from "src/app/shared/models/tab-tag/tab-tag.model";
import { Constants } from "src/app/shared/common";
import { TagTabService } from "src/app/shared/services/api/tag-tab/tag-tab.service";
import { MilestonesTabModel } from "src/app/shared/models/milestones-tab/milestones-tab.model";
import { DetailPreservationTabModel, PreservationModel } from "src/app/shared/models/preservation-tab/preservation-tab.model";
import { MatDialog, MatDialogRef } from "@angular/material";
import { SyncDetailComponent } from "../sync-detail/sync-detail.component";
import { ConveyData2SyncDetailService } from "src/app/shared/services/utils/utils-sub.service";

@Component({
  selector: "app-menu",
  templateUrl: "./app-menu.component.html",
  styleUrls: ["./app-menu.component.scss"],
})

export class AppMenuComponent implements OnInit {
  //--- Input & Output
  @Input() isToggleNav: boolean;
  @Input() colorSideBar: string;
  @Input() colorHeader: string;
  @Input() colorTextColour2: string;
  @Input() moduleProjectDefaultModel: ModuleProjectDefaultModel = new ModuleProjectDefaultModel();
  @Output() onToggleAppNav: EventEmitter<boolean> = new EventEmitter();
  @Input() authInProjectDto: AuthInProjectDto[];

  //--- Model
  projectSettingsModel: ProjectSettingsModel = new ProjectSettingsModel();
  companyUpdationModel: CompanyUpdationModel = new CompanyUpdationModel();
  companyColorModel: CompanyColorModel = new CompanyColorModel();
  moduleByUserModels: ModuleByUserModel[] = [];
  moduleByUserDefault: ModuleByUserModel[] = [];
  userInfo: UserModel = new UserModel();
  projectByUserAndModuleModels: ProjectByUserAndModuleModel[] = [];
  projectByUserAndModuleModel: ProjectByUserAndModuleModel = new ProjectByUserAndModuleModel();
  projectManagementModel: ProjectUpdatingModel = new ProjectUpdatingModel();
  companyManagementModel: CompanyManagementModel = new CompanyManagementModel();

  //--- Boolean
  isCompletionsLink: boolean = false;
  isWorkpackLink: boolean = false;
  isJointIntegrityLink: boolean = false;
  isCommissioningProceduresLink: boolean = false;
  isCompletionsLinkShow: boolean;
  isWorkpackLinkShow: boolean;
  isJointIntegrityLinkShow: boolean;
  isCommissioningProceduresLinkShow: boolean;
  isAdmin: boolean;
  isAdminConfigManagement: boolean;
  logoProject: string;
  isHaveMoreProject: boolean = true;
  isEmptyProject: boolean = false;
  isSyncAllState = false;
  hasValueIndexedDB = false;
  isDownloading: boolean = false;

  //--- Variable
  locationPath: string;
  permissionsViews = PermissionsViews;
  private dialogSyncDetailRef: MatDialogRef<SyncDetailComponent>;

  constructor(
    private clientState: ClientState,
    private router: Router,
    private authErrorHandler: AuthErrorHandler,
    private moduleService: ModuleService,
    private idbService: IdbService,
    private tagTabService: TagTabService,
    private reloadSideMenuService: ReloadSideMenuService,
    private reloadAfterSyncS: ReloadAfterSynchronizingService,
    private downloadStatusService: DownloadStatusService,
    public dialog: MatDialog,
    private conveyData2SDService: ConveyData2SyncDetailService,
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.locationPath = event.urlAfterRedirects.slice(1);
        let navigationPaths = this.locationPath.split("/");
        this.isAdminConfigManagement =
          navigationPaths[navigationPaths.length - 1] == "company-management" ||
          navigationPaths[navigationPaths.length - 1] == "user-management" ||
          navigationPaths[navigationPaths.length - 1] == "project-management";
      }
    });

    this.reloadSideMenuService.getMessage().subscribe((res) => {
      if (res.isEnable) {
        this.onCheckValueIndexedDB();
      }
    });

    this.downloadStatusService.getMessage4Tags().subscribe((res) => {
      if (res.isDownloading) {
        this.isDownloading = res.isDownloading;
      } else if (res.requestAmount === 0) {
        this.isDownloading = res.isDownloading;
      }
    });

    this.conveyData2SDService.getMessage().subscribe(res => {
      if (res.isOpen) {
        this.openSyncScreen(res.response);
      } else {
        if (this.dialogSyncDetailRef) {
          this.dialogSyncDetailRef.componentInstance.data = res.response;
        }
      }
    });
  }

  ngOnInit() {
    //--- Get user info
    this.userInfo = JwtTokenHelper.GetUserInfo();
    if (this.userInfo) {
      if (this.userInfo.userType === "Admin") {
        this.isAdmin = true;
      }

      //--- Get module by user
      this.moduleProjectDefaultModel = JwtTokenHelper.GetModuleProjectDefault();
      if (this.moduleProjectDefaultModel) {
        this.onGetModuleByUserId(this.moduleProjectDefaultModel.moduleKey, false);
      }
    }

    if (!this.hasValueIDB) {
      this.onCheckValueIndexedDB();
    }
  }

  //--- Check info device
  get isTablet() {
    return InfoDevice.isTablet;
  }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  set hasValueIDB(isEnable: boolean) {
    this.hasValueIndexedDB = isEnable
  }

  get hasValueIDB() {
    return this.hasValueIndexedDB;
  }

  public get isAdminProject() {
    //--- Get project permission
    let _managerInProject: ManagerInProject = new ManagerInProject();
    _managerInProject = JwtTokenHelper.GetManagerInProject();
    return _managerInProject && _managerInProject.isAdminProject;
  }

  onCheckPermission = (key: string) => {
    return JwtTokenHelper.IsAuthInProject(key, this.authInProjectDto);
  };

  //--- Get module by user
  onGetModuleByUserId = (moduleKey: string, isReloadRouter: boolean) => {
    // this.clientState.isBusy = true;
    this.moduleService.getListModuleByUserId(this.userInfo.userId).subscribe(
      (res) => {
        this.moduleByUserModels = res.items ? <ModuleByUserModel[]>[...res.items] : [];
        this.moduleByUserModels.map((m) => {
          if (this.isAdmin) {
            this.isCompletionsLinkShow = true;
            this.isWorkpackLinkShow = true;
            this.isJointIntegrityLinkShow = true;
            this.isCommissioningProceduresLinkShow = true;
          } else {
            if (m.moduleKey === "CO") this.isCompletionsLinkShow = true;
            if (m.moduleKey === "WP") this.isWorkpackLinkShow = true;
            if (m.moduleKey === "JI") this.isJointIntegrityLinkShow = true;
            if (m.moduleKey === "CP")
              this.isCommissioningProceduresLinkShow = true;
          }
        });

        //--- Focus module and project default
        this.moduleProjectDefaultModel = JwtTokenHelper.GetModuleProjectDefault();
        if (this.moduleProjectDefaultModel) {
          if (this.moduleProjectDefaultModel.moduleKey === "CO")
            this.isCompletionsLink = true;
          else if (this.moduleProjectDefaultModel.moduleKey === "WP")
            this.isWorkpackLink = true;
          else if (this.moduleProjectDefaultModel.moduleKey === "JI")
            this.isJointIntegrityLink = true;
          else if (this.moduleProjectDefaultModel.moduleKey === "CP")
            this.isCommissioningProceduresLink = true;
        }
      },
      (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      }
    );
  };

  //--- Toggle module
  onToggleModule = (moduleKey: string) => {
    if (moduleKey == "CO") {
      this.isCompletionsLink = true;
      this.isWorkpackLink = false;
      this.isJointIntegrityLink = false;
      this.isCommissioningProceduresLink = false;

      this.onGetModuleByUserId(moduleKey, true);
    } else if (moduleKey == "WP") {
      this.isCompletionsLink = false;
      this.isWorkpackLink = true;
      this.isJointIntegrityLink = false;
      this.isCommissioningProceduresLink = false;
    } else if (moduleKey == "JI") {
      this.isCompletionsLink = false;
      this.isWorkpackLink = false;
      this.isJointIntegrityLink = true;
      this.isCommissioningProceduresLink = false;
    } else if (moduleKey == "CP") {
      this.isCompletionsLink = false;
      this.isWorkpackLink = false;
      this.isJointIntegrityLink = false;
      this.isCommissioningProceduresLink = true;
    }
  };

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
      // check handovers
      new Promise((resolve, reject) => {
        const _snHandovers = StoreNames.handovers;
        this.idbService.getAllData(_snHandovers).then((res) => {
          resolve(res.length > 0);
        }, (err) => {
          reject(err);
        });
      }),
      // check tag preservation
      new Promise((resolve, reject) => {
        const _snTagPreservation = StoreNames.tagPreservation;
        this.idbService.getAllData(_snTagPreservation).then((res) => {
          resolve(res.length > 0);
        }, (err) => {
          reject(err);
        });
      }),
    ]).then((listResult) => {
      this.hasValueIDB = listResult.some(_r => _r === true);
    }, err => { });
  }

  openSyncScreen(data) {
    this.dialogSyncDetailRef = this.dialog.open(SyncDetailComponent, {
      width: '95vw',
      // height: '92vh',
      maxWidth: '95vw',
      data: data,
      panelClass: 'custom-modalbox',
      // position: {
      //   bottom: 'bottom'
      // }
    });

    this.dialogSyncDetailRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  onSyncAllTag() {
    this.isSyncAllState = true;
  }

  closeSideMenu() {
    if (this.isTablet) { this.onToggleAppNav.emit(true); }
  }

  onSyncAllConfirm(isConfirm: boolean) {
    if (isConfirm) {
      this.closeSideMenu();
      let _tags2Sync: DataTagNoModel[] = new Array(), _tagIds: string[] = new Array();
      let _records2Sync: ItrRecordDetail[] = new Array();
      let _punches2Sync: PunchPageListModel[] = new Array();
      let _handovers2Sync: MilestonesTabModel[] = new Array();
      let _preservation2Sync: DetailPreservationTabModel[] = [];
      let _tagPreservationIds: string[] = new Array<string>();
      const _tagSN = StoreNames.tags, _recordSN = StoreNames.records, _punchSN = StoreNames.punches,
        _handoversSN = StoreNames.handovers, _snPreservation = StoreNames.preservation, _snTagPreservation = StoreNames.tagPreservation;
      let _syncData: SynchronizeDataCommand = new SynchronizeDataCommand();

      Promise.all([
        new Promise(resolve => {
          this.idbService.getAllData(_tagSN).then((_tags) => {
            resolve(_tags);
          });
        }),
        new Promise(resolve => {
          this.idbService.getAllData(_recordSN).then((_records) => {
            resolve(_records);
          })
        }),
        new Promise(resolve => {
          this.idbService.getAllData(_punchSN).then((_punches) => {
            resolve(_punches);
          });
        }),
        new Promise(resolve => {
          this.idbService.getAllData(_handoversSN).then((_handovers) => {
            resolve(_handovers);
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
      ])
        .then(result => {
          // get value Tags
          const _tags: DataTagNoModel[] = result[0] as DataTagNoModel[];
          let _syncTagsBefore: ResponseSyncItem[] = new Array();
          _tags2Sync = [..._tags];
          if (_tags2Sync.length > 0) {
            _tags2Sync.forEach(tag => {
              _tagIds.push(tag.tagId);
              _syncTagsBefore.push(new ResponseSyncItem(tag.tagId, tag.tagNo));
            });
          }
          // get value Records
          const _records: ItrRecordDetail[] = result[1] as ItrRecordDetail[];
          _records2Sync.push(..._records.filter(_r => _r.isEdited));
          // get value Punches
          const _punches: PunchPageListModel[] = result[2] as PunchPageListModel[];
          _punches2Sync.push(..._punches.filter(_p => (_p.isAdded) || (_p.isEdited) || (_p.isDeleted)));
          // get value Handovers
          const _handovers: MilestonesTabModel[] = result[3] as MilestonesTabModel[];
          _handovers2Sync = [..._handovers];
          // get value Preservation
          const _preservationL: DetailPreservationTabModel[] = result[4] as DetailPreservationTabModel[];
          _preservation2Sync = [..._preservationL];
          // get value Tag Preservation
          const _tagPreservationL: PreservationModel[] = result[5] as PreservationModel[];
          let _syncPresBefore: ResponseSyncItem[] = new Array();
          if (_tagPreservationL && _tagPreservationL.length > 0) {
            _tagPreservationL.forEach(_tP => {
              _tagPreservationIds.push(_tP.tagId);
              _syncPresBefore.push(new ResponseSyncItem(_tP.tagId, _tP.tagNo));
            });
          }
          // open Sync detail dialog
          const _dataSyncBefore = {
            dataRequest: {
              syncTags: _syncTagsBefore,
              syncPunches: _punches2Sync && _punches2Sync.length > 0 && [..._punches2Sync.map(_punch => (new ResponseSyncItem(_punch.punchId, _punch.punchNo)))],
              syncPreservation: _syncPresBefore,
              syncHandovers: _handovers2Sync && _handovers2Sync.length > 0 && [..._handovers2Sync.map(_handover => (new ResponseSyncItem(_handover.handoverId, _handover.handoverNo)))],
            },
            dataResponse: null,
          };
          this.openSyncScreen(_dataSyncBefore);
          // call sync api
          _syncData.projectKey = this.moduleProjectDefaultModel.projectKey;
          _syncData.tagIds = _tagIds || [];
          _syncData.records = _records2Sync || [];
          _syncData.punches = _punches2Sync;
          _syncData.handovers = _handovers2Sync;
          _syncData.preservations = _preservation2Sync;
          _syncData.tagPreservationIds = _tagPreservationIds;
          this.tagTabService.synchronizeDownloadedData(_syncData).subscribe((response) => {
            this.idbService.clearDataInAllStores([StoreNames.lookups, StoreNames.punchSignatureTemplate]);
            this.dialogSyncDetailRef.componentInstance.data = ({ ..._dataSyncBefore, ...{ dataResponse: { ...response.content } } });
            this.reloadAfterSyncS.sendMessage(this.locationPath, response.content);
            this.downloadStatusService.reloadDownloadDetail(true);
            this.reloadSideMenuService.sendMessage(true);
            this.authErrorHandler.handleSuccess(Constants.TagTabSyncAllSuccess);
          }, (err) => {
            this.authErrorHandler.handleError(err.message);
          });
        });
    }
    this.isSyncAllState = false;
  }
}
