import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'edit-limits-tab',
    templateUrl: './edit-limits-tab.component.html'
})

export class EditLimitsTabComponent implements OnInit {
    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

    public ngOnInit() {
    }

    onSaveData = () => {
        this.onSuccess.emit(true);
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}