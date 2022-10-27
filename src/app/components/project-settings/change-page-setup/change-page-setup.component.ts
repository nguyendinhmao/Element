import { Component, OnInit } from '@angular/core';
import { Subscription } from "rxjs/internal/Subscription";
import { ClientState } from "src/app/shared/services/client/client-state";
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from 'src/app/shared/services/api/projects/project.service';
import { ProjectUpdatingModel } from 'src/app/shared/models/project-management/project-management.model';
import { UpdateProjectSignatureModel, ProjectSignatureItem } from 'src/app/shared/models/project-settings/project-signature.model';
import { UpdateProjectStageModel, ProjectStageItem } from 'src/app/shared/models/project-settings/project-stage.model';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { AuthErrorHandler } from 'src/app/shared/services';
import { ProjectMemberService } from 'src/app/shared/services/api/project-settings/project-member.service';
import { AuthorizationLookupValueModel, RoleLookupValueModel } from 'src/app/shared/models/project-settings/project-user.model';
import { Constants } from 'src/app/shared/common';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import * as $ from "jquery";

@Component({
    selector: "change-page-setup",
    templateUrl: "./change-page-setup.component.html",
    styleUrls: ["./change-page-setup.component.scss"],
})

export class ChangePageSetupComponent implements OnInit {
    //--- Model
    projectManagementModel: ProjectUpdatingModel = new ProjectUpdatingModel();
    updateProjectSignatureModel: UpdateProjectSignatureModel = new UpdateProjectSignatureModel();
    updateProjectStageModel: UpdateProjectStageModel = new UpdateProjectStageModel();
    roleModels: RoleLookupValueModel[] = [];
    authorizationLevelModels: AuthorizationLookupValueModel[] = [];
    projectSignatureItemTemp: ProjectSignatureItem[] = [];
    projectSignatureItemDeleted: ProjectSignatureItem[] = [];
    projectStageItemTemp: ProjectStageItem[] = [];

    //--- Variables
    sub: Subscription;
    projectKey: string;
    moduleKey: string;

    //--- Boolean
    isEdited = false;
    hasShowWarningSignatureValidate = false;
    hasShowWarningStageValidate = false;
    isShowResetWarning = false;

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

