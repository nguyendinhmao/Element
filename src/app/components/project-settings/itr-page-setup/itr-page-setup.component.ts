import { Component, AfterViewInit, OnInit } from "@angular/core";
import { Subscription } from "rxjs/internal/Subscription";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { AuthErrorHandler } from "src/app/shared/services/auth/auth.error-handler";
import { ClientState } from "src/app/shared/services/client/client-state";
import { UpdateProjectSignatureModel, ProjectSignatureItem } from "src/app/shared/models/project-settings/project-signature.model";
import { ProjectService } from "src/app/shared/services/api/projects/project.service";
import { ProjectMemberService } from "src/app/shared/services/api/project-settings/project-member.service";
import { ProjectUpdatingModel } from "src/app/shared/models/project-management/project-management.model";
import { AuthorizationLookupValueModel } from 'src/app/shared/models/project-settings/project-user.model';
import { Constants } from 'src/app/shared/common';
import * as $ from "jquery";

@Component({
  selector: "itr-page-setup",
  templateUrl: "./itr-page-setup.component.html",
  styleUrls: ["./itr-page-setup.component.scss"],
})

export class ItrPageSetupComponent implements OnInit, AfterViewInit {
  //--- Model
  updateProjectSignatureModel: UpdateProjectSignatureModel = new UpdateProjectSignatureModel();
  authorizationLevelModels: AuthorizationLookupValueModel[] = [];
  projectSignatureItemTemp: ProjectSignatureItem[] = [];
  projectSignatureItemDeleted: ProjectSignatureItem[] = [];
  projectManagementModel: ProjectUpdatingModel = new ProjectUpdatingModel();

  //--- Variables
  isEdited = false;
  hasShowWarningValidate = false;
  isShowResetWarning = false;
  sub: Subscription;
  projectId: string;
  projectKey: string;
  moduleKey: string;

  constructor(
    public clientState: ClientState,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private authErrorHandler: AuthErrorHandler,
    private projectMemberService: ProjectMemberService
  ) {
    this.sub = this.route.params.subscribe((params) => {
      this.projectKey = params["projectKey"];
      this.moduleKey = params["moduleKey"];
      if (!this.projectKey || !this.moduleKey) {
        this.router.navigate([""]);
      } else {
        this.onGetProjectByKey();
      }
    });
  }

  ngOnInit(): void {
    //--- Hide left menu
    $("#top-header .project-name").hide();
    $("#matSideNavMenu").hide();
    $(".toggle-nav").hide();
  }

  //--- Get project by key
  onGetProjectByKey = () => {
    this.clientState.isBusy = true;

    this.projectService.getProjectByKey(this.projectKey).subscribe(
      (res) => {
        this.projectManagementModel = res ? <ProjectUpdatingModel>{ ...res } : null;

        if (this.projectManagementModel) {
          this.updateProjectSignatureModel.projectId = this.projectManagementModel.id;
          this.updateProjectSignatureModel.projectKey = this.projectManagementModel.projectKey;

          this.onGetDataSignatures();
        } else {
          this.clientState.isBusy = false;
        }
      },
      (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      }
    );
  };

  onGetProjectRolesLookup = () => {
    this.projectMemberService.getAuthorizationLevelLookup().subscribe((res) => {
      this.authorizationLevelModels = res.content ? <AuthorizationLookupValueModel[]>[...res.content] : [];
    }, (error) => {
      this.authErrorHandler.handleError(error.message);
    }
    );
  }

  onGetProjectSignatureItr = () => {
    this.projectService.getProjectSignatureItr(this.projectKey).subscribe((res) => {
      this.updateProjectSignatureModel.projectSignatures = res.content ? <ProjectSignatureItem[]>[...res.content] : [];
      this.projectSignatureItemTemp = [];
      this.updateProjectSignatureModel.projectSignatures.map(item => {
        this.projectSignatureItemTemp.push(Object.assign({}, item))
      });
    }, (error) => {
      this.authErrorHandler.handleError(error.message);
    }
    );
  }

