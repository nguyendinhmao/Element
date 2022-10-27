import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { StoreNames } from 'src/app/shared/models/common/common.model';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { ConditionalAcceptedModel, ConditionalModel, HandoverLookUpModel, HandoverStatus, HandoverStatusEnum, MilestonesTabModel, MilestoneTags } from 'src/app/shared/models/milestones-tab/milestones-tab.model';
import { IdbService } from 'src/app/shared/services';
import { MilestonesTabService } from 'src/app/shared/services/api/milestones-tab/milestones-tab.service';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { ClientState } from 'src/app/shared/services/client/client-state';

@Component({
  selector: 'conditional-acceptance',
  templateUrl: './conditional-acceptance.component.html'
})

export class ConditionalAcceptanceComponent implements OnInit {
  @Input() projectKey: string;
  @Input() handoverId: string;
  @Input() accepted: boolean;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

  //--- Model
  conditionalModel: ConditionalModel = new ConditionalModel();
  conditionalAcceptedModel: ConditionalAcceptedModel = new ConditionalAcceptedModel();

  //--- Boolean
  isEnableAccept: boolean;

  // Variable 
  msg = {
    conditionSuccess: 'Accept condition successfully!',
    cannotAccept: 'Cannot accept condition.',
  }

  constructor(
    public clientState: ClientState,
    private milestonesTabService: MilestonesTabService,
    private authErrorHandler: AuthErrorHandler,
    private idbService: IdbService,
  ) { }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  public ngOnInit() {
    this.onCheckConditional();
  }

  onCheckConditional = () => {
    this.clientState.isBusy = true;

    if (this.isOffline) {
      const _snHandovers = StoreNames.handovers;
      this.idbService.getItem(_snHandovers, this.handoverId).then(res => {
        const _handover: MilestonesTabModel = res ? { ...res } : null;
        this.conditionalModel = {
          conditions: this.getConditions(_handover.tagsRelated),
          isAccepted: _handover.conditionalAcceptance
        }
        if (this.conditionalModel.conditions.length > 0 && !this.conditionalModel.isAccepted) {
          this.isEnableAccept = true;
        }
        this.clientState.isBusy = false;
      }, er => {
        this.clientState.isBusy = false;
      })
    } else {
      this.milestonesTabService.checkConditional(this.projectKey, this.handoverId).subscribe(res => {
        this.conditionalModel = res.content ? <ConditionalModel>{ ...res.content } : null;

        if (this.conditionalModel.conditions.length > 0 && !this.conditionalModel.isAccepted) {
          this.isEnableAccept = true;
        }

        this.clientState.isBusy = false;
      }, (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      });
      if (this.accepted) {
        this.isEnableAccept = false;
      }
    }
  }

  onAccepted = (conditionalModel: ConditionalModel) => {
    this.clientState.isBusy = true;

    if (this.isOffline) {
      const _snHandovers = StoreNames.handovers;
      this.idbService.getItem(_snHandovers, this.handoverId).then(res => {
        const _handover: MilestonesTabModel = res ? { ...res } : null;
        // add remarks for handover
        _handover.remarks = conditionalModel.conditions;
        // accepted condition
        _handover.conditionalAcceptance = true;
        // update status' handover
        _handover.status = HandoverStatus.ConditionallyAccepted;
        _handover.statusId = HandoverStatusEnum.ConditionallyAccepted;
        _handover.isChanged = true;
        // update handover to store
        this.idbService.updateItem(_snHandovers, _handover, this.handoverId);
        // prompt message
        this.clientState.isBusy = false;
        this.onSuccess.emit(true);
        this.authErrorHandler.handleSuccess(this.msg.conditionSuccess);
      }, err => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(this.msg.cannotAccept);
      });
    } else {
      this.conditionalAcceptedModel.projectKey = this.projectKey;
      this.conditionalAcceptedModel.handoverId = this.handoverId;
      this.conditionalAcceptedModel.conditions = conditionalModel.conditions;

      this.milestonesTabService.conditionalAcceptedHandover(this.conditionalAcceptedModel).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.onSuccess.emit(true);
          this.authErrorHandler.handleSuccess(this.msg.conditionSuccess);
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        }
      });
    }
  }

  onCancel = () => {
    this.onSuccess.emit(false);
  }

  // Utils
  getConditions(tagRelated: Array<MilestoneTags>) {
    let _collection = new Array();
    let _result = new Array();
    const _prefix = {
      record: 'Record',
      change: 'Change',
      punch: 'Punch',
    }
    // execute ITRs
    tagRelated.forEach(_tag => { _tag.itrs && _tag.itrs.length > 0 && (_collection.push(..._tag.itrs)) });
    _collection.forEach(_c => _result.push(`${_prefix.record} ${_c.name} have not completed: ${_c.status}`));
    // execute Punches
    _collection = new Array();
    tagRelated.forEach(_tag => _tag.punches && _tag.punches.length > 0 && (_collection.push(..._tag.punches)));
    _collection.forEach(_c => _result.push(`${_prefix.record} ${_c.name} have not completed: ${_c.status}`));
    //execute Changes
    _collection = new Array();
    let _changesTemp = new Array();
    tagRelated.forEach(_tag => _tag.changes && _tag.changes.length > 0 && (_changesTemp.push(..._tag.changes)));
    _changesTemp.forEach((_change: HandoverLookUpModel) => {
      if (!(_collection.some(_c => _c.id === _change.id))) {
        _collection.push(_change);
      }
    });
    _collection.forEach(_c => _result.push(`${_prefix.record} ${_c.name} have not completed: ${_c.status}`));
    return _result;
  }
}