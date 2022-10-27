import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { UpdateHandoverModel } from 'src/app/shared/models/data-tab/data-handover.model';
import { ClientState, AuthErrorHandler } from 'src/app/shared/services';
import { DataHandoverService } from 'src/app/shared/services/api/data-tab/data-handover.service';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { Constants } from 'src/app/shared/common';
import { DataDisciplineService } from 'src/app/shared/services/api/data-tab/data-discipline.service';
import { DataSubSystemService } from 'src/app/shared/services/api/data-tab/data-subsystem.service';
import { DataMilestoneService } from 'src/app/shared/services/api/data-tab/data-milestone.service';
import { DisciplineLookUpModel } from 'src/app/shared/models/data-tab/data-discipline.model';
import { MilestoneLookUpModel } from 'src/app/shared/models/data-tab/data-milestone.model';
import { SubSystemLookUpModel } from 'src/app/shared/models/data-tab/data-subsystem.model';
import { SystemLookUpModel } from 'src/app/shared/models/data-tab/data-system.model';
import { DataSystemService } from 'src/app/shared/services/api/data-tab/data-system.service';

@Component({
    selector: 'edit-handover',
    templateUrl: './edit-handover.component.html'
})
export class EditHandoverComponent implements OnInit {
    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Input() handoverId: string;
    @Input() projectKey: string;
    handoverCodeError: boolean = false;
    handoverErrorMessage: string;
    disciplineModels: DisciplineLookUpModel[] = [];
    milestoneModels: MilestoneLookUpModel[] = [];
    subsystemModels: SubSystemLookUpModel[] = [];
    systemModels: SystemLookUpModel[] = [];
    updationModel: UpdateHandoverModel = new UpdateHandoverModel();

    constructor(
        public clientState: ClientState,
        private dataHandoverService: DataHandoverService,
        private authErrorHandler: AuthErrorHandler,
        private disciplineService: DataDisciplineService,
        private subSystemService: DataSubSystemService,
        private milestoneService: DataMilestoneService,
        private systemService: DataSystemService,
    ) { }

    ngOnInit() {
        this.handoverCodeError = false;
        this.handoverErrorMessage = null;
        this.onGetAllDataRelate();
    }

    onGetHandover = () => {
        this.clientState.isBusy = true;
        this.dataHandoverService.getHandoverId(this.handoverId).subscribe(res => {
            this.updationModel = res ? <UpdateHandoverModel>{ ...res } : null;
            this.onGetLookUpSubsystem(this.updationModel.systemId);
            this.clientState.isBusy = false;
        }), (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        };
    }

    onGetAllDataRelate = () => {
        Promise.all([
            this.onGetLookUpDiscipline(),
            this.onGetLookUpMilestone(),
            this.onGetLookUpSystem(),
            this.onGetHandover()
        ]).then(res => {
            this.clientState.isBusy = false;
        }).catch((err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }

    onSaveData = (form: NgForm) => {
        if (!form || form.invalid) {
            return;
        }
        this.clientState.isBusy = true;
        let handoverUpdateModel = <UpdateHandoverModel>{
            ...this.updationModel
        };
        this.dataHandoverService.updateHandover(handoverUpdateModel).subscribe({
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

    onChangeHandoverCode = (event) => {
        const regex = /r'^[a-zA-Z0-9\+]*$'/;
        let codeMacth = regex.test(event.target.value);
        if (codeMacth && event.target.value.length > 15) {
            this.handoverCodeError = true;
            this.handoverErrorMessage = Constants.ValidateHandoverCodeMaxLength;
            return;
        }
        if (!codeMacth && event.target.value.length > 1) {
            this.handoverCodeError = true;
            this.handoverErrorMessage = Constants.ValidateHandoverCodeFormat;
            return;
        }
        this.handoverCodeError = false;
        this.handoverErrorMessage = null;
        return;
    }
    onGetLookUpDiscipline() {
        this.clientState.isBusy = true;
        this.disciplineService.getDisciplineLookUp(this.projectKey).subscribe(res => {
            this.disciplineModels = res.content ? <DisciplineLookUpModel[]>[...res.content] : [];
            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }
    onGetLookUpMilestone() {
        this.clientState.isBusy = true;
        this.milestoneService.getMilestoneLookUp(this.projectKey).subscribe(res => {
            this.milestoneModels = res.content ? <MilestoneLookUpModel[]>[...res.content] : [];
            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }
    onGetLookUpSubsystem(systemId?: string) {
        this.clientState.isBusy = true;
        this.subSystemService.getSubSystemLookUp(this.projectKey, systemId || "").subscribe(res => {
            this.subsystemModels = res.content ? <SubSystemLookUpModel[]>[...res.content] : [];
            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }
    onGetLookUpSystem() {
        this.clientState.isBusy = true;
        this.systemService.getElementSystemLookUp(this.projectKey).subscribe(res => {
            this.systemModels = res.content ? <SystemLookUpModel[]>[...res.content] : [];
            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }
    onCancel = () => {
        this.onSuccess.emit(false);
    }
    onGetSubSystemBySystem(event) {
        this.onGetLookUpSubsystem(event.id);
        this.updationModel.subSystemId = null;
    }
}