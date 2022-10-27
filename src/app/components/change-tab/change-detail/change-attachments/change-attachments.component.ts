import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ChangePageService } from 'src/app/shared/services/api/change-page/change-page.service';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { DetailChangeModel, AttachmentModel, OtherChangeStageModel, ChangeTypeLookUpModel, LoadingSelectionChangeModel, ChangeStatus, ApproveModel, RejectModel, Signature } from 'src/app/shared/models/change-tab/change-tab.model';
import { ClientState, AuthErrorHandler } from 'src/app/shared/services';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants } from 'src/app/shared/common/constants/constants';
@Component({
    selector: 'change-attachments',
    templateUrl: './change-attachments.component.html',
    styleUrls: ['./change-attachments.component.scss']
})

export class ChangeAttachmentsComponent implements OnInit{

    @Input() changeId: string;
    // model
    attachmentModel: AttachmentModel[] = [];
    //--- Variables
    sub: any;
    moduleKey: string;
    projectKey: string;
    deleteFile: AttachmentModel
    //--- Boolean
    isDeleteState: boolean;
    files: File[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private changeService: ChangePageService,
        private clientState: ClientState,
        private authErrorHandler: AuthErrorHandler,
    ) {
        this.sub = this.route.params.subscribe((params) => {
            this.moduleKey = params["moduleKey"];
            this.projectKey = params["projectKey"];
            // this.changeId = params["changeId"];
            if (!this.moduleKey || !this.projectKey) {
                this.router.navigate([""]);
            }
        });
    }

    ngOnInit(): void {
        this.onGetData();
    }

    //--- Get data

    onGetData() {
        this.clientState.isBusy = true;
        this.changeService.getChangeAttachment(this.changeId).subscribe(
            res => {
                this.attachmentModel = res.content ? <AttachmentModel[]>[...res.content] : [];
                this.clientState.isBusy = false;
            },
            (err: ApiError) => {
                this.clientState.isBusy = false;
                this.authErrorHandler.handleError(err.message);
            }
        )
    }
    //--- Delete item
    onOpenDeleteModal = (file: AttachmentModel) => {
        this.isDeleteState = true;
        this.deleteFile = file;
    }

    onDeleteConfirm = (isConfirm: boolean) => {
        if (!isConfirm) {
            return;
        }
        this.isDeleteState = false;
        this.changeService.removeChangeAttachment(this.deleteFile.id, this.changeId).subscribe({
            complete: () => {
                this.deleteFile = null;
                this.authErrorHandler.handleSuccess(Constants.ChangeAttachmentDeleted);
                this.onGetData();
            },
            error: (err: ApiError) => {
                this.deleteFile = null;
                this.clientState.isBusy = false;
                this.authErrorHandler.handleError(err.message);
            },
        });
    }

    onGetFile = (event) => {
        let file: File = event.target.files && <File>event.target.files[0];
        // this.attachmentModel.push(new AttachmentModel(), { name: file.name, stageName: null, url: null, id: null });
        this.files.push(file);
    }
    onRemoveUploadFile = (file: File) => {
        this.files.splice(this.files.indexOf(file), 1);
    }

    onUploadFiles = () => {
        this.clientState.isBusy = true;
        this.changeService.updateChangeAttachment(this.changeId, this.files).subscribe(
            (res) => {
                this.attachmentModel = [];
                this.attachmentModel = res.content ? <AttachmentModel[]>[...res.content] : [];
                this.files = [];
                this.authErrorHandler.handleSuccess(Constants.ChangeAttachmentUpdated);
                this.clientState.isBusy = false;
            },
            (err: ApiError) => {
                this.clientState.isBusy = false;
                this.authErrorHandler.handleError(err.message);
            }
        );
    }

    // onDownloadFile = (item) => {
    //     if (item) {
    //         var bytes = this.coreService.base64ToArrayBuffer(item.data);
    //         var blob = new Blob([bytes], { type: item.fileType });
    //         var link = document.createElement('a');
    //         link.href = window.URL.createObjectURL(blob);
    //         link.download = item.fileName;
    //         link.click();
    //     }
    // }
}