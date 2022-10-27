import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { DataPreservationElementService } from 'src/app/shared/services/api/data-tab/data-preservationelement.service';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { UpdatePreservationElementModel } from 'src/app/shared/models/data-tab/data-preservationelement.model';
import { Constants } from 'src/app/shared/common';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/shared/directives/format-datepicker/format-datepicker';

@Component({
    selector: 'edit-data-preservationelement',
    templateUrl: './edit-data-preservationelement.component.html',
    providers: [
        { provide: DateAdapter, useClass: AppDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})

export class EditDataPreservationElementComponent implements OnInit {

    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Input() preservationElementId: string;

    updationModel: UpdatePreservationElementModel = new UpdatePreservationElementModel();
    preservationElementCodeError: boolean = false;
    preservationElementErrorMessage: string;

    constructor(
        public clientState: ClientState,
        private dataPreservationElementService: DataPreservationElementService,
        private authErrorHandler: AuthErrorHandler,
    ) { }

    ngOnInit() {
        this.preservationElementCodeError = false;
        this.preservationElementErrorMessage = null;
        this.onGetPreservationElementById();
    }

    onGetPreservationElementById = () => {
        this.clientState.isBusy = true;
        this.dataPreservationElementService.getPreservationElementId(this.preservationElementId).subscribe(res => {
            this.updationModel = res ? <UpdatePreservationElementModel>{ ...res } : null;
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
        let preservationElementUpdateModel = <UpdatePreservationElementModel>{
            ...this.updationModel
        };
        preservationElementUpdateModel.frequencyInWeeks = this.updationModel.type == 'Periodic' ? this.updationModel.frequencyInWeeks : null;
        // preservationElementUpdateModel.projectId = this.projectId;
        this.dataPreservationElementService.updatePreservationElement(preservationElementUpdateModel).subscribe({
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

    onChangePreservationElementName = (event) => {
        const regex = /r'^[a-zA-Z0-9\+]*$'/;
        let codeMacth = regex.test(event.target.value);
        if (codeMacth && event.target.value.length > 25) {
            this.preservationElementCodeError = true;
            this.preservationElementErrorMessage = Constants.ValidatePreservationElementCodeMaxLength;
            return;
        }
        if (!codeMacth && event.target.value.length > 1) {
            this.preservationElementCodeError = true;
            this.preservationElementErrorMessage = Constants.ValidatePreservationElementCodeFormat;
            return;
        }
        this.preservationElementCodeError = false;
        this.preservationElementErrorMessage = null;
        return;
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}