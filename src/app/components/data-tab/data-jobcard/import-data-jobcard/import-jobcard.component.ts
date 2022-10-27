import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ClientState, AuthErrorHandler } from 'src/app/shared/services';
import { DataJobCardService } from 'src/app/shared/services/api/data-tab/data-jobcard.service';
import { ToastrService } from 'ngx-toastr';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { Constants } from 'src/app/shared/common';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'import-jobcard',
    templateUrl: './import-jobcard.component.html'
})
export class ImportJobCardComponent {
    @Input() visible: boolean;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

    suggestion: boolean = false;
    fileDataJobCard: File;

    sub: Subscription;
    projectKey: string;

    constructor(
        public clientState: ClientState,
        private dataJobCardService: DataJobCardService,
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
        if (this.fileDataJobCard !== null) this.fileDataJobCard = null;
        const filetype = file.type;
        const fileNameEndsWithCsv = file.name.toLocaleLowerCase().endsWith(".csv");
        var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
        if (file) {
            this.suggestion = isCorrectFileType;
            this.fileDataJobCard = file;
        }
    }

    onImportData = () => {
        if (this.fileDataJobCard) {
            const filetype = this.fileDataJobCard.type;
            const fileNameEndsWithCsv = this.fileDataJobCard.name.toLocaleLowerCase().endsWith(".csv");
            var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
            if (!isCorrectFileType) {
                this.authErrorHandler.handleError("Please select the file format as csv.");
                return;
            }

            this.clientState.isBusy = true;
            this.dataJobCardService.insertJobCardsViaCsvFile(this.fileDataJobCard, this.projectKey).subscribe({
                complete: () => {
                    this.fileDataJobCard = null;
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