import { Component, NgZone, OnInit } from "@angular/core";
import {
  ReportTypeModel,
  Type2Switch,
} from "src/app/shared/models/report-type/report-type";
import { MockReportTypeApi } from "src/app/shared/mocks/mock.report-type";
import { ClientState } from "src/app/shared/services/client/client-state";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import {
  AuthErrorHandler,
  ProgressReportService,
} from "src/app/shared/services";
import {
  CanvasA4Config,
  DetailItrRenderModel,
  DetailItrReportCommand,
  DetailItrReportConstant,
  FieldConfig,
  FilterModel,
  LayoutReportModel,
  Lookup,
  LookupList,
  ModuleReport,
  PunchSummaryRenderModel,
  PunchSummaryReportCommand,
  PunchSummaryReportConstant,
  SkylineRenderModel,
  SkylineReportCommand,
  SkylineReportConstant,
  SubSystemReportCommand,
  SystemReportCommand,
  SystemReportConstant,
} from "src/app/shared/models/progress-tab/progress-tab.model";
import { Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { ExportModel } from "src/app/shared/models/data-tab/data-tab.model";

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { DataMilestoneService } from "src/app/shared/services/api/data-tab/data-milestone.service";
import { DataSystemService } from "src/app/shared/services/api/data-tab/data-system.service";
import { DataSubSystemService } from "src/app/shared/services/api/data-tab/data-subsystem.service";
import { DataDisciplineService } from "src/app/shared/services/api/data-tab/data-discipline.service";
import { PunchPageService } from "src/app/shared/services/api/punch-page/punch-page.service";
import { DataWorkpackService } from "src/app/shared/services/api/data-tab/data-workpack.service";
import { DataPunchTypeService } from "src/app/shared/services/api/data-tab/data-punchtype.service";
import { DataOrderService } from "src/app/shared/services/api/data-tab/data-order.service";
import { DataLocationService } from "src/app/shared/services/api/data-tab/data-location.service";
import { DataPunchService } from "src/app/shared/services/api/data-tab/data-punch.service";
// import { browser } from 'protractor';
declare var $: any;

@Component({
  selector: "progress-tab",
  styleUrls: ["./progress-tab.component.scss"],
  templateUrl: "./progress-tab.component.html",
})
export class ProgressTabComponent implements OnInit {
  private mockReportTypeApi = new MockReportTypeApi();

  //#region boolean variables
  isShowPreview = false;
  isCollapse = false;
  isOpenFilterSec = false;
  isEnableOutput = false;
  isDisableAnother = false;
  isLoadingPreviewBtn = false;
  isLoadingExportBtn = false;
  //#endregion boolean variables

  //#region common variables
  reportTypeModels: ReportTypeModel[] = [];
  isShowLookupBlank = {
    correctAction: false,
    milestones: false,
    dateFrom: false,
    dateTo: false,
    descriptions: false, // should free text
    disciplines: false,
    drawings: false,
    itrStatuses: false, // should static selection - All, Open, Closed.  The default selection will be All
    jobCards: false,
    locations: false,
    materialNo: false,
    materialsRequired: false,
    punchNo: false,
    punchStatuses: false, // should static selection - The default selections should be Approved and Done
    subsystems: false,
    systems: false,
    tags: false,
    types: false,
    workPacks: false,
  };
  isShowLookups = this.deepCopy(this.isShowLookupBlank);
  showBasedReportType = {
    1: ["milestones", "dateFrom", "dateTo"], // Skyline report
    2: [
      "systems",
      "subsystems",
      "milestones",
      "disciplines",
      "punchNo",
      "types",
      "drawings",
      "tags",
      "descriptions",
      "correctAction",
      "locations",
      "materialsRequired",
      "materialNo",
      "punchStatuses",
    ], // Punch List Summary report
    3: ["multiSystems"], // System Summary report
    4: ["multiSystems", "multiSubSystems"], // Sub-system summary report
    5: [
      "multiSystems",
      "multiSubSystems",
      "multiMilestones",
      "multiWorkPacks",
      "multiDisciplines",
      "multiTagNos",
      "descriptions",
      "itrStatuses",
    ], // Detailed ITRs report
    6: [
      "multiSystems",
      "multiSubSystems",
      "multiDisciplines",
      "multiPunchNo",
      "multiTypes",
      "multiDrawings",
      "multiTagNos",
      "descriptions",
      "correctAction",
      "multiLocations",
      "materialsRequired",
      "multiMaterialNo",
      "punchStatuses",
    ], // Punch Summary report
  };
  fieldNames = {
    correctAction: {
      name: "Corrective Action",
      placeholder: "Enter Corrective Action",
    },
    milestones: {
      name: "Milestone",
      placeholder: "Select All",
    },
    dateFrom: {
      name: "Date From",
      placeholder: "Select Date From",
    },
    dateTo: {
      name: "Date To",
      placeholder: "Select Date To",
    },
    descriptions: {
      name: "Description",
      placeholder: "Enter Description",
    },
    disciplines: {
      name: "Discipline",
      placeholder: "Select Discipline",
    },
    drawings: {
      name: "Drawing",
      placeholder: "Select Drawing",
    },
    multiDrawings: {
      name: "Drawing",
      placeholder: "Select All",
    },
    itrStatuses: {
      name: "Status",
      placeholder: "Select Status",
    },
    jobCards: {
      name: "Job Card",
      placeholder: "Select Job Card",
    },
    locations: {
      name: "Location",
      placeholder: "Select Location",
    },
    multiLocations: {
      name: "Location",
      placeholder: "Select All",
    },
    materialNo: {
      name: "Material No.",
      placeholder: "Select Material No.",
      dependentBy: [
        {
          key: "materialsRequired",
          value: 1,
        },
      ],
    },
    multiMaterialNo: {
      name: "Material No.",
      placeholder: "Select All",
      dependentBy: [
        {
          key: "materialsRequired",
          value: 1,
        },
      ],
    },
    materialsRequired: {
      name: "Materials Required",
      placeholder: "Select All",
    },
    punchNo: {
      name: "Punch No.",
      placeholder: "Select Punch No.",
    },
    multiPunchNo: {
      name: "Punch No.",
      placeholder: "Select All",
    },
    punchStatuses: {
      name: "Status",
      placeholder: "Select All",
    },
    subsystems: {
      name: "Sub-System",
      placeholder: "Select Sub-System",
    },
    systems: {
      name: "System",
      placeholder: "Select System",
    },
    multiSystems: {
      name: "Systems",
      placeholder: "Select All",
    },
    multiSubSystems: {
      name: "Sub-Systems",
      placeholder: "Select All",
    },
    multiTagNos: {
      name: "Tag No.",
      placeholder: "Select All",
    },
    multiDisciplines: {
      name: "Disciplines",
      placeholder: "Select All",
    },
    multiWorkPacks: {
      name: "Work Packs",
      placeholder: "Select All",
    },
    multiJobCards: {
      name: "Job Cards",
      placeholder: "Select All",
    },
    multiMilestones: {
      name: "Milestones",
      placeholder: "Select All",
    },
    tags: {
      name: "Tag No.",
      placeholder: "Select Tag No.",
    },
    multiTags: {
      name: "Tag No.",
      placeholder: "Select All",
    },
    types: {
      name: "Type",
      placeholder: "Select Type",
    },
    multiTypes: {
      name: "Type",
      placeholder: "Select All",
    },
    workPacks: {
      name: "Work Pack",
      placeholder: "Select Work Pack",
    },
  };
  fieldAttributes: any = new Array();
  filterModelBlank: FilterModel = {
    correctAction: null,
    dateFrom: null,
    dateTo: null,
    descriptions: null,
    disciplines: null,
    drawings: null,
    itrStatuses: null,
    jobCards: null,
    locations: null,
    materialNo: null,
    materialsRequired: null,
    milestones: null,
    punchNo: null,
    punchStatuses: null,
    subsystems: null,
    systems: null,
    multiSystems: null,
    multiSubSystems: null,
    multiTagNos: null,
    multiDisciplines: null,
    multiWorkPacks: null,
    multiJobCards: null,
    multiMilestones: null,
    multiTypes: null,
    multiPunchNo: null,
    multiMaterialNo: null,
    multiLocations: null,
    multiDrawings: null,
    tags: null,
    types: null,
    workPacks: null,
  };
  filterModel: FilterModel = this.deepCopy(this.filterModelBlank);
  filterModel2Compare: FilterModel = null;
  defaultValues = {
    itrStatuses: 1,
  };
  currentReportType: ReportTypeModel = null;
  lookupData: LookupList = new LookupList();
  lookupDataOrigin: LookupList = new LookupList();
  sourcePreview: any;
  projectKey: string;
  sub: Subscription;
  reportType: "EXCEL" | "PDF" = "PDF";
  dataModel4Excel = null;
  dataModel4Pdf = null;
  layoutReportModel: LayoutReportModel;
  currentFilterCriteria = "";
  //#endregion common variables

  constructor(
    public clientState: ClientState,
    private pReportService: ProgressReportService,
    private route: ActivatedRoute,
    private router: Router,
    private authErrorHandler: AuthErrorHandler,
    private milestoneService: DataMilestoneService,
    private systemService: DataSystemService,
    private subSystemService: DataSubSystemService,
    private punchPageService: PunchPageService,
    private dataDisciplineService: DataDisciplineService,
    private workPackService: DataWorkpackService,
    private dataPunchTypeService: DataPunchTypeService,
    private orderService: DataOrderService,
    private locationService: DataLocationService,
    private dataPunchService: DataPunchService,
    private _ngZone: NgZone
  ) {
    this.reportTypeModels = [
      { reportTypeId: 1, key: "skyline", reportTypeName: "Skyline Report" },
      // { reportTypeId: 2, key: 'punch', reportTypeName: "Punch List" },
      { reportTypeId: 3, key: "system", reportTypeName: "System Summary" },
      {
        reportTypeId: 4,
        key: "subSystem",
        reportTypeName: "SubSystem Summary",
      },
      { reportTypeId: 5, key: "itr", reportTypeName: "Detailed ITRs" },
      {
        reportTypeId: 6,
        key: "punchSummary",
        reportTypeName: "Punchlist Summary",
      },
    ];

    this.sub = this.route.params.subscribe((params) => {
      this.projectKey = params["projectKey"];
      if (!this.projectKey) {
        this.router.navigate([""]);
      }
    });
  }

  public ngOnInit() {
    this.isOpenFilterSec = !!this.currentReportType;
    this.onGetAllLookupData();
  }

  //#region Get Filters Data
  onGetAllLookupData() {
    this.clientState.isBusy = true;
    Promise.all([
      this.onGetLookUpMilestone(),
      this.onGetLookUpSystem(),
      this.onGetLookUpSubsystem(),
      this.onGetLookUpTag(),
      this.onGetLookUpDiscipline(),
      this.onGetLookUpWorkPack(),
      this.onGetLookPunchType(),
      this.onGetDrawingLookUp(),
      this.onGetLocationsLookUp(),
      this.onGetPunchLookUp(),
      this.onGetOrderLookUp(),
    ])
      .then(
        (res) => {
          // assign lookup for milestones
          this.lookupData.milestones = res[0] as Array<Lookup>;
          this.lookupData.multiMilestones = res[0] as Array<Lookup>;
          // assign lookup for systems
          this.lookupData.systems = res[1] as Array<Lookup>;
          this.lookupData.multiSystems = res[1] as Array<Lookup>;
          // assign lookup for subsystems
          this.lookupDataOrigin.multiSubSystems = res[2] as Array<Lookup>;
          this.lookupData.multiSubSystems = res[2] as Array<Lookup>;
          //assign Lookup for tags
          this.lookupDataOrigin.multiTagNos = res[3] as Array<Lookup>;
          this.lookupData.multiTagNos = res[3] as Array<Lookup>;
          //assign Lookup for disciplines
          this.lookupDataOrigin.multiDisciplines = res[4] as Array<Lookup>;
          this.lookupData.multiDisciplines = res[4] as Array<Lookup>;
          //assign Lookup for work pack
          this.lookupData.multiWorkPacks = res[5] as Array<Lookup>;
          //assign Lookup for types
          this.lookupData.multiTypes = res[6] as Array<Lookup>;
          //assign Lookup for drawings
          let _drawings = (res[7] as Array<any>).map((loc) => {
            return {
              id: loc.drawingId,
              value: loc.drawingNo,
            };
          });
          this.lookupData.multiDrawings = _drawings;
          //assign Lookup for locations
          this.lookupData.multiLocations = res[8] as Array<Lookup>;
          //assign Lookup for punch no
          this.lookupDataOrigin.multiPunchNo = res[9] as Array<Lookup>;
          this.lookupData.multiPunchNo = res[9] as Array<Lookup>;
          //assign Lookup for order no
          this.lookupData.multiMaterialNo = res[10] as Array<Lookup>;
          //assign Lookup for job card
          // this.lookupData.multiJobCards = res[6] as Array<Lookup>;

          // add some static data for punch + itr
          this.lookupData.punchStatuses = [
            { id: 1, value: "Approved" },
            { id: 2, value: "Done" },
          ];
          this.lookupData.itrStatuses = [
            { id: 1, value: "All" },
            { id: 2, value: "Open" },
            { id: 3, value: "Closed" },
          ];
          this.lookupData.materialsRequired = [
            { id: 1, value: "Yes" },
            { id: 2, value: "No" },
          ];

          this.clientState.isBusy = false;
        },
        (errs) => {
          errs.forEach((err) => {
            this.handleErrorAll(err, { isLookup: true });
          });
        }
      )
      .catch((err) => {
        this.clientState.isBusy = false;
      });
  }

  //--- Milestones
  onGetLookUpMilestone() {
    return new Promise((resolve, reject) => {
      this.milestoneService.getMilestoneLookUp(this.projectKey).subscribe(
        (res) => {
          resolve(res.content);
        },
        (err: ApiError) => {
          reject(err);
        }
      );
    });
  }

  //--- System
  onGetLookUpSystem = () => {
    return new Promise((resolve, reject) => {
      this.systemService.getElementSystemLookUp(this.projectKey).subscribe(
        (res) => {
          resolve(res.content);
        },
        (err: ApiError) => {
          reject(err);
        }
      );
    });
  };

  //--- Subsystem
  onGetLookUpSubsystem = () => {
    return new Promise((resolve, reject) => {
      this.subSystemService.getSubSystemLookUp(this.projectKey, "").subscribe(
        (res) => {
          resolve(res.content);
        },
        (err: ApiError) => {
          reject(err);
        }
      );
    });
  };

  //--- Tag No
  onGetLookUpTag = () => {
    return new Promise((resolve, reject) => {
      this.punchPageService.getTagLookUpPunchPage(this.projectKey).subscribe(
        (res) => {
          resolve(res.content);
        },
        (err: ApiError) => {
          reject(err);
        }
      );
    });
  };

  //--- Discipline
  onGetLookUpDiscipline = () => {
    return new Promise((resolve, reject) => {
      this.dataDisciplineService
        .getDisciplineLookUpTagPage(this.projectKey)
        .subscribe(
          (res) => {
            resolve(res.content);
          },
          (err: ApiError) => {
            reject(err);
          }
        );
    });
  };

  //--- Work Pack
  onGetLookUpWorkPack = () => {
    return new Promise((resolve, reject) => {
      this.workPackService.getWorkPackLookUp(this.projectKey).subscribe(
        (res) => {
          resolve(res.content);
        },
        (err: ApiError) => {
          reject(err);
        }
      );
    });
  };

  //--- Punch Type
  onGetLookPunchType = () => {
    return new Promise((resolve, reject) => {
      this.dataPunchTypeService.getPunchTypeLookUp(this.projectKey).subscribe(
        (res) => {
          resolve(res.content);
        },
        (err: ApiError) => {
          reject(err.message);
          this.authErrorHandler.handleError(err.message);
        }
      );
    });
  };

  //--- Order lookup
  onGetOrderLookUp = () => {
    return new Promise((resolve, reject) => {
      this.orderService.getOrderLookUp(this.projectKey).subscribe(
        (res) => {
          resolve(res.content);
        },
        (err: ApiError) => {
          reject(err.message);
          this.authErrorHandler.handleError(err.message);
        }
      );
    });
  };

  //--- Drawing
  onGetDrawingLookUp = () => {
    return new Promise((resolve, reject) => {
      this.punchPageService
        .getDrawingLookUpPunchPage(this.projectKey)
        .subscribe(
          (res) => {
            resolve(res.content);
          },
          (err: ApiError) => {
            reject(err.message);
            this.authErrorHandler.handleError(err.message);
          }
        );
    });
  };

  //--- Locations
  onGetLocationsLookUp = () => {
    return new Promise((resolve, reject) => {
      this.locationService.getLocationLookUp(this.projectKey).subscribe(
        (res) => {
          resolve(res.content);
        },
        (err: ApiError) => {
          reject(err.message);
          this.authErrorHandler.handleError(err.message);
        }
      );
    });
  };

  //--- Punch no
  onGetPunchLookUp = () => {
    return new Promise((resolve, reject) => {
      this.dataPunchService.getPunchLookUp(this.projectKey).subscribe(
        (res) => {
          resolve(res.content);
        },
        (err: ApiError) => {
          reject(err.message);
          this.authErrorHandler.handleError(err.message);
        }
      );
    });
  };

  //--- Job Card
  // need to confirm where getting
  //#endregion Get Filters Data

  clearReportType() {
    this.currentReportType = null;
  }

  getLookupDataFor(key: string): Array<Lookup> {
    if (!this.lookupData[key]) {
      return null;
    }
    return this.lookupData[key];
  }

  checkHavingFilter() {
    this.isEnableOutput = Object.keys(this.filterModel).some(
      (_key) => !!this.filterModel[_key]
    );
  }

  onSelect(changedItem: ReportTypeModel) {
    if (changedItem) {
      this.isOpenFilterSec = true;
      // reset previewer
      this.dataModel4Pdf = null;
      this.dataModel4Excel = null;
      this.isShowPreview = false;
      // checking have any changed report type or not
      if (
        (this.currentReportType &&
          this.currentReportType.reportTypeId !== changedItem.reportTypeId) ||
        !this.currentReportType
      ) {
        // reset values
        this.currentReportType = changedItem;
        this.fieldAttributes = new Array();
        this.isShowLookups = this.deepCopy(this.isShowLookupBlank);
        this.filterModel = this.deepCopy(this.filterModelBlank);
        // set field which should show
        const _showedFields = this.showBasedReportType[
          changedItem.reportTypeId
        ];
        _showedFields.forEach((_fieldName) => {
          this.isShowLookups[_fieldName] = true;
          let _fieldConfig: FieldConfig = {
            ...{
              key: _fieldName,
              type: null,
              default: this.defaultValues[_fieldName]
                ? this.defaultValues[_fieldName]
                : null,
            },
          };
          _fieldConfig.type = this.setFieldType(_fieldName);
          this.fieldAttributes.push(_fieldConfig);
        });
      }
      setTimeout(() => {
        this.checkHavingFilter();
      }, 100);
    } else {
      this.isOpenFilterSec = false;
      this.isShowLookups = this.deepCopy(this.isShowLookupBlank);
    }
  }

  filterFChange(item: any, key: string, type: string) {
    if (item) {
      switch (type) {
        case Type2Switch.dropdown:
          this.filterModel[key] = item.id;
          break;
        case Type2Switch.text:
          this.filterModel[key] = item.srcElement.value;
          break;
        case Type2Switch.date:
          this.filterModel[key] = item;
          break;
        case Type2Switch.multiSelect:
          this.filterModel[key] = [...item.map((_i) => _i.id)];
          break;
      }
      // filter through directives
      this.filter4Data(Array.isArray(item), key);
      // -------------------------
      setTimeout(() => {
        this.checkHavingFilter();
      }, 100);
    } else {
      this.filterModel[key] = null;
    }
  }

  swipeAllFilter() {
    this.filterModel = this.deepCopy(this.filterModelBlank);
    // set value as default
    setTimeout(() => {
      this.checkHavingFilter();
    }, 100);
  }

  filter4Data = (isArray: boolean, key: string) => {
    if (!isArray) {
      return;
    }
    switch (key) {
      case "multiSystems":
        if (this.currentReportType.key === "subSystem") {
          if (
            this.filterModel.multiSystems &&
            this.filterModel.multiSystems.length > 0
          ) {
            this.lookupData.multiSubSystems = this.lookupDataOrigin.multiSubSystems.filter(
              (_item) =>
                this.filterModel.multiSystems.some(
                  (_id) => _id === _item["systemId"]
                )
            );
            // filter subsystem
            if (
              this.filterModel.multiSubSystems &&
              this.filterModel.multiSubSystems.length > 0
            ) {
              this.filterModel.multiSubSystems = this.filterModel.multiSubSystems.filter(
                (_id) =>
                  this.lookupData.multiSubSystems.some(
                    (_item) => _item.id === _id
                  )
              );
            }
          } else {
            this.lookupData.multiSubSystems = this.deepCopy(
              this.lookupDataOrigin.multiSubSystems
            );
            this.filterModel.multiSubSystems = null;
          }
        }

        if (
          this.currentReportType.key === "itr" ||
          this.currentReportType.key === "punchSummary"
        ) {
          // affect to Sub + Tags and then Disciplines
          if (
            this.filterModel.multiSystems &&
            this.filterModel.multiSystems.length > 0
          ) {
            this.lookupData.multiSubSystems = this.lookupDataOrigin.multiSubSystems.filter(
              (_item) =>
                this.filterModel.multiSystems.some(
                  (_id) => _id === _item["systemId"]
                )
            );
            this.lookupData.multiTagNos = this.lookupDataOrigin.multiTagNos.filter(
              (_item) =>
                this.filterModel.multiSystems.some(
                  (_id) => _id === _item["systemId"]
                )
            );
            this.lookupData.multiDisciplines = this.lookupDataOrigin.multiDisciplines.filter(
              (_item) =>
                this.lookupData.multiTagNos.some(
                  (_i) => _i["disciplineId"] === _item.id
                )
            );
            // filter subsystem
            if (
              this.filterModel.multiSubSystems &&
              this.filterModel.multiSubSystems.length > 0
            ) {
              this.filterModel.multiSubSystems = this.filterModel.multiSubSystems.filter(
                (_id) =>
                  this.lookupData.multiSubSystems.some(
                    (_item) => _item.id === _id
                  )
              );
            }
            // filter tags
            if (
              this.filterModel.multiTagNos &&
              this.filterModel.multiTagNos.length > 0
            ) {
              this.filterModel.multiTagNos = this.filterModel.multiTagNos.filter(
                (_id) =>
                  this.lookupData.multiTagNos.some((_item) => _item.id === _id)
              );
            }
            // filter disciplines
            if (
              this.filterModel.multiDisciplines &&
              this.filterModel.multiDisciplines.length > 0
            ) {
              this.filterModel.multiDisciplines = this.filterModel.multiDisciplines.filter(
                (_id) =>
                  this.lookupData.multiDisciplines.some(
                    (_item) => _item.id === _id
                  )
              );
            }
          } else {
            this.lookupData.multiSubSystems = this.deepCopy(
              this.lookupDataOrigin.multiSubSystems
            );
            this.lookupData.multiTagNos = this.deepCopy(
              this.lookupDataOrigin.multiTagNos
            );
            this.lookupData.multiDisciplines = this.deepCopy(
              this.lookupDataOrigin.multiDisciplines
            );
            this.filterModel.multiSubSystems = null;
            this.filterModel.multiTagNos = null;
            this.filterModel.multiDisciplines = null;
          }
        }
        break;
      case "multiSubSystems":
        if (
          this.currentReportType.key === "itr" ||
          this.currentReportType.key === "punchSummary"
        ) {
          // affect to Tags and then Disciplines
          if (
            (this.filterModel.multiSubSystems &&
              this.filterModel.multiSubSystems.length > 0) ||
            (this.filterModel.multiSystems &&
              this.filterModel.multiSystems.length > 0)
          ) {
            this.lookupData.multiTagNos =
              this.filterModel.multiSystems &&
                this.filterModel.multiSystems.length > 0
                ? this.lookupDataOrigin.multiTagNos.filter((_item) =>
                  this.filterModel.multiSystems.some(
                    (_id) => _id === _item["systemId"]
                  )
                )
                : this.lookupDataOrigin.multiTagNos.filter((_item) =>
                  this.filterModel.multiSubSystems.some(
                    (_id) => _id === _item["subSystemId"]
                  )
                );

            this.lookupData.multiDisciplines = this.lookupDataOrigin.multiDisciplines.filter(
              (_item) =>
                this.lookupData.multiTagNos.some(
                  (_i) => _i["disciplineId"] === _item.id
                )
            );
            // filter tags
            if (
              this.filterModel.multiTagNos &&
              this.filterModel.multiTagNos.length > 0
            ) {
              this.filterModel.multiTagNos = this.filterModel.multiTagNos.filter(
                (_id) =>
                  this.lookupData.multiTagNos.some((_item) => _item.id === _id)
              );
            }
            // filter disciplines
            if (
              this.filterModel.multiDisciplines &&
              this.filterModel.multiDisciplines.length > 0
            ) {
              this.filterModel.multiDisciplines = this.filterModel.multiDisciplines.filter(
                (_id) =>
                  this.lookupData.multiDisciplines.some(
                    (_item) => _item.id === _id
                  )
              );
            }
          } else {
            this.lookupData.multiTagNos = this.deepCopy(
              this.lookupDataOrigin.multiTagNos
            );
            this.lookupData.multiDisciplines = this.deepCopy(
              this.lookupDataOrigin.multiDisciplines
            );
            this.filterModel.multiTagNos = null;
            this.filterModel.multiDisciplines = null;
          }
        }
        break;
      case "multiDisciplines":
        if (
          this.currentReportType.key === "itr" ||
          this.currentReportType.key === "punchSummary"
        ) {
          // affect to Disciplines
          if (
            this.filterModel.multiDisciplines &&
            this.filterModel.multiDisciplines.length > 0
          ) {
            if (
              (this.filterModel.multiSubSystems &&
                this.filterModel.multiSubSystems.length > 0) ||
              (this.filterModel.multiSystems &&
                this.filterModel.multiSystems.length > 0)
            ) {
              this.lookupData.multiTagNos =
                this.filterModel.multiSystems &&
                  this.filterModel.multiSystems.length > 0
                  ? this.lookupDataOrigin.multiTagNos.filter((_item) =>
                    this.filterModel.multiSystems.some(
                      (_id) => _id === _item["systemId"]
                    )
                  )
                  : this.lookupDataOrigin.multiTagNos.filter((_item) =>
                    this.filterModel.multiSubSystems.some(
                      (_id) => _id === _item["subSystemId"]
                    )
                  );
            }

            this.lookupData.multiTagNos = this.lookupData.multiTagNos.filter(
              (_item) =>
                this.filterModel.multiDisciplines.some(
                  (_id) => _id === _item["disciplineId"]
                )
            );
            // filter tags
            if (
              this.filterModel.multiTagNos &&
              this.filterModel.multiTagNos.length > 0
            ) {
              this.filterModel.multiTagNos = this.filterModel.multiTagNos.filter(
                (_id) =>
                  this.lookupData.multiTagNos.some((_item) => _item.id === _id)
              );
            }
          } else if (
            (this.filterModel.multiSubSystems &&
              this.filterModel.multiSubSystems.length > 0) ||
            (this.filterModel.multiSystems &&
              this.filterModel.multiSystems.length > 0)
          ) {
            this.lookupData.multiTagNos =
              this.filterModel.multiSystems &&
              this.filterModel.multiSystems.length > 0
                ? this.lookupDataOrigin.multiTagNos.filter((_item) =>
                  this.filterModel.multiSystems.some(
                    (_id) => _id === _item["systemId"]
                  )
                )
                : this.lookupDataOrigin.multiTagNos.filter((_item) =>
                  this.filterModel.multiSubSystems.some(
                    (_id) => _id === _item["subSystemId"]
                  )
                );
          } else {
            this.lookupData.multiTagNos = this.deepCopy(
              this.lookupDataOrigin.multiTagNos
            );
            this.filterModel.multiTagNos = null;
          }
        }
        break;
    }
  };
  //#region Preview section
  preview = () => {
    this.isDisableAnother = true;
    this.isLoadingPreviewBtn = true;

    switch (this.currentReportType.reportTypeId) {
      case this.reportTypeModels[0].reportTypeId:
        this.previewSkylineR();
        break;
      case this.reportTypeModels[1].reportTypeId:
        this.previewSystemR();
        break;
      case this.reportTypeModels[2].reportTypeId:
        this.previewSubsystemR();
        break;
      case this.reportTypeModels[3].reportTypeId:
        this.previewDetailItrR();
        break;
      case this.reportTypeModels[4].reportTypeId:
        this.previewPunchSummaryR();
        break;
    }
  };

  assign4AllModel(response) {
    // let get layoutReportModel
    this.layoutReportModel = {
      ...new LayoutReportModel(),
      ...{
        projectLogo: response.projectImage,
        clientLogo: response.clientImage,
        eaiLogo: response.eaiImage,
        titleReport: this.currentReportType.reportTypeName,
        isTitleCriteria: this.currentReportType.key === "skyline",
        filter: response.filter,
      },
    };
    // assign into model
    const _data4Model = this.modifyData(response);
    this.dataModel4Excel = _data4Model.excelData;
    this.dataModel4Pdf = _data4Model.pdfData;
  }

  modifyData(response: any) {
    switch (this.currentReportType.reportTypeId) {
      case this.reportTypeModels[0].reportTypeId:
        return {
          pdfData: this.modifySkylineRData(response.skylineReportData),
          excelData: response.skylineReportData,
        };
      case this.reportTypeModels[1].reportTypeId:
        return {
          pdfData: this.modifySystemRData(response),
          excelData: {
            milestones: response.milestones,
            systems: response.systems,
          },
        };
      case this.reportTypeModels[2].reportTypeId:
        return {
          pdfData: this.modifySubSystemRData(response),
          excelData: {
            milestones: response.milestones,
            subSystems: response.subSystems,
          },
        };
      case this.reportTypeModels[3].reportTypeId:
        return {
          pdfData: this.modifyDetailItrData(response.itrSystems),
          excelData: response.itrSystems,
        };
      case this.reportTypeModels[4].reportTypeId:
        return {
          pdfData: this.modifyPunchSummaryData(response.punchSystems),
          excelData: response.punchSystems,
        };
    }
  }

  previewSkylineR = () => {
    let _milestoneName = null;
    if (this.filterModel.milestones) {
      const _selected = this.lookupData.milestones.find(
        (_m) => _m.id === this.filterModel.milestones
      );
      _milestoneName = _selected.value;
    }
    let _newCommand: SkylineReportCommand = {
      ...new SkylineReportCommand(),
      ...{
        module: ModuleReport.skyline,
        typeExport: this.reportType,
        projectKey: this.projectKey,
        dateFrom: this.removeTimeZoneOut(this.filterModel.dateFrom),
        dateTo: this.removeTimeZoneOut(this.filterModel.dateTo),
        milestoneId: this.filterModel.milestones,
        milestoneName: _milestoneName,
      },
    };
    this.pReportService.getSkylineReportFile(_newCommand).subscribe(
      (res) => {
        const _response =
          res && res.content ? ({ ...res.content } as any) : null;
        if (!_response) {
          return;
        }
        this.isCollapse = false;
        $("#applyFilterForm").collapse("hide");

        this.assign4AllModel(_response);
        this.handleSuccess({ isPreview: true });
      },
      (err) => {
        this.handleErrorAll(err, {});
      }
    );
  };

  modifySkylineRData(dataModel) {
    const _maxContentWidth = document.getElementById("previewerSection")
      .offsetWidth;
    // calculate pages based on cols
    let _resultFinal: Array<Array<SkylineRenderModel>> = new Array();
    let _widthLeft = _maxContentWidth - SkylineReportConstant.MAX_REST_SKYLINE;
    let _currentIndex = -1;
    let _balance = null;

    dataModel &&
      dataModel.forEach((_item: SkylineRenderModel) => {
        let _source = _balance ? this.deepCopy(_balance) : this.deepCopy(_item);
        while (_source) {
          const afterCalculating = this.calculateMax.skylineCols(
            _source,
            _widthLeft
          );
          _widthLeft = afterCalculating.widthLeft;
          if (_currentIndex === -1) {
            _resultFinal.push([afterCalculating.add as SkylineRenderModel]);
            _currentIndex =
              _resultFinal.length - 1 < 0 ? 0 : _resultFinal.length - 1;
          } else if (_widthLeft < SkylineReportConstant.MAX_CELL_WIDTH) {
            _resultFinal[_currentIndex].push(
              afterCalculating.add as SkylineRenderModel
            );
            _widthLeft =
              _maxContentWidth - SkylineReportConstant.MAX_REST_SKYLINE;
            _currentIndex = -1;
          } else {
            _resultFinal[_currentIndex].push(
              afterCalculating.add as SkylineRenderModel
            );
          }

          _source = this.deepCopy(afterCalculating.left);
          _balance = this.deepCopy(afterCalculating.left);
        }
      });
    return _resultFinal;
  }

  previewSystemR = () => {
    let _newCommand: SystemReportCommand = new SystemReportCommand();
    this.lookupData.multiSystems.forEach((_item) => {
      if (
        this.filterModel.multiSystems &&
        this.filterModel.multiSystems.indexOf(_item.id.toString()) > -1
      ) {
        _newCommand.systemIds.push(_item.id.toString());
        _newCommand.listSystemNo.push(_item.value);
      }
    });

    _newCommand = {
      ..._newCommand,
      ...{
        module: ModuleReport.system,
        typeExport: this.reportType,
        projectKey: this.projectKey,
      },
    };

    this.pReportService.getSystemReportFile(_newCommand).subscribe(
      (res) => {
        const _response =
          res && res.content ? ({ ...res.content } as any) : null;
        if (!_response) {
          return;
        }

        this.assign4AllModel(_response);
        this.handleSuccess({ isPreview: true });
      },
      (err) => {
        this.handleErrorAll(err, {});
      }
    );
  };

  modifySystemRData(dataModel) {
    const _milestoneTitle = dataModel.milestones;
    const _systems = dataModel.systems;
    const CONFIGs = {
      minWidth4System: 200,
      minWidth4Punch: 60,
      minWidth4Change: 80,
      minWidth4Completion: 200,
      headerCellHeight: 30,
      minWidth4ITRs: 90,
      minWidth4Handover: 120,
      // layoutHeight: 278,
      layoutHeight: 188,
      paddingPreviewer: 40,
    };
    const MAX_A4 = {
      // height: 297 - 24,
      // width: 208 - 20,
      // height: 208 - 40,
      height: 208 - 25,
      width: 297 - 12,
    };
    const _elPreviewer = document.getElementById("previewerSection");
    const _elPreviewerW = _elPreviewer.offsetWidth - CONFIGs.paddingPreviewer;
    let _maxRows = SystemReportConstant.MAX_ROW_PDF;
    let _currentWidth =
      CONFIGs.minWidth4System +
      CONFIGs.minWidth4Punch +
      CONFIGs.minWidth4Change +
      CONFIGs.minWidth4Completion +
      (_milestoneTitle && _milestoneTitle.length > 0
        ? (CONFIGs.minWidth4ITRs + CONFIGs.minWidth4Handover) *
        _milestoneTitle.length
        : 0);
    const _scaleRatio =
      _elPreviewerW < _currentWidth ? _elPreviewerW / _currentWidth : 1;

    const _heightExp = (MAX_A4.height * _elPreviewerW) / MAX_A4.width;
    const _rowsExp = Math.floor(
      (_heightExp -
        CONFIGs.layoutHeight -
        CONFIGs.headerCellHeight * _scaleRatio * 2) /
      (CONFIGs.headerCellHeight * _scaleRatio)
    );
    _maxRows = _rowsExp ? _rowsExp : _maxRows;
    let _len = 0;
    let _result = new Array();
    while (_len < _systems.length) {
      let _indexEnd = _len + _maxRows;
      if (_indexEnd > _systems.length) {
        _indexEnd = _systems.length;
      }
      _result.push({
        milestones: _milestoneTitle,
        systems: _systems.slice(_len, _indexEnd),
      });
      _len = _indexEnd;
    }
    return _result;
  }

  previewSubsystemR = () => {
    let _newCommand: SubSystemReportCommand = new SubSystemReportCommand();
    this.lookupData.multiSystems.forEach((_item) => {
      if (
        this.filterModel.multiSystems &&
        this.filterModel.multiSystems.indexOf(_item.id.toString()) > -1
      ) {
        _newCommand.systemIds.push(_item.id.toString());
        _newCommand.listSystemNo.push(_item.value);
      }
    });

    this.lookupData.multiSubSystems.forEach((_item) => {
      if (
        this.filterModel.multiSubSystems &&
        this.filterModel.multiSubSystems.indexOf(_item.id.toString()) > -1
      ) {
        _newCommand.subSystemIds.push(_item.id.toString());
        _newCommand.listSubSystemNo.push(_item.value);
      }
    });

    _newCommand = {
      ..._newCommand,
      ...{
        module: ModuleReport.system,
        typeExport: this.reportType,
        projectKey: this.projectKey,
      },
    };

    this.pReportService.getSubSystemReportFile(_newCommand).subscribe(
      (res) => {
        const _response =
          res && res.content ? ({ ...res.content } as any) : null;
        if (!_response) {
          return;
        }

        this.assign4AllModel(_response);
        this.handleSuccess({ isPreview: true });
      },
      (err) => {
        this.handleErrorAll(err, {});
      }
    );
  };

  modifySubSystemRData(dataModel) {
    const _milestoneTitle = dataModel.milestones;
    const subSystems = dataModel.subSystems;
    const CONFIGs = {
      minWidth4System: 200,
      minWidth4Punch: 60,
      minWidth4Change: 80,
      minWidth4Completion: 200,
      headerCellHeight: 30,
      minWidth4ITRs: 90,
      minWidth4Handover: 120,
      // layoutHeight: 278,
      layoutHeight: 188,
      paddingPreviewer: 40,
    };
    const MAX_A4 = {
      // height: 297 - 24,
      // width: 208 - 20,
      // height: 208 - 40,
      height: 208 - 25,
      width: 297 - 12,
    };
    const _elPreviewer = document.getElementById("previewerSection");
    const _elPreviewerW = _elPreviewer.offsetWidth - CONFIGs.paddingPreviewer;
    let _maxRows = SystemReportConstant.MAX_ROW_PDF;
    let _currentWidth =
      CONFIGs.minWidth4System +
      CONFIGs.minWidth4Punch +
      CONFIGs.minWidth4Change +
      CONFIGs.minWidth4Completion +
      (_milestoneTitle && _milestoneTitle.length > 0
        ? (CONFIGs.minWidth4ITRs + CONFIGs.minWidth4Handover) *
        _milestoneTitle.length
        : 0);
    const _scaleRatio =
      _elPreviewerW < _currentWidth ? _elPreviewerW / _currentWidth : 1;

    const _heightExp = (MAX_A4.height * _elPreviewerW) / MAX_A4.width;
    const _rowsExp = Math.floor(
      (_heightExp -
        CONFIGs.layoutHeight -
        CONFIGs.headerCellHeight * _scaleRatio * 2) /
      (CONFIGs.headerCellHeight * _scaleRatio)
    );
    _maxRows = _rowsExp ? _rowsExp : _maxRows;
    let _len = 0;
    let _result = new Array();
    while (_len < subSystems.length) {
      let _indexEnd = _len + _maxRows;
      if (_indexEnd > subSystems.length) {
        _indexEnd = subSystems.length;
      }
      _result.push({
        milestones: _milestoneTitle,
        subSystems: subSystems.slice(_len, _indexEnd),
      });
      _len = _indexEnd;
    }
    return _result;
  }

  previewDetailItrR = () => {
    let _newCommand: DetailItrReportCommand = new DetailItrReportCommand();
    let _filterCriteria = "";
    let _nos = {
      system: new Array(),
      subsystem: new Array(),
      milestone: new Array(),
      workPack: new Array(),
      jobCards: new Array(),
      discipline: new Array(),
      tag: new Array(),
      tagDescription: this.filterModel.descriptions,
      status: null,
    };

    _nos.system = this.convertArray2StringList("multiSystems") as Array<string>;
    _nos.subsystem = this.convertArray2StringList(
      "multiSubSystems"
    ) as Array<string>;
    _nos.discipline = this.convertArray2StringList(
      "multiDisciplines"
    ) as Array<string>;
    _nos.milestone = this.convertArray2StringList(
      "multiMilestones"
    ) as Array<string>;
    _nos.workPack = this.convertArray2StringList(
      "multiWorkPacks"
    ) as Array<string>;
    _nos.tag = this.convertArray2StringList("multiTagNos") as Array<string>;
    _nos.status = this.convertArray2StringList(
      "itrStatuses",
      "status"
    ) as Array<string>;

    _filterCriteria = "";
    _filterCriteria +=
      _nos.system.length > 0 ? " - System: " + _nos.system.join(", ") : "";
    _filterCriteria +=
      _nos.subsystem.length > 0
        ? " - SubSystem: " + _nos.subsystem.join(", ")
        : "";
    _filterCriteria +=
      _nos.milestone.length > 0
        ? " - Milestone: " + _nos.milestone.join(", ")
        : "";
    _filterCriteria +=
      _nos.workPack.length > 0
        ? " - Work Pack: " + _nos.workPack.join(", ")
        : "";
    _filterCriteria +=
      _nos.discipline.length > 0
        ? " - Discipline: " + _nos.discipline.join(", ")
        : "";
    _filterCriteria +=
      _nos.tag.length > 0 ? " - Tag: " + _nos.tag.join(", ") : "";
    _filterCriteria += _nos.tagDescription
      ? " - Tag Description: " + _nos.tagDescription
      : "";
    _filterCriteria += _nos.status ? " - ITR Status: " + _nos.status : "";

    this.currentFilterCriteria = _filterCriteria;
    _newCommand = {
      ..._newCommand,
      ...{
        systemIds: this.filterModel.multiSystems,
        subSystemIds: this.filterModel.multiSubSystems,
        tagIds: this.filterModel.multiTagNos,
        disciplineIds: this.filterModel.multiDisciplines,
        milestoneIds: this.filterModel.multiMilestones,
        workPackIds: this.filterModel.multiWorkPacks,
        tagDescription: this.filterModel.descriptions,
        status: _nos.status || null,
        filter: _filterCriteria,
      },
      ...{
        module: ModuleReport.itr,
        typeExport: this.reportType,
        projectKey: this.projectKey,
      },
    };

    this.pReportService.getDetailedItrReportData(_newCommand).subscribe(
      (res) => {
        const _response =
          res && res.content ? ({ ...res.content } as any) : null;
        if (!_response) {
          return;
        }

        this.assign4AllModel(_response);
        this.handleSuccess({ isPreview: true });
      },
      (err) => {
        this.handleErrorAll(err, {});
      }
    );
  };

  modifyDetailItrData(dataModel) {
    const _maxContentWidth = document.getElementById("previewerSection")
      .offsetWidth;

    const _expectedHeight = Math.floor(
      ((_maxContentWidth - DetailItrReportConstant.MAX_REST) *
        CanvasA4Config.CANVAS_HEIGHT) /
      CanvasA4Config.CANVAS_WIDTH
    );

    // height content = height - (headerHeight + footerHeight)  this.currentFilterCriteria
    const _expectedContentHeight =
      _expectedHeight -
      (DetailItrReportConstant.MAX_HEADER_HEIGHT +
        DetailItrReportConstant.MIN_FOOTER_HEIGHT) -
      10;
    let _resultFinal: Array<Array<DetailItrRenderModel>> = new Array();
    let _heightLeft = _expectedContentHeight;
    let _curIndex = -1;
    let _balance = null;

    dataModel?.forEach((_item: DetailItrRenderModel) => {
      let _source = _balance ? this.deepCopy(_balance) : this.deepCopy(_item);
      while (_source) {
        const afterCalculating = this.calculateMax.detailItrRows(
          _source,
          _heightLeft
        );
        _heightLeft = afterCalculating.heightLeft;
        if (_curIndex === -1) {
          _resultFinal.push([afterCalculating.add as DetailItrRenderModel]);
          _curIndex = _resultFinal.length - 1 < 0 ? 0 : _resultFinal.length - 1;
          if (_heightLeft < DetailItrReportConstant.MAX_ROW_HEIGHT * 5) {
            _heightLeft = _expectedContentHeight;
            _curIndex = -1;
          }
        } else if (_heightLeft < DetailItrReportConstant.MAX_ROW_HEIGHT * 5) {
          afterCalculating.add['items4Pdf'] && afterCalculating.add['items4Pdf'].length > 0 ? _resultFinal[_curIndex].push(
            afterCalculating.add as DetailItrRenderModel
          ) : null;
          _heightLeft = _expectedContentHeight;
          _curIndex = -1;
        } else {
          afterCalculating.add['items4Pdf'] && afterCalculating.add['items4Pdf'].length > 0 ? _resultFinal[_curIndex].push(
            afterCalculating.add as DetailItrRenderModel
          ) : null;
        }

        _source = this.deepCopy(afterCalculating.left);
        _balance = this.deepCopy(afterCalculating.left);
      }
    });
    return _resultFinal;
  }

  previewPunchSummaryR = () => {
    let _newCommand: PunchSummaryReportCommand = new PunchSummaryReportCommand();
    let _filterCriteria = "";
    let _nos = {
      system: new Array(),
      subsystem: new Array(),
      discipline: new Array(),
      punch: new Array(),
      type: new Array(),
      drawing: new Array(),
      tag: new Array(),
      description: this.filterModel.descriptions,
      correction: this.filterModel.correctAction,
      location: new Array(),
      materialR:
        this.filterModel.materialsRequired === 1
          ? "Yes"
          : this.filterModel.materialsRequired === 2
            ? "No"
            : "",
      materialN: new Array(),
      status: null,
    };
    _nos.system = this.convertArray2StringList("multiSystems") as Array<string>;
    _nos.subsystem = this.convertArray2StringList(
      "multiSubSystems"
    ) as Array<string>;
    _nos.discipline = this.convertArray2StringList(
      "multiDisciplines"
    ) as Array<string>;
    _nos.punch = this.convertArray2StringList("multiPunchNo") as Array<string>;
    _nos.type = this.convertArray2StringList("multiTypes") as Array<string>;
    _nos.drawing = this.convertArray2StringList(
      "multiDrawings"
    ) as Array<string>;
    _nos.tag = this.convertArray2StringList("multiTagNos") as Array<string>;
    _nos.location = this.convertArray2StringList(
      "multiLocations"
    ) as Array<string>;
    _nos.materialN = this.convertArray2StringList(
      "multiMaterialNo"
    ) as Array<string>;
    _nos.status = this.convertArray2StringList(
      "punchStatuses",
      "status"
    ) as Array<string>;

    _filterCriteria = "";
    _filterCriteria +=
      _nos.system && _nos.system.length > 0
        ? " - System: " + _nos.system.join(", ")
        : "";
    _filterCriteria +=
      _nos.subsystem && _nos.subsystem.length > 0
        ? " - SubSystem: " + _nos.subsystem.join(", ")
        : "";
    _filterCriteria +=
      _nos.discipline && _nos.discipline.length > 0
        ? " - Discipline: " + _nos.discipline.join(", ")
        : "";
    _filterCriteria +=
      _nos.punch && _nos.punch.length > 0
        ? " - Punch No: " + _nos.punch.join(", ")
        : "";
    _filterCriteria +=
      _nos.type && _nos.type.length > 0
        ? " - Type: " + _nos.type.join(", ")
        : "";
    _filterCriteria +=
      _nos.drawing && _nos.drawing.length > 0
        ? " - Drawing: " + _nos.drawing.join(", ")
        : "";
    _filterCriteria +=
      _nos.tag && _nos.tag.length > 0 ? " - Tag: " + _nos.tag.join(", ") : "";
    _filterCriteria += _nos.description
      ? " - Description: " + _nos.description
      : "";
    _filterCriteria += _nos.correction
      ? " - Correction Action: " + _nos.correction
      : "";
    _filterCriteria +=
      _nos.location && _nos.location.length > 0
        ? " - Location: " + _nos.location.join(", ")
        : "";
    _filterCriteria +=
      _nos.materialR && _nos.materialR.length > 0
        ? " - Material Required: " + _nos.materialR
        : "";
    _filterCriteria +=
      _nos.materialN && _nos.materialN.length > 0
        ? " - Material No: " + _nos.materialN.join(", ")
        : "";
    _filterCriteria += _nos.status ? " - Punch Status: " + _nos.status : "";

    _newCommand = {
      ..._newCommand,
      ...{
        systemIds: this.filterModel.multiSystems,
        subSystemIds: this.filterModel.multiSubSystems,
        tagIds: this.filterModel.multiTagNos,
        disciplineIds: this.filterModel.multiDisciplines,
        punchTypeIds: this.filterModel.multiTypes,
        punchIds: this.filterModel.multiPunchNo,
        drawingIds: this.filterModel.multiDrawings,
        locationIds: this.filterModel.multiLocations,
        materialsRequired:
          this.filterModel.materialsRequired === 1
            ? true
            : this.filterModel.materialsRequired === 2
              ? false
              : null,
        orderIds: this.filterModel.multiMaterialNo,
        punchDescription: this.filterModel.descriptions,
        correctiveAction: this.filterModel.correctAction,
        status: _nos.status || null,
        filter: _filterCriteria,
      },
      ...{
        module: ModuleReport.punch,
        typeExport: this.reportType,
        projectKey: this.projectKey,
      },
    };

    this.pReportService.getPunchSummaryReportData(_newCommand).subscribe(
      (res) => {
        const _response =
          res && res.content ? ({ ...res.content } as any) : null;
        if (!_response) {
          return;
        }

        this.assign4AllModel(_response);
        this.handleSuccess({ isPreview: true });
      },
      (err) => {
        this.handleErrorAll(err, {});
      }
    );
  };

  modifyPunchSummaryData(dataModel) {
    const _maxContentWidth = document.getElementById("previewerSection")
      .offsetWidth;
    const _expectedHeight = Math.floor(
      ((_maxContentWidth - PunchSummaryReportConstant.MAX_REST) *
        CanvasA4Config.CANVAS_HEIGHT) /
      CanvasA4Config.CANVAS_WIDTH
    );
    // height content = height - (headerHeight + footerHeight)  this.currentFilterCriteria
    const _expectedContentHeight =
      _expectedHeight -
      (PunchSummaryReportConstant.MAX_HEADER_HEIGHT +
        PunchSummaryReportConstant.MIN_FOOTER_HEIGHT) -
      10;
    let _resultFinal: Array<Array<PunchSummaryRenderModel>> = new Array();
    let _heightLeft = _expectedContentHeight;
    let _curIndex = -1;
    let _balance = null;

    dataModel &&
      dataModel.forEach((_item: PunchSummaryRenderModel) => {
        let _source = _balance ? this.deepCopy(_balance) : this.deepCopy(_item);
        while (_source) {
          const afterCalculating = this.calculateMax.punchSummaryRows(
            _source,
            _heightLeft
          );
          _heightLeft = afterCalculating.heightLeft;
          if (_curIndex === -1) {
            _resultFinal.push([
              afterCalculating.add as PunchSummaryRenderModel,
            ]);
            _curIndex =
              _resultFinal.length - 1 < 0 ? 0 : _resultFinal.length - 1;
            if (_heightLeft < PunchSummaryReportConstant.MAX_ROW_HEIGHT * 5) {
              _heightLeft = _expectedContentHeight;
              _curIndex = -1;
            }
          } else if (
            _heightLeft <
            PunchSummaryReportConstant.MAX_ROW_HEIGHT * 5
          ) {
            afterCalculating.add['items4Pdf'] && afterCalculating.add['items4Pdf'].length > 0 ? _resultFinal[_curIndex].push(
              afterCalculating.add as PunchSummaryRenderModel
            ) : null;
            _heightLeft = _expectedContentHeight;
            _curIndex = -1;
          } else {
            afterCalculating.add['items4Pdf'] && afterCalculating.add['items4Pdf'].length > 0 ? _resultFinal[_curIndex].push(
              afterCalculating.add as PunchSummaryRenderModel
            ) : null;
          }

          _source = this.deepCopy(afterCalculating.left);
          _balance = this.deepCopy(afterCalculating.left);
        }
      });
    return _resultFinal;
  }
  //#endregion Preview section

  //#region Export section
  export = () => {
    switch (this.currentReportType.reportTypeId) {
      case this.reportTypeModels[0].reportTypeId:
        this.exportSkylineR();
        break;
      case this.reportTypeModels[1].reportTypeId:
        this.exportSystemR();
        break;
      case this.reportTypeModels[2].reportTypeId:
        this.exportSubSystemR();
        break;
      case this.reportTypeModels[3].reportTypeId:
        this.exportDetailItrR();
        break;
      case this.reportTypeModels[4].reportTypeId:
        this.exportPunchSummaryR();
        break;
    }
  };

  exportSkylineR = () => {
    let _milestoneName = null;
    if (this.reportType === "EXCEL") {
      this.isDisableAnother = true;
      this.isLoadingExportBtn = true;
      if (this.filterModel.milestones) {
        const _selected = this.lookupData.milestones.find(
          (_m) => _m.id === this.filterModel.milestones
        );
        _milestoneName = _selected.value;
      }
      let _newCommand: SkylineReportCommand = {
        ...new SkylineReportCommand(),
        ...{
          module: ModuleReport.skyline,
          typeExport: this.reportType,
          projectKey: this.projectKey,
          dateFrom: this.removeTimeZoneOut(this.filterModel.dateFrom),
          dateTo: this.removeTimeZoneOut(this.filterModel.dateTo),
          milestoneId: this.filterModel.milestones,
          milestoneName: _milestoneName,
        },
      };
      this.pReportService.exportSkylineReportToExcel(_newCommand).subscribe(
        (res) => {
          const _response = res ? (res as any) : null;
          if (!_response) {
            return;
          }
          this.onSaveFile(_response);
          this.handleSuccess({});
        },
        (err) => {
          this.handleErrorAll(err, {});
        }
      );
    } else {
      this.isDisableAnother = true;
      this.isLoadingExportBtn = true;
      if (this.filterModel.milestones) {
        const _selected = this.lookupData.milestones.find(
          (_m) => _m.id === this.filterModel.milestones
        );
        _milestoneName = _selected.value;
      }
      let _newCommand: SkylineReportCommand = {
        ...new SkylineReportCommand(),
        ...{
          module: ModuleReport.skyline,
          typeExport: this.reportType,
          projectKey: this.projectKey,
          dateFrom: this.removeTimeZoneOut(this.filterModel.dateFrom),
          dateTo: this.removeTimeZoneOut(this.filterModel.dateTo),
          milestoneId: this.filterModel.milestones,
          milestoneName: _milestoneName,
        },
      };
      this.pReportService.getSkylineReportFile(_newCommand).subscribe(
        (res) => {
          const _response =
            res && res.content ? ({ ...res.content } as any) : null;
          if (!_response) {
            return;
          }
          this.assign4AllModel(_response);
          // Initialize pdf
          setTimeout(() => {
            this.downloadPdf("Skyline_Report.pdf");
          }, 100);
        },
        (err) => {
          this.handleErrorAll(err, {});
        }
      );
    }
  };

  exportSystemR = () => {
    if (this.reportType === "EXCEL") {
      this.isDisableAnother = true;
      this.isLoadingExportBtn = true;
      let _newCommand: SystemReportCommand = new SystemReportCommand();
      this.lookupData.multiSystems.forEach((_item) => {
        if (
          this.filterModel.multiSystems &&
          this.filterModel.multiSystems.indexOf(_item.id.toString()) > -1
        ) {
          _newCommand.systemIds.push(_item.id.toString());
          _newCommand.listSystemNo;
        }
      });

      _newCommand = {
        ..._newCommand,
        ...{
          module: ModuleReport.system,
          typeExport: this.reportType,
          projectKey: this.projectKey,
        },
      };
      this.pReportService.exportSkylineReportToExcel(_newCommand).subscribe(
        (res) => {
          const _response = res ? (res as any) : null;
          if (!_response) {
            return;
          }
          this.onSaveFile(_response);
          this.handleSuccess({});
        },
        (err) => {
          this.handleErrorAll(err, {});
        }
      );
    } else {
      this.isDisableAnother = true;
      this.isLoadingExportBtn = true;
      let _newCommand: SystemReportCommand = new SystemReportCommand();
      this.lookupData.multiSystems.forEach((_item) => {
        if (
          this.filterModel.multiSystems &&
          this.filterModel.multiSystems.indexOf(_item.id.toString()) > -1
        ) {
          _newCommand.systemIds.push(_item.id.toString());
          _newCommand.listSystemNo.push(_item.value);
        }
      });

      _newCommand = {
        ..._newCommand,
        ...{
          module: ModuleReport.system,
          typeExport: this.reportType,
          projectKey: this.projectKey,
        },
      };

      this.pReportService.getSystemReportFile(_newCommand).subscribe(
        (res) => {
          const _response =
            res && res.content ? ({ ...res.content } as any) : null;
          if (!_response) {
            return;
          }
          this.assign4AllModel(_response);
          // Initialize pdf
          setTimeout(() => {
            this.downloadPdf("System_Summary.pdf");
          }, 100);
        },
        (err) => {
          this.handleErrorAll(err, {});
        }
      );
    }
  };

  exportSubSystemR = () => {
    if (this.reportType === "EXCEL") {
      this.isDisableAnother = true;
      this.isLoadingExportBtn = true;
      let _newCommand: SubSystemReportCommand = new SubSystemReportCommand();
      this.lookupData.multiSystems.forEach((_item) => {
        if (
          this.filterModel.multiSystems &&
          this.filterModel.multiSystems.indexOf(_item.id.toString()) > -1
        ) {
          _newCommand.systemIds.push(_item.id.toString());
          _newCommand.listSystemNo.push(_item.value);
        }
      });

      this.lookupData.multiSubSystems.forEach((_item) => {
        if (
          this.filterModel.multiSubSystems &&
          this.filterModel.multiSubSystems.indexOf(_item.id.toString()) > -1
        ) {
          _newCommand.subSystemIds.push(_item.id.toString());
          _newCommand.listSubSystemNo.push(_item.value);
        }
      });

      _newCommand = {
        ..._newCommand,
        ...{
          module: ModuleReport.subSystem,
          typeExport: this.reportType,
          projectKey: this.projectKey,
        },
      };
      this.pReportService.exportSkylineReportToExcel(_newCommand).subscribe(
        (res) => {
          const _response = res ? (res as any) : null;
          if (!_response) {
            return;
          }
          this.onSaveFile(_response);
          this.handleSuccess({});
        },
        (err) => {
          this.handleErrorAll(err, {});
        }
      );
    } else {
      this.isDisableAnother = true;
      this.isLoadingExportBtn = true;
      let _newCommand: SubSystemReportCommand = new SubSystemReportCommand();
      this.lookupData.multiSystems.forEach((_item) => {
        if (
          this.filterModel.multiSystems &&
          this.filterModel.multiSystems.indexOf(_item.id.toString()) > -1
        ) {
          _newCommand.systemIds.push(_item.id.toString());
          _newCommand.listSystemNo.push(_item.value);
        }
      });

      this.lookupData.multiSubSystems.forEach((_item) => {
        if (
          this.filterModel.multiSubSystems &&
          this.filterModel.multiSubSystems.indexOf(_item.id.toString()) > -1
        ) {
          _newCommand.subSystemIds.push(_item.id.toString());
          _newCommand.listSubSystemNo.push(_item.value);
        }
      });

      _newCommand = {
        ..._newCommand,
        ...{
          module: ModuleReport.system,
          typeExport: this.reportType,
          projectKey: this.projectKey,
        },
      };

      this.pReportService.getSubSystemReportFile(_newCommand).subscribe(
        (res) => {
          const _response =
            res && res.content ? ({ ...res.content } as any) : null;
          if (!_response) {
            return;
          }
          this.assign4AllModel(_response);
          // Initialize pdf
          setTimeout(() => {
            this.downloadPdf("SubSystem_Summary.pdf");
          }, 100);
        },
        (err) => {
          this.handleErrorAll(err, {});
        }
      );
    }
  };

  exportDetailItrR = () => {
    this.isDisableAnother = true;
    this.isLoadingExportBtn = true;
    let _newCommand: DetailItrReportCommand = new DetailItrReportCommand();

    let _filterCriteria = "";
    let _nos = {
      system: new Array(),
      subsystem: new Array(),
      milestone: new Array(),
      workPack: new Array(),
      jobCards: new Array(),
      discipline: new Array(),
      tag: new Array(),
      tagDescription: this.filterModel.descriptions,
      status: null,
    };

    _nos.system = this.convertArray2StringList("multiSystems") as Array<string>;
    _nos.subsystem = this.convertArray2StringList(
      "multiSubSystems"
    ) as Array<string>;
    _nos.discipline = this.convertArray2StringList(
      "multiDisciplines"
    ) as Array<string>;
    _nos.milestone = this.convertArray2StringList(
      "multiMilestones"
    ) as Array<string>;
    _nos.workPack = this.convertArray2StringList(
      "multiWorkPacks"
    ) as Array<string>;
    _nos.tag = this.convertArray2StringList("multiTagNos") as Array<string>;
    _nos.status = this.convertArray2StringList(
      "itrStatuses",
      "status"
    ) as Array<string>;

    _filterCriteria = `
    ${
      _nos.system.length > 0
        ? " - System: " + _nos.system.join(", ")
        : ""
      }
    ${
      _nos.subsystem.length > 0
        ? " - SubSystem: " + _nos.subsystem.join(", ")
        : ""
      }
    ${
      _nos.milestone.length > 0
        ? " - Milestone: " + _nos.milestone.join(", ")
        : ""
      }
    ${
      _nos.workPack.length > 0
        ? " - Work Pack: " + _nos.workPack.join(", ")
        : ""
      }
    ${
      _nos.discipline.length > 0
        ? " - Discipline: " + _nos.discipline.join(", ")
        : ""
      }
    ${_nos.tag.length > 0 ? " - Tag: " + _nos.tag.join(", ") : ""}
    ${_nos.tagDescription ? " - Tag Description: " + _nos.tagDescription : ""}
    ${_nos.status ? " - ITR Status: " + _nos.status : ""}`;

    _newCommand = {
      ..._newCommand,
      ...{
        systemIds: this.filterModel.multiSystems,
        subSystemIds: this.filterModel.multiSubSystems,
        tagIds: this.filterModel.multiTagNos,
        disciplineIds: this.filterModel.multiDisciplines,
        milestoneIds: this.filterModel.multiMilestones,
        workPackIds: this.filterModel.multiWorkPacks,
        tagDescription: this.filterModel.descriptions,
        status: _nos.status || null,
        filter: _filterCriteria,
      },
      ...{
        module: ModuleReport.itr,
        typeExport: this.reportType,
        projectKey: this.projectKey,
      },
    };

    if (this.reportType === "EXCEL") {
      this.pReportService.exportSkylineReportToExcel(_newCommand).subscribe(
        (res) => {
          const _response = res ? (res as any) : null;
          if (!_response) {
            return;
          }
          this.onSaveFile(_response);
          this.handleSuccess({});
        },
        (err) => {
          this.handleErrorAll(err, {});
        }
      );
    } else {
      this.pReportService.getDetailedItrReportData(_newCommand).subscribe(
        (res) => {
          const _response =
            res && res.content ? ({ ...res.content } as any) : null;
          if (!_response) {
            return;
          }
          this.assign4AllModel(_response);
          // Initialize pdf
          setTimeout(() => {
            this.downloadPdf("Detail_Itr_Report.pdf");
          }, 100);
        },
        (err) => {
          this.handleErrorAll(err, {});
        }
      );
    }
  };

  exportPunchSummaryR = () => {
    this.isDisableAnother = true;
    this.isLoadingExportBtn = true;
    let _newCommand: PunchSummaryReportCommand = new PunchSummaryReportCommand();
    let _filterCriteria = "";
    let _nos = {
      system: new Array(),
      subsystem: new Array(),
      discipline: new Array(),
      punch: new Array(),
      type: new Array(),
      drawing: new Array(),
      tag: new Array(),
      description: this.filterModel.descriptions,
      correction: this.filterModel.correctAction,
      location: new Array(),
      materialR:
        this.filterModel.materialsRequired === 1
          ? "Yes"
          : this.filterModel.materialsRequired === 2
            ? "No"
            : "",
      materialN: new Array(),
      status: null,
    };
    _nos.system = this.convertArray2StringList("multiSystems") as Array<string>;
    _nos.subsystem = this.convertArray2StringList(
      "multiSubSystems"
    ) as Array<string>;
    _nos.discipline = this.convertArray2StringList(
      "multiDisciplines"
    ) as Array<string>;
    _nos.punch = this.convertArray2StringList("multiPunchNo") as Array<string>;
    _nos.type = this.convertArray2StringList("multiTypes") as Array<string>;
    _nos.drawing = this.convertArray2StringList(
      "multiDrawings"
    ) as Array<string>;
    _nos.tag = this.convertArray2StringList("multiTagNos") as Array<string>;
    _nos.location = this.convertArray2StringList(
      "multiLocations"
    ) as Array<string>;
    _nos.materialN = this.convertArray2StringList(
      "multiMaterialNo"
    ) as Array<string>;
    _nos.status = this.convertArray2StringList(
      "punchStatuses",
      "status"
    ) as Array<string>;

    _filterCriteria = `
    ${
      _nos.system && _nos.system.length > 0
        ? " - System: " + _nos.system.join(", ")
        : ""
      }
    ${
      _nos.subsystem && _nos.subsystem.length > 0
        ? " - SubSystem: " + _nos.subsystem.join(", ")
        : ""
      }
    ${
      _nos.discipline && _nos.discipline.length > 0
        ? " - Discipline: " + _nos.discipline.join(", ")
        : ""
      }
    ${
      _nos.punch && _nos.punch.length > 0
        ? " - Punch No: " + _nos.punch.join(", ")
        : ""
      }
    ${
      _nos.type && _nos.type.length > 0
        ? " - Type: " + _nos.type.join(", ")
        : ""
      }
    ${
      _nos.drawing && _nos.drawing.length > 0
        ? " - Drawing: " + _nos.drawing.join(", ")
        : ""
      }
    ${_nos.tag && _nos.tag.length > 0 ? " - Tag: " + _nos.tag.join(", ") : ""}
    ${_nos.description ? " - Description: " + _nos.description : ""}
    ${_nos.correction ? " - Correction Action: " + _nos.correction : ""}
    ${
      _nos.location && _nos.location.length > 0
        ? " - Location: " + _nos.location.join(", ")
        : ""
      }
    ${
      _nos.materialR && _nos.materialR.length > 0
        ? " - Material Required: " + _nos.materialR
        : ""
      }
    ${
      _nos.materialN && _nos.materialN.length > 0
        ? " - Material No: " + _nos.materialN.join(", ")
        : ""
      }
    ${_nos.status ? " - Punch Status: " + _nos.status : ""}`;

    _newCommand = {
      ..._newCommand,
      ...{
        systemIds: this.filterModel.multiSystems,
        subSystemIds: this.filterModel.multiSubSystems,
        tagIds: this.filterModel.multiTagNos,
        disciplineIds: this.filterModel.multiDisciplines,
        punchTypeIds: this.filterModel.multiTypes,
        punchIds: this.filterModel.multiPunchNo,
        drawingIds: this.filterModel.multiDrawings,
        locationIds: this.filterModel.multiLocations,
        materialsRequired:
          this.filterModel.materialsRequired === 1
            ? true
            : this.filterModel.materialsRequired === 2
              ? false
              : null,
        orderIds: this.filterModel.multiMaterialNo,
        punchDescription: this.filterModel.descriptions,
        correctiveAction: this.filterModel.correctAction,
        status: _nos.status || null,
        filter: _filterCriteria,
      },
      ...{
        module: ModuleReport.punch,
        typeExport: this.reportType,
        projectKey: this.projectKey,
      },
    };

    if (this.reportType === "EXCEL") {
      this.pReportService.exportSkylineReportToExcel(_newCommand).subscribe(
        (res) => {
          const _response = res ? (res as any) : null;
          if (!_response) {
            return;
          }
          this.onSaveFile(_response);
          this.handleSuccess({});
        },
        (err) => {
          this.handleErrorAll(err, {});
        }
      );
    } else {
      this.pReportService.getPunchSummaryReportData(_newCommand).subscribe(
        (res) => {
          const _response =
            res && res.content ? ({ ...res.content } as any) : null;
          if (!_response) {
            return;
          }
          this.assign4AllModel(_response);
          // Initialize pdf
          setTimeout(() => {
            this.downloadPdf("Punchlist_Summary_Report.pdf");
          }, 100);
        },
        (err) => {
          this.handleErrorAll(err, {});
        }
      );
    }
  };
  //#endregion Export section

  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  };

  checkDependentBy = (key: string) => {
    if (
      this.fieldNames[key]?.dependentBy &&
      this.fieldNames[key].dependentBy.length > 0
    ) {
      return this.fieldNames[key].dependentBy.some(
        (dependent: any) => this.filterModel[dependent.key] === dependent.value
      );
    }

    return true;
  };

  //#region Utils
  calculateMax = {
    skylineCols: (source: SkylineRenderModel, sectionWidth: number) => {
      if (source && source.handoverItems && source.handoverItems.length === 0) {
        return {
          add: source,
          left: null,
          widthLeft: sectionWidth - SkylineReportConstant.MAX_CELL_WIDTH,
        };
      }
      let _leftSource: SkylineRenderModel = null;
      const _sourceItemsLen = Array.isArray(source.handoverItems)
        ? source.handoverItems.length
        : 0;
      const _leftCols = Math.floor(
        sectionWidth /
        (SkylineReportConstant.MAX_CELL_WIDTH +
          SkylineReportConstant.MAX_COL_MARGIN)
      );
      const _itemCols = Math.ceil(
        _sourceItemsLen / SkylineReportConstant.MAX_ROWS_PDF
      );

      let _result = {};
      if (_leftCols > _itemCols) {
        _result = { ...source, ...{ items4Pdf: [...source.handoverItems] } };
        sectionWidth -=
          _itemCols *
          (SkylineReportConstant.MAX_CELL_WIDTH +
            SkylineReportConstant.MAX_COL_MARGIN);
      } else {
        const _destination = _leftCols * SkylineReportConstant.MAX_ROWS_PDF;
        _result = {
          ...source,
          ...{ items4Pdf: [...source.handoverItems.slice(0, _destination)] },
        };
        _leftSource = {
          ...source,
          ...{
            handoverItems: [
              ...source.handoverItems.slice(_destination, _sourceItemsLen),
            ],
          },
        };
        sectionWidth -=
          _leftCols *
          (SkylineReportConstant.MAX_CELL_WIDTH +
            SkylineReportConstant.MAX_COL_MARGIN);
      }
      return {
        add: _result,
        left: _leftSource,
        widthLeft: sectionWidth,
      };
    },
    detailItrRows: (source: DetailItrRenderModel, sectionHeight: number) => {
      let _leftSource: DetailItrRenderModel = null;
      const _sourceItemsLen = Array.isArray(source.itrTags)
        ? source.itrTags.length
        : 0;
      const _maxRows = Math.floor(
        sectionHeight / DetailItrReportConstant.MAX_ROW_HEIGHT
      );
      const _rows4Title = source.subSystemId ? 4 : 3;
      let _rows = 0;
      let _currentIndex = -1;
      let _result = {};

      while (_rows <= _maxRows - _rows4Title) {
        if (
          _currentIndex + 1 < _sourceItemsLen &&
          source.itrTags[_currentIndex + 1].rowNumber + _rows >
          _maxRows - _rows4Title
        ) {
          break;
        }
        _currentIndex += 1;
        if (_currentIndex + 1 >= _sourceItemsLen) {
          if (
            source.itrTags[_currentIndex].rowNumber + _rows >
            _maxRows - _rows4Title
          ) {
            _currentIndex -= 1;
          } else {
            _rows += source.itrTags[_currentIndex].rowNumber;
          }
          break;
        }
        _rows += source.itrTags[_currentIndex].rowNumber;
      }

      _result = {
        ...source,
        ...{ items4Pdf: [...source.itrTags.slice(0, _currentIndex + 1)] },
      };
      _leftSource =
        _currentIndex < _sourceItemsLen - 1
          ? {
            ...source,
            ...{
              itrTags: [
                ...source.itrTags.slice(_currentIndex + 1, _sourceItemsLen),
              ],
            },
          }
          : null;
      sectionHeight -=
        DetailItrReportConstant.MAX_ROW_HEIGHT * (_rows + _rows4Title);
      return {
        add: _result,
        left: _leftSource,
        heightLeft: sectionHeight,
      };
    },
    punchSummaryRows: (
      source: PunchSummaryRenderModel,
      sectionHeight: number
    ) => {
      let _leftSource: PunchSummaryRenderModel = null;
      const _sourceItemsLen = Array.isArray(source.punchTags)
        ? source.punchTags.length
        : 0;
      const _maxRows = Math.floor(
        sectionHeight / PunchSummaryReportConstant.MAX_ROW_HEIGHT
      );
      const _rows4Title = source.subSystemId ? 4 : 3;
      let _rows = 0;
      let _currentIndex = -1;
      let _result = {};

      while (_rows <= _maxRows - _rows4Title) {
        if (
          _currentIndex + 1 < _sourceItemsLen &&
          source.punchTags[_currentIndex + 1].rowNumber + _rows >
          _maxRows - _rows4Title
        ) {
          break;
        }
        _currentIndex += 1;
        if (_currentIndex + 1 >= _sourceItemsLen) {
          if (
            source.punchTags[_currentIndex].rowNumber + _rows >
            _maxRows - _rows4Title
          ) {
            _currentIndex -= 1;
          } else {
            _rows += source.punchTags[_currentIndex].rowNumber;
          }
          break;
        }
        _rows += source.punchTags[_currentIndex].rowNumber;
      }

      _result = {
        ...source,
        ...{ items4Pdf: [...source.punchTags.slice(0, _currentIndex + 1)] },
      };
      _leftSource =
        _currentIndex < _sourceItemsLen - 1
          ? {
            ...source,
            ...{
              punchTags: [
                ...source.punchTags.slice(_currentIndex + 1, _sourceItemsLen),
              ],
            },
          }
          : null;
      sectionHeight -=
        PunchSummaryReportConstant.MAX_ROW_HEIGHT * (_rows + _rows4Title);
      return {
        add: _result,
        left: _leftSource,
        heightLeft: sectionHeight,
      };
    },
  };

  setFieldType = (fieldNames: string) => {
    switch (fieldNames) {
      case "descriptions":
      case "correctAction":
        return Type2Switch.text;
      case "dateFrom":
      case "dateTo":
        return Type2Switch.date;
      case "multiSystems":
      case "multiSubSystems":
      case "multiTagNos":
      case "multiDisciplines":
      case "multiWorkPacks":
      case "multiJobCards":
      case "multiMilestones":
      case "multiPunchNo":
      case "multiTypes":
      case "multiDrawings":
      case "multiLocations":
      case "multiMaterialNo":
        return Type2Switch.multiSelect;
      default:
        return Type2Switch.dropdown;
    }
  };

  downloadPdf(fileName: string) {
    this._ngZone.runOutsideAngular(() => {
      let _funcs = new Array();
      const doc = new jsPDF("l", "mm", "a4");
      const isSystemView =
        document
          .querySelector(".container-content-preview")
          ?.classList.contains("pt-4") || false;
      if (isSystemView) this.removePaddingContainer();
      this.dataModel4Pdf.forEach((_page, i) => {
        const data = document.getElementById(`pdfContent_${i}`);
        const _isScale =
          this.currentReportType.reportTypeId ===
          this.reportTypeModels[1].reportTypeId ||
          this.currentReportType.reportTypeId ===
          this.reportTypeModels[2].reportTypeId;
        // console.log('get browser zoom', ((window.outerWidth - 10) / window.innerWidth) * 100); //only true with chrome and Edge

        _funcs.push(this.convertHtml2Canvas(data, _isScale));
      });
      if (isSystemView) this.addPaddingContainer();

      Promise.all(_funcs).then((res) => {
        // const _A4MaxWidth = 208;
        // const _A4MaxHeight = 297;
        const _A4MaxWidth = 297;
        const _A4MaxHeight = 208;
        const imgWidth = _A4MaxWidth - 20;
        let positionX = 10; // x2
        let positionY = 12; // x2
        res.forEach((_canvas, i) => {
          const imgHeight = Math.floor(
            (_canvas.height * imgWidth) / _canvas.width
          );
          if (i !== 0) {
            doc.addPage();
          }
          const contentDataURL = _canvas.toDataURL("image/png", 1.0);
          doc.addImage(
            contentDataURL,
            "PNG",
            positionX,
            positionY,
            imgWidth,
            imgHeight
          );
        });
        this.handleSuccess({});
        setTimeout(() => {
          doc.save(fileName);
        }, 10);
      });
    });
  }

  convertHtml2Canvas(data: HTMLElement, isScale = false) {
    const A4MaxWidth = 297;
    const A4MaxHeight = 208;
    const imgWidth = A4MaxWidth - 20;
    const eHeight = Math.floor(
      ((A4MaxHeight - 24) * data.offsetWidth) / imgWidth
    );
    return new Promise((resolve, reject) => {
      html2canvas(data, {
        logging: false,
        width: data.offsetWidth + 10,
        height: eHeight + 20,
        scrollY: -window.scrollY,
        onclone: (cloneDoc) => {
          const _target = cloneDoc.getElementById(data.id);
          const _targetContent = _target.getElementsByClassName("content")[0];
          const _asCanvas = {
            height: _target.offsetHeight,
            heightContent: _targetContent["offsetHeight"],
            width: _target.offsetWidth,
            widthContent: _targetContent["offsetWidth"],
          };

          const _restHeight = _asCanvas.height - _asCanvas.heightContent;
          const _expectedContentHeight = eHeight - _restHeight - 10;
          const _elContent = cloneDoc.getElementById(
            _targetContent.firstElementChild.firstElementChild.id
          );
          _elContent.style.width = "100%";

          if (_asCanvas.heightContent < _expectedContentHeight) {
            _elContent.style.height = `${_expectedContentHeight - 15}px`;
            // recalculate height
            _target.style.height = `${
              _asCanvas.height -
              _asCanvas.heightContent +
              _expectedContentHeight
              }px`;
          }
          cloneDoc.getElementById("previewerBody").style.height = "100%";

          if (isScale) {
            const _el = cloneDoc.getElementById(
              _elContent.firstElementChild.id
            );
            const _scale =
              _elContent.offsetWidth < _el.offsetWidth
                ? _elContent.offsetWidth / _el.offsetWidth
                : 1;

            if (_scale !== 1) {
              _el.style.transform = `translate(-50%) scale(${_scale})`;
            }
          }
          const _page = _target.getAttribute("title");
          _target.appendChild(this._createPage4Pdf(cloneDoc, _page));
        },
      }).then((canvas) => {
        resolve(canvas);
      });
    });
  }
  addPaddingContainer() {
    document
      .querySelectorAll(".container-content-preview")
      .forEach((element) => {
        element.classList.add("pt-4");
      });
  }
  removePaddingContainer() {
    document
      .querySelectorAll(".container-content-preview")
      .forEach((element) => {
        element.classList.remove("pt-4");
      });
  }

  _createPage4Pdf(doc: Document, page: string): HTMLElement {
    const _wrapper = doc.createElement("div");
    _wrapper.style.width = "100%";
    _wrapper.style.paddingTop = "10px";
    _wrapper.style.textAlign = "center";
    const _page = doc.createElement("strong");
    _page.appendChild(doc.createTextNode(page));
    _wrapper.appendChild(_page);

    return _wrapper;
  }

  onSaveFile(exportModel: ExportModel) {
    if (exportModel == undefined || exportModel == null) return;

    var bytes = this.base64ToArrayBuffer(exportModel.fileContent);
    var blob = new Blob([bytes], { type: exportModel.contentType });

    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    var edge = ua.indexOf("Edge");
    if (
      msie > 0 ||
      edge > 0 ||
      !!navigator.userAgent.match(/Trident.*rv\:11\./)
    ) {
      window.navigator.msSaveOrOpenBlob(blob, exportModel.fileName);
    } else {
      var url = window.URL;
      var downloadUrl = url.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = downloadUrl;
      a.download = exportModel.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  base64ToArrayBuffer = (base64: string) => {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
      var ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  };

  deepCopy(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) {
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

    throw new Error("Unable to copy obj! Its type isn't supported.");
  }

  removeTimeZoneOut(value: string) {
    if (!value) {
      return null;
    }
    const m = new Date(value);
    return `${m.getDate()} ${m.getMonth() + 1} ${m.getFullYear()}`;
  }

  convertArray2StringList(keySource: string, specific: string = "all") {
    let _result: Array<string> | string;
    switch (specific) {
      case "status":
        _result = "";
        this.lookupData[keySource].forEach((_item) => {
          if (this.filterModel[keySource] === _item.id) {
            _result = _item.value;
          }
        });
        return !!_result ? _result : "";
      default:
        _result = new Array();
        this.lookupData[keySource].forEach((_item) => {
          if (
            this.filterModel[keySource] &&
            this.filterModel[keySource].indexOf(_item.id.toString()) > -1
          ) {
            (_result as Array<string>).push(_item.value);
          }
        });
        return _result;
    }
  }

  handleSuccess = ({
    isPreview = false,
    isLoadingPreview = false,
    isLoadingExport = false,
  }) => {
    this.isLoadingPreviewBtn = isLoadingPreview;
    this.isLoadingExportBtn = isLoadingExport;
    this.isDisableAnother = false;
    if (isPreview) {
      this.isShowPreview = true;
    }
  };

  handleErrorAll = (
    err,
    { isLookup = false, isLoadingExport = false, isLoadingPreview = false }
  ) => {
    if (!isLookup) {
      this.isLoadingExportBtn = isLoadingExport;
      this.isLoadingPreviewBtn = isLoadingPreview;
      this.isDisableAnother = false;
    }

    this.authErrorHandler.handleError(err.message);
  };
  //#endregion Utils
}
