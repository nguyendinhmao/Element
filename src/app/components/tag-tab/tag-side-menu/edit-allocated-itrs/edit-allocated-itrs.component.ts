import { OnInit, Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { Subscription } from 'rxjs';
import { TagTabService } from 'src/app/shared/services/api/tag-tab/tag-tab.service';
import { ITRService } from 'src/app/shared/services/api/itr/itr.service';
import { ItrLookUpModel } from 'src/app/shared/models/itr-tab/itr-admin.model';
import { Configs, Constants } from 'src/app/shared/common';
import { TagItrModel, TagItrStatus, ItrAllowcateUpdateModel } from 'src/app/shared/models/tab-tag/tab-tag.model';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
    selector: 'edit-allocated-itrs',
    templateUrl: './edit-allocated-itrs.component.html'
})

export class EditAllocatedItrsComponent implements OnInit {
    @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
    @Output() tagUpdate: EventEmitter<string[]> = new EventEmitter();
    @Input() projectKey: string;
    @Input() tagId: string;

    @ViewChild("itrAdmin") ngSelectComponent: NgSelectComponent;
    sub: Subscription;
    currentPageNumber: number;
    currentPageSize: number;
    idItr: string;
    itrModelLookup: ItrLookUpModel[] = [];
    tagItrModel: TagItrModel[] = [];
    tagItrUpdationModels: TagItrModel[] = [];
    tagItrModelAdded: TagItrModel;
    itrAllowcateUpdateModel: ItrAllowcateUpdateModel = new ItrAllowcateUpdateModel();

    constructor(
        public clientState: ClientState,
        private authErrorHandler: AuthErrorHandler,
        private tagTabService: TagTabService,
        private itrService: ITRService
    ) { }

    public ngOnInit() {
        this.onGetItrLookUp()
        this.onGetTagItrByTag()
    }

    addItemAllocate() {
        if (!this.tagItrModelAdded && this.tagItrModelAdded == null) {
            this.authErrorHandler.handleError(Constants.ItrIsNotEmpty);
            return;
        }

        const isExist = this.tagItrModel.find(e => {
            return e.itrId === this.tagItrModelAdded.itrId
        });

        const isExistsAdded = this.tagItrModel.find(e => {
            return e.itrId === this.tagItrModelAdded.itrId && e.isAdded !== null && e.isAdded
        });

        if (isExist && isExist.status && isExist.status === TagItrStatus.NotStarted || isExistsAdded) {
            this.authErrorHandler.handleError(`Itr '${this.tagItrModelAdded.itrNo}' is allocated. Please choose orther Itr`);
            return;
        }

        if (isExist && isExist.status !== TagItrStatus.Completed && isExist.status !== TagItrStatus.Deleted) {
            this.authErrorHandler.handleError(`${this.tagItrModelAdded.itrNo} is allocated but incompleted. Please choose orther Itr`);
            return;
        } else if (isExist && isExist.status === TagItrStatus.Completed) {
            var anotherExist = this.tagItrModel.find(e => {
                return e.itrId === this.tagItrModelAdded.itrId && e.status !== TagItrStatus.Completed && e.status !== TagItrStatus.Deleted
            });
            if (anotherExist) this.authErrorHandler.handleError(`${this.tagItrModelAdded.itrNo} is allocated but incompleted. Please choose orther Itr`);
        }

        this.tagItrModelAdded.status = TagItrStatus.NotStarted;
        this.tagItrModelAdded.tagId = this.tagId;

        this.itrModelLookup = this.itrModelLookup.filter((e, index) => {
            if (index > 0) {
                return e.id !== this.tagItrModelAdded.itrId;
            }
            return this.itrModelLookup.slice(0, 1)
        });

        // check model update
        const isExistUpdate = this.tagItrUpdationModels.find(e => {
            return e.itrId === this.tagItrModelAdded.itrId
        });

        if (isExistUpdate) {
            if (isExistUpdate.isAdded == true) {
                this.authErrorHandler.handleError(`Itr '${isExistUpdate.itrNo}' is choosed.Please choose orther Itr`);
            } else if (isExistUpdate.isDeleted == true) {
                this.tagItrUpdationModels = this.tagItrUpdationModels.filter(e => {
                    return e !== isExistUpdate
                })
                isExistUpdate.isDeleted = false;
                this.tagItrModel.push(isExistUpdate);
            }
        }
        else {
            this.tagItrModel.push(this.tagItrModelAdded);
            this.tagItrModelAdded.isAdded = true;
            this.tagItrModelAdded.isDeleted = null;
            this.tagItrUpdationModels.push(this.tagItrModelAdded);
        }
        this.ngSelectComponent.handleClearClick();
        this.tagItrModelAdded = null;
    }

