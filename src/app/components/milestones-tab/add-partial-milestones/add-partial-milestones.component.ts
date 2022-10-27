import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { JwtTokenHelper } from 'src/app/shared/common';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { StoreNames } from 'src/app/shared/models/common/common.model';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { CreatePartialHandoverModel, HandoverLookUpModel, HandoverStatus, HandoverStatusEnum, HandoverType, MilestonesTabModel, MilestoneTags, WalkdownSignature, WalkdownStatusEnum } from 'src/app/shared/models/milestones-tab/milestones-tab.model';
import { DisciplineLookUpPunchPage } from 'src/app/shared/models/punch-item/punch-item.model';
import { RecordQuestionsModel, RecordSignaturesModel } from 'src/app/shared/models/tab-tag/itr-record.model';
import { ClientState, IdbService } from 'src/app/shared/services';
import { MilestonesTabService } from 'src/app/shared/services/api/milestones-tab/milestones-tab.service';
import { PunchPageService } from 'src/app/shared/services/api/punch-page/punch-page.service';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';

@Component({
  selector: "add-partial-milestones",
  templateUrl: "./add-partial-milestones.component.html",
})

export class AddPartialMilestonesComponent implements OnInit {
  @Input() handoverId: string;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

  //--- Model
  disciplineModels: DisciplineLookUpPunchPage[] = [];
  disciplineTempModels: DisciplineLookUpPunchPage[] = [];
  createPartialHandoverModel: CreatePartialHandoverModel = new CreatePartialHandoverModel();

  //--- Variables
  bufferSize = 100;
  isLoadingDiscipline: boolean;
  walkdownStatusEnum = WalkdownStatusEnum;
  handoverStatusEnum = HandoverStatusEnum;

  constructor(
    private punchPageService: PunchPageService,
    private authErrorHandler: AuthErrorHandler,
    private clientState: ClientState,
    private milestonesTabService: MilestonesTabService,
    private idbService: IdbService,
  ) { }

  public ngOnInit() {
    this.onGetLookUpDiscipline();
  }

