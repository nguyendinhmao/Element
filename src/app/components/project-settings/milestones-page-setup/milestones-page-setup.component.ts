import { Component, OnInit } from '@angular/core';
import { Subscription } from "rxjs/internal/Subscription";
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectMilestoneSetuptList, MilestoneSignature, ProjectMilestoneUpdationModel } from 'src/app/shared/models/project-settings/project-milestone.model';
import { ClientState, AuthErrorHandler } from 'src/app/shared/services';
import { DataMilestoneService } from 'src/app/shared/services/api/data-tab/data-milestone.service';
import { ProjectMilestoneService } from 'src/app/shared/services/api/project-settings/project-milestone.service';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { MilestoneLookUpModel } from 'src/app/shared/models/data-tab/data-milestone.model';
import { Constants } from 'src/app/shared/common';
import { AuthorizationLookupValueModel } from 'src/app/shared/models/project-settings/project-user.model';
import { ProjectMemberService } from 'src/app/shared/services/api/project-settings/project-member.service';
import { ProjectUpdatingModel } from 'src/app/shared/models/project-management/project-management.model';
import * as $ from "jquery";
import { ProjectService } from 'src/app/shared/services/api/projects/project.service';
import { Category } from "src/app/shared/models/punch-page/punch-page.model";
import { Renderer2 } from '@angular/core';

@Component({
  selector: 'milestones-page-setup',
  templateUrl: './milestones-page-setup.component.html',
  styleUrls: ['./milestones-page-setup.component.scss'],
})

export class MilestonesPageSetupComponent implements OnInit {
  //--- Models
  projectMilestoneModel: ProjectMilestoneSetuptList[] = [];
  milestoneModelListTemp: ProjectMilestoneSetuptList[] = [];
  milestoneModels: MilestoneLookUpModel[] = [];
  milestoneLookupTemp: MilestoneLookUpModel[] = [];
  authorizationLevelModels: AuthorizationLookupValueModel[] = [];
  projectManagementModel: ProjectUpdatingModel = new ProjectUpdatingModel();
  itrTypeModels: Category[] = [];
  punchCategoryModels: Category[] = [];

