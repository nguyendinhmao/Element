import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ITRAdminUpdationModel } from 'src/app/shared/models/itr-tab/itr-admin.model';
import { DisciplineLookUpModel } from 'src/app/shared/models/data-tab/data-discipline.model';
import { MilestoneLookUpModel } from 'src/app/shared/models/data-tab/data-milestone.model';
import { ITRService } from 'src/app/shared/services/api/itr/itr.service';
import { DataDisciplineService } from 'src/app/shared/services/api/data-tab/data-discipline.service';
import { DataMilestoneService } from 'src/app/shared/services/api/data-tab/data-milestone.service';
import { AuthErrorHandler } from 'src/app/shared/services';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'edit-itr-admin',
    templateUrl: './edit-itr-admin.component.html'
})

export class EditItrAdminComponent implements OnInit {
    @Input() visible: boolean = false;
    @Input() updationModel: ITRAdminUpdationModel;
    @Input() projectKey: string;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    milestoneModels: MilestoneLookUpModel[] = [];
    disciplineModels: DisciplineLookUpModel[] = [];
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
        this.onGetDisciplineLookup();
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
    // get discipline
    // onGetLookUpDiscipline() {
    //     this.clientState.isBusy = true;
    //     this.disciplineService.getDisciplineLookUp().subscribe(res => {
    //         this.disciplineModels = res.content ? <DisciplineLookUpModel[]>[...res.content] : [];
    //         this.clientState.isBusy = false;
    //     }, (err: ApiError) => {
    //         this.clientState.isBusy = false;
    //         this.authErrorHandler.handleError(err.message);
    //     });
    // }

    //-- Discipline lookup
    onGetDisciplineLookup = () => {
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

    onSaveData = (form: NgForm) => {
        if (!form || form.invalid) {
            return;
        }
        this.clientState.isBusy = true;
        let updationModel = <ITRAdminUpdationModel>{
            ...this.updationModel
        }
        if (updationModel.type == 'Handover') updationModel.disciplineId = null
        this.itrService.updateITR(updationModel).subscribe({
            complete: () => {
                this.clientState.isBusy = false;
                this.onSuccess.emit(true);
            },
            error: (err: ApiError) => {
                this.clientState.isBusy = false;
                this.authErrorHandler.handleError(err.message);
            }
        });
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}