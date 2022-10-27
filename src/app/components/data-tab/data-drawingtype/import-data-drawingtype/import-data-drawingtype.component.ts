import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DataDrawingTypeService } from 'src/app/shared/services/api/data-tab/data-drawingtype.service';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ToastrService } from 'ngx-toastr';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { Constants } from 'src/app/shared/common';

@Component({
    selector: 'import-data-drawingtype',
    templateUrl: './import-data-drawingtype.compnent.html'
})

export class ImportDataDrawingTypeComponent {
    @Input() visible: boolean;
    @Input() projectKey: string;
    @Input() projectId: string;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

    suggestion: boolean = false;
    fileDataDrawingType: File;

    constructor(
        public clientState: ClientState,
        private dataDrawingTypeService: DataDrawingTypeService,
        private toastr: ToastrService,
        private authErrorHandler: AuthErrorHandler
    ) { }

    onSelectFile = (event) => {
        let file: File = event.target.files && <File>event.target.files[0];
        if(this.fileDataDrawingType !== null) this.fileDataDrawingType = null;
        const filetype = file.type;
        const fileNameEndsWithCsv = file.name.toLocaleLowerCase().endsWith(".csv");
        var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
        if (file) {
            this.suggestion = isCorrectFileType;
            this.fileDataDrawingType = file;
        }
    }

    onImportData = () => {
        if (this.fileDataDrawingType) {
            const filetype = this.fileDataDrawingType.type;
            const fileNameEndsWithCsv = this.fileDataDrawingType.name.toLocaleLowerCase().endsWith(".csv");
            var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
            if (!isCorrectFileType) {
                this.authErrorHandler.handleError("Please select the file format as csv.");
                return;
            }

            this.clientState.isBusy = true;
            this.dataDrawingTypeService.insertDrawingTypesViaCsvFile(this.projectId, this.fileDataDrawingType).subscribe({
                complete: () => {
                    this.fileDataDrawingType = null;
                    this.clientState.isBusy = false;
                    this.onSuccess.emit(true);
                },
                error: (err: ApiError) => {
                    this.clientState.isBusy = false;
                    this.onSuccess.emit(false);
                    this.authErrorHandler.handleError(err.message);
                }
            })
        } else {
            this.toastr.error(Constants.ChooseFile);
        }
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}
