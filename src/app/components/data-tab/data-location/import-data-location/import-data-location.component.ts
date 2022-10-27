import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DataLocationService } from 'src/app/shared/services/api/data-tab/data-location.service';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'import-data-location',
    templateUrl: './import-data-location.component.html'
})

export class ImportDataLocationComponent {
    @Input() visible: boolean;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Input() projectId: string;

    suggestion: boolean = false;
    fileDataLocation: File;

    sub: Subscription;
    projectKey: string;

    constructor(
        public clientState: ClientState,
        private dataLocationService: DataLocationService,
        private authErrorHandler: AuthErrorHandler,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        this.sub = this.route.params.subscribe((params) => {
            this.projectKey = params["projectKey"];
            if (!this.projectKey) {
                this.router.navigate([""]);
            }
        });
    }

    onSelectFile = (event) => {
        let file: File = event.target.files && <File>event.target.files[0];
        if (this.fileDataLocation !== null) this.fileDataLocation = null;
        const filetype = file.type;
        const fileNameEndsWithCsv = file.name.toLocaleLowerCase().endsWith(".csv");
        var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
        if (file) {
            this.suggestion = isCorrectFileType;
            this.fileDataLocation = file;
        }
    }

    onImportData = () => {
        if (this.fileDataLocation) {
            const filetype = this.fileDataLocation.type;
            const fileNameEndsWithCsv = this.fileDataLocation.name.toLocaleLowerCase().endsWith(".csv");
            var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
            if (!isCorrectFileType) {
                this.authErrorHandler.handleError("Please select the file format as csv.");
                return;
            }

            this.clientState.isBusy = true;
            this.dataLocationService.insertLocationsViaCsvFile(this.fileDataLocation, this.projectKey).subscribe({
                complete: () => {
                    this.fileDataLocation = null;
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

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}
