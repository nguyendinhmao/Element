import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DataPreservationElementService } from 'src/app/shared/services/api/data-tab/data-preservationelement.service';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ToastrService } from 'ngx-toastr';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { Constants } from 'src/app/shared/common';

@Component({
    selector: 'import-data-preservationelement',
    templateUrl: './import-data-preservationelement.compnent.html'
})

export class ImportDataPreservationElementComponent {
    @Input() visible: boolean;
    @Input() projectKey: string;
    @Input() projectId: string;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

    suggestion: boolean = false;
    fileDataPreservationElement: File;

    constructor(
        public clientState: ClientState,
        private dataPreservationElementService: DataPreservationElementService,
        private toastr: ToastrService,
        private authErrorHandler: AuthErrorHandler
    ) { }

    onSelectFile = (event) => {
        let file: File = event.target.files && <File>event.target.files[0];
        if(this.fileDataPreservationElement !== null) this.fileDataPreservationElement = null;
        const filetype = file.type;
        const fileNameEndsWithCsv = file.name.toLocaleLowerCase().endsWith(".csv");
        var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
        if (file) {
            this.suggestion = isCorrectFileType;
            this.fileDataPreservationElement = file;
        }
    }

    onImportData = () => {
        if (this.fileDataPreservationElement) {
            const filetype = this.fileDataPreservationElement.type;
            const fileNameEndsWithCsv = this.fileDataPreservationElement.name.toLocaleLowerCase().endsWith(".csv");
            var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
            if (!isCorrectFileType) {
                this.authErrorHandler.handleError("Please select the file format as csv.");
                return;
            }

            this.clientState.isBusy = true;
            this.dataPreservationElementService.insertPreservationElementsViaCsvFile(this.projectId, this.fileDataPreservationElement).subscribe({
                complete: () => {
                    this.fileDataPreservationElement = null;
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
