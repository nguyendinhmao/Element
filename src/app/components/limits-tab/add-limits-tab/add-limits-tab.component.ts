import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'add-limits-tab',
    templateUrl: './add-limits-tab.component.html'
})

export class AddLimitsTabComponent implements OnInit {
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