import { Component, Input, Output, EventEmitter } from '@angular/core';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';

@Component({
    selector: 'tag-confirm-modal',
    templateUrl: './tag-confirm-modal.component.html',
    styleUrls: ['./tag-confirm-modal.component.scss'],
})

export class TagConfirmModalComponent {
    @Input() visible: boolean;
    @Input() header: string;
    @Input() content: string;
    @Input() id: string = "tagConfirmModal";
    @Input() hiddenCloseSymbol = false;

    @Output() confirm: EventEmitter<string> = new EventEmitter();
    
    get isOffline() {
        return InfoDevice.isOffline;
    }

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
