import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, NgZone } from "@angular/core";
import { Router } from "@angular/router";
import { JwtTokenHelper } from "src/app/shared/common/jwt-token-helper/jwt-token-helper";
import { UserModel } from "src/app/shared/models/user/user.model";
import { Configs } from "src/app/shared/common/configs/configs";
import { StorageService } from "src/app/shared/services/core/storage.service";
import { ClientState } from "src/app/shared/services/client/client-state";
import { StorageKey } from "src/app/shared/models/storage-key/storage-key";
import { DeviceDetectorService } from "ngx-device-detector";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { CompanyManagementModel, CompanyColorModel } from "src/app/shared/models/company-management/company-management.model";
import { CompanyService } from "src/app/shared/services/api/companies/company.service";
import { AuthErrorHandler } from "src/app/shared/services/auth/auth.error-handler";
import { ProjectService } from "src/app/shared/services/api/projects/project.service";
import { ModuleProjectDefaultModel } from "src/app/shared/models/module/module.model";
import { ProjectUpdatingModel, AuthInProjectDto, ManagerInProject, AuthSignInProjectModel, CompanyInfoModel } from "src/app/shared/models/project-management/project-management.model";
import { ReloadLayoutService } from "src/app/shared/services/core/reload-layout.service";
import * as $ from "jquery";
import { NotificationService } from 'src/app/shared/services/api/notification/notification.service';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { NotificationSnackbar } from "../notification-snackbar/notification-snackbar.component";
import { NotificationModel } from "src/app/shared/models/notifications/notifications.model";
import { DownloadStatusService, IdbService, ReloadSideMenuService } from "src/app/shared/services";
import { DownloadDetailStatus } from "src/app/shared/models/tab-tag/tab-tag.model";
import { StoreNames, TypeDownloadRequest } from "src/app/shared/models/common/common.model";

@Component({
  selector: "app-layout",
  templateUrl: "./app-layout.component.html",
  styleUrls: ["./app-layout.component.scss"],
})

export class AppLayoutComponent implements OnInit, AfterViewInit {
  @ViewChild("mainContainer") mainContainer: ElementRef;
  @ViewChild('downloadDetailView') downloadDetailView: any;

  //--- Model
  userInfo: UserModel = new UserModel();
  companyManagementModel: CompanyManagementModel = new CompanyManagementModel();
  moduleProjectDefaultModel: ModuleProjectDefaultModel = new ModuleProjectDefaultModel();
  projectManagementModel: ProjectUpdatingModel = new ProjectUpdatingModel();
  companyColorModel: CompanyColorModel = new CompanyColorModel();
  authInProjectDto: AuthInProjectDto[] = [];
  downloadStatus = {
    ready: 'Online - Ready',
    notReady: 'Online - Not Ready',
    offline: 'Offline',
  }
  downloadShows = {
    tagsDownloaded: 0,
    tagsTotal: 0,
    milestonesDownloaded: 0,
    milestoneTotal: 0,
    preservationDownloaded: 0,
    preservationTotal: 0,
  }
  downloadShowsBlank = this.deepCopy(this.downloadShows);
  downloadDetailShowsLocal = {
    tags: new Array<DownloadDetailStatus>(),
    milestones: new Array<DownloadDetailStatus>(),
    preservation: new Array<DownloadDetailStatus>(),
  };
  downloadDetailShowsTemp = {
    tags: new Array<DownloadDetailStatus>(),
    milestones: new Array<DownloadDetailStatus>(),
    preservation: new Array<DownloadDetailStatus>(),
  };
  downloadDetailShows = {
    all: new Array<DownloadDetailStatus>(),
    tags: new Array<DownloadDetailStatus>(),
    milestones: new Array<DownloadDetailStatus>(),
    preservation: new Array<DownloadDetailStatus>(),
  };
  downloadDetailItems = new Array<DownloadDetailStatus>();
  downloadTabName = {
    all: 'all',
    tags: 'tags',
    milestones: 'milestones',
    preservation: 'preservation',
    newPunches: 'newPunches',
  };
  currentTabName: string = this.downloadTabName.all;

