import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { DataDrawingService } from 'src/app/shared/services/api/data-tab/data-drawing.service';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { DrawingModel } from 'src/app/shared/models/data-tab/data-drawing.model';
import { Constants } from 'src/app/shared/common';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/shared/directives/format-datepicker/format-datepicker';
import { DataDrawingTypeService } from 'src/app/shared/services/api/data-tab/data-drawingtype.service';
import { DrawingTypeLookUpModel } from 'src/app/shared/models/data-tab/data-drawingtype.model';

@Component({
    selector: 'add-data-drawing',
    templateUrl: './add-data-drawing.component.html',
    styleUrls: ['./add-data-drawing.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: AppDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})

export class AddDataDrawingComponent implements OnInit {

    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Input() projectId: string;

    createModel: DrawingModel = new DrawingModel();
    drawingCodeError: boolean = false;
    drawingErrorMessage: string;
    drawingTypeModels: DrawingTypeLookUpModel[] = [];
    file: File;

    constructor(
        public clientState: ClientState,
        private dataDrawingService: DataDrawingService,
        private dataDrawingTypeService: DataDrawingTypeService,
        private authErrorHandler: AuthErrorHandler,
    ) { }

    ngOnInit() {
        this.drawingCodeError = false;
        this.drawingErrorMessage = null;
        this.onGetLookUpDrawingType(this.projectId);
    }

    onSaveData = (form: NgForm) => {
        if (!form || form.invalid) {
            return;
        }
        this.clientState.isBusy = true;
        let drawingCreateModel = <DrawingModel>{
            ...this.createModel
        };
        this.dataDrawingService.createDrawing(drawingCreateModel, this.file).subscribe({
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

    onChangeDrawingName = (event) => {
        const regex = /r'^[a-zA-Z0-9\+]*$'/;
        let codeMacth = regex.test(event.target.value);
        if (codeMacth && event.target.value.length > 25) {
            this.drawingCodeError = true;
            this.drawingErrorMessage = Constants.ValidateDrawingCodeMaxLength;
            return;
        }
        if (!codeMacth && event.target.value.length > 1) {
            this.drawingCodeError = true;
            this.drawingErrorMessage = Constants.ValidateDrawingCodeFormat;
            return;
        }
        this.drawingCodeError = false;
        this.drawingErrorMessage = null;
        return;
    }

    onGetLookUpDrawingType(projectId) {
        this.clientState.isBusy = true;
        this.dataDrawingTypeService.getDrawingTypeLookUp(projectId).subscribe(res => {
            this.drawingTypeModels = res.content ? <DrawingTypeLookUpModel[]>[...res.content] : [];
            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }

    onGetFile = (event) => {
        this.file = event.target.files && <File>event.target.files[0];
    }

    onRemoveUploadFile = () => {
        this.file = null;
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}