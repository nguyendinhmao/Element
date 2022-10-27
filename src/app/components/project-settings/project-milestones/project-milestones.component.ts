import { Component, OnInit, Renderer2, ViewChild, ElementRef, Input } from '@angular/core';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { ProjectMilestoneModel, ProjectMilestoneUpdationModel } from 'src/app/shared/models/project-settings/project-milestone.model';
import { DataMilestoneService } from 'src/app/shared/services/api/data-tab/data-milestone.service';
import { ProjectMilestoneService } from 'src/app/shared/services/api/project-settings/project-milestone.service';
import { MilestoneLookUpModel } from 'src/app/shared/models/data-tab/data-milestone.model';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { Constants } from 'src/app/shared/common';

@Component({
  selector: 'project-milestones',
  templateUrl: './project-milestones.component.html'
})

export class ProjectMilestonesComponent implements OnInit {
  @ViewChild('milestone') milestone: ElementRef;
  @Input() projectId: string;
  @Input() projectKey: string;
  dataProjectMilestoneModels: ProjectMilestoneModel[] = [];

  milestoneModels: MilestoneLookUpModel[] = [];
  projectMilestoneList: ProjectMilestoneModel[] = [];

  constructor(
    public clientState: ClientState,
    public activatedRoute: ActivatedRoute,
    public toastr: ToastrService,
    private authErrorHandler: AuthErrorHandler,
    private renderer: Renderer2,
    private milestoneService: DataMilestoneService,
    private projectMilestoneService: ProjectMilestoneService,

  ) { }

  ngOnInit() {
    this.onGetLookUpMilestone();
  }

  addMilestoneModel = () => {
    this.onRemoveMilestone();
    this.projectMilestoneList.push({
      id: null,
      milestoneId: null,
      isUpdated: false,
      isDeleted: false,
      itrType: null,
      punchCategory: null
    })
  }

  onRemoveMilestone = () => {
    this.milestoneModels = this.milestoneModelsTemp;
    this.projectMilestoneList.map(item => {
      if (!item.isDeleted) this.milestoneModels = this.milestoneModels.filter(x => x.id != item.milestoneId);
    });
  }

  removeMilestoneModel = (index, item: ProjectMilestoneModel) => {
    if (item.id) {
      this.projectMilestoneList[index].isDeleted = true;
    }
    else {
      this.projectMilestoneList.splice(this.projectMilestoneList.indexOf(item), 1);
    }
    setTimeout(this.onRemoveMilestone, 500);
  }

  onUpdateProjectMilestone = (index, item: ProjectMilestoneModel) => {
    const isExist = this.projectMilestoneList.filter(x => x.milestoneId == item.milestoneId);
    isExist && isExist.length > 0 && isExist[0].milestoneId == item.milestoneId ? this.projectMilestoneList[index] = { ...item, isUpdated: true, isDeleted: false } : this.projectMilestoneList[index].isUpdated = true;
    setTimeout(this.onRemoveMilestone, 500);
  }

  projectMilestoneTemp = [];

  getProjectMilestoneList() {
    this.clientState.isBusy = true;
    this.projectMilestoneService.getProjectMilestoneList(this.projectId).subscribe(res => {
      this.projectMilestoneList = res.content ? <ProjectMilestoneModel[]>[...res.content] : [];
      this.projectMilestoneList.map(item => {
        this.projectMilestoneTemp.push(Object.assign({}, item))
      });
      setTimeout(this.onRemoveMilestone, 500);
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  milestoneModelsTemp = [];
  onGetLookUpMilestone() {
    this.clientState.isBusy = true;
    this.milestoneService.getMilestoneLookUp(this.projectKey).subscribe(res => {
      this.milestoneModels = res.content ? <MilestoneLookUpModel[]>[...res.content] : [];
      this.milestoneModels.map(item => {
        this.milestoneModelsTemp.push(Object.assign({}, item))
      });
      this.getProjectMilestoneList();
      // this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onSaveData = (form: NgForm) => {
    if (!form || form.invalid) {
      return;
    }
    this.clientState.isBusy = true;
    let projectMilestoneUpdateModel = <ProjectMilestoneUpdationModel>{
      projectKey: this.projectKey,
      projectMileStones: [],
      walkDownSignatures: [],
      milestoneSignatures: []
    };
    this.projectMilestoneService.updateProjectMilestone(projectMilestoneUpdateModel).subscribe(res => {
      let result = res.content ? <ProjectMilestoneModel[]>[...res.content] : [];
      this.projectMilestoneList = [];
      this.projectMilestoneTemp = [];
      this.milestoneModels = this.milestoneModelsTemp;
      result.map(item => {
        this.projectMilestoneList.push(Object.assign({}, item))
        this.projectMilestoneTemp.push(Object.assign({}, item))
      });
      setTimeout(this.onRemoveMilestone, 500);
      this.authErrorHandler.handleSuccess(Constants.ProjectMilestoneUpdated);
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onResetMilestone() {
    this.milestoneModels = this.milestoneModelsTemp;
    this.projectMilestoneList = [];
    this.projectMilestoneTemp.map(item => this.projectMilestoneList.push(Object.assign({}, item)));
    setTimeout(this.onRemoveMilestone, 500);
  }
}
