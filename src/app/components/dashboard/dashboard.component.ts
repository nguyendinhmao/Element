import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import {
  DisplayGrid,
  GridsterComponent,
  GridsterItemComponentInterface,
  GridType,
} from 'angular-gridster2';
import { UserModel } from 'src/app/shared/models/user/user.model';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { JwtTokenHelper } from 'src/app/shared/common/jwt-token-helper/jwt-token-helper';
import { StorageService } from 'src/app/shared/services/core/storage.service';
import { StorageKey } from 'src/app/shared/models/storage-key/storage-key';
import {
  ModuleProjectDefaultModel,
  ModuleByUserModel,
} from 'src/app/shared/models/module/module.model';
import { ProjectByUserAndModuleModel } from 'src/app/shared/models/project-management/project-management.model';
import { Configs } from 'src/app/shared/common/configs/configs';
import { ProjectService } from 'src/app/shared/services/api/projects/project.service';
import { ReloadLayoutService } from 'src/app/shared/services/core/reload-layout.service';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import * as $ from 'jquery';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import * as Chart from 'chart.js';
import { MatTableDataSource } from '@angular/material/table';
import { DashboardService } from 'src/app/shared/services/api/dashboard/dashboard.service';
import {
  ChartCommand,
  ChartModel,
  ChartType,
} from 'src/app/shared/models/dashboard/dashboard.model';
import { Constants } from 'src/app/shared/common';
import { MatSelectionListChange } from '@angular/material/list';
import { fromEvent } from 'rxjs';
import { PunchPageService } from 'src/app/shared/services/api/punch-page/punch-page.service';
import { StoreNames } from 'src/app/shared/models/common/common.model';
import { DownloadStatusService, IdbService, ReloadSideMenuService } from 'src/app/shared/services';
import { MatDialog } from '@angular/material/dialog';
import { AlertSwitchingComponent } from './alert-switching/alert-switching.component';

class WeeklyHandoverModel {
  handoverNo: string;
  handoverId?: string;
  systemNo: string;
  subSystemNo: string;
  description: string;
  plannedDate: Date;
  status: string;
  statusId?: string;
}

