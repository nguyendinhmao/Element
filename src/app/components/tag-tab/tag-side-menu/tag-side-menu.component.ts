import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
} from "@angular/core";
import { ChartType, ChartDataSets } from "chart.js";
import { Label } from "ng2-charts";
import {
  UpdateTagTabSideMenu,
  TagItrModel,
  StatusColor,
  StatusDisplay
} from "src/app/shared/models/tab-tag/tab-tag.model";
import { AuthErrorHandler, ClientState, IdbService } from "src/app/shared/services";
import { Constants } from "src/app/shared/common";
import { TabSideMenuModel } from "src/app/shared/models/tab-tag/tab-side-menu.model";
import { TagTabService } from "src/app/shared/services/api/tag-tab/tag-tab.service";
import { ActivatedRoute, Router } from "@angular/router";
import RecordStatusList from "../allocated-itrs/config/status-list";
import { IndexRelatedSNs, StoreNames } from 'src/app/shared/models/common/common.model';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { MatDialog } from "@angular/material/dialog";
import { TagPreviewDrawingComponent } from "../tag-preview-drawing/tag-preview-drawing.component";
import { DetailPreservationTabModel, PreservationStatusEnum } from "src/app/shared/models/preservation-tab/preservation-tab.model";

@Component({
  selector: "tag-side-menu",
  templateUrl: "./tag-side-menu.component.html",
  styleUrls: ["./tag-side-menu.component.scss"],
})

export class TagSideMenuComponent implements OnInit, OnChanges {
  //--- Input + Output
  @Input() tagIdDetail: string;
  @Input() tagDescriptionDetail: string;
  @Input() tagNoDetail: string;
  @Input() isLockedTag: boolean = false;
  @Input() projectKey: string;
  @Input() isShowITRBuilder: boolean;

  @Output() showEditTagNo: EventEmitter<boolean> = new EventEmitter();
  @Input() isConfirmSaveTagNo: boolean;

  @Output() showITRBuilder: EventEmitter<string> = new EventEmitter();
  @Output() showEditAllocatedITRs: EventEmitter<boolean> = new EventEmitter();
  @Input() isLoadDetailChart: boolean;
  @Input() tagUpdateIds: [];
  @Input() isLoadTagItrByTag: boolean;

  @Output() showAddPunch: EventEmitter<boolean> = new EventEmitter();

  //--- Boolean
  isLoadingRightSideBar: boolean;
  isEditTagNo: boolean;
  isSaveTagNo: boolean;
  isEditAllocatedItrs: boolean;
  isAddNewState: boolean = false;
  showComplete: boolean;
  isDrawingLoaded = false;

  //--- Variable
  StatusColor = StatusColor;
  StatusDisplay = StatusDisplay;
  chartLabels: Label[] = [];
  chartDataSets: ChartDataSets[];
  chartType: ChartType = "bar";
  chartOptions: any;
  tabSideDetail: TabSideMenuModel;
  tagItrModel: TagItrModel[] = [];
  tagId: string;
  percentChangeActive: number;
  percentChangeCompleted: number;
  percentPunchTypeA: number;
  percentPunchTypeACompleted: number;
  percentPunchTypeB: number;
  percentPunchTypeBCompleted: number;
  percentPunchTypeC: number;
  percentPunchTypeCCompleted: number;
  percentCompleted: number;
  sub: any;
  moduleKey: string;
  tagNoDetailTemp: string = "";
  percentageNumber: number = 0;
  _storeName: string;

  //--- Model
  tabSideMenuModel: TabSideMenuModel = new TabSideMenuModel();
  drawings: any[] = [];
  preservationL: DetailPreservationTabModel[] = new Array();

  constructor(
    private tagTabService: TagTabService,
    public clientState: ClientState,
    private authErrorHandler: AuthErrorHandler,
    private route: ActivatedRoute,
    private router: Router,
    private idbService: IdbService,
    public dialog: MatDialog,
  ) {
    this.sub = this.route.params.subscribe((params) => {
      this.moduleKey = params["moduleKey"];
      this.projectKey = params["projectKey"];

      if (!this.moduleKey || !this.projectKey) {
        this.router.navigate([""]);
      }
    });
    this._storeName = StoreNames.tags;
  }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  get isTablet() {
    return InfoDevice.isTablet;
  }

