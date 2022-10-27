import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { MilestonesProjectSettingsModel } from 'src/app/shared/models/project-settings/project-settings.model';
import { MockMilestonesProjectSettingsApi } from 'src/app/shared/mocks/mock.project-settings';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { MilestoneLookUpModel } from 'src/app/shared/models/data-tab/data-milestone.model';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { DataMilestoneService } from 'src/app/shared/services/api/data-tab/data-milestone.service';
import { DataDisciplineService } from 'src/app/shared/services/api/data-tab/data-discipline.service';
import { DisciplineLookUpModel } from 'src/app/shared/models/data-tab/data-discipline.model';
import { ITRAdminCreatetionModel } from 'src/app/shared/models/itr-tab/itr-admin.model';
import { ITRService } from 'src/app/shared/services/api/itr/itr.service';
import { NgForm } from '@angular/forms';
import { JwtTokenHelper } from 'src/app/shared/common';

@Component({
    selector: 'add-itr-admin',
    templateUrl: './add-itr-admin.component.html'
})

export class AddItrAdminComponent implements OnInit {
    @Input() visible: boolean = false;
    @Input() projectKey: string;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

    milestoneModels: MilestoneLookUpModel[] = [];
    disciplineModels: DisciplineLookUpModel[] = [];
    itrCreationModel: ITRAdminCreatetionModel = new ITRAdminCreatetionModel();
    bufferSize = 100;
    disciplineTempModels: DisciplineLookUpModel[] = [];
    isDisciplineLoadingSelect: boolean;
    milestoneTempModels: MilestoneLookUpModel[] = [];
    isMilestoneLoadingSelect: boolean;
    constructor(
        public clientState: ClientState,
        private authErrorHandler: AuthErrorHandler,
        private milestoneService: DataMilestoneService,
        private disciplineService: DataDisciplineService,
        private itrService: ITRService
    ) { }

    public ngOnInit() {
        //--- Get milestones
        this.onGetLookUpMilestone();
        //--- Get Discipline 
        this.onGetLookUpDiscipline();
    }

    //--- Get milestones
    // onGetLookUpMilestone() {
    //     this.clientState.isBusy = true;
    //     this.milestoneService.getMilestoneLookUp(this.projectKey).subscribe(res => {
    //         this.milestoneLookUpModels = res.content ? <MilestoneLookUpModel[]>[...res.content] : [];
    //         this.clientState.isBusy = false;
    //     }, (err: ApiError) => {
    //         this.clientState.isBusy = false;
    //         this.authErrorHandler.handleError(err.message);
    //     });
    // }

    //---Milestone
    onGetLookUpMilestone = () => {
        this.clientState.isBusy = true;
        this.milestoneService.getMilestoneLookUp(this.projectKey).subscribe(res => {
            this.milestoneModels = res.content ? <MilestoneLookUpModel[]>[...res.content] : [];
            this.milestoneTempModels = this.milestoneModels.slice(0, this.bufferSize);
            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }

    onScrollToEndMilestone = () => {
        if (this.milestoneModels.length > this.bufferSize) {
            const len = this.milestoneTempModels.length;
            const more = this.milestoneModels.slice(len, this.bufferSize + len);
            this.isMilestoneLoadingSelect = true;
            setTimeout(() => {
                this.isMilestoneLoadingSelect = false;
                this.milestoneTempModels = this.milestoneTempModels.concat(more);
            }, 500)
        }
    }

    onSearchMilestone = ($event) => {
        this.isMilestoneLoadingSelect = true;
        if ($event.term == '') {
            this.milestoneTempModels = this.milestoneModels.slice(0, this.bufferSize);
            this.isMilestoneLoadingSelect = false;
        } else {
            this.milestoneTempModels = this.milestoneModels;
            this.isMilestoneLoadingSelect = false;
        }
    }

    onClearMilestone = () => {
        this.milestoneTempModels = this.milestoneModels.slice(0, this.bufferSize);
    }
    //-----

    //---Discipline
    onGetLookUpDiscipline = () => {
        this.clientState.isBusy = true;
        this.disciplineService.getDisciplineLookUp(this.projectKey).subscribe(res => {
            this.disciplineModels = res.content ? <DisciplineLookUpModel[]>[...res.content] : [];
            this.disciplineTempModels = this.disciplineModels.slice(0, this.bufferSize);
            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }

    onScrollToEndDiscipline = () => {
        if (this.disciplineModels.length > this.bufferSize) {
            const len = this.disciplineTempModels.length;
            const more = this.disciplineModels.slice(len, this.bufferSize + len);
            this.isDisciplineLoadingSelect = true;
            setTimeout(() => {
                this.isDisciplineLoadingSelect = false;
                this.disciplineTempModels = this.disciplineTempModels.concat(more);
            }, 500)
        }
    }

    onSearchDiscipline = ($event) => {
        this.isDisciplineLoadingSelect = true;
        if ($event.term == '') {
            this.disciplineTempModels = this.disciplineModels.slice(0, this.bufferSize);
            this.isDisciplineLoadingSelect = false;
        } else {
            this.disciplineTempModels = this.disciplineModels;
            this.isDisciplineLoadingSelect = false;
        }
    }

    onClearDiscipline = () => {
        this.disciplineTempModels = this.disciplineModels.slice(0, this.bufferSize);
    }
    //-----


    onSaveData = (form: NgForm) => {
        if (!form || form.invalid) {
            return;
        }
        this.clientState.isBusy = true;
        let creationModel = <ITRAdminCreatetionModel>{
            ...this.itrCreationModel
        }
        let projectId = JwtTokenHelper.GetModuleProjectDefault().defaultProjectId;
        creationModel.projectId = projectId;
        if (creationModel.type == 'Handover') creationModel.disciplineId = null
        this.itrService.createITR(creationModel).subscribe({
            complete: () => {
                this.clientState.isBusy = false;
                this.onSuccess.emit(true);
            },
            error: (err) => {
                this.clientState.isBusy = false;
                this.authErrorHandler.handleError(err.message);
            }
        });
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}