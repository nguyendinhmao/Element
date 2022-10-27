import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { DataTagNoService } from 'src/app/shared/services/api/data-tab/data-tagno.service';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { UpdateTagNoModel, TagLookUpModel, DrawingLookUpModel2 } from 'src/app/shared/models/data-tab/data-tagno.model';
import { WorkPackLookUpModel } from 'src/app/shared/models/data-tab/data-workpack.model';
import { DataWorkpackService } from 'src/app/shared/services/api/data-tab/data-workpack.service';
import { DataLocationService } from 'src/app/shared/services/api/data-tab/data-location.service';
import { DataSubSystemService } from 'src/app/shared/services/api/data-tab/data-subsystem.service';
import { LocationLookUpModel } from 'src/app/shared/models/data-tab/data-location.model';
import { SubSystemLookUpModel } from 'src/app/shared/models/data-tab/data-subsystem.model';
import { PackageLookUpModel } from 'src/app/shared/models/package/package.model';
import { EquipmentLookUpModel } from 'src/app/shared/models/equipment/equipment.model';
import { DataEquipmentService } from 'src/app/shared/services/api/data-tab/data-equipment.service';
import { DataSystemService } from 'src/app/shared/services/api/data-tab/data-system.service';
import { SystemLookUpModel } from 'src/app/shared/models/data-tab/data-system.model';
import { ProjectLookupModel } from 'src/app/shared/models/project-management/project-management.model';
import { ProjectService } from 'src/app/shared/services/api/projects/project.service';
import { TagTypeModel } from 'src/app/shared/models/tab-tag/tab-tag.model';
import { MockTabTypeApi } from 'src/app/shared/mocks/mock.tag-type';
import { DataDisciplineService } from 'src/app/shared/services/api/data-tab/data-discipline.service';
import { DisciplineLookUpModel } from 'src/app/shared/models/data-tab/data-discipline.model';
import { DrawingLookUpModel } from 'src/app/shared/models/punch-page/punch-page.model';
import { DataDrawingService } from 'src/app/shared/services/api/data-tab/data-drawing.service';

@Component({
  selector: 'edit-data-tagno',
  templateUrl: './edit-data-tagno.component.html'
})

