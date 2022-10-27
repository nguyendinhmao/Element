import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { DataPreservationElementService } from 'src/app/shared/services/api/data-tab/data-preservationelement.service';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { CreatePreservationElementModel } from 'src/app/shared/models/data-tab/data-preservationelement.model';
import { Constants } from 'src/app/shared/common';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/shared/directives/format-datepicker/format-datepicker';

@Component({
  selector: 'create-data-preservationelement',
  templateUrl: './create-data-preservationelement.component.html',
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})

export class CreateDataPreservationElementComponent implements OnInit {

  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() projectId: string;

  creationModel: CreatePreservationElementModel = new CreatePreservationElementModel();
  preservationElementCodeError: boolean = false;
  preservationElementErrorMessage: string;

  constructor(
    public clientState: ClientState,
    private dataPreservationElementService: DataPreservationElementService,
    private authErrorHandler: AuthErrorHandler,
  ) { }

  ngOnInit() {
    this.preservationElementCodeError = false;
    this.preservationElementErrorMessage = null;
  }

  onSaveData = (form: NgForm) => {
    if (!form || form.invalid) {
      return;
    }
    this.clientState.isBusy = true;
    this.creationModel.projectId = this.projectId;
    let preservationElementCreateModel = <CreatePreservationElementModel>{
      ...this.creationModel
    };
    preservationElementCreateModel.frequencyInWeeks = this.creationModel.type == 'Periodic' ? this.creationModel.frequencyInWeeks : null;
    // preservationElementUpdateModel.projectId = this.projectId;
    this.dataPreservationElementService.createPreservationElement(preservationElementCreateModel).subscribe({
      complete: () => {
        this.clientState.isBusy = false;
        this.onSuccess.emit(true);
      },
      error: (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      }
    });
  }

  onChangePreservationElementName = (event) => {
    const regex = /r'^[a-zA-Z0-9\+]*$'/;
    let codeMacth = regex.test(event.target.value);
    if (codeMacth && event.target.value.length > 25) {
      this.preservationElementCodeError = true;
      this.preservationElementErrorMessage = Constants.ValidatePreservationElementCodeMaxLength;
      return;
    }
    if (!codeMacth && event.target.value.length > 1) {
      this.preservationElementCodeError = true;
      this.preservationElementErrorMessage = Constants.ValidatePreservationElementCodeFormat;
      return;
    }
    this.preservationElementCodeError = false;
    this.preservationElementErrorMessage = null;
    return;
  }

  onCancel = () => {
    this.onSuccess.emit(false);
  }
}
