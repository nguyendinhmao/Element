import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthErrorHandler, ClientState } from 'src/app/shared/services';
import * as $ from "jquery";
import { ProjectUpdatingModel } from 'src/app/shared/models/project-management/project-management.model';
import { ProjectService } from 'src/app/shared/services/api/projects/project.service';
import { ProjectSignatureItem, UpdateProjectSignatureModel } from 'src/app/shared/models/project-settings/project-signature.model';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ProjectMemberService } from 'src/app/shared/services/api/project-settings/project-member.service';
import { AuthorizationLookupValueModel } from 'src/app/shared/models/project-settings/project-user.model';
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Constants } from 'src/app/shared/common';


@Component({
    selector: "preservation-page-setup",
    templateUrl: "./preservation-page-setup.component.html",
    styleUrls: ["./preservation-page-setup.component.scss"],
})

export class PreservationPageSetupComponent implements OnInit {
    //--- Boolean
    isEdited = false;
    isShowResetWarning = false;
    hasShowWarningValidate = false;

    //--- Variables
    sub: Subscription;
    projectId: string;
    projectKey: string;
    moduleKey: string;

    //--- Model
    projectManagementModel: ProjectUpdatingModel = new ProjectUpdatingModel();
    updateProjectSignatureModel: UpdateProjectSignatureModel = new UpdateProjectSignatureModel();
    authorizationLevelModels: AuthorizationLookupValueModel[] = [];
    projectSignatureItemTemp: ProjectSignatureItem[] = [];
    projectSignatureItemDeleted: ProjectSignatureItem[] = [];

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
            }
        });
    }

    ngOnInit(): void {
        //--- Hide left menu
        $("#top-header .project-name").hide();
        $("#matSideNavMenu").hide();
        $(".toggle-nav").hide();

        this.onGetProjectByKey();
    }


    //--- Get project by key
    onGetProjectByKey = () => {
        this.clientState.isBusy = true;

        this.projectService.getProjectByKey(this.projectKey).subscribe((res) => {
            this.projectManagementModel = res ? <ProjectUpdatingModel>{ ...res } : null;

            if (this.projectManagementModel) {
                this.updateProjectSignatureModel.projectId = this.projectManagementModel.id;
                this.updateProjectSignatureModel.projectKey = this.projectManagementModel.projectKey;

                this.onGetDataSignatures();
            } else {
                this.clientState.isBusy = false;
            }
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        }
        );
    };

    onGetDataSignatures = () => {
        Promise.all([
            this.onGetProjectRolesLookup(),
            this.onGetProjectSignaturePreservation(this.projectKey)
        ]).then(res => {
            this.clientState.isBusy = false;
        }).catch((err: ApiError) => {
            this.clientState.isBusy = false;
        });
    }

    onGetProjectSignaturePreservation = (projectKey: string) => {
        this.projectService.getProjectSignaturePreservation(projectKey).subscribe((res) => {
            this.updateProjectSignatureModel.projectSignatures = res.content ? <ProjectSignatureItem[]>[...res.content] : [];
            this.projectSignatureItemTemp = [];
            this.updateProjectSignatureModel.projectSignatures.map(item => {
                this.projectSignatureItemTemp.push(Object.assign({}, item))
            });
        }, (error) => {
            this.authErrorHandler.handleError(error.message);
        });
    }


    onGetProjectRolesLookup = () => {
        this.projectMemberService.getAuthorizationLevelLookup().subscribe((res) => {
            this.authorizationLevelModels = res.content ? <AuthorizationLookupValueModel[]>[...res.content] : [];
        }, (error) => {
            this.authErrorHandler.handleError(error.message);
        });
    }

    onClickDeleteSign = (indexOfSign: number, sign: ProjectSignatureItem) => {
        if (indexOfSign > -1) {
            this.projectSignatureItemDeleted.push({ ...sign, isDeleted: true });
            this.updateProjectSignatureModel.projectSignatures.splice(indexOfSign, 1);
            this.onCheckEdit();
        }
    }

    onClickSave = () => { 
        this.hasShowWarningValidate = false;

        this.updateProjectSignatureModel.projectSignatures.map(pres => {
          if (!pres.authorizationId || !pres.description) this.hasShowWarningValidate = true;
        });
    
        if (this.hasShowWarningValidate) return;
        this.clientState.isBusy = true;
    
        this.updateProjectSignatureModel.projectSignatures.map((pres, index) => {
            pres.number = index + 1;
          if (pres.id) {
            let presUpdate = this.projectSignatureItemTemp.filter(item => item.id == pres.id);
            if (presUpdate && presUpdate.length > 0) {
                pres.isUpdated = pres.isDeleted = presUpdate[0].isUpdated = presUpdate[0].isDeleted = false;
                pres.isUpdated = (presUpdate[0].id == pres.id && (presUpdate[0].authorizationId != pres.authorizationId || presUpdate[0].description != pres.description || presUpdate[0].number != pres.number)) ? true : false;
            }
          }
        })
        this.updateProjectSignatureModel.projectSignatures = this.projectSignatureItemDeleted.concat(this.updateProjectSignatureModel.projectSignatures);
    
        this.projectService.updateProjectSignaturePreservation(this.updateProjectSignatureModel).subscribe((res) => {
          this.isEdited = false;
          this.updateProjectSignatureModel.projectSignatures = [];
          this.projectSignatureItemTemp = [];
          this.updateProjectSignatureModel.projectSignatures = res.content ? <ProjectSignatureItem[]>[...res.content] : [];
          this.updateProjectSignatureModel.projectSignatures.map(item => {
            this.projectSignatureItemTemp.push(Object.assign({}, item))
          });
          this.clientState.isBusy = false;
          this.authErrorHandler.handleSuccess(Constants.SignaturesSaveSuccess);
        }, (error) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(error.message);
        });
    }

    onClickReset = () => {
        if (this.isEdited) this.isShowResetWarning = true;
        else this.onResetData();
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

    onClickCreateAddSignature = () => {
        this.updateProjectSignatureModel.projectSignatures.push(new ProjectSignatureItem())
        this.onCheckEdit();
    }

    onCheckEdit = () => {
        this.isEdited = JSON.stringify(this.updateProjectSignatureModel.projectSignatures) != JSON.stringify(this.projectSignatureItemTemp) ? true : false;
    }

    onConfirmReset = (event) => {
        if (event) this.onResetData();
        this.isShowResetWarning = false;
    }

    drop = (event: CdkDragDrop<any[]>) => {
        moveItemInArray(this.updateProjectSignatureModel.projectSignatures, event.previousIndex, event.currentIndex);
        this.isEdited = true;
    }

}