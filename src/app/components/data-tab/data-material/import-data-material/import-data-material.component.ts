import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DataMaterialService } from 'src/app/shared/services/api/data-tab/data-material.service';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ToastrService } from 'ngx-toastr';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { Constants } from 'src/app/shared/common';

@Component({
    selector: 'import-data-material',
    templateUrl: './import-data-material.compnent.html'
})

export class ImportDataMaterialComponent {
    @Input() visible: boolean;
    @Input() projectKey: string;
    @Input() projectId: string;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

    suggestion: boolean = false;
    fileDataMaterial: File;

    constructor(
        public clientState: ClientState,
        private dataMaterialService: DataMaterialService,
        private toastr: ToastrService,
        private authErrorHandler: AuthErrorHandler
    ) { }

    onSelectFile = (event) => {
        let file: File = event.target.files && <File>event.target.files[0];
        if(this.fileDataMaterial !== null) this.fileDataMaterial = null;
        const filetype = file.type;
        const fileNameEndsWithCsv = file.name.toLocaleLowerCase().endsWith(".csv");
        var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
        if (file) {
            this.suggestion = isCorrectFileType;
            this.fileDataMaterial = file;
        }
    }

    onImportData = () => {
        if (this.fileDataMaterial) {
            const filetype = this.fileDataMaterial.type;
            const fileNameEndsWithCsv = this.fileDataMaterial.name.toLocaleLowerCase().endsWith(".csv");
            var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
            if (!isCorrectFileType) {
                this.authErrorHandler.handleError("Please select the file format as csv.");
                return;
            }

            this.clientState.isBusy = true;
            this.dataMaterialService.insertMaterialsViaCsvFile(this.fileDataMaterial, this.projectKey).subscribe({
                complete: () => {
                    this.fileDataMaterial = null;
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