  //--- Check info device
  // get isTablet() {
  //   return InfoDevice.isTablet;
  // }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  onGetLookUpDiscipline = () => {
    this.clientState.isBusy = true;
    if (this.isOffline) {
      const _snHandovers = StoreNames.handovers;
      this.idbService.getItem(_snHandovers, this.handoverId).then(res => {
        this.disciplineModels = res && res.disciplines ? <DisciplineLookUpPunchPage[]>[...res.disciplines] : [];
        this.disciplineTempModels = this.disciplineModels.slice(0, this.bufferSize);
        this.clientState.isBusy = false;
      }, err => {
        this.clientState.isBusy = false;
      });
    } else {
      this.milestonesTabService.getDisciplineHandoverLookUp(this.handoverId).subscribe(
        (res) => {
          this.disciplineModels = res.content ? <DisciplineLookUpPunchPage[]>[...res.content] : [];
          this.disciplineTempModels = this.disciplineModels.slice(0, this.bufferSize);
          this.clientState.isBusy = false;
        },
        (err: ApiError) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        }
      );
    }
  }

  onScrollToEndSelect = () => {
    if (this.disciplineModels.length > this.bufferSize) {
      this.isLoadingDiscipline = true;
      const len = this.disciplineTempModels.length;
      const more = this.disciplineModels.slice(len, this.bufferSize + len);
      setTimeout(() => {
        this.isLoadingDiscipline = false;
        this.disciplineTempModels = this.disciplineTempModels.concat(more);
      }, 500);
    }
  }

  onSearchSelect = ($event: { term: string; }) => {
    if ($event.term == "") {
      this.disciplineTempModels = this.disciplineModels.slice(0, this.bufferSize);
      this.isLoadingDiscipline = false;
    } else {
      this.disciplineTempModels = this.disciplineModels;
      this.isLoadingDiscipline = false;
    }
  }

  onClearSelect = () => {
    this.disciplineTempModels = this.disciplineModels.slice(0, this.bufferSize);
  }

  onSubmit = (f: NgForm) => {
    if (f.invalid) {
      return;
    }
    this.clientState.isBusy = true;

    const _infoProject = JwtTokenHelper.GetModuleProjectDefault();
    this.createPartialHandoverModel.handoverId = this.handoverId;
    this.createPartialHandoverModel.projectKey = _infoProject.projectKey;

    if (this.isOffline) {
      const _snHandovers = StoreNames.handovers;
      const _guid = this._createGuid();
      this.idbService.getItem(_snHandovers, this.handoverId).then((res: MilestonesTabModel) => {
        if (res) {
          const _updatedHandover = this.deepCopy(res) as MilestonesTabModel;
          const _newHandover = this.deepCopy(res) as MilestonesTabModel;
          // separate tagRelated
          let _updatedTagRelated: MilestoneTags[] = new Array();
          let _newTagRelated: MilestoneTags[] = new Array();
          // separate Disciplines
          let _updatedDisciplines = new Array();
          let _newDisciplines = new Array();
          _updatedHandover.disciplines.forEach(_dis => {
            if (this.createPartialHandoverModel.disciplineIds.some(_disId => _disId === _dis.id)) {
              _newTagRelated.push({ ..._updatedHandover.tagsRelated.find(_tag => _tag.disciplineId === _dis.id) });
              _newDisciplines.push(_dis);
            } else {
              _updatedTagRelated.push({ ..._updatedHandover.tagsRelated.find(_tag => _tag.disciplineId === _dis.id) });
              _updatedDisciplines.push(_dis);
            }
          });
          // set tags related
          _updatedHandover.tagsRelated = [..._updatedTagRelated];
          _newHandover.tagsRelated = [..._newTagRelated];
          // set Disciplines
          _updatedHandover.disciplines = [..._updatedDisciplines];
          _newHandover.disciplines = [..._newDisciplines];
          // set Type for both
          _updatedHandover.type = HandoverType.intial;
          _newHandover.type = _newHandover && _newHandover.disciplines.length === 1 ? HandoverType.individual : HandoverType.partial;
          // set for new handover
          _newHandover.handoverId = _guid
          Object.assign(_newHandover, { ...this.reset4NewHandover(_newHandover), isChanged: true });
          // add new handover
          this.idbService.addItem(_snHandovers, _guid, _newHandover);
          // update handover
          setTimeout(() => {
            this.idbService.updateItem(_snHandovers, _updatedHandover, this.handoverId).then(res => {
              this.clientState.isBusy = false;
              this.onSuccess.emit(true);
              this.authErrorHandler.handleSuccess("Add partial successfully!");
            }, err => {
              this.clientState.isBusy = false;
              this.authErrorHandler.handleError('An error has occurred while CreatePartialHandover. Please contact Admin for assistance.');
            });
          }, 10);
        }
      });
    } else {
      this.milestonesTabService.createPartialHandover(this.createPartialHandoverModel).subscribe({
        complete: () => {
          this.clientState.isBusy = false;
          this.onSuccess.emit(true);
          this.authErrorHandler.handleSuccess("Add partial successfully!");
        },
        error: (err: ApiError) => {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(err.message);
        }
      });
    }
  }

  reset4NewHandover(newHandover: MilestonesTabModel) {
    // walkdown signatures
    const _tempWD = {
      isTurn: false,
      signDate: null,
      signUserId: null,
      signedName: null,
    }
    const _walkdownSignatures: WalkdownSignature[] = this.deepCopy(newHandover.walkDownSignatures).map((_s: WalkdownSignature) => {
      if (_s.number === 1) {
        return { ..._s, ..._tempWD, ...{ isTurn: true } };
      }
      return { ..._s, ..._tempWD };
    });
    // record signatures
    const _tempRS = {
      isTurn: false,
      signDate: null,
      signUserId: null,
      signatureId: "00000000-0000-0000-0000-000000000000",
      userCompany: null,
      userName: null,
    }
    const _rSignatures: RecordSignaturesModel[] = this.deepCopy(newHandover.recordHandover.signatures).map((_s: RecordSignaturesModel) => {
      if (_s.number === 1) {
        return { ..._s, ..._tempRS, ...{ isTurn: true } };
      }
      return { ..._s, ..._tempRS };
    });
    // record questions
    const _rQuestions: RecordQuestionsModel[] = this.deepCopy(newHandover.recordHandover.questions).map((_q: RecordQuestionsModel) => _q && (_q.currentAnswer = null));
    return {
      remarks: new Array(),
      handoverNo: '',
      conditionalAcceptance: false,
      isInitialHO: false,
      walkDownStatus: this.walkdownStatusEnum.NotStarted,
      status: HandoverStatus.NotStarted,
      walkDownSignatures: _walkdownSignatures,
      recordHandover: { ...newHandover.recordHandover, ...{ questions: _rQuestions, signatures: _rSignatures } },
      isAddNew: true,
    }
  }

  onCancel = () => {
    this.onSuccess.emit(false);
  };

  // Utils
  _createGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
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
}