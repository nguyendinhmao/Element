import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { Constants, JwtTokenHelper } from 'src/app/shared/common';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/shared/directives/format-datepicker/format-datepicker';
import { StoreNames } from 'src/app/shared/models/common/common.model';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { AddCommentPresInfoCommand, CommentPreservation, DeleteCommentPresInfoCommand, DetailPreservationTabModel, PreservationElementInfo } from 'src/app/shared/models/preservation-tab/preservation-tab.model';
import { AuthErrorHandler, ClientState, IdbService } from 'src/app/shared/services';
import { PreservationTabServices } from 'src/app/shared/services/api/preservation-tab/preservation-tab.service';

@Component({
  selector: 'element-preservation-info',
  templateUrl: './element-preservation-info.component.html',
  styleUrls: ['./element-preservation-info.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})

export class ElementPreservationInfoComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() elementInfo: PreservationElementInfo;
  @Input() preservationId: string;

  preservationElementCodeError: boolean = false;
  preservationElementErrorMessage: string;
  isShowRemoveCommentModal = false;
  commentId: string = null;

  commentModels: CommentPreservation[] = [];
  newComment = '';
  isAddComment = false;

  optionFormat = { hour: 'numeric', minute: 'numeric' };

  constructor(
    public clientState: ClientState,
    // private dataPreservationElementService: DataPreservationElementService,
    private authErrorHandler: AuthErrorHandler,
    private preservationService: PreservationTabServices,
    private idbService: IdbService,
  ) { }

  ngOnInit() {
    this.preservationElementCodeError = false;
    this.preservationElementErrorMessage = null;
    this.commentModels = this.elementInfo.comments;
  }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  addComment() {
    if (this.isOffline) {
      const _userInfo = JwtTokenHelper.GetUserInfo();
      let _newComment: CommentPreservation = {
        ...{
          id: this._createGuid(),
          content: this.newComment,
          createdDate: (new Date()),
          user: _userInfo.userName,
          canDelete: true,
        }
      };

      const _snPreservation = StoreNames.preservation;
      this.idbService.getItem(_snPreservation, this.preservationId).then(res => {
        const _preservation: DetailPreservationTabModel = res ? { ...res } as DetailPreservationTabModel : null;
        const _comments = _preservation.preservationElement.comments;
        _comments.push(_newComment);
        _preservation.isUpdated = true;
        _preservation.preservationElement.comments = [..._comments];
        // update tag preservation change
        const _snTagPreservation = StoreNames.tagPreservation;
        this.idbService.getItem(_snTagPreservation, _preservation.tagId).then(_tP => {
          this.idbService.updateItem(_snTagPreservation, { ..._tP, ...{ isChanged: true } }, _tP.tagId);
        });
        this.idbService.updateItem(_snPreservation, _preservation, this.preservationId);
        this.commentModels = _comments ? [..._comments] : [];
        this.newComment = '';
        this.authErrorHandler.handleSuccess('Successfully! Added the comment.');
      });
    } else {
      this.clientState.isBusy = true;
      const _mProjectDefault = JwtTokenHelper.GetModuleProjectDefault();
      let _newC: AddCommentPresInfoCommand = new AddCommentPresInfoCommand();
      _newC = {
        comment: this.newComment,
        preservationId: this.preservationId,
        projectKey: _mProjectDefault.projectKey,
      };

      this.preservationService.addCommentPreservationInfo(_newC).subscribe((res) => {
        this.newComment = '';
        this.commentModels = res ? [...res.content] : [];
        this.clientState.isBusy = false;
        this.authErrorHandler.handleSuccess('Successfully! Added the comment.');
      }, (err) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      });
    }
  }

  openRemoveCommentModal(cId: string) {
    this.commentId = cId;
    this.isShowRemoveCommentModal = true;
  }

  removeComment(isConfirm: boolean) {
    if (isConfirm) {
      if (this.isOffline) {
        const _snPreservation = StoreNames.preservation;
        this.idbService.getItem(_snPreservation, this.preservationId).then(res => {
          const _preservation: DetailPreservationTabModel = res ? { ...res } as DetailPreservationTabModel : null;
          const _comments = (_preservation.preservationElement.comments).filter(_c => _c.id !== this.commentId);
          _preservation.preservationElement.comments = [..._comments];
          // update tag preservation change
          const _snTagPreservation = StoreNames.tagPreservation;
          this.idbService.getItem(_snTagPreservation, _preservation.tagId).then(_tP => {
            this.idbService.updateItem(_snTagPreservation, { ..._tP, ...{ isChanged: true } }, _tP.tagId);
          });
          this.idbService.updateItem(_snPreservation, _preservation, this.preservationId);
          this.commentModels = _comments ? [..._comments] : [];
          this.commentId = '';
          this.authErrorHandler.handleSuccess('Successfully! Deleted the comment.');
        });
      } else {
        this.clientState.isBusy = true;
        const _mProjectDefault = JwtTokenHelper.GetModuleProjectDefault();
        let _deleteC: DeleteCommentPresInfoCommand = new DeleteCommentPresInfoCommand();
        _deleteC = {
          preservationId: this.preservationId,
          projectKey: _mProjectDefault.projectKey,
          commentId: this.commentId,
        }

        this.preservationService.deleteCommentPreservationInfo(_deleteC).subscribe((res) => {
          this.commentModels = res ? [...res.content] : [];
          this.clientState.isBusy = false;
          this.commentId = '';
          this.authErrorHandler.handleSuccess('Successfully! Deleted the comment.');
        }, (err) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        });
      }
    }
    this.isShowRemoveCommentModal = false;
  }

  createDate(date) {
    return (new Date(date)).toLocaleDateString('es-ES', this.optionFormat);
  }

  onChangePreservationElementName = (event) => {
    const regex = /r'^[a-zA-Z0-9\+]*$'/;
    let codeMacth = regex.test(event.target.value);
    if (codeMacth && event.target.value.length > 25) {
      this.preservationElementCodeError = true;
      this.preservationElementErrorMessage = Constants.ValidatePreservationElementCodeMaxLength;
      return;
    }
    if (!codeMacth && event.target.value.length > 1) {
      this.preservationElementCodeError = true;
      this.preservationElementErrorMessage = Constants.ValidatePreservationElementCodeFormat;
      return;
    }
    this.preservationElementCodeError = false;
    this.preservationElementErrorMessage = null;
    return;
  }

  onCancel = () => {
    this.onSuccess.emit(false);
  }

  _createGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}