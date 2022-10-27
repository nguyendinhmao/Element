import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ClientState, AuthErrorHandler } from 'src/app/shared/services';
import { DataHandoverService } from 'src/app/shared/services/api/data-tab/data-handover.service';
import { ToastrService } from 'ngx-toastr';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { Constants } from 'src/app/shared/common';

@Component({
    selector: 'import-handover',
    templateUrl: './import-handover.component.html'
})
export class ImportHandoverComponent{
    @Input() visible: boolean;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Input() projectKey
    suggestion: boolean = false;
    fileDataHandover: File;

    constructor(
        public clientState: ClientState,
        private dataHandoverService: DataHandoverService,
        private toastr: ToastrService,
        private authErrorHandler: AuthErrorHandler
    ) { }

    onSelectFile = (event) => {
        let file: File = event.target.files && <File>event.target.files[0];
        if(this.fileDataHandover !== null) this.fileDataHandover = null;
        const filetype = file.type;
        const fileNameEndsWithCsv = file.name.toLocaleLowerCase().endsWith(".csv"); 
        var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
        if (file) {
            this.suggestion = isCorrectFileType;
            this.fileDataHandover = file;
        }
    }

    onImportData = () => {
        if (this.fileDataHandover) {
            const fileNameEndsWithCsv = this.fileDataHandover.name.toLocaleLowerCase().endsWith(".csv");
            const filetype = this.fileDataHandover.type;
            var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
            if (!isCorrectFileType) {
                this.authErrorHandler.handleError("Please select the file format as csv.");
                return;
            }

            this.clientState.isBusy = true;
            this.dataHandoverService.insertHandoversViaCsvFile(this.projectKey,this.fileDataHandover).subscribe({
                complete: () => {
                    this.fileDataHandover = null;
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