import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import {
  LayoutReportModel,
  SkylineRenderModel,
} from "src/app/shared/models/progress-tab/progress-tab.model";

@Component({
  selector: "layout-exported-page",
  templateUrl: "./layout-exported-page.component.html",
  styleUrls: ["./layout-exported-page.component.scss"],
})
export class LayoutExportedPageComponent implements OnInit, OnChanges {
  @Input() layoutReportModel: LayoutReportModel = new LayoutReportModel();
  @Input() data4Content: Array<SkylineRenderModel> | any = null;
  @Input() isPdfShow: boolean = true;
  @Input() layout4: string = "skyline";

  //#region common variables
  prefix = "data:image/png;base64,";
  filterCDefaults = {
    skyline: "Filter Criteria - All",
    system: "Filter Criteria - All",
    subSystem: "Filter Criteria - All",
    itr: "Filter Criteria - All ",
    punchSummary: "Filter Criteria - All",
  };
  filterCPrefix = {
    skyline: "Filter Criteria ",
    system: "Filter Criteria ",
    subSystem: "Filter Criteria ",
    itr: "Filter Criteria ",
    punchSummary: "Filter Criteria ",
  };
  //#endregion common variables

  //#region boolean variables
  reportTypesStandard = {
    skyline: "skyline",
    system: "system",
    subSystem: "subSystem",
    itr: "itr",
    punchSummary: "punchSummary",
  };
  reportTypeInUse = this.deepCopy(this.reportTypesStandard);
  //#endregion boolean variables

  ngOnInit() {
    console.log(this.layoutReportModel);
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(this.layoutReportModel);
  }

  resetFlags() {
    this.reportTypeInUse = this.deepCopy(this.reportTypesStandard);
  }

  // Utils
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
}
