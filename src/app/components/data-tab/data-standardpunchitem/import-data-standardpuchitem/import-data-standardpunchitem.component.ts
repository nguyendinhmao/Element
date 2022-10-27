import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ToastrService } from 'ngx-toastr';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { Constants } from 'src/app/shared/common';
import { DataStandardPunchItemService } from 'src/app/shared/services/api/data-tab/data-standardpunchitem.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'import-data-standardpunchitem',
    templateUrl: './import-data-standardpunchitem.compnent.html'
})

export class ImportStandardPunchItemComponent {
    @Input() visible: boolean;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

    suggestion: boolean = false;
    fileDataStandardPunchItem: File;
    projectKey: string;
    sub: any;

    constructor(
        public clientState: ClientState,
        private dataStandardPunchItemService: DataStandardPunchItemService,
        private toastr: ToastrService,
        private authErrorHandler: AuthErrorHandler,
        private route: ActivatedRoute,
        private router: Router,
    ) { 
        this.sub = this.route.params.subscribe(params => {
            this.projectKey = params['projectKey'];
            if (!this.projectKey) {
                this.router.navigate([""]);
            }
        });
    }

    onSelectFile = (event) => {
        let file: File = event.target.files && <File>event.target.files[0];
        if(this.fileDataStandardPunchItem !== null) this.fileDataStandardPunchItem = null;
        const fileNameEndsWithCsv = file.name.toLocaleLowerCase().endsWith(".csv");
        const filetype = file.type;
        var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
        if (file) {
            this.suggestion = isCorrectFileType;
            this.fileDataStandardPunchItem = file;
        }
    }

    onImportData = () => {
        if (this.fileDataStandardPunchItem) {
            const filetype = this.fileDataStandardPunchItem.type;
            const fileNameEndsWithCsv = this.fileDataStandardPunchItem.name.toLocaleLowerCase().endsWith(".csv");
            var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel')||fileNameEndsWithCsv;
            if (!isCorrectFileType) {
                this.authErrorHandler.handleError("Please select the file format as csv.");
                return;
            }

            this.clientState.isBusy = true;
            this.dataStandardPunchItemService.insertStandardPunchItemsViaCsvFile(this.fileDataStandardPunchItem, this.projectKey).subscribe({
                complete: () => {
                    this.fileDataStandardPunchItem = null;
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
