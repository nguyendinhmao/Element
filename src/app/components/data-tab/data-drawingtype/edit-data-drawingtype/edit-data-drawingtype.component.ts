import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { DataDrawingTypeService } from 'src/app/shared/services/api/data-tab/data-drawingtype.service';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { UpdateDrawingTypeModel } from 'src/app/shared/models/data-tab/data-drawingtype.model';
import { Constants } from 'src/app/shared/common';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/shared/directives/format-datepicker/format-datepicker';

@Component({
    selector: 'edit-data-drawingtype',
    templateUrl: './edit-data-drawingtype.component.html',
    providers: [
        { provide: DateAdapter, useClass: AppDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})

export class EditDataDrawingTypeComponent implements OnInit {

    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Input() drawingTypeId: string;

    updationModel: UpdateDrawingTypeModel = new UpdateDrawingTypeModel();
    drawingTypeCodeError: boolean = false;
    drawingTypeErrorMessage: string;

    constructor(
        public clientState: ClientState,
        private dataDrawingTypeService: DataDrawingTypeService,
        private authErrorHandler: AuthErrorHandler,
    ) { }

    ngOnInit() {
        this.drawingTypeCodeError = false;
        this.drawingTypeErrorMessage = null;
        this.onGetDrawingTypeById();
    }

    onGetDrawingTypeById = () => {
        this.clientState.isBusy = true;
        this.dataDrawingTypeService.getDrawingTypeId(this.drawingTypeId).subscribe(res => {
            this.updationModel = res ? <UpdateDrawingTypeModel>{ ...res } : null;
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
        let drawingTypeUpdateModel = <UpdateDrawingTypeModel>{
            ...this.updationModel
        };
        this.dataDrawingTypeService.updateDrawingType(drawingTypeUpdateModel).subscribe({
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

    onChangeDrawingTypeName = (event) => {
        const regex = /r'^[a-zA-Z0-9\+]*$'/;
        let codeMacth = regex.test(event.target.value);
        if (codeMacth && event.target.value.length > 25) {
            this.drawingTypeCodeError = true;
            this.drawingTypeErrorMessage = Constants.ValidateDrawingTypeCodeMaxLength;
            return;
        }
        if (!codeMacth && event.target.value.length > 1) {
            this.drawingTypeCodeError = true;
            this.drawingTypeErrorMessage = Constants.ValidateDrawingTypeCodeFormat;
            return;
        }
        this.drawingTypeCodeError = false;
        this.drawingTypeErrorMessage = null;
        return;
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}