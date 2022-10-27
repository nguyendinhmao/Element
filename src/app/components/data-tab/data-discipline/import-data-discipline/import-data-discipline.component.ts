import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DataDisciplineService } from 'src/app/shared/services/api/data-tab/data-discipline.service';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ToastrService } from 'ngx-toastr';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { Constants } from 'src/app/shared/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'import-data-discipline',
    templateUrl: './import-data-discipline.compnent.html'
})

export class ImportDataDisciplineComponent {
    @Input() visible: boolean;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

    suggestion: boolean = false;
    fileDataDiscipline: File;
    projectKey: string;
    sub: Subscription;

    constructor(
        public clientState: ClientState,
        private dataDisciplineService: DataDisciplineService,
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
        if (this.fileDataDiscipline !== null) this.fileDataDiscipline = null;
        const fileNameEndsWithCsv = file.name.toLocaleLowerCase().endsWith(".csv");
        const filetype = file.type;
        var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
        if (file) {
            this.suggestion = isCorrectFileType;
            this.fileDataDiscipline = file;
        }
    }

    onImportData = () => {
        if (this.fileDataDiscipline) {
            const filetype = this.fileDataDiscipline.type;
            const fileNameEndsWithCsv = this.fileDataDiscipline.name.toLocaleLowerCase().endsWith(".csv");
            var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
            if (!isCorrectFileType) {
                this.authErrorHandler.handleError("Please select the file format as csv.");
                return;
            }

            this.clientState.isBusy = true;
            this.dataDisciplineService.insertDisciplinesViaCsvFile(this.fileDataDiscipline, this.projectKey).subscribe({
                complete: () => {
                    this.fileDataDiscipline = null;
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
