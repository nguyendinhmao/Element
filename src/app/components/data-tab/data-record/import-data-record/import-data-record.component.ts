import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ITRService } from 'src/app/shared/services/api/itr/itr.service';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ToastrService } from 'ngx-toastr';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { Constants } from 'src/app/shared/common';

@Component({
    selector: 'import-data-record',
    templateUrl: './import-data-record.compnent.html'
})

export class ImportDataRecordComponent {
    @Input() visible: boolean;
    @Input() projectKey: string;
    @Input() projectId: string;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

    suggestion: boolean = false;
    fileDataRecord: File;

    constructor(
        public clientState: ClientState,
        private dataRecordService: ITRService,
        private toastr: ToastrService,
        private authErrorHandler: AuthErrorHandler
    ) { }

    onSelectFile = (event) => {
        let file: File = event.target.files && <File>event.target.files[0];
        if(this.fileDataRecord !== null) this.fileDataRecord = null;
        const filetype = file.type;
        const fileNameEndsWithCsv = file.name.toLocaleLowerCase().endsWith(".csv");
        var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
        if (file) {
            this.suggestion = isCorrectFileType;
            this.fileDataRecord = file;
        }
    }

    onImportData = () => {
        if (this.fileDataRecord) {
            const filetype = this.fileDataRecord.type;
            const fileNameEndsWithCsv = this.fileDataRecord.name.toLocaleLowerCase().endsWith(".csv");
            var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
            if (!isCorrectFileType) {
                this.authErrorHandler.handleError("Please select the file format as csv.");
                return;
            }

            this.clientState.isBusy = true;
            this.dataRecordService.insertRecordsViaCsvFile(this.projectId, this.fileDataRecord).subscribe({
                complete: () => {
                    this.fileDataRecord = null;
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
