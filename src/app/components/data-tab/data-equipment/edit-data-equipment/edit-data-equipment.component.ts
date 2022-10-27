import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { DataEquipmentService } from 'src/app/shared/services/api/data-tab/data-equipment.service';
import { NgForm } from '@angular/forms';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { UpdateEquipmentModel } from 'src/app/shared/models/data-tab/data-equipment.model';

@Component({
    selector: 'edit-data-equipment',
    templateUrl: './edit-data-equipment.component.html'
})

export class EditDataEquipmentComponent implements OnInit {
    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Input() equipmentId: string;

    updationModel: UpdateEquipmentModel = new UpdateEquipmentModel();

    constructor(
        public clientState: ClientState,
        private dataEquipmentService: DataEquipmentService,
        private authErrorHandler: AuthErrorHandler
    ) { }

    public ngOnInit() {
        this.onGetEquipmentById();
    }

    onGetEquipmentById() {
        this.clientState.isBusy = true;
        this.dataEquipmentService.getEquipmentById(this.equipmentId).subscribe(res => {
            this.updationModel = res ? <UpdateEquipmentModel>{ ...res } : null;
            this.clientState.isBusy = false;
        }), (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        };
    }

    onSaveData = (form: NgForm) => {
        if (!form || form.invalid) {
            return;
        }
        this.clientState.isBusy = true;
        let equipmentUpdateModel = <UpdateEquipmentModel>{
            ...this.updationModel
        };
        this.dataEquipmentService.updateEquipment(equipmentUpdateModel).subscribe({
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