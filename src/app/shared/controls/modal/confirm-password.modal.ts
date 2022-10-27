import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AuthErrorHandler } from '../../services/auth/auth.error-handler';

@Component({
    selector: 'confirm-password-modal',
    templateUrl: './confirm-password.modal.html',
})

export class ConfirmPasswordModalComponent {
    @Input() visible: boolean;
    @Input() header: string;
    @Input() content: string;
    @Input() id: string = "confirmModal";
    @Output() confirm: EventEmitter<boolean> = new EventEmitter();
    @Output() onRemoveConfirm: EventEmitter<string> = new EventEmitter();

    password: string;

    constructor(
        private authErrorHandler: AuthErrorHandler
    ) { }

    onConfirm = () => {
        if (this.password === null || typeof this.password === 'undefined') {
            this.authErrorHandler.handleError("Password is requried");
            return;
        }
        this.onRemoveConfirm.emit(this.password);
    }
    
    onClose = () => {
        this.confirm.emit(false);
    }
}
