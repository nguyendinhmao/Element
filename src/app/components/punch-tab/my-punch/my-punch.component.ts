import { Component } from "@angular/core";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { ActivatedRoute, Router } from "@angular/router";
import { ClientState } from "src/app/shared/services/client/client-state";
import { JwtTokenHelper } from "src/app/shared/common/jwt-token-helper/jwt-token-helper";
import { AuthInProjectDto } from "src/app/shared/models/project-management/project-management.model";
import { PermissionsViews } from "src/app/shared/common/constants/permissions";
import { PunchPageService } from "src/app/shared/services/api/punch-page/punch-page.service";
import { CounterUserPunchesModel, PunchPageListModel } from "src/app/shared/models/punch-page/punch-page.model";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { AuthErrorHandler } from "src/app/shared/services/auth/auth.error-handler";
import { StoreNames } from 'src/app/shared/models/common/common.model';
import { IdbService } from 'src/app/shared/services';
import { PunchStatuses } from 'src/app/shared/models/punch-item/punch-item.model';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';

@Component({
  selector: "my-punch",
  styleUrls: ["./my-punch.component.scss"],
  templateUrl: "./my-punch.component.html",
})

export class MyPunchComponent {
  //--- Boolean
  isAddNewState: boolean;
  isInitLoadData = true;
  isApproveLoadData = true;
  isSignatureLoadData = true;

  permissionsViews = PermissionsViews;
  authInProjectDto: AuthInProjectDto[] = [];
  punchCounter: CounterUserPunchesModel;

  //--- Variables
  textLabel: string;
  moduleKey: string;
  projectKey: string;
  hiddenApproveBadge = false;
  hiddenCreateBadge = false;
  hiddenSignOffBadge = false;
  _storeName: string;

  _tabNames = {
    create: "Create",
    approve: "Approve",
    sign: "Sign-off",
  }
  _actionTypes = {
    create: "Create",
    approve: "Approve",
    sign: "Sign",
  }
  indexTab: number;
  actionType: string = '';
  tagNo: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private punchPageService: PunchPageService,
    private authErrorHandler: AuthErrorHandler,
    private idbService: IdbService,
    private clientState: ClientState,
  ) {
    this._storeName = StoreNames.punches;
    this.route.params.subscribe((params) => {
      this.moduleKey = params["moduleKey"];
      this.projectKey = params["projectKey"];
      if (!this.moduleKey || !this.projectKey) {
        this.router.navigate([""]);
      }
    });

    this.route.queryParams.subscribe(params => {
      this.actionType = params['actionType'] || '';
      this.tagNo = params['tagNo'] || '';
      switch (this.actionType.toLowerCase()) {
        case this._actionTypes.approve.toLowerCase():
          this.textLabel = this._tabNames.approve;
          this.indexTab = 1;
          break;
        case this._actionTypes.sign.toLowerCase():
          this.textLabel = this._tabNames.sign;
          this.indexTab = 2;
          break;
        default:
          this.textLabel = this._tabNames.create;
          this.indexTab = 0;
          break;
      }
      this.actionType = '';
    });
    this.authInProjectDto = JwtTokenHelper.GetAuthProject() ? <AuthInProjectDto[]>[...JwtTokenHelper.GetAuthProject()] : [];
    this.onGetCounter("default");
  }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  onChangeTab = (event: MatTabChangeEvent) => {
    if (!this.onCheckPermission(this.permissionsViews.PUNCH_TAB_VIEW_TAB_APPROVE)) {
      if (event.index == 0) {
        this.textLabel = this._tabNames.create;
      } else {
        this.textLabel = this._tabNames.sign;
      }
    } else {
      if (event.index == 0) {
        this.textLabel = this._tabNames.create;
      } else if (event.index == 1) {
        this.textLabel = this._tabNames.approve;
      } else {
        this.textLabel = this._tabNames.sign;
      }
    }
    // this.clientState.isBusy = true;
  };

  onLoadingTab = (tabName: string) => {
    if (tabName) {
      switch (tabName) {
        case this._tabNames.create: {
          this.isInitLoadData = false;
          break;
        }
        case this._tabNames.approve: {
          this.isApproveLoadData = false;
          break;
        }
        case this._tabNames.sign: {
          this.isSignatureLoadData = false;
          break;
        }
        default: {
          break;
        }
      }
    }

    if (this.isOffline) {
      this.onGetCountUserPunchOffline();
    } else {
      this.onGetCountUserPunchOnline();
    }
  }

  onGetCounter = (tabName: string) => {
    if (tabName) {
      switch (tabName) {
        case this._tabNames.create: {
          this.isApproveLoadData = true;
          break;
        }
        case this._tabNames.approve: {
          this.isSignatureLoadData = true;
          this.isInitLoadData = true;
          break;
        }
        case this._tabNames.sign: {
          break;
        }
        default: {
          break;
        }
      }
    }

    if (this.isOffline) {
      this.onGetCountUserPunchOffline();
    } else {
      this.onGetCountUserPunchOnline();
    }
  };

  onGetCountUserPunchOnline = () => {
    this.punchPageService.getCountUserPunch(this.projectKey, this.tagNo).subscribe((res) => {
      this.punchCounter = res ? <CounterUserPunchesModel>{ ...res } : null;
      if (this.punchCounter.unSubmittedPunches == 0) {
        this.hiddenCreateBadge = true;
      } else {
        this.hiddenCreateBadge = false;
      }
      if (this.punchCounter.submittedPunches == 0) {
        this.hiddenApproveBadge = true;
      } else {
        this.hiddenApproveBadge = false;
      }
      if (this.punchCounter.needMySignaturePunches == 0) {
        this.hiddenSignOffBadge = true;
      } else {
        this.hiddenSignOffBadge = false;
      }
    }, (err: ApiError) => {
      this.authErrorHandler.handleError(err.message);
    });
  }

  onGetCountUserPunchOffline() {
    this.clientState.isBusy = true;
    this.idbService.getAllData(this._storeName).then((punches: PunchPageListModel[]) => {
      if (punches && punches.length > 0) {
        this.punchCounter = new CounterUserPunchesModel();

        const _unSubmitted = punches.filter(_punch => !_punch.isDeleted && (_punch.status === PunchStatuses.draft || _punch.status === PunchStatuses.rejected));
        this.punchCounter.unSubmittedPunches = _unSubmitted ? _unSubmitted.length : null;
        this.hiddenCreateBadge = _unSubmitted && _unSubmitted.length < 1;

        const _submitted = punches.filter(_punch => !_punch.isDeleted && (_punch.status === PunchStatuses.submitted));
        this.punchCounter.submittedPunches = _submitted ? _submitted.length : null;
        this.hiddenApproveBadge = _submitted && _submitted.length < 1;

        const _needSign = punches.filter(_punch => !_punch.isDeleted && (_punch.status === PunchStatuses.approved));
        this.punchCounter.needMySignaturePunches = _needSign ? _needSign.length : null;
        this.hiddenSignOffBadge = _needSign && _needSign.length < 1;

        this.clientState.isBusy = false;
      } else {
        this.punchCounter = new CounterUserPunchesModel();
        this.punchCounter.unSubmittedPunches = 0;
        this.punchCounter.submittedPunches = 0;
        this.punchCounter.needMySignaturePunches = 0;
      }
    }, (err) => {
      this.clientState.isBusy = false;
    });
  }

  onCheckPermission = (key: string) => {
    return JwtTokenHelper.IsAuthInProject(key, this.authInProjectDto);
  };
}
