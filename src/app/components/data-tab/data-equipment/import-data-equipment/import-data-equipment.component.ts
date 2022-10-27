import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ClientState, AuthErrorHandler } from 'src/app/shared/services';
import { DataEquipmentService } from 'src/app/shared/services/api/data-tab/data-equipment.service';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'import-data-equipment',
    templateUrl: './import-data-equipment.component.html'
})

export class ImportDataEquipmentComponent {
    @Input() visible: boolean;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Input() projectId: string;

    fileDataEquipment: File;
    suggestion: boolean = false;
    projectKey: string;

    constructor(
        public clientState: ClientState,
        private dataEquipmentService: DataEquipmentService,
        private authErrorHandler: AuthErrorHandler,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        this.route.params.subscribe((params) => {
            this.projectKey = params["projectKey"];
            if (!this.projectKey) {
              this.router.navigate([""]);
            }
          });
     }

    onImportData = () => {
        if (this.fileDataEquipment) {
            const filetype = this.fileDataEquipment.type;
            const fileNameEndsWithCsv = this.fileDataEquipment.name.toLocaleLowerCase().endsWith(".csv");
            var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
            if (!isCorrectFileType) {
                this.authErrorHandler.handleError("Please select the file format as csv.");
                return;
            }

            this.clientState.isBusy = true;
            this.dataEquipmentService.insertquipmentsViaCsvFile(this.fileDataEquipment, this.projectKey).subscribe({
                complete: () => {
                    this.fileDataEquipment = null;
                    this.clientState.isBusy = false;
                    this.onSuccess.emit(true);
                },
                error: (err: ApiError) => {
                    this.clientState.isBusy = false;
                    this.onSuccess.emit(false);
                    this.authErrorHandler.handleError(err.message);
                }
            })
        }
        else {
            this.authErrorHandler.handleError("Please choose file.")
        }
    }

    onSelectFile = (event) => {
        let file: File = event.target.files && <File>event.target.files[0];
        if(this.fileDataEquipment !== null) this.fileDataEquipment = null;
        const filetype = file.type;
        const fileNameEndsWithCsv = file.name.toLocaleLowerCase().endsWith(".csv");
        var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel')||fileNameEndsWithCsv;
        if (file) {
            this.suggestion = isCorrectFileType;
            this.fileDataEquipment = file;
        }
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}