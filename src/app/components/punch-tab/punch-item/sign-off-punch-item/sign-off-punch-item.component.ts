import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'sign-off-punch-item',
    templateUrl: './sign-off-punch-item.component.html'
})

export class SignOffPunchItemComponent {
    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

    onSignOffData = () => {
        this.onSuccess.emit(true);
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}