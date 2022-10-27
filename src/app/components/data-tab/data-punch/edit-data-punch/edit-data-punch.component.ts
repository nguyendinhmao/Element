import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { DataPunchService } from 'src/app/shared/services/api/data-tab/data-punch.service';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { UpdatePunchModel } from 'src/app/shared/models/data-tab/data-punch.model';
import { DisciplineLookUpModel } from 'src/app/shared/models/data-tab/data-discipline.model';
import { MilestoneLookUpModel } from 'src/app/shared/models/data-tab/data-milestone.model';
import { DataPunchTypeService } from 'src/app/shared/services/api/data-tab/data-punchtype.service';
import { PunchTypeLookUpModel } from 'src/app/shared/models/data-tab/data-punchtype.model';
import { DataDisciplineService } from 'src/app/shared/services/api/data-tab/data-discipline.service';
import { DataMilestoneService } from 'src/app/shared/services/api/data-tab/data-milestone.service';
import { TagLookUpModel } from 'src/app/shared/models/data-tab/data-tagno.model';
import { OrderLookUpModel } from 'src/app/shared/models/data-tab/data-order.model';
import { DataTagNoService } from 'src/app/shared/services/api/data-tab/data-tagno.service';
import { DataOrderService } from 'src/app/shared/services/api/data-tab/data-order.service';
import { Constants } from 'src/app/shared/common';
import { DataDrawingService } from 'src/app/shared/services/api/data-tab/data-drawing.service';
import { DrawingLookUpModel } from "src/app/shared/models/punch-page/punch-page.model";
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { LocationLookUpModel } from 'src/app/shared/models/data-tab/data-location.model';
import { DataLocationService } from 'src/app/shared/services/api/data-tab/data-location.service';
import { PunchPageService } from 'src/app/shared/services/api/punch-page/punch-page.service';

@Component({
  selector: 'edit-data-punch',
  styleUrls: ["./edit-data-punch-item.component.scss"],
  templateUrl: './edit-data-punch.component.html'
})

export class EditDataPunchComponent implements OnInit {

  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() punchId: string;
  @Input() updationModel: UpdatePunchModel
  punchCodeError: boolean = false;
  punchErrorMessage: string;
  bufferSize = 100;

  disciplineModels: DisciplineLookUpModel[] = [];
  milestoneModels: MilestoneLookUpModel[] = [];
  punchTypeModels: PunchTypeLookUpModel[] = [];
  drawingModels: DrawingLookUpModel[] = [];
  drawingTempModels: DrawingLookUpModel[] = [];
  tagModels: TagLookUpModel[] = [];
  orderModels: OrderLookUpModel[] = [];
  projectKey: string;
  moduleKey: string;
  sub: Subscription;
  locationLookUpModels: LocationLookUpModel[] = [];
  constructor(
    public clientState: ClientState,
    private dataPunchService: DataPunchService,
    private authErrorHandler: AuthErrorHandler,
    private disciplineService: DataDisciplineService,
    private milestoneService: DataMilestoneService,
    private punchTypeService: DataPunchTypeService,
    private punchPageService: PunchPageService,
    private locationService: DataLocationService,
    private tagService: DataTagNoService,
    private orderService: DataOrderService,
    private drawingService: DataDrawingService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.sub = this.route.params.subscribe(params => {
      this.projectKey = params['projectKey'];
      this.moduleKey = params['moduleKey'];
      if (!this.projectKey || !this.moduleKey) {
        this.router.navigate(['']);
      }
    });
  }

  ngOnInit() {
    this.punchCodeError = false;
    this.punchErrorMessage = null;
    this.onGetPunchById();
    this.onGetLookUpPunchType();
    this.onGetLookUpOrder();
    this.onGetLookUpTag();
    this.onGetLookUpDrawing();
    // this.onGetLookUpLocationDrawing();
    this.onGetLocationLookUp();

  }

  onGetPunchById = () => {
    this.clientState.isBusy = true;
    this.dataPunchService.getPunchId(this.punchId, this.projectKey).subscribe(res => {
      this.updationModel = res ? <UpdatePunchModel>{ ...res } : null;
      this.clientState.isBusy = false;
    }), (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    };
  }

