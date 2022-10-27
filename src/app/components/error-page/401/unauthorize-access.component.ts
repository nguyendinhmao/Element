import { Component, OnDestroy } from '@angular/core';
import { ClientState } from 'src/app/shared/services';

@Component({
    selector: 'unauthorize-access',
    templateUrl: './unauthorize-access.component.html',
    styleUrls: ['./unauthorize-access.component.scss'],
})

export class UnauthorizeAccessComponent implements OnDestroy {

    constructor(private clientState: ClientState) { }

    ngOnDestroy(): void {
        this.clientState.isBusy = false;
    }
}