import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { JwtTokenHelper } from 'src/app/shared/common';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { StoreNames } from 'src/app/shared/models/common/common.model';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { HandoverLookUpModel, MilestonesTabModel, MilestoneTags, WalkDownCompleteModel, WalkdownStatusEnum } from 'src/app/shared/models/milestones-tab/milestones-tab.model';
import { IdbService } from 'src/app/shared/services';
import { MilestonesTabService } from 'src/app/shared/services/api/milestones-tab/milestones-tab.service';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { ClientState } from 'src/app/shared/services/client/client-state';

@Component({
  selector: "walkdown-complete-milestones",
  templateUrl: "./walkdown-complete-milestones.component.html",
  styleUrls: ['./walkdown-complete-milestones.component.scss']
})

export class WalkdownCompleteMilestonesComponent implements OnInit {
  //--- Boolean
  isEnableStartWalkdown: boolean = false;
  isEnableSignOff: boolean = false;
  isShowAnotherSign: boolean = false;

  //--- Model
  handoverLookUpModels: HandoverLookUpModel[] = [];
  walkDownCompleteModel: WalkDownCompleteModel = new WalkDownCompleteModel();
  walkdownStatusEnum = WalkdownStatusEnum;

  //--- Variable
  projectKey: string;
  handoverId: string;

  events = {
    onSuccess: 'onSuccess',
    onSignOff: 'onSignOff',
    onShowAddPunchItem: 'onShowAddPunchItem',
    onAnotherSignOff: 'onAnotherSignOff',
  }

  msg = {
    startWithoutPunch: 'Walkdown Complete',
    startSuccessful: 'Walkdown Complete',
    accept2Continue: 'The Handover still has outstanding work scope. Please conditionally accept if you want to continue.',
    cannotStart: 'Cannot start walkdown',
  }

  constructor(
    private milestonesTabService: MilestonesTabService,
    public clientState: ClientState,
    private authErrorHandler: AuthErrorHandler,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<WalkdownCompleteMilestonesComponent>,
    private idbService: IdbService,
  ) { }

  //--- Check info device
  //   get isTablet() {
  //     return InfoDevice.isTablet;
  //   }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  public ngOnInit() {
    this.projectKey = this.data['projectKey'];
    this.handoverId = this.data['handoverId'];

    //--- disable backdrop dialog
    this.dialogRef.disableClose = true;

