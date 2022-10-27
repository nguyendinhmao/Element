import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { CreateStandardPunchItemModel } from 'src/app/shared/models/data-tab/data-standardpunchitem.model';
import { DataStandardPunchItemService } from 'src/app/shared/services/api/data-tab/data-standardpunchitem.service';
import { DisciplineLookUpModel } from 'src/app/shared/models/data-tab/data-discipline.model';
import { DataDisciplineService } from 'src/app/shared/services/api/data-tab/data-discipline.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'create-data-standardpunchitem',
  templateUrl: './create-data-standardpunchitem.component.html'
})

export class CreateStandardPunchItemComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() projectId: string;
  creationModel: CreateStandardPunchItemModel = new CreateStandardPunchItemModel();
  disciplineModels: DisciplineLookUpModel[] = [];
  disciplineTempModels: DisciplineLookUpModel[] = [];
  isDisciplineLoadingSelect: boolean;
  bufferSize = 100;
  projectKey: string;
  sub: Subscription;
  constructor(
    public clientState: ClientState,
    private dataStandardPunchItemService: DataStandardPunchItemService,
    private disciplineService: DataDisciplineService,
    private authErrorHandler: AuthErrorHandler,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    (this.sub = this.route.params.subscribe((params) => {
      this.projectKey = params["projectKey"];
      if (!this.projectKey) {
        this.router.navigate([""]);
      }
    }));
  }

  ngOnInit() {

    if (!this.creationModel) this.creationModel = new CreateStandardPunchItemModel();
    this.onGetDisciplineLookup();
  }
  onSaveData = (form: NgForm) => {
    if (!form || form.invalid) {
      return;
    }
    this.clientState.isBusy = true;
    this.creationModel.projectId = this.projectId;
    let createStandardPunchItemModel = <CreateStandardPunchItemModel>{
      ...this.creationModel
    };
    this.dataStandardPunchItemService.createStandardPunchItem(createStandardPunchItemModel).subscribe({
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
  onGetDisciplineLookup = () => {
    this.clientState.isBusy = true;
    this.disciplineService.getDisciplineLookUp(this.projectKey).subscribe(res => {
      this.disciplineModels = res.content ? <DisciplineLookUpModel[]>[...res.content] : [];
      this.disciplineTempModels = this.disciplineModels.slice(0, this.bufferSize);
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }
  onScrollToEndDiscipline = () => {
    if (this.disciplineModels.length > this.bufferSize) {
      const len = this.disciplineTempModels.length;
      const more = this.disciplineModels.slice(len, this.bufferSize + len);
      this.isDisciplineLoadingSelect = true;
      setTimeout(() => {
        this.isDisciplineLoadingSelect = false;
        this.disciplineTempModels = this.disciplineTempModels.concat(more);
      }, 500)
    }
  }

  onSearchDiscipline = ($event) => {
    this.isDisciplineLoadingSelect = true;
    if ($event.term == '') {
      this.disciplineTempModels = this.disciplineModels.slice(0, this.bufferSize);
      this.isDisciplineLoadingSelect = false;
    } else {
      this.disciplineTempModels = this.disciplineModels;
      this.isDisciplineLoadingSelect = false;
    }
  }

  onClearDiscipline = () => {
    this.disciplineTempModels = this.disciplineModels.slice(0, this.bufferSize);
  }
  onCancel = () => {
    this.onSuccess.emit(false);
  }
}
