import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ClientState, AuthErrorHandler } from 'src/app/shared/services';
import { DataOrderService } from 'src/app/shared/services/api/data-tab/data-order.service';
import { ToastrService } from 'ngx-toastr';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { Constants } from 'src/app/shared/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'import-order',
    templateUrl: './import-order.component.html'
})
export class ImportOrderComponent {
    @Input() visible: boolean;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

    suggestion: boolean = false;
    fileDataOrder: File;
    sub: Subscription;
    projectKey: string;

    constructor(
        public clientState: ClientState,
        private dataOrderService: DataOrderService,
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
        if (this.fileDataOrder !== null) this.fileDataOrder = null;
        const filetype = file.type;
        const fileNameEndsWithCsv = file.name.toLocaleLowerCase().endsWith(".csv");
        var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
        if (file) {
            this.suggestion = isCorrectFileType;
            this.fileDataOrder = file;
        }
    }

    onImportData = () => {
        if (this.fileDataOrder) {
            const filetype = this.fileDataOrder.type;
            const fileNameEndsWithCsv = this.fileDataOrder.name.toLocaleLowerCase().endsWith(".csv");
            var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
            if (!isCorrectFileType) {
                this.authErrorHandler.handleError("Please select the file format as csv.");
                return;
            }

            this.clientState.isBusy = true;
            this.dataOrderService.insertOrdersViaCsvFile(this.fileDataOrder, this.projectKey).subscribe({
                complete: () => {
                    this.fileDataOrder = null;
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