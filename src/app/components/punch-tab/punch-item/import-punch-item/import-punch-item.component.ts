import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'import-punch-item',
    templateUrl: './import-punch-item.component.html'
})

export class ImportPunchItemComponent {
    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

    onImportData = () => {
        this.onSuccess.emit(true);
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}