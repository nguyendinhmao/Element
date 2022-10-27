import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HandoverLookUpModel } from 'src/app/shared/models/milestones-tab/milestones-tab.model';

@Component({
    selector: "allocated-info-milestones",
    templateUrl: "./allocated-info-milestones.component.html",
})

export class AllocatedInfoComponent implements OnInit {
    @Input() handoverLookUpModels: HandoverLookUpModel[];
    @Input() allocatedHeader: string;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

    constructor() { }

    public ngOnInit() { }

    onCancel = () => {
        this.onSuccess.emit(false);
    };
}