import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'sign-off-change-item',
    templateUrl: './sign-off-change-item.component.html'
})

export class SignOffChangeItemComponent {
    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

    onSignOffData = () => {
        this.onSuccess.emit(true);
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}