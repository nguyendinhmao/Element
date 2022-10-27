import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { DataDisciplineService } from 'src/app/shared/services/api/data-tab/data-discipline.service';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { CreateDisciplineModel, UpdateDisciplineModel } from 'src/app/shared/models/data-tab/data-discipline.model';
import { Constants } from 'src/app/shared/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'create-data-discipline',
  templateUrl: './create-data-discipline.component.html'
})

export class CreateDataDisciplineComponent implements OnInit {

  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() projectId: string;

  creationModel: CreateDisciplineModel = new CreateDisciplineModel();
  disciplineCodeError: boolean = false;
  disciplineErrorMessage: string;
  projectKey: string;
  sub: Subscription;

  constructor(
    public clientState: ClientState,
    private dataDisciplineService: DataDisciplineService,
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

  ngOnInit() {
    this.disciplineCodeError = false;
    this.disciplineErrorMessage = null;
  }

  onSaveData = (form: NgForm) => {
    if (!form || form.invalid) {
      return;
    }
    this.clientState.isBusy = true;
    this.creationModel.projectId = this.projectId;
    let createDisciplineModel = <CreateDisciplineModel>{
      ...this.creationModel
    };
    this.dataDisciplineService.createDiscipline(createDisciplineModel).subscribe({
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

  onChangeDisciplineCode = (event) => {
    const regex = /r'^[a-zA-Z0-9\+]*$'/;
    let codeMacth = regex.test(event.target.value);
    if (codeMacth && event.target.value.length > 7) {
      this.disciplineCodeError = true;
      this.disciplineErrorMessage = Constants.ValidateDisciplineCodeMaxLength;
      return;
    }
    if (!codeMacth && event.target.value.length > 1) {
      this.disciplineCodeError = true;
      this.disciplineErrorMessage = Constants.ValidateDisciplineCodeFormat;
      return;
    }
    this.disciplineCodeError = false;
    this.disciplineErrorMessage = null;
    return;
  }

  onCancel = () => {
    this.onSuccess.emit(false);
  }
}
