import { Component } from "@angular/core";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { ActivatedRoute, Router } from "@angular/router";
import { ClientState } from "src/app/shared/services/client/client-state";
import { JwtTokenHelper } from "src/app/shared/common/jwt-token-helper/jwt-token-helper";
import { AuthInProjectDto } from "src/app/shared/models/project-management/project-management.model";
import { PermissionsViews } from "src/app/shared/common/constants/permissions";
import { ChangePageService } from "src/app/shared/services/api/change-page/change-page.service";
import { CounterUserChangesModel } from "src/app/shared/models/change-tab/change-tab.model";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { AuthErrorHandler } from "src/app/shared/services/auth/auth.error-handler";

@Component({
  selector: "my-change",
  styleUrls: ["./my-change.component.scss"],
  templateUrl: "./my-change.component.html",
})

export class MyChangeComponent {
  //--- Boolean
  isAddNewState: boolean;
  isInitLoadData = true;
  isApproveLoadData = true;
  isSignatureLoadData = true;

  permissionsViews = PermissionsViews;
  authInProjectDto: AuthInProjectDto[] = [];
  changeCounter: CounterUserChangesModel;

  //--- Variables
  textLabel: string = "Update";
  moduleKey: string;
  projectKey: string;
  hiddenApproveBadge = false;
  hiddenUpdateBadge = false;
  hiddenSignOffBadge = false;

  _tabNames = {
    update: "Update",
    approve: "Approve",
    sign: "Sign-off",
  }
  _actionTypes = {
    update: "Update",
    approve: "Approve",
    sign: "SignOff",
  }
  indexTab: number;
  actionType: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientState: ClientState,
    private changePageService: ChangePageService,
    private authErrorHandler: AuthErrorHandler
  ) {
    this.route.params.subscribe((params) => {
      this.moduleKey = params["moduleKey"];
      this.projectKey = params["projectKey"];
      if (!this.moduleKey || !this.projectKey) {
        this.router.navigate([""]);
      }
    });

    this.route.queryParams.subscribe(params => {
      this.actionType = params['actionType'];
      switch (this.actionType) {
        case this._actionTypes.approve:
          this.textLabel = this._tabNames.approve;
          this.indexTab = 1;
          break;
        case this._actionTypes.sign:
          this.textLabel = this._tabNames.sign;
          this.indexTab = 2;
          break;
        default:
          this.textLabel = this._tabNames.update;
          this.indexTab = 0;
          break;
      }
    });
    this.authInProjectDto = JwtTokenHelper.GetAuthProject() ? <AuthInProjectDto[]>[...JwtTokenHelper.GetAuthProject()] : [];
    this.onGetCounter("default");
  }

  onChangeTab = (event: MatTabChangeEvent) => {
    if (event.index == 0) {
      this.textLabel = this._tabNames.update;
    } else if (event.index == 1) {
      this.textLabel = this._tabNames.approve;
    } else {
      this.textLabel = this._tabNames.sign;
    }

    // this.clientState.isBusy = true;
  };

  onLoadingTab = (tabName: string) => {
    if (tabName) {
      switch (tabName) {
        case this._tabNames.update: {
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

    this.onGetCountUserChange();
  }

  onGetCounter = (tabName: string) => {
    if (tabName) {
      switch (tabName) {
        case this._tabNames.update: {
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

    this.onGetCountUserChange();
  };

  onGetCountUserChange = () => {
    this.changePageService.getCountUserChange(this.projectKey).subscribe((res) => {
      this.changeCounter = res ? <CounterUserChangesModel>{ ...res } : null;
      if (this.changeCounter.unSubmittedChanges == 0) {
        this.hiddenUpdateBadge = true;
      }
      if (this.changeCounter.submittedChanges == 0) {
        this.hiddenApproveBadge = true;
      }
      if (this.changeCounter.needMySignatureChanges == 0) {
        this.hiddenSignOffBadge = true;
      }
    }, (err: ApiError) => {
      this.authErrorHandler.handleError(err.message);
    });
  }

  onCheckPermission = (key: string) => {
    return JwtTokenHelper.IsAuthInProject(key, this.authInProjectDto);
  };
}
