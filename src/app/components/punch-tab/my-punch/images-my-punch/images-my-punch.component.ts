import { OnInit, Component, Input, Output, EventEmitter } from "@angular/core";
import { Lightbox } from 'ngx-lightbox';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { ImageBase64Helper, ImageLookUp } from "src/app/shared/models/punch-page/punch-page.model";

@Component({
    selector: "images-my-punch",
    styleUrls: ["./images-my-punch.component.scss"],
    templateUrl: "./images-my-punch.component.html",
})

export class ImagesMyPunchComponent implements OnInit {
    @Input() visible: boolean = false;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Input() imageLookUpModel: ImageLookUp[];

    myPunchImages = [];

    constructor(
        private lightbox: Lightbox
    ) { }

    ngOnInit(): void {
        this.onLoadImagesMyPunch();
    }

    get isOffline() {
        return InfoDevice.isOffline;
    }

    onLoadImagesMyPunch = () => {
        this.imageLookUpModel.forEach(element => {
            this.myPunchImages.push({
                src: this.isOffline ? element.base64 : element.url,
            })
        });
    }

    openImage(index: number): void {
        this.lightbox.open(this.myPunchImages, index, { centerVertically: true, showImageNumberLabel: true, alwaysShowNavOnTouchDevices: true, enableTransition: true });
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    };
}