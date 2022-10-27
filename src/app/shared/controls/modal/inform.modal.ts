import { Component, Input } from '@angular/core';

@Component({
    selector: 'inform-modal',
    templateUrl: './inform.modal.html',
})

export class InformModalComponent {
    @Input() visible: boolean = false;
    @Input() header: string;
    @Input() content: string;
}