  onSaveData = (form: NgForm) => {
    if (!form || form.invalid) {
      return;
    }


    let drawingTemp = this.updationModel.drawings || [];
    if (drawingTemp) {
      this.updationModel.drawings = [];
      this.updationModel.drawingIds.map((drawingId) => {
        if (
          drawingId &&
          !drawingTemp.some((item) => item.drawingId == drawingId)
        ) {
          let drawing = this.drawingModels.filter(
            (item) => item.drawingId == drawingId
          )[0];
          this.updationModel.drawings.push({
            ...drawing,
            isAdded: true,
            isDeleted: false,
          });
        }
      });
      drawingTemp.map((drawing) => {
        if (
          drawing &&
          drawing.drawingId &&
          !this.updationModel.drawingIds.some(
            (item) => item == drawing.drawingId
          )
        ) {
          this.updationModel.drawings.push({
            ...drawing,
            isAdded: false,
            isDeleted: true,
          });
        }
      });
    }
    this.clientState.isBusy = true;
    let subsystemUpdateModel = <UpdatePunchModel>{
      ...this.updationModel
    };
    this.dataPunchService.updatePunch(subsystemUpdateModel).subscribe({
      complete: () => {
        this.clientState.isBusy = false;
        this.onSuccess.emit(true);
      },
      error: (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      }
    });
  }

  onChangePunchCode = (event) => {
    const regex = /r'^[a-zA-Z0-9\+]*$'/;
    let codeMacth = regex.test(event.target.value);
    if (codeMacth && event.target.value.length > 7) {
      this.punchCodeError = true;
      this.punchErrorMessage = Constants.ValidateDisciplineCodeMaxLength;
      return;
    }
    if (!codeMacth && event.target.value.length > 1) {
      this.punchCodeError = true;
      this.punchErrorMessage = Constants.ValidateDisciplineCodeFormat;
      return;
    }
    this.punchCodeError = false;
    this.punchErrorMessage = null;
    return;
  }

  onGetLookUpDiscipline() {
    this.clientState.isBusy = true;
    this.disciplineService.getDisciplineLookUp(this.projectKey).subscribe(res => {
      this.disciplineModels = res.content ? <DisciplineLookUpModel[]>[...res.content] : [];
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onGetLookUpPunchType() {
    this.clientState.isBusy = true;
    this.punchTypeService.getPunchTypeLookUp(this.projectKey).subscribe(res => {
      this.punchTypeModels = res.content ? <PunchTypeLookUpModel[]>[...res.content] : [];
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onGetLookUpTag() {
    this.clientState.isBusy = true;
    this.tagService.getTagLookUp(this.projectKey).subscribe(res => {
      this.tagModels = res.content ? <TagLookUpModel[]>[...res.content] : [];
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onGetLookUpOrder() {
    this.clientState.isBusy = true;
    this.orderService.getOrderLookUp(this.projectKey).subscribe(res => {
      this.orderModels = res.content ? <OrderLookUpModel[]>[...res.content] : [];
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onGetLookUpMilestone() {
    this.clientState.isBusy = true;
    this.milestoneService.getMilestoneLookUp().subscribe(res => {
      this.milestoneModels = res.content ? <MilestoneLookUpModel[]>[...res.content] : [];
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onGetLookUpDrawing() {
    return new Promise((resolve, reject) => {
      this.punchPageService.getDrawingLookUpPunchPage(this.projectKey).subscribe(
        (res) => {
          this.drawingModels = res.content
            ? <DrawingLookUpModel[]>[...res.content]
            : [];
          this.drawingTempModels = this.drawingModels.slice(0, this.bufferSize);
          resolve(res.content);
        },
        (err: ApiError) => {
          this.authErrorHandler.handleError(err.message);
          reject(err.message);
        }
      );
    });
  };

  onClearDrawingSelect = (drawing: DrawingLookUpModel) => {
    if (
      drawing &&
      drawing.drawingId &&
      this.updationModel.drawingIds &&
      this.updationModel.drawingIds.length > 0
    ) {
      this.updationModel.drawingIds = this.updationModel.drawingIds.filter(
        (item) => item != drawing.drawingId
      );
    }
  };
  // onGetLookUpLocationDrawing(){
  //     this.clientState.isBusy = true;
  //     this.drawingService.getLocationDrawingLookUp().subscribe(res =>{
  //         this.locationDrawingModels = res.content ? <DrawingLookUpModel[]>[ ...res.content ] :  [];
  //         this.clientState.isBusy = false;
  //     }, (err: ApiError) => {
  //         this.clientState.isBusy = false;
  //         this.authErrorHandler.handleError(err.message);
  //     });
  // }
  onGetLocationLookUp() {
    this.clientState.isBusy = true;
    this.locationService.getLocationLookUp(this.projectKey).subscribe(res => {
      this.locationLookUpModels = res.content ? <LocationLookUpModel[]>[...res.content] : [];
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }



  onCancel = () => {
    this.onSuccess.emit(false);
  }
}
