import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { DataSystemService } from 'src/app/shared/services/api/data-tab/data-system.service';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';

@Component({
    selector: 'import-data-system',
    templateUrl: './import-data-system.component.html'
})

export class ImportDataSystemComponent {
    @Input() visible: boolean;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Input() projectId: string;
    fileDataSystem: File;
    suggestion: boolean = false;

    constructor(
        public clientState: ClientState,
        private dataSystemService: DataSystemService,
        private authErrorHandler: AuthErrorHandler
    ) { }

    onImportData = () => {
        if (this.fileDataSystem) {
            const filetype = this.fileDataSystem.type;
            const fileNameEndsWithCsv = this.fileDataSystem.name.toLocaleLowerCase().endsWith(".csv");
            var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
            if (!isCorrectFileType) {
                this.authErrorHandler.handleError("Please select the file format as csv.");
                return;
            }
            this.clientState.isBusy = true;
            this.dataSystemService.insertSystemsViaCsvFile(this.projectId, this.fileDataSystem).subscribe({
                complete: () => {
                    this.fileDataSystem = null;
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
            this.authErrorHandler.handleError("Please choose file.");
        }
    }

    onSelectFile = (event) => {

        let file: File = event.target.files && <File>event.target.files[0];
        if(this.fileDataSystem !== null) this.fileDataSystem = null;
        const filetype = file.type;
        const fileNameEndsWithCsv = file.name.toLocaleLowerCase().endsWith(".csv");
        var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
        if (file) {
            this.suggestion = isCorrectFileType;
            this.fileDataSystem = file;
        }
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}