        this.projectService.getProjectByKey(this.projectKey).subscribe((res) => {
            this.projectManagementModel = res ? <ProjectUpdatingModel>{ ...res } : null;

            if (this.projectManagementModel) {
                this.updateProjectSignatureModel.projectId = this.projectManagementModel.id;
                this.updateProjectSignatureModel.projectKey = this.projectManagementModel.projectKey;
                this.updateProjectStageModel.projectKey = this.projectManagementModel.projectKey;
                this.onGetDataSignatures();
            } else {
                this.clientState.isBusy = false;
            }
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }

    onGetDataSignatures = () => {
        Promise.all([
            this.onGetProjectAuthorizationsLookup(),
            this.onGetProjectRolesLookup(),
            this.onGetProjectSignatureChange(this.projectKey),
            this.onGetProjectStageChange(this.projectKey)
        ]).then(res => {
            this.clientState.isBusy = false;
        }).catch((err: ApiError) => {
            this.clientState.isBusy = false;
        });
    }

    onGetProjectAuthorizationsLookup() {
        return new Promise((resolve, reject) => {
            this.projectMemberService.getAuthorizationLevelLookup().subscribe((res) => {
                this.authorizationLevelModels = res.content ? <AuthorizationLookupValueModel[]>[...res.content] : [];
                resolve(res.content);
            }, (err: ApiError) => {
                this.clientState.isBusy = true;
                reject(err.message)
                this.authErrorHandler.handleError(err.message);
            });
        });
    }
    onGetProjectRolesLookup() {
        return new Promise((resolve, reject) => {
            this.projectMemberService.getProjectRolesLookupByProject(this.projectKey).subscribe((res) => {
                this.roleModels = res.content ? <RoleLookupValueModel[]>[...res.content] : [];
                resolve(res.content);
            }, (err: ApiError) => {
                this.clientState.isBusy = true;
                reject(err.message)
                this.authErrorHandler.handleError(err.message);
            });
        });
    }

    onGetProjectSignatureChange(projectKey: string) {
        return new Promise((resolve, reject) => {
            this.projectService.getProjectSignatureChange(projectKey).subscribe((res) => {
                this.updateProjectSignatureModel.projectSignatures = res.content ? <ProjectSignatureItem[]>[...res.content] : [];
                this.projectSignatureItemTemp = [];
                this.updateProjectSignatureModel.projectSignatures.map(item => {
                    this.projectSignatureItemTemp.push(Object.assign({}, item))
                });
                resolve(res.content);
            }, (err: ApiError) => {
                this.clientState.isBusy = true;
                reject(err.message)
                this.authErrorHandler.handleError(err.message);
            });
        });
    }

    onGetProjectStageChange(projectKey: string) {
        return new Promise((resolve, reject) => {
            this.projectService.getProjectStageChange(projectKey).subscribe((res) => {
                this.updateProjectStageModel.projectStages = res.content ? <ProjectStageItem[]>[...res.content] : [];
                this.projectStageItemTemp = [];
                this.updateProjectStageModel.projectStages.map(item => {
                    this.projectStageItemTemp.push(Object.assign({}, item))
                });
                resolve(res.content);
            }, (err: ApiError) => {
                this.clientState.isBusy = true;
                reject(err.message)
                this.authErrorHandler.handleError(err.message);
            });
        });
    }

    onCheckEdit = () => {
        this.isEdited = JSON.stringify(this.updateProjectSignatureModel.projectSignatures) != JSON.stringify(this.projectSignatureItemTemp) ? true : false;
    }

    onClickSaveSignature = () => {
        this.hasShowWarningSignatureValidate = false;

        this.updateProjectSignatureModel.projectSignatures.map(change => {
            if (!change.authorizationId || !change.description) this.hasShowWarningSignatureValidate = true;
        });

        if (this.hasShowWarningSignatureValidate) return;
        this.clientState.isBusy = true;

        this.updateProjectSignatureModel.projectSignatures.map((change, index) => {
            change.number = index + 1;
            if (change.id) {
                let changeUpdate = this.projectSignatureItemTemp.filter(item => item.id == change.id);
                if (changeUpdate && changeUpdate.length > 0) {
                    change.isUpdated = change.isDeleted = changeUpdate[0].isUpdated = changeUpdate[0].isDeleted = false;
                    change.isUpdated = (changeUpdate[0].id == change.id && (changeUpdate[0].authorizationId != change.authorizationId || changeUpdate[0].description != change.description || changeUpdate[0].number != change.number)) ? true : false;
                }
            }
        })

        this.updateProjectSignatureModel.projectSignatures = this.projectSignatureItemDeleted.concat(this.updateProjectSignatureModel.projectSignatures);

        this.projectService.updateProjectSignatureChange(this.updateProjectSignatureModel).subscribe((res) => {
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

    onClickSaveStage = () => {
        this.hasShowWarningStageValidate = false;
        this.updateProjectStageModel.projectStages.map(stage => {
            if (!stage.authorizationId || !stage.description) this.hasShowWarningStageValidate = true;
        });

        if (this.hasShowWarningStageValidate) return;
        this.updateProjectStageModel.projectStages.map((stage, index) => {
            stage.number = index + 1;
        })

        this.projectService.updateProjectStageChange(this.updateProjectStageModel).subscribe((res) => {
            this.updateProjectStageModel.projectStages = [];
            this.projectStageItemTemp = [];
            this.updateProjectStageModel.projectStages = res.content ? <ProjectStageItem[]>[...res.content] : [];
            this.updateProjectStageModel.projectStages.map(item => {
                this.projectStageItemTemp.push(Object.assign({}, item))
            });
            this.clientState.isBusy = false;
            this.authErrorHandler.handleSuccess(Constants.StagesSaveSuccess);
        }, (error) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(error.message);
        })
    }

    onClickReset = () => {
        if (this.isEdited) this.isShowResetWarning = true;
        else this.onResetSignatureData();
    }

    onConfirmReset = (event) => {
        if (event) this.onResetSignatureData();
        this.isShowResetWarning = false;
    }

    onResetSignatureData = () => {
        this.updateProjectSignatureModel.projectSignatures = [];
        this.projectSignatureItemDeleted = [];
        this.projectSignatureItemTemp.map(item => {
            this.updateProjectSignatureModel.projectSignatures.push(Object.assign({}, item))
        });
        this.onCheckEdit();
        this.hasShowWarningSignatureValidate = false;
    }

    onResetStageData = () => {
        this.updateProjectStageModel.projectStages = [];
        // this.projectSignatureItemDeleted = [];
        this.projectStageItemTemp.map(item => {
            this.updateProjectStageModel.projectStages.push(Object.assign({}, item))
        });
        // this.onCheckEdit();
        this.hasShowWarningStageValidate = false;
    }

    onClickDeleteChangeSignature = (indexOfChange: number, change: ProjectSignatureItem) => {
        if (indexOfChange > -1) {
            this.projectSignatureItemDeleted.push({ ...change, isDeleted: true });
            this.updateProjectSignatureModel.projectSignatures.splice(indexOfChange, 1);
            this.onCheckEdit();
        }
    }

    onClickDeleteChangeStage = (indexOfChange: number, change: ProjectSignatureItem) => {
        if (indexOfChange > -1) {
            // this.projectSignatureItemDeleted.push({ ...change, isDeleted: true });
            this.updateProjectStageModel.projectStages.splice(indexOfChange, 1);
            // this.onCheckEdit();
        }
    }

    onClickCreateAddSignature = () => {
        this.updateProjectSignatureModel.projectSignatures.push(new ProjectSignatureItem())
        this.onCheckEdit();
    }

    onClickCreateAddStage = () => {
        this.updateProjectStageModel.projectStages.push(new ProjectStageItem());
    }

    dropSignature = (event: CdkDragDrop<any[]>) => {
        moveItemInArray(this.updateProjectSignatureModel.projectSignatures, event.previousIndex, event.currentIndex);
        this.isEdited = true;
    }
    dropStage = (event: CdkDragDrop<any[]>) => {
        moveItemInArray(this.updateProjectStageModel.projectStages, event.previousIndex, event.currentIndex);
    }
}