export class EditDataTagNoComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() projectKey
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() tagId: string;

  updationModel: UpdateTagNoModel = new UpdateTagNoModel()
  workPackLookUpModels: WorkPackLookUpModel[] = [];
  locationLookUpModels: LocationLookUpModel[] = [];
  subSystemLookUpModels: SubSystemLookUpModel[] = [];
  packageLookUpModels: PackageLookUpModel[] = [];
  equipmentLookUpModel: EquipmentLookUpModel[] = [];
  systemModels: SystemLookUpModel[] = [];
  projectLookupModels: ProjectLookupModel[] = [];
  tagLookupModels: TagLookUpModel[] = [];
  private mockTabTypeApi = new MockTabTypeApi();
  dataTagTypeModels: TagTypeModel[] = [];
  disciplineModels: DisciplineLookUpModel[] = [];


  bufferSize = 100;
  drawingModels: DrawingLookUpModel2[] = [];
  drawingTempModels: DrawingLookUpModel2[] = [];
  constructor(
    public clientState: ClientState,
    private datatagnoService: DataTagNoService,
    private dataDrawingService: DataDrawingService,
    private authErrorHandler: AuthErrorHandler,
    private workPackService: DataWorkpackService,
    private locationService: DataLocationService,
    private subSystemService: DataSubSystemService,
    private equipmentService: DataEquipmentService,
    private systemService: DataSystemService,
    private projectService: ProjectService,
    private dataDisciplineService: DataDisciplineService,
  ) { }

  public ngOnInit() {
    this.onGetAllDataRelate();
  }

  onGetAllDataRelate = () => {
    Promise.all([
      this.onGetDisciplineLookup(),
      this.onGetWorkPackLookUp(),
      this.onGetLocationLookUp(),
      this.onEquipmentTypeLookUp(),
      this.onGetLookUpDrawing(),
      this.onGetTag(),
      this.onGetTagType()
    ]).then(res => {
      this.clientState.isBusy = false;
    }).catch((err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }
  onGetTag() {
    this.clientState.isBusy = true;
    this.datatagnoService.getTagNoId(this.tagId).subscribe(res => {
      this.updationModel = res ? <UpdateTagNoModel>{ ...res } : null;
      this.onGetLookUpSystem();
      this.onGetSubSytemLookUp(this.updationModel.systemId);
      this.onGetLookUpTag(this.updationModel.tagId);
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

    this.clientState.isBusy = true;
    let tagnoUpdateModel = <UpdateTagNoModel>{
      ...this.updationModel
    };
    this.datatagnoService.updateTagNo(tagnoUpdateModel).subscribe({
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

  onChangetagnoCode = (event) => {
    const regex = /r'^[a-zA-Z0-9\+]*$'/;
    let codeMacth = regex.test(event.target.value);
    if (codeMacth && event.target.value.length > 10) {
      this.authErrorHandler.handleError("tagno Code maximune 10 characters");
      return;
    }
    if (!codeMacth && event.target.value.length > 1) {
      this.authErrorHandler.handleError("tagno Code which allows only the a-zA-Z0-9 characters");
      return;
    }
    return;
  }
  onGetWorkPackLookUp() {
    this.clientState.isBusy = true;
    this.workPackService.getWorkPackLookUp(this.projectKey).subscribe(res => {
      this.workPackLookUpModels = res.content ? <WorkPackLookUpModel[]>[...res.content] : [];
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }
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
  onEquipmentTypeLookUp() {
    this.clientState.isBusy = true;
    this.equipmentService.getEquipmentTypeLookUp(this.projectKey).subscribe(res => {
      this.equipmentLookUpModel = res.content ? <EquipmentLookUpModel[]>[...res.content] : [];
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }
  onGetSubSytemLookUp(systemId?: string) {
    this.clientState.isBusy = true;

    if (!systemId) return;

    this.subSystemService.getSubSystemLookUp(this.projectKey, systemId).subscribe(res => {
      this.subSystemLookUpModels = res.content ? <SubSystemLookUpModel[]>[...res.content] : [];
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }
  onGetLookUpSystem() {
    this.clientState.isBusy = true;
    this.systemService.getElementSystemLookUp(this.projectKey).subscribe(res => {
      this.systemModels = res.content ? <SystemLookUpModel[]>[...res.content] : [];
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }
  onGetLookUpTag(tagId?: string) {
    this.clientState.isBusy = true;

    if (!tagId) return;

    this.datatagnoService.getTagLookUp(this.projectKey, tagId).subscribe(res => {
      this.tagLookupModels = res.content ? <TagLookUpModel[]>[...res.content] : [];
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }
  onGetTagType() {
    this.clientState.isBusy = true;
    this.mockTabTypeApi.getTagTypeData().subscribe(res => {
      this.dataTagTypeModels = res.content ? <TagTypeModel[]>[...res.content] : [];
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }
  onGetSubSystemBySystem(event) {
    this.onGetSubSytemLookUp(event.id);
    this.updationModel.subSystemId = null;
  }
  onCancel = () => {
    this.onSuccess.emit(false);
  }
  onGetDisciplineLookup() {
    this.clientState.isBusy = true;
    this.dataDisciplineService.getDisciplineLookUp(this.projectKey).subscribe(res => {

      this.disciplineModels = res.content ? <TagLookUpModel[]>[...res.content] : [];
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onClearDrawingSelect = (drawing: DrawingLookUpModel2) => {
    if (
      drawing &&
      drawing.id &&
      this.updationModel.drawingIds &&
      this.updationModel.drawingIds.length > 0
    ) {
      this.updationModel.drawingIds = this.updationModel.drawingIds.filter(
        (id) => id != drawing.id
      );
    }
  };

  onGetLookUpDrawing() {
    return new Promise((resolve, reject) => {
      this.dataDrawingService.getDrawingLookUp(this.projectKey).subscribe(
        (res) => {
          this.drawingModels = res.content
            ? <DrawingLookUpModel2[]>[...res.content]
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

}
