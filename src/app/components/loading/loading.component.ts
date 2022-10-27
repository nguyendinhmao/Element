import { Component } from '@angular/core';
import { ClientState } from 'src/app/shared/services/client/client-state';

@Component({
    selector: 'loading-state',
    templateUrl: './loading.component.html'
})

export class LoadingComponent {
    constructor(
        public clientState: ClientState,
    ) { }
}