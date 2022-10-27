import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DataTagNoService } from 'src/app/shared/services/api/data-tab/data-tagno.service';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ToastrService } from 'ngx-toastr';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { Constants } from 'src/app/shared/common';

@Component({
  selector: 'import-data-tagdrawing',
  templateUrl: './import-data-tagdrawing.component.html'
})

export class ImportDataTagDrawingComponent {
  @Input() visible: boolean;
  @Input() projectKey
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

  suggestion: boolean = false;
  fileDataTagNo: File;

  constructor(
    public clientState: ClientState,
    private dataTagNoService: DataTagNoService,
    private toastr: ToastrService,
    private authErrorHandler: AuthErrorHandler
  ) { }

  onSelectFile = (event) => {
    let file: File = event.target.files && <File>event.target.files[0];
    if (this.fileDataTagNo !== null) this.fileDataTagNo = null;
    const filetype = file.type;
    const fileNameEndsWithCsv = file.name.toLocaleLowerCase().endsWith(".csv");
    var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
    if (file) {
      this.suggestion = isCorrectFileType;
      this.fileDataTagNo = file;
    }
  }

  onImportData = () => {
    if (this.fileDataTagNo) {
      const filetype = this.fileDataTagNo.type;
      const fileNameEndsWithCsv = this.fileDataTagNo.name.toLocaleLowerCase().endsWith(".csv");
      var isCorrectFileType = (filetype === 'text/csv' || filetype === 'application/vnd.ms-excel') || fileNameEndsWithCsv;
      if (!isCorrectFileType) {
        this.authErrorHandler.handleError("Please select the file format as csv.");
        return;
      }

      this.clientState.isBusy = true;
      this.dataTagNoService.insertTagDrawingViaCsvFile(this.projectKey, this.fileDataTagNo).subscribe({
        complete: () => {
          this.fileDataTagNo = null;
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
