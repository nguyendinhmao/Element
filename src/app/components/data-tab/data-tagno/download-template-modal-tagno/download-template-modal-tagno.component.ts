import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DataTagNoService } from 'src/app/shared/services/api/data-tab/data-tagno.service';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ToastrService } from 'ngx-toastr';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { Constants } from 'src/app/shared/common';

@Component({
  selector: 'download-template-modal-tagno',
  templateUrl: './download-template-modal-tagno.component.html'
})

export class DownloadTemplateModalComponent {
  @Input() visible: boolean;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

  onDownload = () => {
    this.onSuccess.emit(true);
  }
}