  onGetDataSignatures = () => {
    Promise.all([
      this.onGetProjectRolesLookup(),
      this.onGetProjectSignatureItr()
    ]).then(res => {
      this.clientState.isBusy = false;
    }).catch((err: ApiError) => {
      this.clientState.isBusy = false;
    });
  }

  onCheckEdit = () => {
    this.isEdited = JSON.stringify(this.updateProjectSignatureModel.projectSignatures) != JSON.stringify(this.projectSignatureItemTemp) ? true : false;
  }

  onClickSave = () => {
    this.hasShowWarningValidate = false;

    this.updateProjectSignatureModel.projectSignatures.map(itr => {
      if (!itr.authorizationId || !itr.description) this.hasShowWarningValidate = true;
    });

    if (this.hasShowWarningValidate) return;
    this.clientState.isBusy = true;

    this.updateProjectSignatureModel.projectSignatures.map((itr, index) => {
      itr.number = index + 1;
      if (itr.id) {
        let itrUpdate = this.projectSignatureItemTemp.filter(item => item.id == itr.id);
        if (itrUpdate && itrUpdate.length > 0) {
          itr.isUpdated = itr.isDeleted = itrUpdate[0].isUpdated = itrUpdate[0].isDeleted = false;
          itr.isUpdated = (itrUpdate[0].id == itr.id && (itrUpdate[0].authorizationId != itr.authorizationId || itrUpdate[0].description != itr.description || itrUpdate[0].number != itr.number)) ? true : false;
        }
      }
    })
    this.updateProjectSignatureModel.projectSignatures = this.projectSignatureItemDeleted.concat(this.updateProjectSignatureModel.projectSignatures);

    this.projectService.updateProjectSignatureItr(this.updateProjectSignatureModel).subscribe(
      (res) => {
        this.isEdited = false;
        this.updateProjectSignatureModel.projectSignatures = [];
        this.projectSignatureItemTemp = [];
        this.updateProjectSignatureModel.projectSignatures = res.content ? <ProjectSignatureItem[]>[...res.content] : [];
        this.updateProjectSignatureModel.projectSignatures.map(item => {
          this.projectSignatureItemTemp.push(Object.assign({}, item))
        });
        this.clientState.isBusy = false;
        this.authErrorHandler.handleSuccess(Constants.SignaturesSaveSuccess);
      },
      (error) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(error.message);
      }
    );
  }

  onClickReset = () => {
    if (this.isEdited) this.isShowResetWarning = true;
    else this.onResetData();
  }

  onConfirmReset = (event) => {
    if (event) this.onResetData();
    this.isShowResetWarning = false;
  }

  onResetData = () => {
    this.updateProjectSignatureModel.projectSignatures = [];
    this.projectSignatureItemDeleted = [];
    this.projectSignatureItemTemp.map(item => {
      this.updateProjectSignatureModel.projectSignatures.push(Object.assign({}, item))
    });
    this.onCheckEdit();
    this.hasShowWarningValidate = false;
  }

  onClickDeleteItr = (indexOfItr: number, itr: ProjectSignatureItem) => {
    if (indexOfItr > -1) {
      this.projectSignatureItemDeleted.push({ ...itr, isDeleted: true });
      this.updateProjectSignatureModel.projectSignatures.splice(indexOfItr, 1);
      this.onCheckEdit();
    }
  }

  onClickCreateAddSignature = () => {
    this.updateProjectSignatureModel.projectSignatures.push(new ProjectSignatureItem())
    this.onCheckEdit();
  }

  drop = (event: CdkDragDrop<any[]>) => {
    moveItemInArray(this.updateProjectSignatureModel.projectSignatures, event.previousIndex, event.currentIndex);
    this.isEdited = true;
  }

  ngAfterViewInit() { }
}
