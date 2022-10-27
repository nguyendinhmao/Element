import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { DataEquipmentService } from 'src/app/shared/services/api/data-tab/data-equipment.service';
import { NgForm } from '@angular/forms';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { CreateEquipmentModel, UpdateEquipmentModel } from 'src/app/shared/models/data-tab/data-equipment.model';

@Component({
  selector: 'create-data-equipment',
  templateUrl: './create-data-equipment.component.html'
})

export class CreateDataEquipmentComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() projectKey: string;

  creationModel: CreateEquipmentModel = new CreateEquipmentModel();

  constructor(
    public clientState: ClientState,
    private dataEquipmentService: DataEquipmentService,
    private authErrorHandler: AuthErrorHandler
  ) { }

  public ngOnInit() {
  }



  onSaveData = (form: NgForm) => {
    if (!form || form.invalid) {
      return;
    }
    this.clientState.isBusy = true;
    this.creationModel.projectKey = this.projectKey;
    let equipmentCreationModel = <CreateEquipmentModel>{
      ...this.creationModel
    };
    this.dataEquipmentService.createEquipment(equipmentCreationModel).subscribe({
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

  onCancel = () => {
    this.onSuccess.emit(false);
  }
}
