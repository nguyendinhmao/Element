import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AuthErrorHandler } from '../../services/auth/auth.error-handler';

@Component({
    selector: 'confirm-reason-modal',
    templateUrl: './confirm-reason.modal.html',
})

export class ConfirmReasonModalComponent {
    @Input() visible: boolean;
    @Input() header: string;
    @Input() content: string;
    @Input() id: string = "confirmModal";
    @Output() cancel?: EventEmitter<boolean> = new EventEmitter();
    @Output() reason: EventEmitter<string> = new EventEmitter();

    reasonText: string;

    constructor(
        private authErrorHandler: AuthErrorHandler
    ) { }

    onConfirm = () => {
        if (this.reasonText === null || typeof this.reasonText === 'undefined') {
            this.authErrorHandler.handleError("The reason field is required");
            return;
        }
        this.reason.emit(this.reasonText);
    }

    onClose = () => {
        this.cancel.emit(true);
    }
}
