import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DataWorkpackService } from 'src/app/shared/services/api/data-tab/data-workpack.service';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ToastrService } from 'ngx-toastr';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { Constants } from 'src/app/shared/common';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'import-data-workpack',
    templateUrl: './import-data-workpack.compnent.html'
})

export class ImportDataWorkpackComponent {
    @Input() visible: boolean;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

    suggestion: boolean = false;
    fileDataWorkpack: File;

    sub: Subscription;
    projectKey: string;

    constructor(
        public clientState: ClientState,
        private dataWorkpackService: DataWorkpackService,
        private toastr: ToastrService,
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
        if (this.fileDataWorkpack !== null) this.fileDataWorkpack = null;
        const filetype = file.type;
        const fileNameEndsWithCsv = file.name.toLocaleLowerCase().endsWith(".csv");
        var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
        if (file) {
            this.suggestion = isCorrectFileType;
            this.fileDataWorkpack = file;
        }
    }

    onImportData = () => {
        if (this.fileDataWorkpack) {
            const filetype = this.fileDataWorkpack.type;
            const fileNameEndsWithCsv = this.fileDataWorkpack.name.toLocaleLowerCase().endsWith(".csv");
            var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
            if (!isCorrectFileType) {
                this.authErrorHandler.handleError("Please select the file format as csv.");
                return;
            }

            this.clientState.isBusy = true;
            this.dataWorkpackService.insertWorkpacksViaCsvFile(this.fileDataWorkpack, this.projectKey).subscribe({
                complete: () => {
                    this.fileDataWorkpack = null;
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
