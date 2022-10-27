import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IncomingMessage } from 'http';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { UpdateEquipmentModel } from 'src/app/shared/models/data-tab/data-equipment.model';
import { PreservationEquipmentAllocate, ElementStatusCommand } from 'src/app/shared/models/itr-tab/preservation-allocation.model';
import { AuthErrorHandler, ClientState } from 'src/app/shared/services';
import { DataEquipmentService } from 'src/app/shared/services/api/data-tab/data-equipment.service';
import { PresservationServices } from 'src/app/shared/services/api/preservation-allocation/preservation-allocation.service';

@Component({
    selector: 'justification-modal',
    templateUrl: './justification-modal.component.html',
    styleUrls: ['./justification-modal.component.scss'],
})

export class JustificationModalComponent implements OnInit {
    @Input() visible: boolean = false;
    @Output() onSubmit: EventEmitter<any> = new EventEmitter();
    @Input() jQuestionContent: string;
    @Input() elements: PreservationEquipmentAllocate[];
    @Input() equipmentCode: string;
    @Input() status: string;
    @Input() isConfirmationShow: boolean;

    sub: any;
    moduleKey: string;
    projectKey: string;
    reasonContent: string;


    constructor(
        public clientState: ClientState,
        private dataEquipmentService: DataEquipmentService,
        private authErrorHandler: AuthErrorHandler,
        private route: ActivatedRoute,
        private router: Router,
        private presservationServices: PresservationServices,
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
    }

    onSubmitData = (form: NgForm) => {
        if (!form || form.invalid) {
            return;
        }

        if (this.status !== 'REMOVED') {
            let _elementIds: string[] = [];
            const _model: ElementStatusCommand = new ElementStatusCommand();

            this.clientState.isBusy = true;

            this.elements.forEach(e => {
                _elementIds.push(e.preservationElementId);
            })
            _model.elementIds = [..._elementIds];
            _model.projectKey = this.projectKey;
            _model.equipmentCode = this.equipmentCode;
            _model.comments = this.reasonContent;


            this.presservationServices.updateStatusAllocation(_model, this.status).subscribe(res => {
                this.onSubmit.emit(true);
                this.clientState.isBusy = false;
            }, (err: ApiError) => {
                this.clientState.isBusy = false;
                this.authErrorHandler.handleError(err.message);
            });
        } else {
            this.onSubmit.emit({
                comment: this.reasonContent,
            });
        }
    }

    onCancel = () => {
        if(this.status !== 'REMOVED') { 
            this.onSubmit.emit(false);
        } else {
            this.onSubmit.emit(null);
        }
    }
}