import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DataSubSystemService } from 'src/app/shared/services/api/data-tab/data-subsystem.service';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ToastrService } from 'ngx-toastr';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';

@Component({
    selector: 'import-data-subsystem',
    templateUrl: './import-data-subsystem.component.html'
})

export class ImportDataSubSystemComponent {
    @Input() visible: boolean;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Input() projectKey: string;
    suggestion: boolean = false;
    fileDataSubSystem: File;

    constructor(
        public clientState: ClientState,
        private dataSubSystemService: DataSubSystemService,
        private toastr: ToastrService,
        private authErrorHandler: AuthErrorHandler
    ) { }

    onSelectFile = (event) => {
        let file: File = event.target.files && <File>event.target.files[0];
        if(this.fileDataSubSystem !== null) this.fileDataSubSystem = null;
        const filetype = file.type;
        const fileNameEndsWithCsv = file.name.toLocaleLowerCase().endsWith(".csv");
        var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
        if (file) {
            this.suggestion = isCorrectFileType;
            this.fileDataSubSystem = file;
        }
    }

    onImportData = () => {
        if (this.fileDataSubSystem) {
            const filetype = this.fileDataSubSystem.type;
            const fileNameEndsWithCsv = this.fileDataSubSystem.name.toLocaleLowerCase().endsWith(".csv");
            var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
            if (!isCorrectFileType) {
                this.authErrorHandler.handleError("Please select the file format as csv.");
                return;
            }

            this.clientState.isBusy = true;
            this.dataSubSystemService.insertSubSystemsViaCsvFile(this.projectKey,this.fileDataSubSystem).subscribe({
                complete: () => {
                    this.fileDataSubSystem = null;
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
            this.toastr.error("Please choose file.");
        }
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}
