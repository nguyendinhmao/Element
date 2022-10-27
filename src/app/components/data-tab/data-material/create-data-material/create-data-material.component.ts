import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { DataMaterialService } from 'src/app/shared/services/api/data-tab/data-material.service';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { CreateMaterialModel } from 'src/app/shared/models/data-tab/data-material.model';
import { Constants } from 'src/app/shared/common';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/shared/directives/format-datepicker/format-datepicker';
import { Subscription } from 'rxjs';

@Component({
    selector: 'create-data-material',
    templateUrl: './create-data-material.component.html',
    providers: [
        { provide: DateAdapter, useClass: AppDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})

export class CreateDataMaterialComponent implements OnInit {

    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Input() projectId: string;

    creationModel: CreateMaterialModel = new CreateMaterialModel();
    materialCodeError: boolean = false;
    materialErrorMessage: string;
    sub: Subscription;

    constructor(
        public clientState: ClientState,
        private dataMaterialService: DataMaterialService,
        private authErrorHandler: AuthErrorHandler,
    ) { }

    ngOnInit() {
        this.materialCodeError = false;
        this.materialErrorMessage = null;
    }

    onSaveData = (form: NgForm) => {
        if (!form || form.invalid) {
            return;
        }

        if(!Number.isInteger(this.creationModel.quantity)){
            this.authErrorHandler.handleError(Constants.ValueQuantityNotInteger);
            return;
        }
        if (this.creationModel.quantity > 2147483647 || this.creationModel.quantity < 0) {
            this.authErrorHandler.handleError(Constants.ValidateMaterialQuantityMax);
            return;
        }
        this.clientState.isBusy = true;
        this.creationModel.projectId = this.projectId;
        let materialCreateModel = <CreateMaterialModel>{
            ...this.creationModel
        };
        console.log('materialCreateModel', materialCreateModel);
        this.dataMaterialService.createMaterial(this.creationModel).subscribe({
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

    onChangeMaterialName = (event) => {
        const regex = /r'^[a-zA-Z0-9\+]*$'/;
        let codeMacth = regex.test(event.target.value);
        if (codeMacth && event.target.value.length > 30) {
            this.materialCodeError = true;
            this.materialErrorMessage = Constants.ValidateMaterialCodeMaxLength;
            return;
        }
        if (!codeMacth && event.target.value.length > 1) {
            this.materialCodeError = true;
            this.materialErrorMessage = Constants.ValidateMaterialCodeFormat;
            return;
        }
        this.materialCodeError = false;
        this.materialErrorMessage = null;
        return;
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}
