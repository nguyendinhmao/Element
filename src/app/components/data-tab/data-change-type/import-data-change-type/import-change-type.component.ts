import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ClientState, AuthErrorHandler } from 'src/app/shared/services';
import { DataChangeTypeService } from "src/app/shared/services/api/data-tab/data-changetype.service";
import { ToastrService } from 'ngx-toastr';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { Constants } from 'src/app/shared/common';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'import-change-type',
    templateUrl: './import-change-type.component.html'
})
export class ImportChangeTypeComponent {
    @Input() visible: boolean;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

    suggestion: boolean = false;
    fileDataChangeType: File;
    sub: Subscription;
    projectKey: string;

    constructor(
        public clientState: ClientState,
        private dataChangeTypeService: DataChangeTypeService,
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
        if (this.fileDataChangeType !== null) this.fileDataChangeType = null;
        const filetype = file.type;
        const fileNameEndsWithCsv = file.name.toLocaleLowerCase().endsWith(".csv");
        var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
        if (file) {
            this.suggestion = isCorrectFileType;
            this.fileDataChangeType = file;
        }
    }

    onImportData = () => {
        if (this.fileDataChangeType) {
            const filetype = this.fileDataChangeType.type;
            const fileNameEndsWithCsv = this.fileDataChangeType.name.toLocaleLowerCase().endsWith(".csv");
            var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
            if (!isCorrectFileType) {
                this.authErrorHandler.handleError("Please select the file format as csv.");
                return;
            }

            this.clientState.isBusy = true;
            this.dataChangeTypeService.insertChangeTypesViaCsvFile(this.fileDataChangeType, this.projectKey).subscribe({
                complete: () => {
                    this.fileDataChangeType = null;
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