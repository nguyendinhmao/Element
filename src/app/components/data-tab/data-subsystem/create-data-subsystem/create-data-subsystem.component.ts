import { SystemLookUpModel } from 'src/app/shared/models/data-tab/data-system.model';
import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { DataSubSystemService } from 'src/app/shared/services/api/data-tab/data-subsystem.service';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { CreateSubSystemModel } from 'src/app/shared/models/data-tab/data-subsystem.model';
import { DataSystemService } from 'src/app/shared/services/api/data-tab/data-system.service';

@Component({
  selector: 'create-data-subsystem',
  templateUrl: './create-data-subsystem.component.html'
})

export class CreateDataSubSystemComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() projectKey: string;
  creationModel: CreateSubSystemModel = new CreateSubSystemModel();
  subsystemNoError: boolean = false;
  subsystemErrorMessage: string;
  systemLookupModels: SystemLookUpModel[] = [];

  constructor(
    public clientState: ClientState,
    private dataSubSystemService: DataSubSystemService,
    private dataSystemService: DataSystemService,
    private authErrorHandler: AuthErrorHandler
  ) { }

  public ngOnInit() {
    this.subsystemNoError = false;
    this.subsystemErrorMessage = null;
    this.onGetSystemLookupModels();
  }

  onGetSystemLookupModels() {
    this.clientState.isBusy = true;
    this.dataSystemService.getElementSystemLookUp(this.projectKey).subscribe(res => {
      this.systemLookupModels = res.content ? <SystemLookUpModel[]>[...res.content] : [];
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
    let subsystemCreateModel = <CreateSubSystemModel>{
      ...this.creationModel
    };
    this.dataSubSystemService.createSubSystem(subsystemCreateModel).subscribe({
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

  onChangeSubSystemNo = (event) => {
    const regex = /r'^[a-zA-Z0-9\+]*$'/;
    let codeMacth = regex.test(event.target.value);
    if (codeMacth && event.target.value.length > 7) {
      this.subsystemNoError = true;
      this.subsystemErrorMessage = "Sub system Number maximune 7 characters";
      return;
    }
    if (!codeMacth && event.target.value.length > 1) {
      this.subsystemNoError = true;
      this.subsystemErrorMessage = "Sub subsystem Number which allows only the a-zA-Z0-9 characters";
      return;
    }
    this.subsystemNoError = false;
    this.subsystemErrorMessage = null;
    return;
  }

  onCancel = () => {
    this.onSuccess.emit(false);
  }
}
