import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ProjectCreationModel } from 'src/app/shared/models/project-management/project-management.model';
import { ProjectService } from 'src/app/shared/services/api/projects/project.service';
import { NgForm, NgModel } from '@angular/forms';
import { CompanyService } from '../../../shared/services/api/companies/company.service';
import { CompanyLookUpModel } from 'src/app/shared/models/common/common.model';
import { UserService } from 'src/app/shared/services/api/user/user.service';
import { UserLookupModel } from 'src/app/shared/models/user/user.model';
import { Configs } from 'src/app/shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { JwtTokenHelper } from 'src/app/shared/common/jwt-token-helper/jwt-token-helper';
import { ModuleProjectDefaultModel } from 'src/app/shared/models/module/module.model';

@Component({
  selector: 'add-project-management',
  templateUrl: './add-project-management.component.html',
})

export class AddProjectManagementComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

  projectCreationModel: ProjectCreationModel = new ProjectCreationModel();
  companyManagementModels: CompanyLookUpModel[] = [];
  projectLeaderModels: UserLookupModel[] = [];
  // projectStatusModels: LookUpModel[] = [];
  moduleProjectDefaultModel: ModuleProjectDefaultModel = new ModuleProjectDefaultModel();

  constructor(
    public clientState: ClientState,
    public companyService: CompanyService,
    public projectService: ProjectService,
    public userService: UserService,
    private authErrorHandler: AuthErrorHandler
  ) { }

  public ngOnInit() {
    this.onGetCompany();
    this.onGetLeader();
    //this.onGetStatuses();
  }

  //--- Get company
  onGetCompany = () => {
    this.clientState.isBusy = true;
    this.companyService.getCompanyLookupData().subscribe(res => {
      this.companyManagementModels = res.items ? <CompanyLookUpModel[]>[...res.items] : [];

      this.companyManagementModels.map(c => {
        if (c.photoUrl) c.photoUrl = Configs.BaseSitePath + c.photoUrl;
      })

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Get leader
  onGetLeader = () => {
    this.clientState.isBusy = true;
    this.userService.getUserLookup(1, '', true).subscribe(res => {
      this.projectLeaderModels = res.items ? <UserLookupModel[]>[...res.items] : [];

      this.projectLeaderModels.map(p => {
        if (p.photoUrl) p.photoUrl = Configs.BaseSitePath + p.photoUrl;
      });

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }
  //--- Save data
  onSaveData = (form: NgForm) => {
    if (!form || form.invalid) {
      return;
    }

    this.clientState.isBusy = true;

    this.moduleProjectDefaultModel = JwtTokenHelper.GetModuleProjectDefault();
    if (this.moduleProjectDefaultModel) {
      this.projectCreationModel.moduleId = this.moduleProjectDefaultModel.moduleId;
    }

    let creationModel = <ProjectCreationModel>{
      ...this.projectCreationModel
    };

    this.projectService.createProject(creationModel).subscribe({
      complete: () => {
        this.clientState.isBusy = false;
        this.onSuccess.emit(true);
      },
      error: (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      },
    });
  }

  suggestProjectKey = (event: any, projectKeyInput: NgModel) => {
    if (projectKeyInput.touched || projectKeyInput.dirty) return;
    const projectName = this.projectCreationModel.projectName;
    if (!projectName || projectName === "" || projectName.length < 2) { 
      this.projectCreationModel.projectKey = ""; 
      return; 
    }

    let projectKey = projectName;

    projectKey = projectName.trim();
    if (projectKey.indexOf(' ') === -1) {
      projectKey = projectName.trim().length >= 2 ? projectName.trim().substr(0, 6) : "";
    }
    else {
      var parts = projectName.split(' ').filter(x => x && x.length > 0).map(x => x.substr(0, 1));
      if (parts.length > 1) {
        projectKey = '';
        parts.forEach(function (part) {
          projectKey += part;
        })
      } else projectKey = projectName;
    }
    projectKey = projectKey.toUpperCase();
    if(projectKey.length > 2){
      projectKey = projectKey.substring(0,2);
    }
    this.projectCreationModel.projectKey = projectKey;
  }

  onCancel = () => {
    this.onSuccess.emit(false);
  }
}
