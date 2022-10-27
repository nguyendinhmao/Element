import { Component } from '@angular/core';
import { ClientState } from 'src/app/shared/services/client/client-state';

@Component({
    selector: 'loading-inpopup',
    templateUrl: './loadingInPopup.component.html'
})

export class LoadingInPopupComponent {
    constructor(
        public clientState: ClientState,
    ) { }
}