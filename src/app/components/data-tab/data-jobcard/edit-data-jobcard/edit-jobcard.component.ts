import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { UpdateJobCardModel } from 'src/app/shared/models/data-tab/data-jobcard.model';
import { ClientState, AuthErrorHandler } from 'src/app/shared/services';
import { DataJobCardService } from 'src/app/shared/services/api/data-tab/data-jobcard.service';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { Constants } from 'src/app/shared/common';
import { WorkPackLookUpModel } from 'src/app/shared/models/data-tab/data-workpack.model';
import { DataWorkpackService } from 'src/app/shared/services/api/data-tab/data-workpack.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'edit-jobcard',
    templateUrl: './edit-jobcard.component.html'
})
export class EditJobCardComponent implements OnInit {
    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Input() updationModel: UpdateJobCardModel;

    jobcardCodeError: boolean = false;
    jobcardErrorMessage: string;
    workPackLookUpModels: WorkPackLookUpModel[] = [];

    sub: Subscription;
    projectKey: string;
    constructor(
        public clientState: ClientState,
        private dataJobCardService: DataJobCardService,
        private authErrorHandler: AuthErrorHandler,
        private workPackSevice: DataWorkpackService,
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
        this.jobcardCodeError = false;
        this.jobcardErrorMessage = null;
        this.onGetWorkPackLookUp();
    }
    onSaveData = (form: NgForm) => {
        if (!form || form.invalid) {
            return;
        }
        this.clientState.isBusy = true;
        let jobcardUpdateModel = <UpdateJobCardModel>{
            ...this.updationModel
        };
        this.dataJobCardService.updateJobCard(jobcardUpdateModel).subscribe({
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

    onChangeJobCardCode = (event) => {
        const regex = /r'^[a-zA-Z0-9\+]*$'/;
        let codeMacth = regex.test(event.target.value);
        if (codeMacth && event.target.value.length > 15) {
            this.jobcardCodeError = true;
            this.jobcardErrorMessage = Constants.ValidateJobCardCodeMaxLength;
            return;
        }
        if (!codeMacth && event.target.value.length > 1) {
            this.jobcardCodeError = true;
            this.jobcardErrorMessage = Constants.ValidateJobCardCodeFormat;
            return;
        }
        this.jobcardCodeError = false;
        this.jobcardErrorMessage = null;
        return;
    }
    onGetWorkPackLookUp() {
        this.clientState.isBusy = true;
        this.workPackSevice.getWorkPackLookUp(this.projectKey).subscribe(res => {
            this.workPackLookUpModels = res.content ? <WorkPackLookUpModel[]>[...res.content] : [];
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