import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { CreationDataOrderModel, UpdationDataOrderModel } from 'src/app/shared/models/data-tab/data-order.model';
import { ClientState, AuthErrorHandler } from 'src/app/shared/services';
import { DataOrderService } from 'src/app/shared/services/api/data-tab/data-order.service';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { Constants } from 'src/app/shared/common';
import { MaterialLookUpModel } from 'src/app/shared/models/data-tab/data-material.model';
import { DataMaterialService } from 'src/app/shared/services/api/data-tab/data-material.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'create-order',
    templateUrl: './create-order.component.html'
})
export class CreateOrderComponent implements OnInit {
    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Input() projectId: string;

    orderCodeError: boolean = false;
    orderErrorMessage: string;
    materialLookUps: MaterialLookUpModel[] = [];
    creationModel: CreationDataOrderModel = new CreationDataOrderModel();
    sub: Subscription;
    projectKey: string;
    constructor(
        public clientState: ClientState,
        private dataOrderService: DataOrderService,
        private authErrorHandler: AuthErrorHandler,
        private materialService: DataMaterialService,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        this.sub = this.route.params.subscribe((params) => {
            this.projectKey = params["projectKey"];
            if (!this.projectKey) {
                this.router.navigate([""]);
            }
        });
    }

    ngOnInit() {
        this.orderCodeError = false;
        this.orderErrorMessage = null;
        this.onGetMaterialLookUp();
    }

    onSaveData = (form: NgForm) => {
        if (!form || form.invalid) {
            return;
        }
        if (!Number.isInteger(this.creationModel.quantity)) {
            this.authErrorHandler.handleError(Constants.ValueQuantityNotInteger);
            return;
        }
        if (this.creationModel.quantity > 2147483647 || this.creationModel.quantity < 0) {
            this.authErrorHandler.handleError(Constants.ValidateMaterialQuantityMax);
            return;
        }
        this.clientState.isBusy = true;
        this.creationModel.projectId = this.projectId;
        let orderUpdateModel = <CreationDataOrderModel>{
            ...this.creationModel
        };
        this.dataOrderService.createOrder(orderUpdateModel).subscribe({
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

    onChangeOrderCode = (event) => {
        const regex = /r'^[a-zA-Z0-9\+]*$'/;
        let codeMacth = regex.test(event.target.value);
        if (codeMacth && event.target.value.length > 15) {
            this.orderCodeError = true;
            this.orderErrorMessage = Constants.ValidateOrderCodeMaxLength;
            return;
        }
        if (!codeMacth && event.target.value.length > 1) {
            this.orderCodeError = true;
            this.orderErrorMessage = Constants.ValidateOrderCodeFormat;
            return;
        }
        this.orderCodeError = false;
        this.orderErrorMessage = null;
        return;
    }
    onGetMaterialLookUp() {
        this.clientState.isBusy = true;
        this.materialService.getMaterialLookUp(this.projectKey).subscribe(res => {
            this.materialLookUps = res.content ? <MaterialLookUpModel[]>[...res.content] : [];
            this.clientState.isBusy = false;
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }
    onCancel = () => {
        this.onSuccess.emit(false);
    }

}
