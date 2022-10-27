import { Component, EventEmitter, Input, OnInit, Output, } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Constants } from 'src/app/shared/common';
import { BCryptHelper } from 'src/app/shared/common/bcrypt/bcrypt';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { StoreNames } from 'src/app/shared/models/common/common.model';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { DetailPreservationTabModel, PreservationStatus, PreservationStatusEnum, SignaturePres, SignOffPreservationCommand } from 'src/app/shared/models/preservation-tab/preservation-tab.model';
import { KeyLookups } from 'src/app/shared/models/punch-item/punch-item.model';
import { User4SignOff } from 'src/app/shared/models/user/user.model';
import { AuthErrorHandler, ClientState, IdbService } from 'src/app/shared/services';
import { PreservationTabServices } from 'src/app/shared/services/api/preservation-tab/preservation-tab.service';



@Component({
  selector: "another-user-sign-preservation",
  templateUrl: "./another-user-sign-preservation.component.html",
  styleUrls: ["./another-user-sign-preservation.component.scss"],
})

export class AnotherUserSignPreservation implements OnInit {
  @Input() visible: boolean = false;
  @Input() hasShowLoginModal = false;
  @Input() elementId: string;

  @Output() onSign: EventEmitter<boolean> = new EventEmitter();

  usernameAnother: FormControl;
  passwordAnother: FormControl;
  sub: Subscription;
  projectKey: string;

  loginAnotherForm: FormGroup;
  keepModalType = 'InvalidUserException';

  msg = {
    invalid: 'Username or password invalid.',
    notPermission: "You don't have permission",
  }


  constructor(
    private preservationTabServices: PreservationTabServices,
    public clientState: ClientState,
    private notificationError: AuthErrorHandler,
    private route: ActivatedRoute,
    private router: Router,
    private idbService: IdbService,
  ) {
    this.sub = this.route.params.subscribe(params => {
      this.projectKey = params['projectKey'];
      if (!this.projectKey) {
        this.router.navigate([""]);
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

  onCancel() {
    this.onSign.emit(false);
  }

  executeSignOnline() {
    this.clientState.isBusy = true;
    const _command: SignOffPreservationCommand = {
      preservationId: this.elementId,
      projectKey: this.projectKey,
      isDifferentUser: true,
      username: this.loginAnotherForm.get('usernameAnother').value,
      password: this.loginAnotherForm.get('passwordAnother').value
    }
    this.preservationTabServices
      .preservationSignOff(_command)
      .subscribe({
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
    }, (err) => { });
  }

  signDirectly(item: User4SignOff) {
    const _snPreservation = StoreNames.preservation;
    this.idbService.getItem(_snPreservation, this.elementId).then((res) => {
      const _element: DetailPreservationTabModel = res ? { ...res } : null;
      const _elementSignTemp: Array<SignaturePres> = _element ? [..._element.signatures] as Array<SignaturePres> : null;
      // check signature permission
      const index = _elementSignTemp && Array.isArray(_elementSignTemp) ? _elementSignTemp.findIndex(_s => _s.isTurn) : null;
      if (_elementSignTemp[index].authorizationLevel >= item.authorizationLevel) {
        // next step
        const _signNo1 = _elementSignTemp[index].number,
          _signNo2 = _signNo1 + 1;
        let _currentIndex = index, _nextIndex;
        if (_elementSignTemp && _elementSignTemp.length > 0) {
          const _temp = {
            signDate: new Date(),
            signedName: item.userName,
            signUserId: item.userId,
            isTurn: false,
          };
          Object.assign(_elementSignTemp[_currentIndex], _temp);

          if (_elementSignTemp.length === 1 || _signNo2 > _elementSignTemp.length) {
            // update status for element
            _element.status = PreservationStatus.COMPLETED.toUpperCase();
            _element.statusId = PreservationStatusEnum.COMPLETED;
            // assign completed date
            _element.dateComplete = (new Date());
            // create element if type is Periodic
            this._createElementAfterCompleting(_element.type, this.deepCopy(_element));
          } else {
            _nextIndex = _elementSignTemp.findIndex(
              (sign) => sign.number === _signNo2
            );
            _elementSignTemp[_nextIndex].isTurn = true;
          }
        }
        _element.isUpdated = true;

        // update tag preservation change
        const _snTagPreservation = StoreNames.tagPreservation;
        this.idbService.getItem(_snTagPreservation, _element.tagId).then(_tP => {
          this.idbService.updateItem(_snTagPreservation, { ..._tP, ...{ isChanged: true } }, _tP.tagId);
        });

        this.idbService
          .updateItem(_snPreservation, _element, this.elementId).then((res) => {
            this.clientState.isBusy = false;
            this.onSign.emit(true);
            this.notificationError.handleSuccess(
              Constants.SignSuccess
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

  _createElementAfterCompleting(type: string, source2Clone: DetailPreservationTabModel) {
    if (type !== 'Periodic') { return; }
    // create new data
    source2Clone.preservationId = this._createGuid();
    source2Clone.preservationNo = '';
    source2Clone.status = PreservationStatus.NOTDUE4Value.toUpperCase();
    source2Clone.statusId = PreservationStatusEnum.ACTIVE;
    source2Clone.dateComplete = null;
    source2Clone.images = new Array();

    // assign preservation due date
    source2Clone.dateDue = new Date((Date.now() + (source2Clone.preservationElement.frequencyInWeeks * 1000 * 3600 * 24 * 7)));
    // assign Signatures
    const _snLookup = StoreNames.lookups;
    this.idbService.getItem(_snLookup, KeyLookups.preservationSignatureTemplate).then(_signatures => {
      source2Clone.signatures = [..._signatures];
      const _snPreservation = StoreNames.preservation;
      this.idbService.addItem(_snPreservation, source2Clone.preservationId, source2Clone);
    });
  }

  _createGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  //#region Utils
  deepCopy(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || 'object' != typeof obj) {
      return obj;
    }

    // Handle Array
    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = this.deepCopy(obj[i]);
      }
      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
          copy[attr] = this.deepCopy(obj[attr]);
        }
      }
      return copy;
    }

    throw new Error('Unable to copy obj! Its type isn\'t supported.');
  }
  //#endregion Utils
}