import { Component, EventEmitter, Input, OnInit, Output, } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Constants, JwtTokenHelper } from 'src/app/shared/common';
import { BCryptHelper } from 'src/app/shared/common/bcrypt/bcrypt';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { StoreNames } from 'src/app/shared/models/common/common.model';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { HandoverStatus, HandoverStatusEnum, MilestonesTabModel, MilestoneTabSignOffCommand, WalkdownSignature, WalkdownStatusEnum } from 'src/app/shared/models/milestones-tab/milestones-tab.model';
import { KeyLookups } from 'src/app/shared/models/punch-item/punch-item.model';
import { User4SignOff } from 'src/app/shared/models/user/user.model';
import { AuthErrorHandler, ClientState, IdbService } from 'src/app/shared/services';
import { MilestonesTabService } from 'src/app/shared/services/api/milestones-tab/milestones-tab.service';
import { TagTabService } from 'src/app/shared/services/api/tag-tab/tag-tab.service';



@Component({
  selector: "another-user-sign-walkdown",
  templateUrl: "./another-user-sign-walkdown.component.html",
  styleUrls: ["./another-user-sign-walkdown.component.scss"],
})

export class AnotherUserSignWalkdown implements OnInit {
  @Input() visible: boolean = false;
  @Input() hasShowLoginModal = false;
  @Input() handoverId: string;

  @Output() onSign: EventEmitter<boolean> = new EventEmitter();

  usernameAnother: FormControl;
  passwordAnother: FormControl;

  loginAnotherForm: FormGroup;
  keepModalType = 'InvalidUserException';
  projectKey: string;
  sub: Subscription;

  msg = {
    invalid: 'Username or password invalid.',
    notPermission: "You don't have permission",
    saveNSub: 'Save and Submit success',
  }

  constructor(
    private milestonesTabService: MilestonesTabService,
    public clientState: ClientState,
    private notificationError: AuthErrorHandler,
    private route: ActivatedRoute,
    private router: Router,
    private idbService: IdbService,
  ) {
    this.sub = this.route.params.subscribe(params => {
      this.projectKey = params['projectKey'];
      if (!this.projectKey) {
        this.router.navigate(['']);
      }
    });
  }

  ngOnInit() {
    this.createFormGroup();
  }


  get isOffline() {
    return InfoDevice.isOffline;
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

    if (this.isOffline) {
      this.executeSignOffline();
    } else {
      this.executeSignOnline();
    }
  }

  executeSignOnline() {
    this.clientState.isBusy = true;
    const _command: MilestoneTabSignOffCommand = {
      handoverId: this.handoverId,
      projectKey: this.projectKey,
      isDifferentUser: true,
      username: this.loginAnotherForm.get('usernameAnother').value,
      password: this.loginAnotherForm.get('passwordAnother').value,
    }

    this.milestonesTabService.signOffWalkDown(_command).subscribe({
      complete: () => {
        this.clientState.isBusy = false;
        this.onSign.emit(true);
        this.notificationError.handleSuccess(Constants.SignSuccess);
      },
      error: (err: ApiError) => {
        this.clientState.isBusy = false;
        if (err.type !== this.keepModalType) {
          this.onSign.emit(false);
        }
        this.notificationError.handleError(err.message);
      },
    });
  }

  executeSignOffline() {
    const _snUser = StoreNames.lookups;
    this.idbService.getItem(_snUser, KeyLookups.userDownloadLookup).then((res) => {
      const _obj: User4SignOff = res.find(_item => _item.userName === this.loginAnotherForm.get('usernameAnother').value) as User4SignOff;
      if (_obj && _obj.clientToken) {
        if (BCryptHelper.comparison(this.loginAnotherForm.get('passwordAnother').value, _obj.clientToken)) {
          this.signDirectly(_obj);
        } else {
          this.notificationError.handleError(this.msg.invalid);
        }
      } else {
        this.notificationError.handleError(this.msg.invalid);
      }
    }, (err) => { })
  }

  signDirectly(item: User4SignOff) {
    const _snHandovers = StoreNames.handovers;
    this.idbService.getItem(_snHandovers, this.handoverId).then((res) => {
      const _handover: MilestonesTabModel = res ? { ...res } : null;
      const _walkdownSignTemp: Array<WalkdownSignature> = _handover ? [..._handover.walkDownSignatures] as Array<WalkdownSignature> : null;
      // check signature permission
      const index = _walkdownSignTemp && Array.isArray(_walkdownSignTemp) ? _walkdownSignTemp.findIndex(_s => _s.isTurn) : null;
      if (_walkdownSignTemp[index].authorizationLevel >= item.authorizationLevel) {
        // next step
        const _signNo1 = _walkdownSignTemp[index].number,
          _signNo2 = _signNo1 + 1;
        let _currentIndex = index, _nextIndex;
        if (_walkdownSignTemp && _walkdownSignTemp.length > 0) {
          const _temp = {
            signDate: new Date(),
            signedName: item.userName,
            signUserId: item.userId,
            isTurn: false,
          };
          Object.assign(_walkdownSignTemp[_currentIndex], _temp);

          if (_walkdownSignTemp.length === 1 || _signNo2 > _walkdownSignTemp.length) {
            _handover.walkDownComplete = true;
            _handover.walkDownStatus = WalkdownStatusEnum.Completed;
            _handover.walkDownCompleteDate = new Date();
            _handover.status = HandoverStatus.Ready;
            _handover.statusId = HandoverStatusEnum.Ready;
          } else {
            _nextIndex = _walkdownSignTemp.findIndex(
              (sign) => sign.number === _signNo2
            );
            _walkdownSignTemp[_nextIndex].isTurn = true;
            _handover.walkDownStatus = WalkdownStatusEnum.Inprogress;
          }
        }

        const _editedHandover = { ..._handover, ...{ walkDownSignatures: [..._walkdownSignTemp], isChanged: true } };
        this.idbService
          .updateItem(_snHandovers, _editedHandover, this.handoverId).then((res) => {
            this.clientState.isBusy = false;
            this.onSign.emit(true);
            this.notificationError.handleSuccess(
              Constants.WalkdownSigned
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