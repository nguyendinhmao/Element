import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { JobCardLookUpModel } from 'src/app/shared/models/data-tab/data-jobcard.model';

@Component({
    selector: 'job-cards-info',
    templateUrl: './job-cards-info.component.html'
})

export class JobCardsInfoComponent implements OnInit {
    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Input() dataJobCards : JobCardLookUpModel[]
    workPackNo: string;
    constructor(
        public clientState: ClientState,
        private authErrorHandler: AuthErrorHandler,
    ) { }

    public ngOnInit() {
        if(this.dataJobCards &&  this.dataJobCards.length > 0){
            this.workPackNo = this.dataJobCards[0].workPackNo;
        }
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}