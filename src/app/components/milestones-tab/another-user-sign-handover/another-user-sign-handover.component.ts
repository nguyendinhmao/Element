import { Component, EventEmitter, Input, OnInit, Output, } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Constants } from 'src/app/shared/common';
import { BCryptHelper } from 'src/app/shared/common/bcrypt/bcrypt';
import { StoreNames } from 'src/app/shared/models/common/common.model';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { HandoverDetail } from 'src/app/shared/models/milestones-tab/handover.model';
import { HandoverStatus, HandoverStatusEnum } from 'src/app/shared/models/milestones-tab/milestones-tab.model';
import { KeyLookups } from 'src/app/shared/models/punch-item/punch-item.model';
import { TagItrStatus } from 'src/app/shared/models/tab-tag/tab-tag.model';
import { User4SignOff } from 'src/app/shared/models/user/user.model';
import { AuthErrorHandler, ClientState, IdbService } from 'src/app/shared/services';
import { TagTabService } from 'src/app/shared/services/api/tag-tab/tag-tab.service';



@Component({
  selector: "another-user-sign-handover",
  templateUrl: "./another-user-sign-handover.component.html",
  styleUrls: ["./another-user-sign-handover.component.scss"],
})

export class AnotherUserSignHandover implements OnInit {
  @Input() visible: boolean = false;
  @Input() hasShowLoginModal = false;
  @Input() type: string = null;
  @Input() requestModel: any;

  @Output() onSign: EventEmitter<boolean> = new EventEmitter();

  usernameAnother: FormControl;
  passwordAnother: FormControl;

  loginAnotherForm: FormGroup;
  keepModalType = 'InvalidUserException';

  msg = {
    invalid: 'Username or password invalid.',
    notPermission: "You don't have permission",
    saveNSub: 'Save and Submit success',
  }

  constructor(
    private tagTabService: TagTabService,
    public clientState: ClientState,
    private notificationError: AuthErrorHandler,
    private idbService: IdbService,
  ) { }

  get isTablet() {
    return InfoDevice.isTablet;
  }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  ngOnInit() {
    this.createFormGroup();
  }

  createFormGroup = () => {
    this.loginAnotherForm = new FormGroup({
      usernameAnother: new FormControl("", [Validators.required]),
      passwordAnother: new FormControl("", [Validators.required]),
    });
  };

  onSignWithAnother() {
    if (this.loginAnotherForm.invalid) {
      return;
    }
    this.requestModel['userName'] = this.loginAnotherForm.get('usernameAnother').value;
    this.requestModel['password'] = this.loginAnotherForm.get('passwordAnother').value;
    switch (this.type) {
      case 'saveAndSubmit':
        if (this.isTablet && this.isOffline) {
          this.executeSignOffline();
        } else {
          this.executeSignSSOnline();
        }
        break;
      case 'approve':
        if (this.isTablet && this.isOffline) {
          this.executeSignOffline();
        } else {
          this.executeSignAOnline();
        }
        break;
    }
  }

  executeSignSSOnline() {
    this.clientState.isBusy = true;
    this.tagTabService
      .updateItrRecordDetail(this.requestModel)
      .subscribe(
        (res) => {
          this.clientState.isBusy = false;
          this.onSign.emit(true);
          this.notificationError.handleSuccess(Constants.SignSuccess);
        },
        (err) => {
          this.clientState.isBusy = false;
          if (err.type !== this.keepModalType) {
            this.onSign.emit(false);
          }
          this.notificationError.handleError(err.message);
        }
      );
  }

  executeSignOffline() {
    const _snUser = StoreNames.lookups;
    this.idbService.getItem(_snUser, KeyLookups.userDownloadLookup).then((res) => {
      const _obj: User4SignOff = res.find(_item => _item.userName === this.requestModel['userName']) as User4SignOff;
      if (_obj && _obj.clientToken) {
        if (BCryptHelper.comparison(this.requestModel['password'], _obj.clientToken)) {
          this.signDirectly(_obj);
        } else {
          this.notificationError.handleError(this.msg.invalid);
        }
      } else {
        this.notificationError.handleError(this.msg.invalid);
      }
    }, (err) => { })
  }

  executeSignAOnline() {
    this.clientState.isBusy = true;
    this.tagTabService.approveRecord(this.requestModel).subscribe(
      (res) => {
        this.clientState.isBusy = false;
        this.onSign.emit(true);
        this.notificationError.handleSuccess(Constants.SignSuccess);
      },
      (err) => {
        this.clientState.isBusy = false;
        if (err.type !== this.keepModalType) {
          this.onSign.emit(false);
        }
        this.notificationError.handleError(err.message);
      }
    );
  }

  signDirectly(item: User4SignOff) {
    const _snHandovers = StoreNames.handovers;
    this.idbService.getItem(_snHandovers, this.requestModel.handoverId).then((res) => {
      const _handover = res ? { ...res } : null;
      const _recordTemp: HandoverDetail = _handover ? { ..._handover.recordHandover } as HandoverDetail : null;
      let _isComplete = false;
      // check signature permission
      const index = _recordTemp && Array.isArray(_recordTemp.signatures) ? (_recordTemp.signatures).findIndex(_s => _s.isTurn) : null;
      if (_recordTemp.signatures[index].authorizationLevel >= item.authorizationLevel) {
        // next step
        const _signNo1 = _recordTemp.signatures[index].number,
          _signNo2 = _signNo1 + 1;
        let _currentIndex = index, _nextIndex;
        if (_recordTemp.signatures && _recordTemp.signatures.length > 0) {
          // _currentIndex = this.signatureList.findIndex(sign => sign.isTurn);
          // _currentIndex = _recordTemp.signatures.findIndex(
          //   (sign) => sign.number === _signNo1
          // );
          const _temp = {
            signDate: new Date(),
            userCompany: item.company,
            userName: item.userName,
            signUserId: item.userId,
            isTurn: false,
          };
          Object.assign(_recordTemp.signatures[_currentIndex], _temp);

          if (_recordTemp.signatures.length === 1 || _signNo2 > _recordTemp.signatures.length) {
            _recordTemp.status = TagItrStatus.Completed;
            _isComplete = true;
          } else {
            _nextIndex = _recordTemp.signatures.findIndex(
              (sign) => sign.number === _signNo2
            );
            _recordTemp.signatures[_nextIndex].isTurn = true;
            _recordTemp.status = TagItrStatus.Inprogress;
          }
        }
        _recordTemp.isEdited = true;

        if (this.requestModel.listQuestionData) {
          _recordTemp.questions = [...this.requestModel.listQuestionData];
        }

        const _editedHandover = { ..._handover, ...{ recordHandover: { ..._recordTemp }, isChanged: true } };
        // Update handover status
        if (_isComplete) {
          _editedHandover.status = HandoverStatus.Completed;
          _editedHandover.statusId = HandoverStatusEnum.Completed;
        }
        this.idbService
          .updateItem(_snHandovers, _editedHandover, this.requestModel.handoverId).then((res) => {
            this.clientState.isBusy = false;
            this.onSign.emit(true);
            this.notificationError.handleSuccess(
              Constants.TagTabSignAndSubmitItrTag
            );
          }, (err) => {
            this.onSign.emit(false);
            this.clientState.isBusy = false;
          });
      } else {
        this.onSign.emit(false);
        this.clientState.isBusy = false;
        this.notificationError.handleError(this.msg.notPermission);
      }
    }, (err) => { })
  }

  onCancel() {
    this.onSign.emit(false);
  }
}