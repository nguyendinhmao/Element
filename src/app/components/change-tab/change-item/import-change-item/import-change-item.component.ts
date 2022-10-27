import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'import-change-item',
    templateUrl: './import-change-item.component.html'
})

export class ImportChangeItemComponent {
    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

    onImportData = () => {
        this.onSuccess.emit(true);
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}