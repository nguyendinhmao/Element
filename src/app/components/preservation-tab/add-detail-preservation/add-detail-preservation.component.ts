import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { IndexRelatedSNs, LoadingSelectionModel, SelectionControlName, StoreNames } from 'src/app/shared/models/common/common.model';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { DetailPreservationTabModel, ElementCreationModel, ElementPresTabNewCommand, PreservationElementInfo, PreservationStatus, PreservationStatusEnum } from 'src/app/shared/models/preservation-tab/preservation-tab.model';
import { KeyLookups } from 'src/app/shared/models/punch-item/punch-item.model';
import { AuthErrorHandler, ClientState, IdbService } from 'src/app/shared/services';
import { PreservationTabServices } from 'src/app/shared/services/api/preservation-tab/preservation-tab.service';

@Component({
  selector: 'add-detail-preservation',
  templateUrl: './add-detail-preservation.component.html',
})
export class AddDetailPreservationComponent implements OnInit {
  @Output() onSubmit: EventEmitter<boolean> = new EventEmitter();

  sub: Subscription;
  projectKey: string;
  preservationid: string;
  tagNo: string;

  elementCreationModelList: ElementCreationModel[] = [];

  loadingSelection: LoadingSelectionModel = new LoadingSelectionModel();
  selectionControlName = SelectionControlName;

  msg = {
    existed: 'This Preservation was existed',
  }


  constructor(
    private preservationTabServices: PreservationTabServices,
    private route: ActivatedRoute,
    private router: Router,
    private clientState: ClientState,
    private authErrorHandler: AuthErrorHandler,
    private idbService: IdbService,
  ) {
    this.sub = this.route.params.subscribe(params => {
      this.projectKey = params['projectKey'];
      this.tagNo = params['preservationId'];
      if (!this.projectKey) {
        this.router.navigate([""]);
      }
    });
  }

  ngOnInit() {
    this.getElementList();
  }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  getElementList() {
    if (this.isOffline) {
      const _snLookups = StoreNames.lookups;
      this.idbService.getItem(_snLookups, KeyLookups.preservationElements).then(res => {
        const _response: PreservationElementInfo[] = res ? [...res] as Array<PreservationElementInfo> : [];
        this.elementCreationModelList = _response.map(_item => ({ id: _item.id, value: _item.elementNo }));
      }, err => { });
    } else {
      this.preservationTabServices.getPreservationElementLookUpByProjectKey(this.projectKey).subscribe(res => {
        this.elementCreationModelList = res.content ? [...res.content] : null;
      });
    }
  }

  onAddNew(form: NgForm) {
    if (!form || form.invalid) {
      return;
    }

    if (this.isOffline) {
      const _snPreservation = StoreNames.preservation;
      const _iPreservation = IndexRelatedSNs.preservation.tagNo;
      this.idbService.getAllDataFromIndex(_snPreservation, _iPreservation, this.tagNo).then(response => {
        const _preservationL = response ? <DetailPreservationTabModel[]>[...response] : [];
        if (this.checkExistence(this.preservationid, _preservationL)) {
          this.clientState.isBusy = false;
          this.authErrorHandler.handleError(this.msg.existed);
        } else {
          const _snLookup = StoreNames.lookups;
          this.idbService.getItem(_snLookup, KeyLookups.preservationElements).then((res) => {
            const _elementTemp: PreservationElementInfo = res ? res.find(_item => _item.id === this.preservationid) : null;
            const _tagId = _preservationL[0].tagId;
            if (_elementTemp) {
              this._createElement(_elementTemp, this.tagNo, _tagId);
              setTimeout(() => {
                this.onSubmit.emit(true);
              }, 500);
            }
            this.clientState.isBusy = false;
          }, err => {
            this.clientState.isBusy = false;
          });
        }
      }, err => {
        this.clientState.isBusy = false;
      });

    } else {
      let _new: ElementPresTabNewCommand = new ElementPresTabNewCommand();
      _new.projectKey = this.projectKey;
      _new.preservationElementId = this.preservationid;
      _new.tagNo = this.tagNo;
      this.preservationTabServices.addElementInPreservationTab(_new).subscribe(res => {
        this.onSubmit.emit(true);
        this.clientState.isBusy = false;
      }, (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      });
    }
  }

  _createElement(element: PreservationElementInfo, tagNo: string, tagId: string) {
    if (!element) { return; }
    let _newPreservation: DetailPreservationTabModel = new DetailPreservationTabModel();
    // create new data
    _newPreservation = {
      ..._newPreservation,
      ...{
        preservationId: this._createGuid(),
        preservationNo: '',
        status: PreservationStatus.NOTDUE4Value.toUpperCase(),
        statusId: PreservationStatusEnum.ACTIVE,
        dateComplete: null,
        images: new Array(),
        type: element.type,
        frequency: element.frequencyInWeeks ? element.frequencyInWeeks.toString() : null,
        element: `${element.elementNo} ${element.task}`,
        tagNo: tagNo,
        tagId: tagId,
      }
    }
    // assign preservation due date
    let _frequency = 1;
    if (element.frequencyInWeeks) {
      _frequency = element.frequencyInWeeks;
    }
    _newPreservation.dateDue = new Date((Date.now() + (_frequency * 1000 * 3600 * 24 * 7)));
    // assign preservation element
    _newPreservation.preservationElement = { ...(new PreservationElementInfo()), ...element };
    // update tag preservation change
    const _snTagPreservation = StoreNames.tagPreservation;
    this.idbService.getItem(_snTagPreservation, tagId).then(_tP => {
      this.idbService.updateItem(_snTagPreservation, { ..._tP, ...{ isChanged: true } }, _tP.tagId);
    });
    // assign Signatures
    const _snLookup = StoreNames.lookups;
    this.idbService.getItem(_snLookup, KeyLookups.preservationSignatureTemplate).then(_signatures => {
      _newPreservation.signatures = [..._signatures];
      // add new preservation
      const _snPreservation = StoreNames.preservation;
      this.idbService.addItem(_snPreservation, _newPreservation.preservationId, _newPreservation);
    });
  }

  _createGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  checkExistence(id: string, preservationL: DetailPreservationTabModel[]) {
    return preservationL.some(_p => _p.preservationElement.id === id);
  }

  onCancel = () => {
    this.onSubmit.emit(false);
  }
}