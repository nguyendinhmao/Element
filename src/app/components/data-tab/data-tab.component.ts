import { Component, OnInit } from "@angular/core";
import { ClientState } from "src/app/shared/services/client/client-state";
import { DataTabModel } from "src/app/shared/models/data-tab/data-tab.model";
import { MockDataTableApi } from "src/app/shared/mocks/mock.data-tab";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { NgForm } from "@angular/forms";
import { Subscription } from "rxjs/internal/Subscription";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthErrorHandler } from "src/app/shared/services/auth/auth.error-handler";
import { ModuleProjectDefaultModel } from "src/app/shared/models/module/module.model";
import { JwtTokenHelper } from "src/app/shared/common/jwt-token-helper/jwt-token-helper";

@Component({
  selector: "data-tab",
  styleUrls: ["./data-tab.component.scss"],
  templateUrl: "./data-tab.component.html",
})
export class DataTabComponent implements OnInit {
  isToggleRightSide: boolean = true;
  isCollapse: boolean = false;

  isDataLocation: boolean;
  isDataEquipment: boolean;
  isDataTabSystem: boolean;
  isDataSubSystem: boolean;
  isDataDiscipline: boolean;
  isDataWorkPack: boolean;
  isProcessing: boolean;
  isTagNo: boolean;
  isHandover: boolean;
  isMilestone: boolean;
  isJobCard: boolean;
  isPunchList: boolean;
  isPunchItem: boolean;
  isDrawingType: boolean;
  isDrawing: boolean;
  isMaterial: boolean;
  isOrder: boolean;
  isPunchType: boolean;
  isStandardPuch: boolean;
  isChangeType: boolean;
  isPreservationElement: boolean;
  isRecord: boolean;

  dataTabModels: DataTabModel[] = [];
  dataTabModel: DataTabModel = new DataTabModel();
  private mockDataTableApi = new MockDataTableApi();
  moduleProjectDefaultModel: ModuleProjectDefaultModel = new ModuleProjectDefaultModel();

  sub: Subscription;
  projectKey: string;
  projectId: string;

  constructor(
    private clientState: ClientState,
    private authErrorHandler: AuthErrorHandler,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.sub = this.route.params.subscribe((params) => {
      this.projectKey = params["projectKey"];
      if (!this.projectKey) {
        this.router.navigate([""]);
      }
    });
  }

  public ngOnInit() {
    //--- Get datatable
    this.onGetDatatable();

    this.moduleProjectDefaultModel = JwtTokenHelper.GetModuleProjectDefault();
    if (this.moduleProjectDefaultModel) {
      this.projectId = this.moduleProjectDefaultModel.defaultProjectId;
    }
  }

  //--- Get datatable
  onGetDatatable = () => {
    this.clientState.isBusy = true;
    this.mockDataTableApi.getDataTab().subscribe(
      (res) => {
        this.dataTabModels = res.content
          ? <DataTabModel[]>[...res.content]
          : [];
        this.clientState.isBusy = false;
      },
      (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      }
    );
  };

  //--- Toggle right side
  onToggleRightSide = () => {
    this.isToggleRightSide = !this.isToggleRightSide;
  };

  //--- Collapse
  onCollapse = () => {
    this.isCollapse = !this.isCollapse;
  };

  //--- Get data
  onGetData = (form: NgForm) => {
    if (!form.valid) {
      return;
    }

    const dataTabId = this.dataTabModel.dataTabId;
    this.isDataDiscipline = dataTabId === 3 ? true : false;
    this.isDataTabSystem = dataTabId === 5 ? true : false;
    this.isDataLocation = dataTabId === 7 ? true : false;
    this.isDataSubSystem = dataTabId === 2 ? true : false;
    this.isDataEquipment = dataTabId === 8 ? true : false;
    this.isTagNo = dataTabId === 1 ? true : false;
    this.isDataWorkPack = dataTabId === 6 ? true : false;
    this.isHandover = dataTabId === 9 ? true : false;
    this.isMilestone = dataTabId === 10 ? true : false;
    this.isJobCard = dataTabId === 11 ? true : false;
    this.isPunchList = dataTabId === 12 ? true : false;
    this.isPunchItem = dataTabId === 13 ? true : false;
    this.isDrawingType = dataTabId === 14 ? true : false;
    this.isDrawing = dataTabId === 4 ? true : false;
    this.isMaterial = dataTabId === 15 ? true : false;
    this.isOrder = dataTabId === 16 ? true : false;
    this.isPunchType = dataTabId === 17 ? true : false;
    this.isStandardPuch = dataTabId === 18 ? true : false;
    this.isChangeType = dataTabId === 19 ? true : false;
    this.isPreservationElement = dataTabId === 20 ? true : false;
    this.isRecord = dataTabId === 21 ? true : false;
    // this.isProcessing = dataTabId === 19 ? true : false;
  };
}
