import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { DataWorkpackService } from 'src/app/shared/services/api/data-tab/data-workpack.service';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { UpdateWorkpackModel } from 'src/app/shared/models/data-tab/data-workpack.model';
import { Constants } from 'src/app/shared/common';

@Component({
    selector: 'edit-data-workpack',
    templateUrl: './edit-data-workpack.component.html'
})

export class EditDataWorkpackComponent implements OnInit {

    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Input() workpackId: string;
    @Input() updationModel: UpdateWorkpackModel
    workpackCodeError: boolean = false;
    workpackErrorMessage: string;

    constructor(
        public clientState: ClientState,
        private dataWorkpackService: DataWorkpackService,
        private authErrorHandler: AuthErrorHandler
    ) { }

    ngOnInit() {
        this.workpackCodeError = false;
        this.workpackErrorMessage = null;
    }


    onSaveData = (form: NgForm) => {
        if (!form || form.invalid) {
            return;
        }
        this.clientState.isBusy = true;
        let subsystemUpdateModel = <UpdateWorkpackModel>{
            ...this.updationModel
        };
        this.dataWorkpackService.updateWorkpack(subsystemUpdateModel).subscribe({
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

    onChangeWorkpackCode = (event) => {
        const regex = /r'^[a-zA-Z0-9\+]*$'/;
        let codeMacth = regex.test(event.target.value);
        if (codeMacth && event.target.value.length > 7) {
            this.workpackCodeError = true;
            this.workpackErrorMessage = Constants.ValidateDisciplineCodeMaxLength;
            return;
        }
        if (!codeMacth && event.target.value.length > 1) {
            this.workpackCodeError = true;
            this.workpackErrorMessage = Constants.ValidateDisciplineCodeFormat;
            return;
        }
        this.workpackCodeError = false;
        this.workpackErrorMessage = null;
        return;
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}