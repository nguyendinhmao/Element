import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtTokenHelper } from 'src/app/shared/common';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { StoreNames } from 'src/app/shared/models/common/common.model';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { DetailPreservationTabModel, ElementPresTabStatusCommand, PreservationStatus, PreservationStatusEnum } from 'src/app/shared/models/preservation-tab/preservation-tab.model';
import { AuthErrorHandler, ClientState, IdbService } from 'src/app/shared/services';
import { PreservationTabServices } from 'src/app/shared/services/api/preservation-tab/preservation-tab.service';

@Component({
  selector: 'justification-prestab-modal',
  templateUrl: './justification-prestab-modal.component.html',
  styleUrls: ['./justification-prestab-modal.component.scss'],
})

export class JustificationPresTabModalComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() onSubmit: EventEmitter<boolean> = new EventEmitter();
  @Input() jQuestionContent: string;
  @Input() elements: DetailPreservationTabModel[];
  @Input() dateDue: string;
  @Input() status: string;

  sub: any;
  moduleKey: string;
  projectKey: string;
  reasonContent: string = '';
  dateDueContent: Date;

  isSetDateDue: boolean = false;
  isRequireSetDD: boolean = false;
  isOverduePaused: boolean = false;

  elementIds: string[] = [];

  constructor(
    public clientState: ClientState,
    private authErrorHandler: AuthErrorHandler,
    private route: ActivatedRoute,
    private router: Router,
    private preservationTabServices: PreservationTabServices,
    private idbService: IdbService,
  ) {
    this.sub = this.route.params.subscribe(params => {
      this.projectKey = params['projectKey'];
      this.moduleKey = params["moduleKey"];
      if (!this.projectKey || !this.moduleKey) {
        this.router.navigate([""]);
      }
    });
  }

  public ngOnInit() {
    const _isMultiple = this.elements.length > 1 || (this.status === 'RESUME' && this.elements.length === 1), _single = this.status !== 'RESUME' && this.elements.length === 1;
    this.isOverduePaused = this.checkOverdue(this.elements);
    if (_single) {
      this.isRequireSetDD = this.status === 'PAUSED' && this.isOverduePaused;
    } else if (_isMultiple) {
      this.isRequireSetDD = this.status === 'RESUME' && this.isOverduePaused;
      this.elements.forEach(e => {
        this.elementIds.push(e.preservationId);
      });
    }
  }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  onSubmitData = (form: NgForm) => {
    if (!form || form.invalid || (this.elements && this.elements.length === 0)) {
      return;
    }
    const _isMultiple = this.elements.length > 1, _single = this.elements.length === 1;
    let _isOverdue = this.isOverduePaused;

    if (this.isOffline) {
      const _snPreservation = StoreNames.preservation;

      if ((_single && (this.status === 'PAUSED' && (this.isSetDateDue || _isOverdue)))
        || (_isMultiple && (this.status === 'RESUME' && (this.isSetDateDue || _isOverdue)))
      ) {
        let _dateDueFormatted = this.dateDueContent ? (new Date(this.dateDueContent)).toDateString() : null;
        this.elements.forEach(_e => (this.idbService.updateItem(_snPreservation, { ..._e, ...{ isUpdated: true, dateDue: _dateDueFormatted, comment: null }, ...this.checkStatus(_dateDueFormatted), ...this.resetPreservationOff(this.status) }, _e.preservationId)));
      } else if (!this.isSetDateDue && !_isOverdue && ((_single && this.status === 'PAUSED')
        || (_isMultiple && this.status === 'RESUME'))) {
        let _dateDueFormatted = (new Date()).toDateString();
        this.elements.forEach(_e => (this.idbService.updateItem(_snPreservation, { ..._e, ...{ isUpdated: true, dateDue: _dateDueFormatted, comment: null }, ...this.checkStatus(_dateDueFormatted), ...this.resetPreservationOff(this.status) }, _e.preservationId)));
      } else {
        this.elements.forEach(_e => (this.idbService.updateItem(_snPreservation, { ..._e, ...{ isUpdated: true, comment: this.reasonContent }, ...this.resetPreservationOff(this.status) }, _e.preservationId)));
      }
      // update tag preservation change
      const _snTagPreservation = StoreNames.tagPreservation;
      this.idbService.getItem(_snTagPreservation, this.elements[0].tagId).then(_tP => {
        this.idbService.updateItem(_snTagPreservation, { ..._tP, ...{ isChanged: true } }, _tP.tagId);
      });
      setTimeout(() => {
        this.onSubmit.emit(true);
      }, 500);
    } else {
      this.clientState.isBusy = true;
      const _model: ElementPresTabStatusCommand = new ElementPresTabStatusCommand();

      _model.preservationIds = _isMultiple ? [...this.elementIds] : [this.elements[0].preservationId];
      _model.projectKey = this.projectKey;

      if ((_single && (this.status === 'PAUSED' && (this.isSetDateDue || _isOverdue)))
        || (_isMultiple && (this.status === 'RESUME' && (this.isSetDateDue || _isOverdue)))
      ) {
        let _dateDueFormatted = this.dateDueContent ? (new Date(this.dateDueContent)).toDateString() : null
        _model.dateDue = _dateDueFormatted;
      } else {
        _model.comments = this.reasonContent;
      }
      this.preservationTabServices.updateElementStatus(_model, this.status).subscribe(res => {
        this.onSubmit.emit(true);
        this.clientState.isBusy = false;
      }, (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      });
    }
  }

  resetPreservationOff(type: string) {
    switch (type) {
      case 'OVERDUE':
      case 'DUE':
      case 'NOTDUE':
        const _userInfo = JwtTokenHelper.GetUserInfo();
        return {
          haltedBy: _userInfo.userName,
          haltedDate: (new Date()),
          isPause: true,
          status: PreservationStatus.PAUSED.toUpperCase(),
          statusId: PreservationStatusEnum.PAUSED,
        }
      case 'STOPPED':
        const _userInfoS = JwtTokenHelper.GetUserInfo();
        return {
          haltedBy: _userInfoS.userName,
          haltedDate: (new Date()),
          isPause: false,
          status: PreservationStatus.STOPPED.toUpperCase(),
          statusId: PreservationStatusEnum.STOPPED,
        }
      case 'PAUSED':
      case 'RESUME':
        return {
          haltedBy: null,
          haltedDate: null,
          isPause: false,
        }
    }
  }

  checkStatus(date) {
    const dueDate = new Date(date);
    const current = new Date();
    if (this.difference(current, dueDate) >= 3) {
      return {
        status: PreservationStatus.NOTDUE4Value.toUpperCase(),
        statusId: PreservationStatusEnum.ACTIVE,
      }
    }
    return {
      status: PreservationStatus.DUE.toUpperCase(),
      statusId: PreservationStatusEnum.ACTIVE,
    }
  }

  difference(date1, date2) {
    const date1utc = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const date2utc = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    const day = 1000 * 60 * 60 * 24;
    return (date2utc - date1utc) / day;
  }

  checkOverdue(elements: DetailPreservationTabModel[]): boolean {
    let _current = new Date().getTime();

    if (elements.length === 1) {
      let _dateDue = new Date(elements[0].dateDue).getTime();
      return _current > _dateDue;
    }
    return !!(elements.find(e => e.status === 'OVERDUE' || new Date(e.dateDue).getTime() < _current));
  }

  avoidPastDate(d: Date): boolean {
    const _currentDate = new Date();
    _currentDate.setHours(0, 0, 0, 0); // set time to zero
    return d.getTime() >= _currentDate.getTime();
  }

  onSetDateDue() {
    this.isSetDateDue = true;
  }

  onCancelSetDateDue() {
    this.isSetDateDue = false;
  }

  onCancel = () => {
    this.onSubmit.emit(false);
  }
}