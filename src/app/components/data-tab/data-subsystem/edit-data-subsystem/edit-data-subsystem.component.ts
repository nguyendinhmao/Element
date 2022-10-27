import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { DataSubSystemService } from 'src/app/shared/services/api/data-tab/data-subsystem.service';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { UpdateSubSystemModel } from 'src/app/shared/models/data-tab/data-subsystem.model';

@Component({
    selector: 'edit-data-subsystem',
    templateUrl: './edit-data-subsystem.component.html'
})

export class EditDataSubSystemComponent implements OnInit {
    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Input() subSystemId: string;
    @Input() updationModel: UpdateSubSystemModel;
    subsystemNoError: boolean = false;
    subsystemErrorMessage: string;

    constructor(
        public clientState: ClientState,
        private dataSubSystemService: DataSubSystemService,
        private authErrorHandler: AuthErrorHandler
    ) { }

    public ngOnInit() {
        this.subsystemNoError = false;
        this.subsystemErrorMessage = null;
        if(!this.updationModel) this.updationModel = new UpdateSubSystemModel();
    }

    onSaveData = (form: NgForm) => {
        if (!form || form.invalid) {
            return;
        }
        this.clientState.isBusy = true;
        let subsystemUpdateModel = <UpdateSubSystemModel>{
            ...this.updationModel
        };
        this.dataSubSystemService.updateSubSystem(subsystemUpdateModel).subscribe({
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

    onChangeSubSystemNo = (event) => {
        const regex = /r'^[a-zA-Z0-9\+]*$'/;
        let codeMacth = regex.test(event.target.value);
        if (codeMacth && event.target.value.length > 7) {
            this.subsystemNoError = true;
            this.subsystemErrorMessage = "Sub system Number maximune 7 characters";
            return;
        }
        if (!codeMacth && event.target.value.length > 1) {
            this.subsystemNoError = true;
            this.subsystemErrorMessage = "Sub subsystem Number which allows only the a-zA-Z0-9 characters";
            return;
        }
        this.subsystemNoError = false;
        this.subsystemErrorMessage = null;
        return;
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}