  ngOnChanges(): void {
    if (this.tagNoDetail !== this.tagNoDetailTemp && this.tagNoDetail !== "") {
      this.onGetTagItrByTag();
      this.onGetTagDetailChart();
      this.getTagDrawingList();
    }

    if (this.isLoadDetailChart) {
      this.onGetTagDetailChart();
    }

    if (this.isLoadTagItrByTag) {
      this.onGetTagItrByTag();
    }

    if (this.isConfirmSaveTagNo) {
      this.onSaveTagNoConfirm(this.isConfirmSaveTagNo);
    }
  }

  ngOnInit(): void {
    // this.onGetTagItrByTag();
    // this.onGetTagDetailChart();
    // this.getTagDrawingList();
  }

  onGetTagItrByTag() {
    this.clientState.isBusy = true;
    this.tagNoDetailTemp = this.tagNoDetail;

    if (this.isOffline) {
      this.idbService.getItem(this._storeName, this.tagIdDetail).then((res) => {
        if (res && res.tagSideMenu) {
          this.assignTagItrList(res.tagSideMenu.itrs);
        }
        this.clientState.isBusy = false;
      }, (err) => { });

      const _snPreservation = StoreNames.preservation;
      const _iPreservation = IndexRelatedSNs.preservation.tagNo;
      this.idbService.getAllDataFromIndex(_snPreservation, _iPreservation, this.tagNoDetail).then(res => {
        this.preservationL = res ? [...res] as DetailPreservationTabModel[] : [];
      });
    } else {
      this.tagTabService.getTagItrList(this.tagIdDetail).subscribe(
        (res) => {
          this.assignTagItrList(res.content);
          this.clientState.isBusy = false;
        },
        (err) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        }
      );
    }
  }

  assignTagItrList(response) {
    this.tagItrModel = response ? <TagItrModel[]>[...response] : [];

    if (this.tagUpdateIds && this.tagUpdateIds.length > 0) {
      this.tagUpdateIds.forEach((element) => {
        this.tagItrModel = this.tagItrModel.map((e) => {
          if (e.tagItrId === element) {
            e.isAdded = true;
          }
          return e;
        });
      });
    }
  }

  //--- Edit tag no
  isNotEdit() {
    if (this.isLockedTag) return false;
    return !this.isEditTagNo && !this.isShowITRBuilder;
  }

  isNotEditItr() {
    if (this.isLockedTag) {
      return false;
    } else {
      return true;
    }
  }

  onEditTagNo = () => {
    this.isEditTagNo = true;
  };

  getTagDrawingList() {
    this.drawings = [];
    this.isDrawingLoaded = false;
    if (this.isOffline) {
      this.clientState.isBusy = true;
      const _snTags = StoreNames.tags;
      const _snDrawings = StoreNames.drawings;
      this.idbService.getItem(_snTags, this.tagIdDetail).then((currentTag) => {
        const _drawingIds = currentTag.drawingIds as string[];
        const _result = [];
        _drawingIds.forEach(_dId => {
          this.idbService.getItem(_snDrawings, _dId).then((_drawing) => _result.push(_drawing));
        });
        setTimeout(() => {
          this.drawings = [..._result];
          this.isDrawingLoaded = true;
          this.clientState.isBusy = false;
        }, 1000);
      }, (err) => {
        this.isDrawingLoaded = true;
        this.clientState.isBusy = false;
      });
    } else {
      this.tagTabService.getTagDrawingList(this.projectKey, this.tagIdDetail).subscribe((res) => {
        this.drawings = res && res.content ? res.content : [];
        this.isDrawingLoaded = true;
        this.clientState.isBusy = false;
      },
        (err) => {
          this.clientState.isBusy = false;
          this.isDrawingLoaded = true;
          this.authErrorHandler.handleError(err.message);
        });
    }
  }

  openPreview(drawingId: string) {
    const dialogRef = this.dialog.open(TagPreviewDrawingComponent, {
      width: '95vw',
      height: '92vh',
      maxWidth: '95vw',
      data: {
        drawingId: drawingId,
        drawings: this.drawings,
        tagId: this.tagIdDetail,
      },
      panelClass: 'custom-modalbox',
      position: {
        bottom: 'bottom'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  onOpenTagNoModal = () => {
    this.showEditTagNo.emit(true);
  };

  onSaveTagNoConfirm = (isConfirm: boolean) => {
    if (isConfirm) {
      this.clientState.isBusy = true;

      let tagUpdationModel = new UpdateTagTabSideMenu();
      tagUpdationModel.tagId = this.tagIdDetail;
      tagUpdationModel.description = this.tagDescriptionDetail;
      tagUpdationModel.tagNo = this.tagNoDetail;

      this.tagTabService.updateTagNo(tagUpdationModel).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.isEditTagNo = false;
          this.isSaveTagNo = false;
          this.authErrorHandler.handleSuccess(Constants.TagNoUpdated);
        },
        error: (err) => {
          this.clientState.isBusy = false;
          this.isEditTagNo = false;
          this.isSaveTagNo = false;
          this.authErrorHandler.handleError(err.message);
        },
      });
    }
  };

  createBadgeStatusByStatusId = (idStatus: number) => {
    switch (idStatus) {
      case RecordStatusList.COMPLETED.id: return `<span class="badge p-2 ${RecordStatusList.COMPLETED.color}">${RecordStatusList.COMPLETED.displayLabel}</span>`
      case RecordStatusList.DELETED.id: return `<span class="badge p-2 ${RecordStatusList.DELETED.color}">${RecordStatusList.DELETED.displayLabel}</span>`
      case RecordStatusList.REJECTED.id: return `<span class="badge p-2 ${RecordStatusList.REJECTED.color}">${RecordStatusList.REJECTED.displayLabel}</span>`
      case RecordStatusList.INPROGRESS.id: return `<span class="badge p-2 ${RecordStatusList.INPROGRESS.color}">${RecordStatusList.INPROGRESS.displayLabel}</span>`
      case RecordStatusList.NOTSTARTED.id: return `<span class="badge p-2 ${RecordStatusList.NOTSTARTED.color}">${RecordStatusList.NOTSTARTED.displayLabel}</span>`
    }
  }

  onResetTagNo = () => {
    this.isEditTagNo = false;
  };

  //--- Donut Chart
  onLoadDonutChartData = (totalChart, completed) => {
    this.percentageNumber = parseFloat(
      (totalChart > 0 ? (completed * 100) / totalChart : 0).toFixed(2)
    );
    this.chartLabels = ["Complete", "In Complete"];
    const inCompleted = totalChart > 0 ? totalChart - completed : 0;
    if (totalChart === 0 && completed === 0) {
      this.showComplete = false;
      this.chartDataSets = [{
        data: [100],
        backgroundColor: ["#6c757d"],
      }];
      this.chartOptions = {
        legend: {
          display: false,
        },
        animation: {
          animateScale: true,
          animateRotate: true,
        },
        tooltips: {
          callbacks: {
            label: () => "0%",
            title: () => "No Data",
          },
        },
      }
      return;
    }
    this.showComplete = true;
    this.chartDataSets = [
      {
        data: [completed, inCompleted],
        backgroundColor: ["#28a745", "#ffc107"],
      },
    ];
    this.chartOptions = {
      legend: {
        display: false,
      },
      animation: {
        animateScale: true,
        animateRotate: true,
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            let dataset = data.datasets[tooltipItem.datasetIndex];
            let meta = dataset._meta[Object.keys(dataset._meta)[0]];
            let total = meta.total;
            let currentValue = dataset.data[tooltipItem.index];
            let percentage = parseFloat(
              ((currentValue / total) * 100).toFixed(2)
            );
            return currentValue + " (" + percentage + "%)";
          },
          title: function (tooltipItem, data) {
            return data.labels[tooltipItem[0].index];
          },
        },
      },
    };
  };

  //--- Edit allocated itr
  onOpenEditAllocatedItrModal = () => {
    this.showEditAllocatedITRs.emit(true)
  };

  //--- Add punch
  onOpenAddPunchModal() {
    this.showAddPunch.emit(true);
  }

  //--- Click ITR Builder
  onClickITRBuilder = (itrId: string) => {
    this.isShowITRBuilder = true;
    this.showITRBuilder.emit(itrId);
  };

  //--- Loading chart
  onGetTagDetailChart() {
    this.clientState.isBusy = true;
    if (this.isOffline) {
      this.idbService.getItem(this._storeName, this.tagIdDetail).then((res) => {
        if (res && res.tagSideMenu) {
          this.assignTagDetailChart(res.tagSideMenu.detailChart);
        }
        this.clientState.isBusy = false;
      }, (err) => { });
    } else {
      this.tagTabService.getTagTabSideMenuDetail(this.tagIdDetail).subscribe(
        (res) => {
          this.assignTagDetailChart(res);
          this.clientState.isBusy = false;
        },
        (err) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        }
      );
    }
  }

  assignTagDetailChart(response) {
    this.tabSideMenuModel = response ? <TabSideMenuModel>{ ...response } : null;

    this.percentChangeCompleted =
      this.tabSideMenuModel.noOfChangeCompleted > 0
        ? (this.tabSideMenuModel.noOfChangeCompleted * 100) /
        this.tabSideMenuModel.noOfChangeActive
        : 0;
    this.percentChangeActive = 100 - this.percentChangeCompleted;

    this.percentPunchTypeACompleted =
      this.tabSideMenuModel.noOfPunchTypeACompleted > 0
        ? (this.tabSideMenuModel.noOfPunchTypeACompleted * 100) /
        this.tabSideMenuModel.noOfPunchTypeA
        : 0;
    this.percentPunchTypeA = 100 - this.percentPunchTypeACompleted;

    this.percentPunchTypeBCompleted =
      this.tabSideMenuModel.noOfPunchTypeBCompleted > 0
        ? (this.tabSideMenuModel.noOfPunchTypeBCompleted * 100) /
        this.tabSideMenuModel.noOfPunchTypeB
        : 0;
    this.percentPunchTypeB = 100 - this.percentPunchTypeBCompleted;

    this.percentPunchTypeCCompleted =
      this.tabSideMenuModel.noOfPunchTypeCCompleted > 0
        ? (this.tabSideMenuModel.noOfPunchTypeCCompleted * 100) /
        this.tabSideMenuModel.noOfPunchTypeC
        : 0;
    this.percentPunchTypeC = 100 - this.percentPunchTypeCCompleted;

    const totalIncomplete =
      this.tabSideMenuModel.noOfChangeActive +
      this.tabSideMenuModel.noOfPunchTypeA +
      this.tabSideMenuModel.noOfPunchTypeB +
      // this.tabSideMenuModel.noOfPunchTypeC +
      this.tabSideMenuModel.noOfItr;
    const totalCompleted =
      this.tabSideMenuModel.noOfChangeCompleted +
      this.tabSideMenuModel.noOfPunchTypeACompleted +
      this.tabSideMenuModel.noOfPunchTypeBCompleted +
      // this.tabSideMenuModel.noOfPunchTypeCCompleted +
      this.tabSideMenuModel.noOfItrCompleted;
    this.onLoadDonutChartData(totalIncomplete, totalCompleted);
  }

  setProgressBarStyle(percent: number) {
    let styles = { width: percent > 0 ? percent + "%" : "0%", };
    return styles;
  }

  countPreservationByStatus(type: string, amountOnline: number) {
    if (!this.isOffline) { return amountOnline; }
    let _count = 0;
    let _sI = -1;
    switch (type) {
      case 'complete':
        _sI = 3;
        break;
      case 'due':
        _sI = 7;
        break;
      case 'overdue':
        _sI = 8;
        break;
    }
    this.preservationL.forEach(_p => PreservationStatusEnum[_p.status] === _sI && (_count += 1));
    return _count;
  }
}