  //--- Variables
  sub: Subscription;
  projectKey: string;
  moduleKey: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public clientState: ClientState,
    private authErrorHandler: AuthErrorHandler,
    private milestoneService: DataMilestoneService,
    private projectMilestoneService: ProjectMilestoneService,
    private projectMemberService: ProjectMemberService,
    private projectService: ProjectService,
    private ren: Renderer2
  ) {
    this.sub = this.route.params.subscribe((params) => {
      this.projectKey = params["projectKey"];
      this.moduleKey = params["moduleKey"];
      if (!this.projectKey || !this.moduleKey) {
        this.router.navigate([""]);
      }
    });
  }

  ngOnInit(): void {
    //--- Hide left menu
    $("#top-header .project-name").hide();
    $("#matSideNavMenu").hide();
    $(".toggle-nav").hide();

    //--- Get data
    this.onGetLookUpMilestone();
    this.onGetProjectAuthorizationsLookup();
    this.onGetProjectByKey();
    this.itrTypeModels = [
      { category: "A" },
      { category: "B" },
      { category: "C" },
    ];
    this.punchCategoryModels = [
      { category: "A" },
      { category: "B" },
      { category: "C" },
    ];
  }

  //--- Get project by key
  onGetProjectByKey = () => {
    this.clientState.isBusy = true;

    this.projectService.getProjectByKey(this.projectKey).subscribe((res) => {
      this.projectManagementModel = res ? <ProjectUpdatingModel>{ ...res } : null;
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  };

  onGetData() {
    this.clientState.isBusy = true;
    this.projectMilestoneService.getProjectMilestoneList(this.projectKey).subscribe(
      (res) => {
        this.projectMilestoneModel = res.content ? <ProjectMilestoneSetuptList[]>[...res.content] : [];
        this.clientState.isBusy = false;
        this.projectMilestoneModel.map(item => {
          this.milestoneModelListTemp.push(item)
        });
      },
      (err: ApiError) => {
        this.authErrorHandler.handleError(err.message);
        this.clientState.isBusy = false;
      }
    )
  }

  onRemoveMilestoneLookup = () => {
    this.milestoneModels = this.milestoneLookupTemp;
    this.projectMilestoneModel.map(item => {
      this.milestoneModels = this.milestoneModels.filter(x => x.id != item.milestoneId);
    });
  }

  onGetLookUpMilestone() {
    this.clientState.isBusy = true;
    this.milestoneService.getMilestoneLookUp(this.projectKey).subscribe(res => {
      this.milestoneModels = res.content ? <MilestoneLookUpModel[]>[...res.content] : [];
      this.clientState.isBusy = false;
      this.milestoneModels.map(elem => {
        this.milestoneLookupTemp.push(elem);
      });
      this.onGetData();
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onChangeMilestone(index: number, item: MilestoneLookUpModel) {
    this.projectMilestoneModel[index].milestoneName = item.value;
    setTimeout(this.onRemoveMilestoneLookup, 500);
    if (this.projectMilestoneModel[index].walkDownSignatures.length <= 0) {
      this.initialWalkDownSignature(index);
    }
    if (this.projectMilestoneModel[index].milestoneSignatures.length <= 0) {
      this.initialMilestoneSignature(index);
    }
  }

  onAddMilestone() {
    this.onRemoveMilestoneLookup();
    this.projectMilestoneModel.push({
      id: null,
      milestoneId: null,
      haveSubSystemHO: false,
      haveSystemHO: false,
      milestoneName: null,
      walkDownSignatures: [],
      milestoneSignatures: [],
      itrType: null,
      punchCategory: null
    });
  }

  initialWalkDownSignature(index: number) {
    const _milestoneId = this.projectMilestoneModel[index].milestoneId;
    this.projectMilestoneModel[index].walkDownSignatures.push({
      authorizationId: null,
      description: null,
      id: null,
      milestoneId: _milestoneId,
      number: 1
    })

  }

  initialMilestoneSignature(index: number) {
    const _milestoneId = this.projectMilestoneModel[index].milestoneId;
    this.projectMilestoneModel[index].milestoneSignatures.push({
      authorizationId: null,
      description: null,
      id: null,
      milestoneId: _milestoneId,
      number: 1
    })
  }

  onAddWalkDownSignature(item: ProjectMilestoneSetuptList) {
    let numberSign = null;
    if (item.walkDownSignatures && item.walkDownSignatures.length === 0) numberSign = 1;
    else {
      let temp = [];
      item.walkDownSignatures.map(e => {
        temp.push(Object.assign({}, e));
      })
      numberSign = temp.sort((a, b) => { return b.number - a.number })[0].number + 1
    }
    item.walkDownSignatures.push({
      authorizationId: null,
      description: null,
      id: null,
      milestoneId: item.milestoneId,
      number: numberSign
    })
  }

  onAddMilestoneSignature(item: ProjectMilestoneSetuptList) {
    let numberSign = null;
    if (item.milestoneSignatures && item.milestoneSignatures.length === 0) numberSign = 1;
    else {
      let temp = [];
      item.milestoneSignatures.map(e => {
        temp.push(Object.assign({}, e));
      })
      numberSign = temp.sort((a, b) => { return b.number - a.number })[0].number + 1
    }
    item.milestoneSignatures.push({
      authorizationId: null,
      description: null,
      id: null,
      milestoneId: item.milestoneId,
      number: numberSign
    })
  }

  onResetMilestone() {
    this.milestoneModels = this.milestoneLookupTemp;
    this.projectMilestoneModel = [];
    this.milestoneModelListTemp.map(item => this.projectMilestoneModel.push(Object.assign({}, item)));
    setTimeout(this.onRemoveMilestoneLookup, 500);
  }

  onGetProjectAuthorizationsLookup() {
    return new Promise((resolve, reject) => {
      this.projectMemberService.getAuthorizationLevelLookup().subscribe((res) => {
        this.authorizationLevelModels = res.content ? <AuthorizationLookupValueModel[]>[...res.content] : [];
        resolve(res.content);
      }, (err: ApiError) => {
        this.clientState.isBusy = true;
        reject(err.message)
        this.authErrorHandler.handleError(err.message);
      });
    });
  }

  onRemoveWalkDownSignature(item: ProjectMilestoneSetuptList, sign: MilestoneSignature) {
    let currentNumber = sign.number;
    item.walkDownSignatures.map(e => {
      if (e.number === (currentNumber + 1)) {
        let temp = e.number;
        e.number = currentNumber;
        currentNumber = temp;
      }
    })
    item.walkDownSignatures.splice(item.walkDownSignatures.indexOf(sign), 1);
  }

  onRemoveMilestoneSignature(item: ProjectMilestoneSetuptList, sign: MilestoneSignature) {
    let currentNumber = sign.number;
    item.milestoneSignatures.map(e => {
      if (e.number === (currentNumber + 1)) {
        let temp = e.number;
        e.number = currentNumber;
        currentNumber = temp;
      }
    })
    item.milestoneSignatures.splice(item.milestoneSignatures.indexOf(sign), 1);
  }

  onRemoveMilestoneList(item: ProjectMilestoneSetuptList) {
    this.projectMilestoneModel.splice(this.projectMilestoneModel.indexOf(item), 1);
    setTimeout(this.onRemoveMilestoneLookup, 500);
  }

  onSaveMileStone() {
    this.projectMilestoneModel = this.projectMilestoneModel.filter(x => x.milestoneId !== null);
    this.projectMilestoneModel.map(e => {
      e.walkDownSignatures = e.walkDownSignatures.filter(s => { return s.authorizationId !== null });
      e.milestoneSignatures = e.milestoneSignatures.filter(s => { return s.authorizationId !== null });
    });

    var update = new ProjectMilestoneUpdationModel();
    update.projectKey = this.projectKey;
    update.walkDownSignatures = [];
    update.milestoneSignatures = [];
    this.projectMilestoneModel.forEach(e => {
      e.walkDownSignatures.forEach(s => update.walkDownSignatures.push(Object.assign({}, s)));
      e.milestoneSignatures.forEach(s => update.milestoneSignatures.push(Object.assign({}, s)));
    });
    update.projectMileStones = this.projectMilestoneModel;

    this.clientState.isBusy = true;
    this.projectMilestoneService.updateProjectMilestone(update).subscribe({
      complete: () => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleSuccess(Constants.UpdatedMileStone);
        this.onGetLookUpMilestone();
      },
      error: (err) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      }
    })
  }

  checkITRTypeRadio = (button, $event, projectMilestone) => {
    $event.preventDefault();

    //--- NOTE: Chỗ itrType bên dưới không phải lỗi đâu nhé, do map model ở trên site từ đâu :v
    if (button.checked) {
      button.checked = false;
      this.projectMilestoneModel.filter(p => p.id === projectMilestone.id).map(e => {
        e.itrType = null
      });
    } else {
      button.checked = true;
      this.projectMilestoneModel.filter(p => p.id === projectMilestone.id).map(e => {
        e.itrType = button.value
      });
    }
  }

  checkPunchCategoryRadio = (button, $event, projectMilestone) => {
    $event.preventDefault();

    //--- NOTE: Chỗ itrType bên dưới không phải lỗi đâu nhé, do map model ở trên site từ đâu :v
    if (button.checked) {
      button.checked = false;
      this.projectMilestoneModel.filter(p => p.id === projectMilestone.id).map(e => {
        e.punchCategory = null
      });
    } else {
      button.checked = true;
      this.projectMilestoneModel.filter(p => p.id === projectMilestone.id).map(e => {
        e.punchCategory = button.value
      });
    }
  }
}