  //--- Boolean
  sideNavOpened: boolean;
  isDesktopDevice: boolean;
  isToggleNav: boolean;
  isDownloading: boolean = false;
  isLoadDetailData: boolean = true;
  downloadTabActive = {
    all: true,
    tags: false,
    milestones: false,
    preservation: false,
    newPunches: false,
  };
  downloadTabShow = {
    all: true,
    tags: false,
    milestones: false,
    preservation: false,
    newPunches: false,
  };

  //--- Variables
  avatarUrl: string;
  sideNavMode: string;
  notificationQuantity: number
  horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  typeRequest = TypeDownloadRequest;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private clientState: ClientState,
    private reloadLayoutService: ReloadLayoutService,
    private deviceService: DeviceDetectorService,
    private companyService: CompanyService,
    private authErrorHandler: AuthErrorHandler,
    private projectService: ProjectService,
    private notificationService: NotificationService,
    private downloadStatusService: DownloadStatusService,
    private reloadSideMenuService: ReloadSideMenuService,
    private idbService: IdbService,
    private _ngZone: NgZone,
    private _snackBar: MatSnackBar,
  ) {
    this.downloadStatusService.getMessage4Tags().subscribe((res) => {
      if (res.isDownloading) {
        this.isDownloading = res.isDownloading;
      } else if (res.requestTagsAmount === 0) {
        this.isDownloading = res.isDownloading;
        // Get downloaded tags
        this.downloadDetailShowsLocal.tags = this.downloadDetailShowsLocal.tags.concat([...this.downloadDetailShowsTemp.tags]);
        // reset local downloading status
        this.downloadDetailShowsTemp.tags = new Array();
        this.downloadShows.tagsTotal = 0;
        this.downloadShows.tagsDownloaded = 0;
        // reload any where need
        this.reloadSideMenuService.sendMessage(true);
        this.downloadStatusService.resetBy(this.typeRequest.tags);
      }
    });

    this.downloadStatusService.getMessage4Milestones().subscribe((res) => {
      if (res.isDownloading) {
        this.isDownloading = res.isDownloading;
      } else if (res.requestMilestoneAmount === 0) {
        this.isDownloading = res.isDownloading;
        // Get downloaded Milestones
        this.downloadDetailShowsLocal.milestones = this.downloadDetailShowsLocal.milestones.concat([...this.downloadDetailShowsTemp.milestones]);
        // reset local downloading Milestones
        this.downloadDetailShowsTemp.milestones = new Array();
        this.downloadShows.milestoneTotal = 0;
        this.downloadShows.milestonesDownloaded = 0;
        // reload any where need
        this.reloadSideMenuService.sendMessage(true);
        this.downloadStatusService.resetBy(this.typeRequest.milestones);
      }
    });

    this.downloadStatusService.getMessage4Preservation().subscribe((res) => {
      if (res.isDownloading) {
        this.isDownloading = res.isDownloading;
      } else if (res.requestPreservationAmount === 0) {
        this.isDownloading = res.isDownloading;
        // Get downloaded Milestones
        this.downloadDetailShowsLocal.preservation = this.downloadDetailShowsLocal.preservation.concat([...this.downloadDetailShowsTemp.preservation]);
        // reset local downloading Milestones
        this.downloadDetailShowsTemp.preservation = new Array();
        this.downloadShows.preservationTotal = 0;
        this.downloadShows.preservationDownloaded = 0;
        // reload any where need
        this.reloadSideMenuService.sendMessage(true);
        this.downloadStatusService.resetBy(this.typeRequest.preservation);
      }
    });

    this.downloadStatusService.getProgress().subscribe((res) => {
      const { totalTags, downloadedTags, totalMilestones, downloadedMilestones, totalPreservation, downloadedPreservation } = res;
      this.downloadShows = {
        ...{
          tagsDownloaded: downloadedTags.length,
          tagsTotal: totalTags.length,
          milestonesDownloaded: downloadedMilestones.length,
          milestoneTotal: totalMilestones.length,
          preservationDownloaded: downloadedPreservation.length,
          preservationTotal: totalPreservation.length,
        }
      };
      if (totalTags && totalTags.length > 0) { this.executeProgressDownload(totalTags, downloadedTags); }
      if (totalMilestones && totalMilestones.length > 0) { this.executeProgressDownload(totalMilestones, downloadedMilestones, this.downloadTabName.milestones); }
      if (totalPreservation && totalPreservation.length > 0) { this.executeProgressDownload(totalPreservation, downloadedPreservation, this.downloadTabName.preservation); }
    }, (err) => { });

    this.downloadStatusService.getReloadDownloadDetail().subscribe((isReload) => {
      if (isReload) {
        // Get downloaded tags
        this.onGetDownloadDetail();
        // reset downloadDetailItems
        this.downloadDetailItems = new Array<DownloadDetailStatus>();
      }
    });
  }

  ngAfterViewInit(): void {
    const mainContainerHeight = $(window).height() - $("#top-header").height();
    if (mainContainerHeight > 0) {
      this.mainContainer.nativeElement.style.minHeight = mainContainerHeight + "px";
    }
  }

  ngOnInit(): void {
    //---Check authenticated
    this.userInfo = JwtTokenHelper.GetUserInfo();
    this.authInProjectDto = JwtTokenHelper.GetAuthProject() ? <AuthInProjectDto[]>[...JwtTokenHelper.GetAuthProject()] : [];
    if (!this.userInfo) {
      this.storageService.onRemoveTokens([
        StorageKey.UserInfo,
        StorageKey.Token,
        StorageKey.ModuleProjectDefault,
        StorageKey.ColourBranding,
        StorageKey.AuthInProject,
      ]);
      this.router.navigate(["login"]);
    } else {
      //--- Check device
      this.isDesktopDevice = this.deviceService.isDesktop();

      if (this.isDesktopDevice) {
        this.sideNavOpened = true;
        this.sideNavMode = "side";
      } else if (this.isTablet) {
        this.sideNavOpened = false;
        this.sideNavMode = "over";
        this.isToggleNav = true;
      }

      //--- Get user profile
      this.onGetUserProfile();

      //--- Get colour branding
      this.onGetColorBranding();

      //--- Get notification quantity
      this.onGetNotification();

      // Get downloaded tags
      this.onGetDownloadDetail();

      // setTimeout(() => {
      //   Object.keys(this.downloadTabName).forEach(_key => {
      //     if (this.downloadTabActive[this.downloadTabName[_key]]) {
      //       this.getDownloadDetailItems(_key);
      //     }
      //   });
      // }, 800);
    }

    //--- Get module project default
    this.moduleProjectDefaultModel = JwtTokenHelper.GetModuleProjectDefault();
    if (this.moduleProjectDefaultModel) {
      this.onGetProjectByKey(this.moduleProjectDefaultModel.projectKey);
    }

    //--- Reload layout
    this.reloadLayoutService.getEmitter().subscribe((message) => {
      if (message === "reloadPersonalInformation") {
        this.onGetUserProfile();
      }

      if (message === "reloadClientLogo" || message === "reloadColorBranding") {
        this.moduleProjectDefaultModel = JwtTokenHelper.GetModuleProjectDefault();
        if (this.moduleProjectDefaultModel) {
          this.onGetProjectByKey(this.moduleProjectDefaultModel.projectKey);
        }
      }

      if (message === "reloadNotificationQuantity") {
        this.onGetNotification();
      }
    });

    const userInfo = JwtTokenHelper.GetUserInfo();
    const mProjectD = JwtTokenHelper.GetModuleProjectDefault();

    this.notificationService.messageReceived.subscribe((data: any) => {
      this._ngZone.run(() => {
        console.log(data);
        const _obj = JSON.parse(data),
          _projectKey = _obj["ProjectKey"],
          _listUser = _obj["ListUser"] || [],
          _isProjectKey = _projectKey === mProjectD.projectKey,
          _object = _listUser.find(_o => _o.UserId === userInfo.userId);

        if (_object && _isProjectKey) {
          this.bellAmount = this.notificationQuantity + 1;
          let _notify: any;
          const _temp = { ..._obj.Content };

          _notify = {
            ...{
              id: _object.NotificationId,
              referenceId: _temp.ReferenceId,
              referenceType: _temp.ReferenceType,
              actionType: _temp.ActionType,
              message: _temp.Message,
              url: _temp.Url,
              isRead: _temp.IsRead,
            }
          };
          this.promptNotification(_notify);
        }
      });
    });
  }

  changeDownloadTab($event: any, tabName: string) {
    $event.stopPropagation();
    Object.keys(this.downloadTabActive).forEach(_key => {
      if (_key === tabName && !this.downloadTabActive[_key]) {
        this.downloadTabActive[tabName] = true;
        this.currentTabName = tabName;
        // this.getDownloadDetailItems(tabName);
      } else if (_key !== tabName && this.downloadTabActive[_key]) {
        this.downloadTabActive[_key] = false;
      }
    });
  }

  getDownloadDetailItems(tabName: string): Array<DownloadDetailStatus> {
    let _result = new Array<DownloadDetailStatus>();
    switch (tabName) {
      case this.downloadTabName.all:
        _result = [... this.downloadDetailShows.tags, ... this.downloadDetailShows.milestones, ...this.downloadDetailShows.preservation];
        break;
      case this.downloadTabName.tags:
        _result = [... this.downloadDetailShows.tags];
        break;
      case this.downloadTabName.milestones:
        _result = [... this.downloadDetailShows.milestones];
        break;
      case this.downloadTabName.preservation:
        _result = [... this.downloadDetailShows.preservation];
        break;
    }
    return [..._result];
  }

  isAllDownloading() {
    return [...this.downloadDetailShowsTemp.tags, ...this.downloadDetailShowsTemp.milestones, ...this.downloadDetailShowsTemp.preservation].length;
  }

  getAllDownloading() {
    return this.downloadShows.tagsDownloaded + this.downloadShows.milestonesDownloaded + this.downloadShows.preservationDownloaded
      + [...this.downloadDetailShowsLocal.tags, ...this.downloadDetailShowsLocal.milestones, ... this.downloadDetailShowsLocal.preservation].length;
  }

  getAllDownloaded() {
    return [...this.downloadDetailShows.tags, ...this.downloadDetailShows.milestones, ... this.downloadDetailShows.preservation].length;
  }

  promptNotification(dataContent) {
    this._snackBar.openFromComponent(NotificationSnackbar, {
      duration: 5 * 1000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: ['snackbar-custom'],
      data: { content: dataContent }
    });
  }

  onGetDownloadDetail() {
    this.isLoadDetailData = true;
    Promise.all([
      new Promise((resolve, reject) => {
        const _snTags = StoreNames.tags;
        this.idbService.getAllData(_snTags).then((res) => {
          this.downloadDetailShowsLocal.tags = this.getDownloadedTags({ tags: res, isDone: true });
          this.downloadDetailShows.tags = this.downloadDetailShowsLocal.tags;
          if (this.downloadDetailShowsTemp.tags && this.downloadDetailShowsTemp.tags.length > 0) {
            this.downloadDetailShows.tags = this.downloadDetailShowsTemp.tags.concat([...this.downloadDetailShows.tags]);
          }
          resolve(res);
        });
      }),
      new Promise((resolve, reject) => {
        const _snHandovers = StoreNames.handovers;
        this.idbService.getAllData(_snHandovers).then((res) => {
          this.downloadDetailShowsLocal.milestones = this.getDownloadedHandovers({ handovers: res, isDone: true });
          this.downloadDetailShows.milestones = this.downloadDetailShowsLocal.milestones;
          if (this.downloadDetailShowsTemp.milestones && this.downloadDetailShowsTemp.milestones.length > 0) {
            this.downloadDetailShows.milestones = this.downloadDetailShowsTemp.milestones.concat([...this.downloadDetailShows.milestones]);
          }
          resolve(res);
        });
      }),
      new Promise((resolve, reject) => {
        const _snTagPreservation = StoreNames.tagPreservation;
        this.idbService.getAllData(_snTagPreservation).then((res) => {
          this.downloadDetailShowsLocal.preservation = this.getDownloadedPreservation({ preservationL: res, isDone: true });
          this.downloadDetailShows.preservation = this.downloadDetailShowsLocal.preservation;
          if (this.downloadDetailShowsTemp.preservation && this.downloadDetailShowsTemp.preservation.length > 0) {
            this.downloadDetailShows.preservation = this.downloadDetailShowsTemp.preservation.concat([...this.downloadDetailShows.preservation]);
          }
          resolve(res);
        });
      }),
    ])
      .then(res => {
        this.isLoadDetailData = false;
      }, err => {
        this.isLoadDetailData = false;
      });
  }

  getDownloadedTags({ tags = new Array(), isError = false, isDone = false }): any {
    let _newDownloadStatus = new Array();
    (tags).forEach(_tag => {
      _newDownloadStatus.push({ ...(new DownloadDetailStatus()), ...{ tagId: _tag.tagId, tagNo: _tag.tagNo, name: `[Tag] ${_tag.tagNo}`, isError: isError, isDone: isDone } });
    });
    return _newDownloadStatus;
  }

  getDownloadedHandovers({ handovers = new Array(), isError = false, isDone = false }) {
    let _newDownloadStatus = new Array();
    (handovers).forEach(_handover => {
      _newDownloadStatus.push({ ...(new DownloadDetailStatus()), ...{ handoverId: _handover.handoverId, handoverNo: _handover.handoverNo, name: `[Handover] ${!!_handover.handoverNo ? _handover.handoverNo : 'New Handover'}`, isError: isError, isDone: isDone } });
    });
    return _newDownloadStatus;
  }

  getDownloadedPreservation({ preservationL = new Array(), isError = false, isDone = false }) {
    let _newDownloadStatus = new Array();
    (preservationL).forEach(_tag => {
      _newDownloadStatus.push({ ...(new DownloadDetailStatus()), ...{ tagPreservationId: _tag.tagId, tagPreservationNo: _tag.tagNo, name: `[Preservation] ${!!_tag.tagNo ? _tag.tagNo : 'New Preservation'}`, isError: isError, isDone: isDone } });
    });
    return _newDownloadStatus;
  }

  executeProgressDownload(total: DownloadDetailStatus[], downloaded: DownloadDetailStatus[], type: string = this.downloadTabName.tags) {
    let result: DownloadDetailStatus[] = new Array<DownloadDetailStatus>();

    switch (type) {
      case this.downloadTabName.tags:
        if (total.length > 0) {
          result = total.map(_tagS => {
            const _tempTS = downloaded.find(_tS => _tS.tagId === _tagS.tagId);
            if (_tempTS) {
              return _tempTS;
            }
            return _tagS;
          });
        }
        // assign mark prefix
        result.map(_tag => !_tag.name && (_tag.name = `[Tag] ${_tag.tagNo}`));
        this.downloadDetailShowsTemp.tags = [...result];
        this.downloadDetailShows.tags = result.concat([...this.downloadDetailShowsLocal.tags]);
        break;
      case this.downloadTabName.milestones:
        if (total.length > 0) {
          result = total.map(_handoverS => {
            const _tempHS = downloaded.find(_hS => _hS.handoverId === _handoverS.handoverId);
            if (_tempHS) {
              return _tempHS;
            }
            return _handoverS;
          });
        }
        // assign mark prefix
        result.map(_handover => !_handover.name && (_handover.name = `[Handover] ${_handover.handoverNo}`));
        this.downloadDetailShowsTemp.milestones = [...result];
        this.downloadDetailShows.milestones = result.concat([...this.downloadDetailShowsLocal.milestones]);
        break;
      case this.downloadTabName.preservation:
        if (total.length > 0) {
          result = total.map(_preservationS => {
            const _tempPS = downloaded.find(_pS => _pS.tagId === _preservationS.tagId);
            if (_tempPS) {
              return _tempPS;
            }
            return _preservationS;
          });
        }
        // assign mark prefix
        result.map(_preservation => !_preservation.name && (_preservation.name = `[Preservation] ${_preservation.tagNo}`));
        this.downloadDetailShowsTemp.preservation = [...result];
        this.downloadDetailShows.preservation = result.concat([...this.downloadDetailShowsLocal.preservation]);
        break;
    }
  }

  openMenuTrigger() {
    this.downloadDetailView.openMenu();
    console.log('Open', this.downloadDetailView);
  }

  closeMenuTrigger() {
    this.downloadDetailView.closeMenu();
    console.log('close', this.downloadDetailView);
  }

  get downloadStatusF() {
    if (this.isOffline) {
      return this.downloadStatus.offline;
    } else {
      return this.isDownloading ? this.downloadStatus.notReady : this.downloadStatus.ready;
    }
  }

  //--- Check info device
  get isTablet() {
    return InfoDevice.isTablet;
  }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  set bellAmount(value) {
    this.notificationQuantity = value;
  }

  get bellAmount() {
    return this.notificationQuantity;
  }

  //--- Get user profile
  onGetUserProfile = () => {
    this.userInfo = JwtTokenHelper.GetUserInfo();
  };

  //--- Get color branding default
  onGetColorBranding = () => {
    const colorBrandings = JwtTokenHelper.GetColorBranding();
    if (colorBrandings === null) {
      this.companyColorModel.colorHeader = Configs.ColorHeaderDefault;
      this.companyColorModel.colorMainBackground = Configs.ColorMainBackgroundDefault;
      this.companyColorModel.colorSideBar = Configs.ColorSideBarDefault;
      this.companyColorModel.colorTextColour1 = Configs.ColorTextColour1Default;
      this.companyColorModel.colorTextColour2 = Configs.ColorTextColour2Default;
    } else {
      this.companyColorModel.colorHeader = colorBrandings.colorHeader;
      this.companyColorModel.colorMainBackground = colorBrandings.colorMainBackground;
      this.companyColorModel.colorSideBar = colorBrandings.colorSideBar;
      this.companyColorModel.colorTextColour1 = colorBrandings.colorTextColour1;
      this.companyColorModel.colorTextColour2 = colorBrandings.colorTextColour2;

      $(".main-container").css("background-color", this.companyColorModel.colorMainBackground);
    }
  };

  //--- Get project by key
  onGetProjectByKey = (projectKey: string) => {
    this.projectService.getProjectByKey(projectKey).subscribe((res) => {
      this.projectManagementModel = res ? <ProjectUpdatingModel>{ ...res } : null;

      this.onSetCompanyInfo(this.projectManagementModel);
      this.onSetAuthSignInProject(this.projectManagementModel)
      this.onSetManagerInProject(this.projectManagementModel);
      this.onGetCompanyById(this.projectManagementModel.companyId);
      this.onGetAuthInProject(projectKey);
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  };

  //--- Set localstorage managerInProject
  onSetManagerInProject(data: ProjectUpdatingModel) {
    let managerInProject: ManagerInProject = new ManagerInProject();

    managerInProject.isAdminProject = data.isAdminProject;
    this.storageService.onSetToken(StorageKey.ManagerInProject, JSON.stringify(managerInProject));
  }

  //--- Set localStorage AuthSignInProject
  onSetAuthSignInProject(data: ProjectUpdatingModel) {
    let info: AuthSignInProjectModel = new AuthSignInProjectModel();
    info.authLevel = data.authLevel;
    this.storageService.onSetToken(StorageKey.AuthSignInProject, JSON.stringify(info));
  }

  //--- Set localStorage CompanyInfo
  onSetCompanyInfo(data: ProjectUpdatingModel) {
    let info: CompanyInfoModel = new CompanyInfoModel();
    info.companyName = data.companyName;
    this.storageService.onSetToken(StorageKey.CompanyInfo, JSON.stringify(info));
  }

  //--- Get company
  onGetCompanyById = (companyId: string) => {
    this.companyService.getCompanyById(companyId).subscribe((res) => {
      this.companyManagementModel = res ? <CompanyManagementModel>{ ...res } : null;

      this.companyManagementModel.logoUrl = this.companyManagementModel.logoUrl
        ? Configs.BaseSitePath + this.companyManagementModel.logoUrl
        : Configs.DefaultClientLogo;

      if (this.companyManagementModel.colorBranding) {
        let colorBrandingArr = this.companyManagementModel.colorBranding.toString().split(";");
        this.companyColorModel.colorHeader = colorBrandingArr[0];
        this.companyColorModel.colorMainBackground = colorBrandingArr[1];
        this.companyColorModel.colorSideBar = colorBrandingArr[2];
        this.companyColorModel.colorTextColour1 = colorBrandingArr[3];
        this.companyColorModel.colorTextColour2 = colorBrandingArr[4];

        $(".main-container").css("background-color", this.companyColorModel.colorMainBackground);
      }

      this.storageService.onSetToken(StorageKey.ColourBranding, JSON.stringify(this.companyColorModel));
      this.reloadLayoutService.reloadLayout("reloadColorBrandingTitle");
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  };

  onGetAuthInProject = (projectKey: string) => {
    this.projectService.getAuthInProject(projectKey).subscribe((res) => {
      this.authInProjectDto = res.content ? <AuthInProjectDto[]>[...res.content] : [];
      this.storageService.onSetToken(StorageKey.AuthInProject, JSON.stringify(this.authInProjectDto));

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  };

  //--- Show notification
  onToggleNotification = () => {
    this.reloadLayoutService.reloadLayout('reloadNotification');
  }

  //--- Logout
  onLogout = () => {
    this.storageService.onRemoveTokens([
      StorageKey.UserInfo,
      StorageKey.Token,
      StorageKey.ModuleProjectDefault,
      StorageKey.ColourBranding,
      StorageKey.AuthInProject,
      StorageKey.AuthSignInProject,
    ]);
    this.router.navigate(["login"]);
  };

  //--- Get notification
  onGetNotification = () => {
    this.clientState.isBusy = true;

    const _mProjectDefault = JwtTokenHelper.GetModuleProjectDefault();
    if (_mProjectDefault.projectKey) {
      this.notificationService.getNotificationList(Configs.DefaultPageNumber, 100, false, _mProjectDefault.projectKey).subscribe(
        (res) => {
          this.notificationQuantity = res.totalItemCount;
          this.clientState.isBusy = false;
        },
        (err: ApiError) => {
          this.authErrorHandler.handleError(err.message);
          this.clientState.isBusy = false;
        }
      )
    }
  }

  //--- Toggle nav
  onToggleNav = () => {
    this.isToggleNav = !this.isToggleNav;

    //--- Project list
    let projectListButton = $(".dashboard .projects-list button");
    if (projectListButton.hasClass("toggle-nav")) {
      projectListButton.removeClass("toggle-nav");
    } else {
      projectListButton.addClass("toggle-nav");
    }

    //--- Body
    let body = $('body');
    if (!body.hasClass("overflow-hidden")) {
      body.addClass("overflow-hidden");
    } else {
      body.removeClass("overflow-hidden");
    }
  }

  //--- Reload site
  reloadSite = () => {
    window.location.replace(window.location.origin);
  };

  //--- Close side nav
  closeSideNav = () => {
    this.isToggleNav = true;

    if ($('body').hasClass("overflow-hidden")) {
      $('body').removeClass("overflow-hidden");
    }
  }

  closeSideMenu($event) {
    if ($event) {
      this.sideNavOpened = false;
      this.closeSideNav();
    }

    if ($('body').hasClass("overflow-hidden")) {
      $('body').removeClass("overflow-hidden");
    }
  }

  deepCopy(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || 'object' != typeof obj) {
      return obj;
    }

    // Handle Array
    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = this.deepCopy(obj[i]);
      }
      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
          copy[attr] = this.deepCopy(obj[attr]);
        }
      }
      return copy;
    }

    throw new Error('Unable to copy obj! Its type isn\'t supported.');
  }
}