    setTimeout(() => {
      this.checkWalkDownStatus();
      this.getPunchHandoverLookUp();
    }, 1);
  }

  //--- Get punch handover
  getPunchHandoverLookUp = () => {
    this.clientState.isBusy = true;
    if (this.isOffline) {
      // get handover punch lookup
      const _snHandovers = StoreNames.handovers;
      this.idbService.getItem(_snHandovers, this.handoverId).then(res => {
        const _updatedHandover: MilestonesTabModel = res ? { ...res } : null;
        if (_updatedHandover && _updatedHandover.tagsRelated && _updatedHandover.tagsRelated.length > 0) {
          this.handoverLookUpModels = this.sumAllPunchesFrom(_updatedHandover.tagsRelated);
        }
      }, err => { });
    } else {
      this.milestonesTabService.getPunchHandoverLookUp(this.handoverId).subscribe(res => {
        this.handoverLookUpModels = res.content ? <HandoverLookUpModel[]>[...res.content] : [];
        this.clientState.isBusy = false;
      }, (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      });
    }
  }

  //--- Check walk down status
  checkWalkDownStatus = () => {
    this.clientState.isBusy = true;
    if (this.isOffline) {
      const _snHandovers = StoreNames.handovers;
      this.idbService.getItem(_snHandovers, this.handoverId).then((res) => {
        this.walkDownCompleteModel = res ? {
          ...(new WalkDownCompleteModel()), ...{
            walkDownSignatures: res.walkDownSignatures,
            walkDownComplete: res.walkDownComplete,
            walkDownStatus: res.walkDownStatus,
          }
        } : null;

        const index = this.walkDownCompleteModel && Array.isArray(this.walkDownCompleteModel.walkDownSignatures) ? (this.walkDownCompleteModel.walkDownSignatures).findIndex(_s => _s.isTurn) : null;
        const infoProject = JwtTokenHelper.GetAuthSignInProject();
        if (index !== null && index !== undefined && index >= 0) {
          this.walkDownCompleteModel.isTurnSign = (this.walkDownCompleteModel.walkDownSignatures[index].authorizationLevel >= infoProject.authLevel);
        }

        this.assignWalkDownCompleteModel();
        this.clientState.isBusy = false;
      }, (err) => {
        this.clientState.isBusy = false;
      });
    } else {
      this.milestonesTabService.onCheckWalkDownStatus(this.projectKey, this.handoverId).subscribe(res => {
        this.walkDownCompleteModel = res.content ? <WalkDownCompleteModel>{ ...res.content } : null;
        this.assignWalkDownCompleteModel();
        this.clientState.isBusy = false;
      }, (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      });
    }
  }

  assignWalkDownCompleteModel() {
    this.isShowAnotherSign = !this.walkDownCompleteModel.walkDownComplete;
    if (this.walkDownCompleteModel.isTurnSign && this.walkDownCompleteModel.walkDownStatus === this.walkdownStatusEnum.Inprogress) {
      this.isEnableSignOff = true;
    }

    if (this.walkDownCompleteModel.walkDownStatus === this.walkdownStatusEnum.NotStarted) {
      this.isEnableStartWalkdown = true;
    }
  }

  //--- Start walk down handover
  startWalkDownHandover = () => {
    this.clientState.isBusy = true;

    if (this.isOffline) {
      const _snHandovers = StoreNames.handovers;
      this.idbService.getItem(_snHandovers, this.handoverId).then(res => {
        const _handover: MilestonesTabModel = res ? { ...res } : null;
        const _listCheckItrs = [...(this.sumAllChangesFrom(_handover.tagsRelated))];
        const _listCheckPunches = [...(this.sumAllItrsFrom(_handover.tagsRelated))];
        const _listCheckChanges = [...(this.sumAllPunchesFrom(_handover.tagsRelated))];

        if (_handover.conditionalAcceptance || (!this.checkList('itr', _listCheckItrs) && !this.checkList('punch', _listCheckPunches) && !this.checkList('change', _listCheckChanges))) {
          const _hasRemarks = _handover.remarks && _handover.remarks.length > 0;
          // get Punches in tags related
          const _punches = this.sumAllPunchesFrom(_handover.tagsRelated);
          // update walkdown status NotStarted => Inprogress
          _handover.walkDownStatus = this.walkdownStatusEnum.Inprogress;
          // update remarks list
          if (_punches.length < 1) {
            if (_hasRemarks) {
              _handover.remarks.push(this.msg.startWithoutPunch);
            } else {
              let _remarksTemp: Array<string> = this.getRemarks(_handover.tagsRelated) as Array<string>;
              _remarksTemp.push(this.msg.startWithoutPunch);
              _handover.remarks = [..._remarksTemp];
            }
          }
          _handover.isChanged = true;
          // update handover to store
          this.idbService.updateItem(_snHandovers, _handover, this.handoverId);
          // prompt message
          this.clientState.isBusy = false;
          this.dialogRef.close(this.events.onSuccess);
          this.authErrorHandler.handleSuccess(this.msg.startSuccessful);
        } else {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(this.msg.accept2Continue);
        }
      }, err => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(this.msg.cannotStart);
      });
    } else {
      this.milestonesTabService.startWalkDownHandover(this.handoverId).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.dialogRef.close(this.events.onSuccess);
          this.authErrorHandler.handleSuccess(this.msg.startSuccessful);
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        }
      })
    }
  }

  checkList(type: string, array: Array<any>) {
    switch (type) {
      case 'punch':
        return array.some(_punch => _punch.status !== 'Done' && _punch.status !== 'Deleted');
      case 'itr':
        return array.some(_itr => _itr.status !== 'Completed' && _itr.status !== 'Deleted');
      case 'change':
        return array.some(_change => _change.status !== 'Complete' && _change.status !== 'Deleted');
    }
  }

  //--- Sign off walkdown handover
  signOffWalkDownHandover = () => {
    this.dialogRef.close(this.events.onSignOff);
  }

  //--- Show add punch item
  onShowAddPunch = () => {
    this.dialogRef.close(this.events.onShowAddPunchItem);
  }

  onLoginConfirm() {
    this.dialogRef.close(this.events.onAnotherSignOff);
  }

  // Utils
  sumAllItrsFrom(tags: Array<MilestoneTags>) {
    let _result = new Array();
    tags.forEach(_tag => _tag.itrs && _tag.itrs.length > 0 && (_result.push(..._tag.itrs)));
    return _result;
  }

  sumAllPunchesFrom(tags: Array<MilestoneTags>) {
    let _result = new Array();
    tags.forEach(_tag => _tag.punches && _tag.punches.length > 0 && (_result.push(..._tag.punches)));
    return _result;
  }

  sumAllChangesFrom(tags: Array<MilestoneTags>) {
    let _result = new Array();
    let _changesTemp = new Array();
    tags.forEach(_tag => _tag.changes && _tag.changes.length > 0 && (_changesTemp.push(..._tag.changes)));
    _changesTemp.forEach((_change: HandoverLookUpModel) => {
      if (!(_result.some(_c => _c.id === _change.id))) {
        _result.push(_change);
      }
    });
    return _result;
  }

  getRemarks(tagRelated: Array<MilestoneTags>) {
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