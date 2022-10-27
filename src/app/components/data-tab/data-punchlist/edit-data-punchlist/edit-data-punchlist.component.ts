import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { DataPunchListService } from 'src/app/shared/services/api/data-tab/data-punchlist.service';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { UpdatePunchListModel } from 'src/app/shared/models/data-tab/data-punchlist.model';
import { DisciplineLookUpModel } from 'src/app/shared/models/data-tab/data-discipline.model';
import { MilestoneLookUpModel } from 'src/app/shared/models/data-tab/data-milestone.model';

import { DataDisciplineService } from 'src/app/shared/services/api/data-tab/data-discipline.service';
import { DataMilestoneService } from 'src/app/shared/services/api/data-tab/data-milestone.service';
import { Constants } from 'src/app/shared/common';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/shared/directives/format-datepicker/format-datepicker';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
    selector: 'edit-data-punchlist',
    templateUrl: './edit-data-punchlist.component.html',
    providers: [
        { provide: DateAdapter, useClass: AppDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})

export class EditDataPunchListComponent implements OnInit {

    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Input() punchListId: string;
    @Input() updationModel: UpdatePunchListModel
    punchListCodeError: boolean = false;
    punchListErrorMessage: string;

    disciplineModels: DisciplineLookUpModel[] = [];
    milestoneModels: MilestoneLookUpModel[] = [];
    sub: Subscription;
    projectKey: string;

    constructor(
        public clientState: ClientState,
        private dataPunchListService: DataPunchListService,
        private authErrorHandler: AuthErrorHandler,
        private disciplineService: DataDisciplineService,
        private milestoneService: DataMilestoneService,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        this.sub = this.route.params.subscribe(params => {
            this.projectKey = params['projectKey'];
            if (!this.projectKey) {
                this.router.navigate(['']);
            }
        });
    }

    ngOnInit() {
        this.punchListCodeError = false;
        this.punchListErrorMessage = null;
        this.onGetPunchListById();
        this.onGetLookUpDiscipline();
        this.onGetLookUpMilestone();
    }

    onGetPunchListById = () => {
        this.clientState.isBusy = true;
        this.dataPunchListService.getPunchListId(this.punchListId).subscribe(res => {
            this.updationModel = res ? <UpdatePunchListModel>{ ...res } : null;
            this.clientState.isBusy = false;
        }), (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        };
    }

    onSaveData = (form: NgForm) => {
        if (!form || form.invalid) {
            return;
        }
        this.clientState.isBusy = true;
        let punchListUpdateModel = <UpdatePunchListModel>{
            ...this.updationModel
        };
        punchListUpdateModel.dateCompleted = punchListUpdateModel.dateCompleted ? (new Date(punchListUpdateModel.dateCompleted)).toDateString() : null
        this.dataPunchListService.updatePunchList(punchListUpdateModel).subscribe({
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

    onChangePunchListCode = (event) => {
        const regex = /r'^[a-zA-Z0-9\+]*$'/;
        let codeMacth = regex.test(event.target.value);
        if (codeMacth && event.target.value.length > 7) {
            this.punchListCodeError = true;
            this.punchListErrorMessage = Constants.ValidateDisciplineCodeMaxLength;
            return;
        }
        if (!codeMacth && event.target.value.length > 1) {
            this.punchListCodeError = true;
            this.punchListErrorMessage = Constants.ValidateDisciplineCodeFormat;
            return;
        }
        this.punchListCodeError = false;
        this.punchListErrorMessage = null;
        return;
    }

    onGetLookUpDiscipline() {
        this.clientState.isBusy = true;
        this.disciplineService.getDisciplineLookUp(this.projectKey).subscribe(res => {
            this.disciplineModels = res.content ? <DisciplineLookUpModel[]>[...res.content] : [];
            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }

    onGetLookUpMilestone() {
        this.clientState.isBusy = true;
        this.milestoneService.getMilestoneLookUp().subscribe(res => {
            this.milestoneModels = res.content ? <MilestoneLookUpModel[]>[...res.content] : [];
            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}