@Component({
  selector: 'dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})

export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('weeklyHandovers') weeklyHandovers: ElementRef;
  //--- Model
  userInfo: UserModel = new UserModel();
  moduleProjectDefaultModel: ModuleProjectDefaultModel = new ModuleProjectDefaultModel();
  projectByUserAndModuleModels: ProjectByUserAndModuleModel[] = [];
  projectByUserAndModuleModel: ProjectByUserAndModuleModel = new ProjectByUserAndModuleModel();
  moduleByUserModels: ModuleByUserModel[] = [];
  moduleByUserDefault: ModuleByUserModel[] = [];

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
  isHaveMoreProject: boolean = true;
  isEmptyProject: boolean = false;
  isAuthor: boolean;
  isSaveModal = false;
  _hasChangeChartPosition = false;
  hasValueIDB = false;

  //--- Variables
  options: GridsterConfig = {
    api: {}
  };
  dashboard: Array<any> = [];
  dashboardTemp: Array<any> = [];
  logoProject: string;
  deletedChart = null;
  dataDashboard = null;
  listCharts = [];
  heightContent = 0;
  orderDefault = { rows: 1, cols: 1, y: 0, x: 0 };
  sizeGauge = 200;

  chartStoresBlank = {
    totalItrs: null,
    totalPunches: null,
    totalHandovers: null,
    totalChanges: null,
    weeklyItrs: null,
    weeklyPunches: null,
  };
  chartStores = { ...this.chartStoresBlank };
  chartType = ChartType;

  _dataSourceHandover: MatTableDataSource<WeeklyHandoverModel>;
  dataHandoverModels: WeeklyHandoverModel[] = [];
  displayedColumns: string[] = [
    'handoverNo',
    'systemNo',
    'subSystemNo',
    'description',
    'plannedDate',
  ];

  planedColors = {
    complete: 'rgba(173, 255, 175, 0.5)',
    overdue: 'rgba(242, 46, 24, 0.5)',
    extra: 'rgba(250, 205, 2, 0.5)',
  };

  contentDashboards = {
    projectCompletion: null,
  };
  currentCharts = [];

  data = {
    PROJECT_COMPLETION: null,
    TOTAL_CHANGES: null,
    TOTAL_HANDOVERS: null,
    TOTAL_PUNCH_ITEMS: null,
    TOTAL_ITRS: null,
    WEEKLY_ITRS: null,
    WEEKLY_PUNCH_ITEMS: null,
    WEEKLY_HANDOVERS: null,
  };

  constructor(
    private router: Router,
    private clientState: ClientState,
    private storageService: StorageService,
    private projectService: ProjectService,
    private reloadLayoutService: ReloadLayoutService,
    private authErrorHandler: AuthErrorHandler,
    private dashboardService: DashboardService,
    private changeDetectorRefs: ChangeDetectorRef,
    private punchPageService: PunchPageService,
    private idbService: IdbService,
    public dialog: MatDialog,
    private reloadSideMenuService: ReloadSideMenuService,
    private downloadStatusService: DownloadStatusService,
  ) {
    const supportsOrientationChange = 'onorientationchange' in window;
    const orientationEvent = supportsOrientationChange ? 'orientationchange' : 'resize';
    fromEvent(window, orientationEvent).subscribe(() => {
      this.onSetResponsiveDashboard();
      this.changeDetectorRefs.detectChanges();
      this.setWithGrister();
    });
  }

  ngOnInit(): void {
    //--- Show left menu
    $('#top-header .project-name').show();
    $('#matSideNavMenu').show();
    $('.toggle-nav').show();
    document.getElementById('layoutMainContainer').style.minHeight = 'auto';
    this.onSetResponsiveDashboard();

    this.moduleProjectDefaultModel = JwtTokenHelper.GetModuleProjectDefault();
    if (this.isTablet && this.isOffline) {
      if (this.moduleProjectDefaultModel) {
        this.router.navigate([
          '',
          'modules',
          this.moduleProjectDefaultModel.moduleKey,
          'projects',
          this.moduleProjectDefaultModel.projectKey,
          'tag-tab',
        ]);
      }
    } else {
      //---Get user info
      this.userInfo = JwtTokenHelper.GetUserInfo();
      if (!this.userInfo) {
        this.storageService.onRemoveTokens([
          StorageKey.UserInfo,
          StorageKey.Token,
          StorageKey.ModuleProjectDefault,
        ]);
        this.router.navigate(['login']);
        this.isAuthor = false;
      } else {
        this.isAuthor = true;

        if (this.moduleProjectDefaultModel) {
          this.onGetModuleByUserId(
            this.moduleProjectDefaultModel.moduleKey,
            false
          );
          this.router.navigate([
            'modules',
            this.moduleProjectDefaultModel.moduleKey,
            'projects',
            this.moduleProjectDefaultModel.projectKey,
            'dashboard',
          ]);
        }
        this.initialOptions();

        //--- Set width for grister
        this.setWithGrister();

        //--- Initial Data and rendering for Dashboard
        this.onGetDashboardDetail();
      }
    }
  }

  ngOnDestroy() {
    // reset style as the beginning
    const mainContainerHeight = $(window).height() - $('#top-header').height();
    if (mainContainerHeight > 0) {
      document.getElementById('layoutMainContainer').style.minHeight = mainContainerHeight + 'px';
    }
  }

  onSetResponsiveDashboard() {
    const heightWindow = screen.height;
    const widthWindow = screen.width;
    if (this.isTablet) {
      this.heightContent = heightWindow - (widthWindow >= 992 ? 140 : 185);
    } else {
      this.heightContent = heightWindow - 281;
    }
  }

  set hasChangeChartPosition(value) {
    this._hasChangeChartPosition = value;
  }

  get hasChangeChartPosition() {
    return this._hasChangeChartPosition;
  }

  //--- Check info device
  get isTablet() {
    return InfoDevice.isTablet;
  }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  getChartType(chartCode: string) {
    return this.chartType[chartCode];
  }

  getDataChart(chartCode: string) {
    return this.data[chartCode];
  }

  onGetDashboardDetail() {
    this.clientState.isBusy = true;
    Object.keys(this.chartStores).forEach((_key) => {
      if (this.chartStores[_key]) {
        this.chartStores[_key].destroy();
      }
    });
    this.dashboardService
      .getDashboardDetail(this.moduleProjectDefaultModel.projectKey)
      .subscribe(
        (res) => {
          this.onResetFirstLoad();
          this.dataDashboard = res ? { ...res } : null;
          this.listCharts = res ? res['dashboardChart'] : [];
          this.onInitialChartList([
            ...this.listCharts.filter((_item) => _item.show),
          ]);
          this.dashboardTemp = [...this.dashboard];
          this.dashboardTemp.forEach(_c => this.currentCharts.push(_c.chartCode));
          this.changeDetectorRefs.detectChanges();
          this.loadCharts(res);
          this.hasChangeChartPosition = false;
          this.clientState.isBusy = false;
        },
        (err: ApiError) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        }
      );
  }

  onResetFirstLoad() {
    this.currentCharts = [];
    this.dataDashboard = null;
    this.dashboard = this.dashboardTemp = [];
    this.listCharts = [];
  }

  loadCharts(data) {
    this.currentCharts.forEach((_type) => {
      this.onFilterChart(_type, data);

    });
    this.changeDetectorRefs.detectChanges();
    if (this.currentCharts.find(_cC => _cC === this.chartType.PROJECT_COMPLETION)) {
      this.setSize4GaugeChart();
    }
  }

  loadSingleChart(type, data) {
    this.onFilterChart(type, data);
    if (type === this.chartType.PROJECT_COMPLETION) {
      this.setSize4GaugeChart();
    } else {
      this.changeDetectorRefs.detectChanges();
    }
  }

  setSize4GaugeChart() {
    setTimeout(() => {
      let chartContainer = document.getElementById('gaugeChartContainer');
      if (chartContainer) {
        const _w = chartContainer.offsetWidth;
        const _h = chartContainer.offsetHeight;
        this.sizeGauge = Math.trunc((_w > _h ? _h : _w) * 0.95);
        this.changeDetectorRefs.detectChanges();
      }
    }, 10);
  }

  onInitialChartList(dataShow: ChartModel[]) {
    if (dataShow && dataShow[0].order == null) {
      dataShow.forEach(_item => {
        const _value = { ..._item };
        _value.order = this.onAssignOrderFor(_value.chartCode);
        this.dashboard.push(_value);
      });
    } else if (dataShow && dataShow.length > 0) {
      dataShow.forEach((_item) => {
        const _value = { ..._item };
        _value.order = JSON.parse(_item.order);
        this.dashboard.push(_value);
      });
    }
  }

  onAssignOrderFor(chartCode: string, previousCols?: number, index?: number) {
    switch (chartCode) {
      case this.chartType.PROJECT_COMPLETION:
        return { rows: 1, cols: 2, y: 0, x: 0 };
      case this.chartType.TOTAL_CHANGES:
        return { rows: 1, cols: 2, y: 0, x: 2 };
      case this.chartType.TOTAL_ITRS:
        return { rows: 1, cols: 2, y: 0, x: 4 };
      case this.chartType.TOTAL_PUNCH_ITEMS:
        return { rows: 1, cols: 2, y: 0, x: 6 };
      case this.chartType.TOTAL_HANDOVERS:
        return { rows: 1, cols: 2, y: 0, x: 0 };
      case this.chartType.WEEKLY_ITRS:
        return { rows: 2, cols: 2, y: 0, x: 2 };
      case this.chartType.WEEKLY_PUNCH_ITEMS:
        return { rows: 2, cols: 2, y: 0, x: 4 };
      case this.chartType.WEEKLY_HANDOVERS:
        return { rows: 2, cols: 2, y: 0, x: 6 };
    }
  }

  onFilterChart(chartCode, response) {
    switch (chartCode) {
      case this.chartType.PROJECT_COMPLETION:
        this.onSetUpProjectCompletion(
          +this.calculateProjectCompletion(response).toFixed(1)
        );
        break;
      case this.chartType.TOTAL_CHANGES:
        const _totalChanges = {
          changes: response['changes'],
          changesCompleted: response['changesCompleted'],
          changesOutStanding: response['changesOutStanding'],
          changesApproved: response['changesApproved'],
        };
        this.onSetUpTotalChangesChart(_totalChanges);
        break;
      case this.chartType.TOTAL_ITRS:
        const _totalItrs = {
          itrs: response['itrs'],
          itrsCompleted: response['itrsCompleted'],
        };
        this.onSetUpTotalItrsChart(_totalItrs);
        break;
      case this.chartType.TOTAL_PUNCH_ITEMS:
        const _totalPunches = {
          punches: response['punches'],
          punchesCompleted: response['punchesCompleted'],
        };
        this.onSetUpTotalPunchesChart(_totalPunches);
        break;
      case this.chartType.TOTAL_HANDOVERS:
        const _totalHandovers = {
          handovers: response['handovers'],
          handoversCompleted: response['handoversCompleted'],
          handoversOutStanding: response['handoversOutStanding'],
        };
        this.onSetUpTotalHandoversChart(_totalHandovers);
        break;
      case this.chartType.WEEKLY_ITRS:
        const _weeklyItrs = response['weeklyItrs'];
        this.onSetUpWeeklyItrsChart(_weeklyItrs);
        break;
      case this.chartType.WEEKLY_PUNCH_ITEMS:
        const _weeklyPunches = response['weeklyPunches'];
        this.onSetUpWeeklyPunchesChart(_weeklyPunches);
        break;
      case this.chartType.WEEKLY_HANDOVERS:
        const _weeklyHandovers = response['weeklyHandovers'];
        this.onSetUpWeeklyHandoversTable(_weeklyHandovers);
        break;
    }
  }

  onAssignChartControl(event) {
    this.chartStores[event.type] = event.content;
  }

  //--- Get module by user
  onGetModuleByUserId = (moduleKey: string, isReloadRouter: boolean) => {
    this.clientState.isBusy = true;

    //--- Set logo project
    this.logoProject = this.moduleProjectDefaultModel.logoProject
      ? Configs.BaseSitePath + this.moduleProjectDefaultModel.logoProject
      : this.moduleProjectDefaultModel.projectName;

    this.onGetProjectByUserAndModule(
      this.userInfo.userId,
      this.moduleProjectDefaultModel.moduleId,
      isReloadRouter
    );
  };

  //--- Get project by user and module
  onGetProjectByUserAndModule = (
    userId: string,
    moduleId: number,
    isReloadRouter: boolean
  ) => {
    //this.clientState.isBusy = true;

    this.projectService
      .getListProjectByUserAndModule(userId, moduleId)
      .subscribe(
        (res) => {
          this.projectByUserAndModuleModels = res.content
            ? [...res.content] as ProjectByUserAndModuleModel[]
            : [];

          //--- Check have more project
          this.projectByUserAndModuleModels = this.projectByUserAndModuleModels.filter(
            (p) =>
              p.projectId !== this.moduleProjectDefaultModel.defaultProjectId
          );

          if (
            this.projectByUserAndModuleModels &&
            this.projectByUserAndModuleModels.length > 0
          ) {
            this.projectByUserAndModuleModels.map((p) => {
              p.logoProject = p.logoProject
                ? Configs.BaseSitePath + p.logoProject
                : '';
            });
            this.isHaveMoreProject = true;
          } else {
            this.isHaveMoreProject = false;
          }

          if (isReloadRouter) {
            this.reloadLayoutService.reloadLayout('reloadClientLogo');
          }

          // this.clientState.isBusy = false;
        },
        (err: ApiError) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        }
      );
  };

  //--- Switch project
  onSwitchProject = (project: ProjectByUserAndModuleModel) => {
    this.clientState.isBusy = true;

    this.moduleProjectDefaultModel.defaultProjectId = project.projectId;
    this.moduleProjectDefaultModel.projectName = project.projectName;
    this.moduleProjectDefaultModel.projectKey = project.projectKey;
    this.moduleProjectDefaultModel.companyId = project.companyId;

    if (project.logoProject) {
      this.moduleProjectDefaultModel.logoProject = project.logoProject.substring(
        Configs.BaseSitePath.length
      );
    } else {
      this.moduleProjectDefaultModel.logoProject = project.logoProject;
    }

    //--- Set logo project
    this.logoProject = this.moduleProjectDefaultModel.logoProject
      ? Configs.BaseSitePath + this.moduleProjectDefaultModel.logoProject
      : this.moduleProjectDefaultModel.projectName;

    //--- Set module project default
    this.storageService.onSetToken(
      StorageKey.ModuleProjectDefault,
      JSON.stringify(this.moduleProjectDefaultModel)
    );

    //--- Get project by user and module
    this.onGetProjectByUserAndModule(
      this.userInfo.userId,
      this.moduleProjectDefaultModel.moduleId,
      true
    );

    //--- Change project and get their own notification
    this.reloadLayoutService.reloadLayout('reloadNotificationQuantity');

    //--- Reload dashboard
    if (
      this.moduleProjectDefaultModel &&
      this.moduleProjectDefaultModel.projectKey
    ) {
      if (this.isTablet) {
        this.onGetLookup(this.moduleProjectDefaultModel.projectKey);
      }
      this.onGetDashboardDetail();
    }
    this.clientState.isBusy = false;
  };

  onCheckValueIndexedDB(project: ProjectByUserAndModuleModel) {
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
      if (listResult.some(_r => _r === true)) {
        this.hasValueIDB = true;
        this.openAlert(project);
      } else {
        this.idbService.clearDataInAllStores();
        this.hasValueIDB = false;
        this.onSwitchProject(project);
        this.downloadStatusService.reloadDownloadDetail(true);
        this.reloadSideMenuService.sendMessage(true);
      }
    }, err => { });
  }

  openAlert(project: ProjectByUserAndModuleModel) {
    const dialogRef = this.dialog.open(AlertSwitchingComponent, {
      width: '70vw',
      height: 'auto',
      panelClass: 'custom-modalbox',
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if (result) {
        this.idbService.clearDataInAllStores();
        this.hasValueIDB = false;
        this.onSwitchProject(project);
        this.downloadStatusService.reloadDownloadDetail(true);
        this.reloadSideMenuService.sendMessage(true);
      }
    });
  }

  onGetLookup(projectKey: string) {
    this.punchPageService.downloadPunchLookup(projectKey).subscribe(
      (res) => {
        this.assignLookup2Storage(res);
        this.assignPunchSignTemplate2Storage(res["punchSignatureTemplate"]);
        this.clientState.isBusy = false;
      },
      (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      }
    );
  }

  assignLookup2Storage(lookupData) {
    const _sn = StoreNames.lookups;
    this.idbService.addLookups(_sn, lookupData);
  }

  assignPunchSignTemplate2Storage(punchSignTemplate) {
    const _sn = StoreNames.punchSignatureTemplate;
    this.idbService.addItem(_sn, 'templates', punchSignTemplate);
  }

  onSelectionChange($event: MatSelectionListChange) {
    if ($event.option.selected) {
      // add
      const _chartCode = $event.option.value;
      const _rawChart = this.listCharts.find(
        (_c) => _c.chartCode === _chartCode
      );
      _rawChart.show = true;
      _rawChart.order = this.onAssignOrderFor(_chartCode);
      this.dashboardTemp.unshift(_rawChart);
      this.currentCharts.push(_chartCode);
      this.changeDetectorRefs.detectChanges();
      this.loadSingleChart(_chartCode, this.dataDashboard);
      this.hasChangeChartPosition = true;
    } else {
      // delete
      const index = this.dashboardTemp.findIndex((_c) => _c.chartCode === $event.option.value);
      const _chartCode = this.dashboardTemp[index].chartCode;
      this.listCharts.map(_c => _c.chartCode === _chartCode && (_c.show = false));
      this.currentCharts.filter(_cC => _cC !== _chartCode);
      this.dashboardTemp.splice(index, 1);
      this.hasChangeChartPosition = true;
    }
  }

  onDeleteChart($event: MouseEvent | TouchEvent, index: number): void {
    $event.preventDefault();
    $event.stopPropagation();
    const _chartCode = this.dashboardTemp[index].chartCode;
    this.listCharts.map(_c => _c.chartCode === _chartCode && (_c.show = false));
    this.currentCharts.filter(_cC => _cC !== _chartCode);
    this.dashboardTemp.splice(index, 1);
    this.hasChangeChartPosition = true;
  }

  openSaveModal() {
    this.isSaveModal = true;
  }

  onSaveCharts(isConfirm: boolean) {
    if (isConfirm) {
      const _command: ChartCommand = new ChartCommand();
      const _dashboardCharts = this.deepCopy(this.dashboardTemp);
      _dashboardCharts.map(_c => (_c.order = JSON.stringify(_c.order)));
      _command.dashboardCharts = [
        ..._dashboardCharts,
      ];
      _command.projectKey = this.moduleProjectDefaultModel.projectKey;
      this.dashboardService.updateDashboardDetail(_command).subscribe(
        (res) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleSuccess(Constants.UpdateDashboardChart);
        },
        (err: ApiError) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        }
      );
      this.hasChangeChartPosition = false;
    }
    this.isSaveModal = false;
  }

  overlapEvent(
    source: GridsterItem,
    target: GridsterItem,
    grid: GridsterComponent
  ) {
    console.log('overlap', source, target, grid);
  }

  //--- Load Dashboard
  initialOptions = () => {
    this.options = {
      gridType: GridType.Fixed,
      displayGrid: DisplayGrid.OnDragAndResize,
      pushItems: true,
      maxCols: 6,
      outerMarginRight: 15,
      outerMarginLeft: 15,
      draggable: {
        delayStart: 0,
        enabled: true,
        ignoreContentClass: 'gridster-item-content',
        ignoreContent: true,
        dragHandleClass: 'drag-handler',
        stop: (item: GridsterItem,
          itemComponent: GridsterItemComponentInterface,
          event: MouseEvent) => {
          this.hasChangeChartPosition = true;
        },
        dropOverItems: false,
        dropOverItemsCallback: this.overlapEvent,
      },
      resizable: {
        enabled: true,
        stop: (item, itemComponent) => {
          let chartContainer = $('#gaugeChartContainer');
          if (chartContainer) {
            setTimeout(() => {
              const _w = chartContainer.width();
              const _h = chartContainer.height();
              this.sizeGauge = Math.trunc((_w > _h ? _h : _w) * 0.95);
            }, 1);
          }
          this.hasChangeChartPosition = true;
        }
      },
      api: {}
    };
  };

  onFormatPosition() {
    this.options.compactType = 'compactUp&Left';
    this.changedOptions();
    this.options.compactType = 'none';
    this.changedOptions();
    this.hasChangeChartPosition = true;
  }

  changedOptions() {
    if (this.options.api && this.options.api.optionsChanged) {
      this.options.api.optionsChanged();
    }
  }

  removeItem(event, item) {
    event.preventDefault();
    event.stopPropagation();
    this.dashboard.splice(this.dashboard.indexOf(item), 1);
  }

  //--- Drawing Dashboard Area
  //--- Project Completion - Gauge Graph
  onSetUpProjectCompletion(value: number) {
    this.data.PROJECT_COMPLETION = value;
  }

  //--- Total ITRs - Vertical Bar Chart
  onSetUpTotalItrsChart(data: any) {
    const canvas = document.getElementById('totalItrs') as HTMLCanvasElement;
    const ctxTotalItrs = canvas ? canvas.getContext('2d') : null;

    let _itrTotal = this.getValuesFrom(data['itrs'], [
      'typeA',
      'typeB',
      'typeC',
    ]);
    let _itrsCompleted = this.getValuesFrom(data['itrsCompleted'], [
      'typeA',
      'typeB',
      'typeC',
    ]);

    const dataTotalItrs = {
      labels: ['A ITR', 'B ITR', 'C ITR'],
      datasets: [
        {
          label: 'Total',
          data: _itrTotal,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
        {
          label: 'Complete',
          data: _itrsCompleted,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };

    const optionTotalItrs = {
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 10,
        },
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              suggestedMax: this.getSuggestedMax(_itrTotal),
            },
          },
        ],
      },
    };
    this.chartStores.totalItrs = this.renderChart(ctxTotalItrs, {
      type: 'bar',
      data: dataTotalItrs,
      options: optionTotalItrs,
    });
  }

  //--- Total Punches - Horizontal Bar Chart
  onSetUpTotalPunchesChart(data: any) {
    const canvas = document.getElementById('totalPunches') as HTMLCanvasElement;
    const ctxTotalPunches = canvas ? canvas.getContext('2d') : null;

    let _punchTotal = this.getValuesFrom(data['punches'], [
      'typeA',
      'typeB',
      'typeC',
    ]);
    let _punchesCompleted = this.getValuesFrom(data['punchesCompleted'], [
      'typeA',
      'typeB',
      'typeC',
    ]);

    const dataTotalPunches = {
      labels: ['Punch A', 'Punch B', 'Punch C'],
      datasets: [
        {
          label: 'Complete',
          data: _punchesCompleted,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Total',
          data: _punchTotal,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };

    const optionTotalPunches = {
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 10,
        },
      },
      scales: {
        xAxes: [
          {
            ticks: {
              beginAtZero: true,
              suggestedMax: this.getSuggestedMax(_punchTotal),
            },
          },
        ],
      },
    };
    this.chartStores.totalPunches = this.renderChart(ctxTotalPunches, {
      type: 'horizontalBar',
      data: dataTotalPunches,
      options: optionTotalPunches,
    });
  }

  //-- Total Handovers - Doughnut graph
  onSetUpTotalHandoversChart(data: any) {
    Chart.defaults.doughnutLabels = Chart.helpers.clone(
      Chart.defaults.doughnut
    );

    const canvas = document.getElementById(
      'totalHandovers'
    ) as HTMLCanvasElement;
    const ctxTotalHandovers = canvas ? canvas.getContext('2d') : null;

    const _totalHandovers = this.getValuesFrom(data, [
      'handoversCompleted',
      'handoversOutStanding',
    ]),
      _isNull = this.isNullData(_totalHandovers),
      _blankConfig = this.getConfigPieBlank();

    Chart.controllers.doughnutLabels = Chart.controllers.doughnut.extend(
      this.configChart(_isNull)
    );

    const dataTotalHandovers = _isNull
      ? _blankConfig.data
      : {
        labels: [],
        datasets: [
          {
            label: 'Dataset 1',
            data: _totalHandovers,
            backgroundColor: ['rgba(75, 192, 192)', 'rgba(255, 206, 86)'],
          },
        ],
      };

    const optionTotalHandovers = _isNull
      ? _blankConfig.options
      : {
        maintainAspectRatio: false,
        responsive: true,
        legend: {
          align: 'center',
          position: 'bottom',
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              const labels = ['Complete', 'Outstanding'];
              let _result = labels[tooltipItem.index];
              if (_result) {
                _result += ': ';
              }
              const _data = data.datasets[tooltipItem.datasetIndex].data,
                _total = _data[0] + _data[1],
                _percent = (_data[tooltipItem.index] / _total) * 100;
              _result += `${_data[tooltipItem.index]} ( ${_percent.toFixed(1)}% )`;
              return _result;
            },
          },
        },
        animation: {
          animateScale: true,
          animateRotate: true,
        },
      };
    this.chartStores.totalHandovers = this.renderChart(ctxTotalHandovers, {
      type: 'doughnutLabels',
      data: dataTotalHandovers,
      options: optionTotalHandovers,
    });
  }

  //--- Total Changes - Pie chart
  onSetUpTotalChangesChart(data: any) {
    Chart.defaults.pieLabels = Chart.helpers.clone(Chart.defaults.pie);

    const canvas = document.getElementById('totalChanges') as HTMLCanvasElement;
    const ctxTotalChanges = canvas ? canvas.getContext('2d') : null;

    const _totalChanges = this.getValuesFrom(data, [
      'changesApproved',
      'changesCompleted',
    ]),
      _isNull = this.isNullData(_totalChanges),
      _blankConfig = this.getConfigPieBlank();

    Chart.controllers.pieLabels = Chart.controllers.pie.extend(
      this.configChart(_isNull)
    );

    const dataTotalChanges = _isNull
      ? _blankConfig.data
      : {
        labels: [],
        datasets: [
          {
            label: 'Dataset 1',
            data: _totalChanges,
            backgroundColor: ['rgba(54, 162, 235)', 'rgba(75, 192, 192)'],
          },
        ],
      };

    const optionTotalChanges = _isNull
      ? _blankConfig.options
      : {
        maintainAspectRatio: false,
        responsive: true,
        legend: {
          align: 'center',
          position: 'bottom',
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              const labels = ['Approved', 'Completed'];
              let _result = labels[tooltipItem.index];
              if (_result) {
                _result += ': ';
              }
              const _data = data.datasets[tooltipItem.datasetIndex].data,
                _total = _data[0] + _data[1],
                _percent = (_data[tooltipItem.index] / _total) * 100;
              _result += `${_data[tooltipItem.index]} ( ${_percent.toFixed(1)}% )`;
              return _result;
            },
          },
        },
        animation: {
          animateScale: true,
          animateRotate: true,
        },
      };
    this.chartStores.totalChanges = this.renderChart(ctxTotalChanges, {
      type: 'pieLabels',
      data: dataTotalChanges,
      options: optionTotalChanges,
    });
  }

  //--- Weekly ITRs - Bar chart
  onSetUpWeeklyItrsChart(data: any) {
    const canvas = document.getElementById('weeklyItrs') as HTMLCanvasElement;
    const ctxWeeklyItrs = canvas ? canvas.getContext('2d') : null;

    let _A = this.getValuesWeekFrom(data, 'typeA');
    let _B = this.getValuesWeekFrom(data, 'typeB');
    let _C = this.getValuesWeekFrom(data, 'typeC');

    const dataWeeklyItrs = {
      labels: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      datasets: [
        {
          label: 'A ITR',
          data: _A,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
        {
          label: 'B ITR',
          data: _B,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'C ITR',
          data: _C,
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1,
        },
      ],
    };

    const optionWeeklyItrs = {
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 10,
        },
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              suggestedMax: this.getSuggestedMax([..._A, ..._B, ..._C]),
            },
          },
        ],
      },
    };
    this.chartStores.weeklyItrs = this.renderChart(ctxWeeklyItrs, {
      type: 'bar',
      data: dataWeeklyItrs,
      options: optionWeeklyItrs,
    });
  }

  //--- Weekly Punches - horizontal chart
  onSetUpWeeklyPunchesChart(data: any) {
    const canvas = document.getElementById(
      'weeklyPunches'
    ) as HTMLCanvasElement;
    const ctxWeeklyPunches = canvas ? canvas.getContext('2d') : null;

    let _A = this.getValuesWeekFrom(data, 'typeA');
    let _B = this.getValuesWeekFrom(data, 'typeB');
    let _C = this.getValuesWeekFrom(data, 'typeC');

    const dataWeeklyPunches = {
      labels: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      datasets: [
        {
          label: 'Punch A',
          data: _A,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
        {
          label: 'Punch B',
          data: _B,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Punch C',
          data: _C,
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1,
        },
      ],
    };

    const optionWeeklyPunches = {
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 10,
        },
      },
      scales: {
        xAxes: [
          {
            ticks: {
              beginAtZero: true,
              suggestedMax: this.getSuggestedMax([..._A, ..._B, ..._C]),
            },
          },
        ],
      },
    };
    this.chartStores.weeklyPunches = this.renderChart(ctxWeeklyPunches, {
      type: 'horizontalBar',
      data: dataWeeklyPunches,
      options: optionWeeklyPunches,
    });
  }

  //--- Weekly Handovers - Table
  onSetUpWeeklyHandoversTable(data: any) {
    this.dataHandoverModels = [...data];
    this.data.WEEKLY_HANDOVERS = new MatTableDataSource(data);
  }

  //--- Render Chart
  renderChart(ctx, config) {
    return ctx ? new Chart([ctx], config) : null;
  }

  //--- Return custom chart config
  configChart(isNull?: boolean) {
    return {
      updateElement: function (arc, index, reset) {
        var _this = this;
        var chart = _this.chart,
          chartArea = chart.chartArea,
          opts = chart.options,
          animationOpts = opts.animation,
          arcOpts = opts.elements.arc,
          centerX = (chartArea.left + chartArea.right) / 2,
          centerY = (chartArea.top + chartArea.bottom) / 2,
          startAngle = opts.rotation, // non reset case handled later
          endAngle = opts.rotation, // non reset case handled later
          dataset = _this.getDataset(),
          circumference =
            reset && animationOpts.animateRotate
              ? 0
              : arc.hidden
                ? 0
                : _this.calculateCircumference(dataset.data[index]) *
                (opts.circumference / (2.0 * Math.PI)),
          innerRadius =
            reset && animationOpts.animateScale ? 0 : _this.innerRadius,
          outerRadius =
            reset && animationOpts.animateScale ? 0 : _this.outerRadius,
          custom = arc.custom || {},
          valueAtIndexOrDefault = Chart.helpers.getValueAtIndexOrDefault;

        Chart.helpers.extend(arc, {
          // Utility
          _datasetIndex: _this.index,
          _index: index,
          _dataset: _this.getDataset(),

          // Desired view properties
          _model: {
            x: centerX + chart.offsetX,
            y: centerY + chart.offsetY,
            startAngle: startAngle,
            endAngle: endAngle,
            circumference: circumference,
            outerRadius: outerRadius,
            innerRadius: innerRadius,
            label: valueAtIndexOrDefault(
              dataset.label,
              index,
              chart.data.labels[index]
            ),
          },

          draw: function () {
            var ctx = this._chart.ctx,
              vm = this._view,
              sA = vm.startAngle,
              eA = vm.endAngle,
              opts = this._chart.config.options;

            var labelPos = this.tooltipPosition();
            var segmentLabel = (vm.circumference / opts.circumference) * 100;

            ctx.beginPath();

            ctx.arc(vm.x, vm.y, vm.outerRadius, sA, eA);
            ctx.arc(vm.x, vm.y, vm.innerRadius, eA, sA, true);

            ctx.closePath();
            ctx.strokeStyle = vm.borderColor;
            ctx.lineWidth = vm.borderWidth;

            ctx.fillStyle = vm.backgroundColor;

            ctx.fill();
            ctx.lineJoin = 'bevel';

            if (vm.borderWidth) {
              ctx.stroke();
            }

            if (vm.circumference > 0.15) {
              // Trying to hide label when it doesn't fit in segment
              ctx.beginPath();
              ctx.font = Chart.helpers.fontString(
                opts.defaultFontSize,
                opts.defaultFontStyle,
                opts.defaultFontFamily
              );
              ctx.fillStyle = '#fff';
              ctx.textBaseline = 'top';
              ctx.textAlign = 'center';

              ctx.fillText(
                isNull ? '' : this._dataset.data[this._index],
                labelPos.x,
                labelPos.y
              );
            }
          },
        });

        var model = arc._model;
        model.backgroundColor = custom.backgroundColor
          ? custom.backgroundColor
          : valueAtIndexOrDefault(
            dataset.backgroundColor,
            index,
            arcOpts.backgroundColor
          );
        model.hoverBackgroundColor = custom.hoverBackgroundColor
          ? custom.hoverBackgroundColor
          : valueAtIndexOrDefault(
            dataset.hoverBackgroundColor,
            index,
            arcOpts.hoverBackgroundColor
          );
        model.borderWidth = custom.borderWidth
          ? custom.borderWidth
          : valueAtIndexOrDefault(
            dataset.borderWidth,
            index,
            arcOpts.borderWidth
          );
        model.borderColor = custom.borderColor
          ? custom.borderColor
          : valueAtIndexOrDefault(
            dataset.borderColor,
            index,
            arcOpts.borderColor
          );

        // Set correct angles if not resetting
        if (!reset || !animationOpts.animateRotate) {
          if (index === 0) {
            model.startAngle = opts.rotation;
          } else {
            model.startAngle = _this.getMeta().data[index - 1]._model.endAngle;
          }

          model.endAngle = model.startAngle + model.circumference;
        }

        arc.pivot();
      },
    };
  }

  //--- Utils
  getSuggestedMax(array: any[]) {
    const _max = Math.max(...array);
    if (_max < 10 || !_max) {
      return 10;
    }
    return _max + _max * 0.1;
  }

  getValuesFrom(array: any[], dataType?: any) {
    let _result = [];
    if (dataType) {
      dataType.forEach((_k) => {
        _result.push(array[_k]);
      });
    } else {
      Object.keys(array).forEach((key) => {
        _result.push(array[key]);
      });
    }

    return _result;
  }

  getValuesWeekFrom(array: any[], type: string) {
    const weekday = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const _result = [];
    weekday.forEach((_d) => {
      const _item = array.find((_i) => _i['dateOfWeek'] === _d);
      _result.push(_item['data'][type]);
    });
    return _result;
  }

  calculateProjectCompletion(object: any) {
    const _punches = object['punches'],
      _punchesCompleted = object['punchesCompleted'],
      _itrs = object['itrs'],
      _itrsCompleted = object['itrsCompleted'];

    const _changes = object['changes'],
      _changesCompleted = object['changesCompleted'],
      _punchesAmount = _punches['typeA'] + _punches['typeB'],
      _punchesCompletedAmount =
        _punchesCompleted['typeA'] + _punchesCompleted['typeB'],
      _itrsAmount = _itrs['typeA'] + _itrs['typeB'] + _itrs['typeC'],
      _itrsCompletedAmount =
        _itrsCompleted['typeA'] +
        _itrsCompleted['typeB'] +
        _itrsCompleted['typeC'];

    const _perChanges = _changes ? _changesCompleted / _changes : 0,
      _perPunches = _punchesAmount
        ? _punchesCompletedAmount / _punchesAmount
        : 0,
      _perItrs = _itrsAmount ? _itrsCompletedAmount / _itrsAmount : 0;

    return ((_perChanges + _perPunches + _perItrs) / 3) * 100;
  }

  getTitle(index: number) {
    switch (index) {
      case 0:
        return 'Project completion';
      case 1:
        return 'Total ITRs';
      case 2:
        return 'Total Punch Items';
      case 3:
        return 'Total Handovers';
      case 4:
        return 'Total Change';
      case 5:
        return 'Weekly ITRs';
      case 6:
        return 'Weekly Punch Items';
      case 7:
        return 'Weekly Handovers';
    }
  }

  convertDate(date: string) {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
    });
  }

  getConfigPieBlank() {
    return {
      data: {
        labels: [],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#6c757d'],
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        animation: {
          animateScale: true,
          animateRotate: true,
        },
        tooltips: {
          callbacks: {
            label: () => 'No Data: 0%',
          },
        },
      },
    };
  }

  isNullData(array: any[]) {
    let _sum = 0;
    array.forEach((_v) => (_sum += _v));
    return !_sum;
  }

  getChartGroupBy(id, index) {
    switch (id) {
      case 'cdk-drop-list-0':
        return `chartG1-${index}`;
      case 'cdk-drop-list-1':
        return `chartG2-${index}`;
      case 'cdk-drop-list-2':
        return `chartG3-${index}`;
      case 'cdk-drop-list-3':
        return `chartG4-${index}`;
    } // use to create order
  }

  assignedBy(groupName: string, data: ChartModel[]) {
    let result = [];
    data.forEach((_item, index) => {
      let value = _item;
      value.order = `${groupName}-${index}`;
      result.push(value);
    });
    return result;
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

  setWithGrister = () => {
    const widthScreen = window.screen.width;
    let widthWindow = 0;
    if (this.isTablet) {
      widthWindow = widthScreen - 75;
    } else {
      widthWindow = widthScreen - 253;
    }
    this.options.fixedColWidth = Math.trunc(widthWindow / 6);
    this.changedOptions();
  };
}
