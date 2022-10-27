import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { UpdateAttachmentDrawingFile } from 'src/app/shared/models/data-tab/data-drawing.model';
import { AuthErrorHandler, ClientState } from 'src/app/shared/services';
import { DataDrawingService } from 'src/app/shared/services/api/data-tab/data-drawing.service';

@Component({
    selector: "file-upload",
    styleUrls: ["./file-upload.component.scss"],
    templateUrl: "./file-upload.component.html",
})

export class FileUploadComponent implements OnInit {
    @Input() visible: boolean = false;
    @Input() drawingId: string;
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

    file: File;

    constructor(
        public clientState: ClientState,
        private authErrorHandler: AuthErrorHandler,
        private dataDrawingService: DataDrawingService,
    ) { }

    ngOnInit(): void { }

    onSaveImages() {
        this.clientState.isBusy = true;
        let _uploadFile: UpdateAttachmentDrawingFile = new UpdateAttachmentDrawingFile();
        _uploadFile.drawingId = this.drawingId;
        this.dataDrawingService.updateAttachmentDrawingFile(_uploadFile, this.file).subscribe(res => {
            this.clientState.isBusy = false;
            this.onSuccess.emit(true);
        }, (err: ApiError) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        });
    }

    onGetFile = (event) => {
        this.file = event.target.files && <File>event.target.files[0];
    }

    onRemoveUploadFile = () => {
        this.file = null;
    }

    onCancel() {
        this.onSuccess.emit(false);
    }
}