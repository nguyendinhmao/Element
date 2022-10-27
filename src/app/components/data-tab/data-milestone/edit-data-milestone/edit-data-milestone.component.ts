import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { DataMilestoneService } from 'src/app/shared/services/api/data-tab/data-milestone.service';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { UpdateMilestoneModel } from 'src/app/shared/models/data-tab/data-milestone.model';
import { Constants } from 'src/app/shared/common';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/shared/directives/format-datepicker/format-datepicker';

@Component({
    selector: 'edit-data-milestone',
    templateUrl: './edit-data-milestone.component.html',
    providers: [
        { provide: DateAdapter, useClass: AppDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})

export class EditDataMilestoneComponent implements OnInit {

    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Input() milestoneId: string;

    updationModel: UpdateMilestoneModel = new UpdateMilestoneModel();
    milestoneCodeError: boolean = false;
    milestoneErrorMessage: string;

    constructor(
        public clientState: ClientState,
        private dataMilestoneService: DataMilestoneService,
        private authErrorHandler: AuthErrorHandler,
    ) { }

    ngOnInit() {
        this.milestoneCodeError = false;
        this.milestoneErrorMessage = null;
        this.onGetMilestoneById();
    }

    onGetMilestoneById = () => {
        this.clientState.isBusy = true;
        this.dataMilestoneService.getMilestoneId(this.milestoneId).subscribe(res => {
            this.updationModel = res ? <UpdateMilestoneModel>{ ...res } : null;
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
        let milestoneUpdateModel = <UpdateMilestoneModel>{
            ...this.updationModel
        };
        milestoneUpdateModel.dateStartPlanned = milestoneUpdateModel.dateStartPlanned ? (new Date(milestoneUpdateModel.dateStartPlanned)).toDateString() : null
        milestoneUpdateModel.dateEndPlanned = milestoneUpdateModel.dateEndPlanned ? (new Date(milestoneUpdateModel.dateEndPlanned)).toDateString() : null
        milestoneUpdateModel.dateStartActual = milestoneUpdateModel.dateStartActual ? (new Date(milestoneUpdateModel.dateStartActual)).toDateString() : null
        milestoneUpdateModel.dateEndActual = milestoneUpdateModel.dateEndActual ? (new Date(milestoneUpdateModel.dateEndActual)).toDateString() : null
        this.dataMilestoneService.updateMilestone(milestoneUpdateModel).subscribe({
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

    onChangeMilestoneName = (event) => {
        const regex = /r'^[a-zA-Z0-9\+]*$'/;
        let codeMacth = regex.test(event.target.value);
        if (codeMacth && event.target.value.length > 7) {
            this.milestoneCodeError = true;
            this.milestoneErrorMessage = Constants.ValidateMilestoneCodeMaxLength;
            return;
        }
        if (!codeMacth && event.target.value.length > 1) {
            this.milestoneCodeError = true;
            this.milestoneErrorMessage = Constants.ValidateMilestoneCodeFormat;
            return;
        }
        this.milestoneCodeError = false;
        this.milestoneErrorMessage = null;
        return;
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}