    removeItemAllowcate(index, item: TagItrModel) {
        if (index >= 0 && item) {
            if (item.status !== TagItrStatus.NotStarted) {
                this.authErrorHandler.handleError(`Can't delete Itr '${item.itrNo}' have status other than status 'Not Started'`);
                return;
            }
            this.tagItrModel = this.tagItrModel.filter(e => {
                return e !== item;
            });
            if (index === 0) {
                this.tagItrModel = this.tagItrModel.splice(0);
            }

            item.isDeleted = true;
            this.tagItrUpdationModels.push(item);

            this.itrModelLookup.push({
                id: item.itrId,
                itrNo: item.itrNo,
                description: item.itrDescription
            });

            this.tagItrUpdationModels = this.tagItrUpdationModels.filter(e => {
                return e.itrId !== item.itrId || (e.itrId === item.itrId && !e.isAdded)
            });
        }
    }

    changeItemSelect(event) {
        if (!event || !event.id || !event.itrNo || !event.description) {
            this.tagItrModelAdded = null
            return;
        };
        this.tagItrModelAdded = new TagItrModel();
        this.tagItrModelAdded.itrId = event.id,
            this.tagItrModelAdded.itrNo = event.itrNo,
            this.tagItrModelAdded.itrDescription = event.description
    }

    onGetItrLookUp(pageNumber?: number, pageSize?: number, itrNo?: string) {
        this.clientState.isBusy = true;
        if (pageNumber >= 0) { this.currentPageNumber = pageNumber; pageNumber = this.currentPageNumber + 1; }
        if (pageSize > 0) this.currentPageSize = pageSize;
        this.itrService.getITRListLookup(this.projectKey, pageNumber || Configs.DefaultPageNumber, pageSize || Configs.DefaultPageSize, itrNo || "").subscribe(res => {
            this.itrModelLookup = res.items ? <ItrLookUpModel[]>[...res.items] : [];
            this.clientState.isBusy = false;
        }, (err) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        })
    }

    onGetTagItrByTag() {
        this.clientState.isBusy = true;
        this.tagTabService.getTagItrList(this.tagId).subscribe(res => {
            this.tagItrModel = res.content ? <TagItrModel[]>[...res.content] : [];
            this.clientState.isBusy = false;
        }, (err) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        })
    }

    onSaveDataItrAllocate() {
        const remarks = this.itrAllowcateUpdateModel.remarks;
        if (typeof remarks === 'undefined' || remarks === null || remarks === "") {
            this.authErrorHandler.handleError("Reason for Change is required.");
            return;
        }
        this.itrAllowcateUpdateModel.tagItrUpdationModels = this.tagItrUpdationModels;
        if (0 >= this.itrAllowcateUpdateModel.tagItrUpdationModels.length) {
            this.authErrorHandler.handleError("Itr Allocated list haven't been changed.");
            return;
        }
        this.clientState.isBusy = true;
        this.tagTabService.updateTagItrTabSideMenu(this.itrAllowcateUpdateModel).subscribe(res => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleSuccess(Constants.TagItrUpdated);
            this.onSuccess.emit(true);
            if (res.content) {
                this.tagUpdate.emit(res.content);
            }
        }, (err) => {
            this.clientState.isBusy = false;
            this.authErrorHandler.handleError(err.message);
        })
    }

    onCancel = () => {
        this.onSuccess.emit(false);
    }
}