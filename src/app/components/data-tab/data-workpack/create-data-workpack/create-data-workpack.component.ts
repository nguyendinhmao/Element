import { DisciplineLookUpModel } from 'src/app/shared/models/data-tab/data-discipline.model';
import { DataDisciplineService } from 'src/app/shared/services/api/data-tab/data-discipline.service';
import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { DataWorkpackService } from 'src/app/shared/services/api/data-tab/data-workpack.service';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { CreateWorkpackModel, UpdateWorkpackModel } from 'src/app/shared/models/data-tab/data-workpack.model';
import { Constants } from 'src/app/shared/common';

@Component({
  selector: 'create-data-workpack',
  templateUrl: './create-data-workpack.component.html'
})

export class CreateDataWorkpackComponent implements OnInit {

  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() projectId: string;
  @Input() projectKey: string;
  creationModel: CreateWorkpackModel = new CreateWorkpackModel();
  workpackCodeError: boolean = false;
  workpackErrorMessage: string;
  disciplineLookupModels: DisciplineLookUpModel[] = [];

  constructor(
    public clientState: ClientState,
    private dataWorkpackService: DataWorkpackService,
    private authErrorHandler: AuthErrorHandler,
    private disciplineService: DataDisciplineService
  ) { }

  ngOnInit() {
    this.workpackCodeError = false;
    this.workpackErrorMessage = null;
    this.onGetDisciplineLookup();
  }

  onGetDisciplineLookup() {
    this.clientState.isBusy = true;
    this.disciplineService.getDisciplineLookUp(this.projectKey).subscribe(res => {
      this.disciplineLookupModels = res.content ? <DisciplineLookUpModel[]>[...res.content] : [];
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onSaveData = (form: NgForm) => {
    if (!form || form.invalid) {
      return;
    }
    this.clientState.isBusy = true;
    this.creationModel.projectId = this.projectId;
    let createWorkPackModel = <CreateWorkpackModel>{
      ...this.creationModel
    };
    this.dataWorkpackService.createWorkpack(createWorkPackModel).subscribe({
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

  onChangeWorkpackCode = (event) => {
    const regex = /r'^[a-zA-Z0-9\+]*$'/;
    let codeMacth = regex.test(event.target.value);
    if (codeMacth && event.target.value.length > 7) {
      this.workpackCodeError = true;
      this.workpackErrorMessage = Constants.ValidateDisciplineCodeMaxLength;
      return;
    }
    if (!codeMacth && event.target.value.length > 1) {
      this.workpackCodeError = true;
      this.workpackErrorMessage = Constants.ValidateDisciplineCodeFormat;
      return;
    }
    this.workpackCodeError = false;
    this.workpackErrorMessage = null;
    return;
  }

  onCancel = () => {
    this.onSuccess.emit(false);
  }
}
