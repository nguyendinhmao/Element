import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { MilestonesProjectSettingsModel } from 'src/app/shared/models/project-settings/project-settings.model';
import { MockMilestonesProjectSettingsApi } from 'src/app/shared/mocks/mock.project-settings';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { EquipmentItrCreationModel } from 'src/app/shared/models/itr-tab/itr-allocation.model';
import { ITRService } from 'src/app/shared/services/api/itr/itr.service';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { ITRAllocationModel } from 'src/app/shared/models/itr-tab/itr-allocation.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'add-itr-allocation',
    templateUrl: './add-itr-allocation.component.html'
})

export class AddItrAllocationComponent implements OnInit {
    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Output() successModel: EventEmitter<ITRAllocationModel> = new EventEmitter();

    milestonesProjectSettingsModels: MilestonesProjectSettingsModel[] = [];
    private mockMilestonesProjectSettingsApi = new MockMilestonesProjectSettingsApi();
    equipmentCreationModel: EquipmentItrCreationModel = new EquipmentItrCreationModel();
    itrLocationModel: ITRAllocationModel = new ITRAllocationModel();
    projectKey: string;
    sub: any;
    moduleKey: string;

    constructor(
        public clientState: ClientState,
        private itrService: ITRService,
        private authErrorHandler: AuthErrorHandler,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        this.sub = this.route.params.subscribe(params => {
            this.projectKey = params['projectKey'];
            this.moduleKey = params["moduleKey"];
            if (!this.projectKey || !this.moduleKey) {
                this.router.navigate([""]);
            }
        });
     }

    public ngOnInit() {
        //--- Get milestones
        this.onGetMilestones();
    }

    //--- Get milestones
    onGetMilestones = () => {
        this.clientState.isBusy = true;
        this.mockMilestonesProjectSettingsApi.getMilestonesProjectSettingData().subscribe(res => {
            this.milestonesProjectSettingsModels = res.content ? <MilestonesProjectSettingsModel[]>[...res.content] : [];
            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
        });
    }


    onSaveData = (form: NgForm) => {
        if (!form || form.invalid) {
            return;
        }
        this.clientState.isBusy = true;
        let creationModel = <EquipmentItrCreationModel>{
            ...this.equipmentCreationModel
        }
        creationModel.projectKey = this.projectKey;

        this.itrService.createEquipment(creationModel).subscribe(res => {
            this.itrLocationModel = res.content ? <ITRAllocationModel>{ ...res.content } : null;
            this.onSuccess.emit(true);
            this.successModel.emit(this.itrLocationModel);
            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });

        // this.itrService.createEquipment(creationModel).subscribe({
        //     complete: () => {
        //         this.clientState.isBusy = false;
        //         this.onSuccess.emit(true);
        //     },
        //     error: (err) => {
        //         this.clientState.isBusy = false;
        //         this.authErrorHandler.handleError(err.message);
        //     }
        // });
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}