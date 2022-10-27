import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { DataLocationService } from 'src/app/shared/services/api/data-tab/data-location.service';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { CreateLocationModel, UpdateLocationModel } from 'src/app/shared/models/data-tab/data-location.model';

@Component({
  selector: 'create-data-location',
  templateUrl: './create-data-location.component.html'
})

export class CreateDataLocationComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() projectId: string;

  creationModel: CreateLocationModel = new CreateLocationModel();

  constructor(
    public clientState: ClientState,
    private dataLocationService: DataLocationService,
    private authErrorHandler: AuthErrorHandler
  ) { }

  public ngOnInit() {

  }

  onSaveData = (form: NgForm) => {
    if (!form || form.invalid) {
      return;
    }
    this.clientState.isBusy = true;
    this.creationModel.projectId = this.projectId;
    let locationCreateModel = <CreateLocationModel>{
      ...this.creationModel
    };
    this.dataLocationService.createLocation(locationCreateModel).subscribe({
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

  onChangeLocationCode = (event) => {
    const regex = /r'^[a-zA-Z0-9\+]*$'/;
    let codeMacth = regex.test(event.target.value);
    if (codeMacth && event.target.value.length > 10) {
      this.authErrorHandler.handleError("Location Code maximune 10 characters");
      return;
    }
    if (!codeMacth && event.target.value.length > 1) {
      this.authErrorHandler.handleError("Location Code which allows only the a-zA-Z0-9 characters");
      return;
    }
    return;
  }

  onCancel = () => {
    this.onSuccess.emit(false);
  }
}
