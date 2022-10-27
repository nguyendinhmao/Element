import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { DataPunchTypeService } from 'src/app/shared/services/api/data-tab/data-punchtype.service';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { UpdatePunchTypeModel } from 'src/app/shared/models/data-tab/data-punchtype.model';
import { Constants } from 'src/app/shared/common';

@Component({
    selector: 'edit-data-punchtype',
    templateUrl: './edit-data-punchtype.component.html'
})

export class EditDataPunchTypeComponent implements OnInit {
    
    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Input() punchTypeId: string;

    @Input() updationModel: UpdatePunchTypeModel;
    typeError: boolean = false;
    punchTypeErrorMessage: string;

    constructor(
        public clientState: ClientState,
        private dataPunchTypeService: DataPunchTypeService,
        private authErrorHandler: AuthErrorHandler
    ) { }

    ngOnInit() {
        this.typeError = false;
        this.punchTypeErrorMessage = null;
        if(!this.updationModel) this.updationModel = new UpdatePunchTypeModel();
    }

    onSaveData = (form: NgForm) => {
        if (!form || form.invalid) {
            return;
        }
        this.clientState.isBusy = true;
        let subsystemUpdateModel = <UpdatePunchTypeModel>{
            ...this.updationModel
        };
        this.dataPunchTypeService.updatePunchType(subsystemUpdateModel).subscribe({
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

    onChangePunchTypeCode = (event) => {
        const regex = /r'^[a-zA-Z0-9\+]*$'/;
        let codeMacth = regex.test(event.target.value);
        if (codeMacth && event.target.value.length > 7) {
            this.typeError = true;
            this.punchTypeErrorMessage = Constants.ValidatePunchTypeCodeMaxLength;
            return;
        }
        if (!codeMacth && event.target.value.length > 1) {
            this.typeError = true;
            this.punchTypeErrorMessage = Constants.ValidatePunchTypeCodeFormat;
            return;
        }
        this.typeError = false;
        this.punchTypeErrorMessage = null;
        return;
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}