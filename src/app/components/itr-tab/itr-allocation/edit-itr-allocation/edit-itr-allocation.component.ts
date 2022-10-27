import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { MilestonesProjectSettingsModel } from 'src/app/shared/models/project-settings/project-settings.model';
import { MockMilestonesProjectSettingsApi } from 'src/app/shared/mocks/mock.project-settings';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { UpdateEquipmentModel } from 'src/app/shared/models/data-tab/data-equipment.model';
import { ITRAllocationModel } from 'src/app/shared/models/itr-tab/itr-allocation.model';
import { DataEquipmentService } from 'src/app/shared/services/api/data-tab/data-equipment.service';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'edit-itr-allocation',
    templateUrl: './edit-itr-allocation.component.html'
})

export class EditItrAllocationComponent implements OnInit {
    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Output() successModel: EventEmitter<ITRAllocationModel> = new EventEmitter();
    @Input() equipmentId: string;

    updationModel: UpdateEquipmentModel = new UpdateEquipmentModel();
    itrLocationModel: ITRAllocationModel = new ITRAllocationModel();
    projectKey: string;
    sub: any;
    moduleKey: string;

    constructor(
        public clientState: ClientState,
        private dataEquipmentService: DataEquipmentService,
        private authErrorHandler: AuthErrorHandler,
        private route: ActivatedRoute,
        private router: Router,
    ) { this.sub = this.route.params.subscribe(params => {
        this.projectKey = params['projectKey'];
        this.moduleKey = params["moduleKey"];
        if (!this.projectKey || !this.moduleKey) {
            this.router.navigate([""]);
        }
    });
}

    public ngOnInit() {
        this.onGetEquipmentById();
    }

    onGetEquipmentById() {
        this.clientState.isBusy = true;
        this.dataEquipmentService.getEquipmentById(this.equipmentId).subscribe(res => {
            this.updationModel = res ? <UpdateEquipmentModel>{ ...res } : null;
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
        let equipmentUpdateModel = <UpdateEquipmentModel>{
            ...this.updationModel
        };
        equipmentUpdateModel.projectKey = this.projectKey;
        this.dataEquipmentService.updateEquipment(equipmentUpdateModel).subscribe(res => {
            this.itrLocationModel = res.content ? <ITRAllocationModel>{ ...res.content } : null;
            this.onSuccess.emit(true);
            this.successModel.emit(this.itrLocationModel);
            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });

        // this.dataEquipmentService.updateEquipment(equipmentUpdateModel).subscribe({
        //     complete: () => {
        //         this.clientState.isBusy = false;
        //         this.onSuccess.emit(true);
        //     },
        //     error: (err: ApiError) => {
        //         this.clientState.isBusy = false;
        //         this.authErrorHandler.handleError(err.message);
        //     }
        // });
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}