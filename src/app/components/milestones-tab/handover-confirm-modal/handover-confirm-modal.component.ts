import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'handover-confirm-modal',
    templateUrl: './handover-confirm-modal.component.html',
    styleUrls: ['./handover-confirm-modal.component.scss'],
})

export class HandoverConfirmModalComponent {
    @Input() visible: boolean;
    @Input() header: string;
    @Input() content: string;
    @Input() id: string = "handoverConfirmModal";
    @Input() hiddenCloseSymbol = false;

    @Output() confirm: EventEmitter<string> = new EventEmitter();

    onConfirm = () => {
        this.confirm.emit('confirm');
    }

    onLoginConfirm() {
        this.confirm.emit('login');
    }

    onClose = () => {
        this.confirm.emit(null);
    }
}
