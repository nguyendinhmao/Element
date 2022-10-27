import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ProjectUpdatingModel, ProjectStatusModel } from 'src/app/shared/models/project-management/project-management.model';
import { ProjectService } from 'src/app/shared/services/api/projects/project.service';
import { NgForm } from '@angular/forms';
import { CompanyService } from '../../../shared/services/api/companies/company.service';
import { UserService } from 'src/app/shared/services/api/user/user.service';
import { UserLookupModel } from 'src/app/shared/models/user/user.model';
import { Configs } from 'src/app/shared/common/configs/configs';
import { CompanyManagementModel } from 'src/app/shared/models/company-management/company-management.model';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { CompanyLookUpModel } from 'src/app/shared/models/common/common.model';
import { ModuleProjectDefaultModel } from 'src/app/shared/models/module/module.model';
import { JwtTokenHelper } from 'src/app/shared/common/jwt-token-helper/jwt-token-helper';

@Component({
  selector: 'edit-project-management',
  templateUrl: './edit-project-management.component.html'
})

export class EditProjectManagementComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() projectUpdationModel: ProjectUpdatingModel;

  companyManagementModels: CompanyLookUpModel[] = [];
  projectLeaderModels: UserLookupModel[] = [];
  projectStatusModels: ProjectStatusModel[] = [];
  moduleProjectDefaultModel: ModuleProjectDefaultModel = new ModuleProjectDefaultModel();

  constructor(
    public clientState: ClientState,
    public companyService: CompanyService,
    public projectService: ProjectService,
    public userService: UserService,
    private authErrorHandler: AuthErrorHandler
  ) { }

  public ngOnInit() {
    if (!this.projectUpdationModel) this.projectUpdationModel = new ProjectUpdatingModel();

    this.onGetCompany();
    this.onGetLeader();
    this.onGetStatuses();
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
        if (p.photoUrl) {
          p.photoUrl = Configs.BaseSitePath + p.photoUrl;
        }
      });

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Get status
  onGetStatuses = () => {
    this.clientState.isBusy = true;
    this.projectService.getProjectStatusLookup().subscribe(res => {
      this.projectStatusModels = res.items ? <CompanyLookUpModel[]>[...res.items] : [];
      this.projectStatusModels.forEach(function (item) {
        item.id = parseInt(item.id);
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
      this.projectUpdationModel.moduleId = this.moduleProjectDefaultModel.moduleId;
    }

    let creationModel = <ProjectUpdatingModel>{
      ...this.projectUpdationModel
    };

    this.projectService.updateProject(creationModel).subscribe({
      complete: () => {
        this.clientState.isBusy = false;
        this.onSuccess.emit(true);
      },
      error: (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      },
    })
  }

  onCancel = () => {
    this.onSuccess.emit(false);
  }
}
