import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ProjectMemberUpdatingModel, RoleLookupValueModel, AuthorizationLookupValueModel } from 'src/app/shared/models/project-settings/project-user.model';
import { ProjectMemberService } from 'src/app/shared/services/api/project-settings/project-member.service';
import { CompanyLookUpModel } from 'src/app/shared/models/common/common.model'
import { NgForm } from '@angular/forms';
import { Configs } from 'src/app/shared/common/configs/configs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { Subscription } from 'rxjs';

@Component({
  selector: 'edit-project-user',
  templateUrl: './edit-project-user.component.html'
})

export class EditProjectUserComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() idEditing: string;
  @Input() projectId: string;
  updationModel: ProjectMemberUpdatingModel = new ProjectMemberUpdatingModel();;
  userManagementModels: CompanyLookUpModel[] = [];
  roleModels: RoleLookupValueModel[] = [];
  authorisationLevelModels: AuthorizationLookupValueModel[] = [];
  projectKey: string;
  sub: Subscription;
  constructor(
    public clientState: ClientState,
    public projectMemberService: ProjectMemberService,
    public activatedRoute: ActivatedRoute,
    private authErrorHandler: AuthErrorHandler,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.sub = this.route.params.subscribe((params) => {
      this.projectKey = params["projectKey"];
      if (!this.projectKey) {
        this.router.navigate([""]);
      }
    });
  }

  public ngOnInit() {
    if (!this.updationModel) this.updationModel = new ProjectMemberUpdatingModel();
    this.onGetAllData();
  }

  onGetAllData = () => {
    this.clientState.isBusy = true;
    Promise.all([
      this.onGetProjectMember(),
      this.onGetUser(),
      this.onGetRoles(),
      this.onGetAuthorisation()
    ]).then(res => {
      if (!this.roleModels.some(item => item.id == this.updationModel.projectRoleId)) {
        this.updationModel.projectRoleId = null;
      }
      this.clientState.isBusy = false;
    }).catch((err: ApiError) => {
      this.clientState.isBusy = false;
    });
  }

  onGetProjectMember = () => {
    return new Promise((resolve, reject) => {
      this.projectMemberService.getProjectMemberById(this.idEditing).subscribe(res => {
        this.updationModel = res ? <ProjectMemberUpdatingModel>{ ...res } : null;
        resolve(this.updationModel);
      }, (err: ApiError) => {
        this.authErrorHandler.handleError(err.message);
        reject(err);
      });
    });
  }

  onGetUser = () => {
    return new Promise((resolve, reject) => {
      this.projectMemberService.getProjectMemberLookup().subscribe(res => {
        this.userManagementModels = res.items ? <CompanyLookUpModel[]>[...res.items] : [];
        this.userManagementModels.map(u => {
          if (u.photoUrl) {
            u.photoUrl = Configs.BaseSitePath + u.photoUrl;
          }
        });
        resolve(this.userManagementModels);
      }, (err: ApiError) => {
        this.authErrorHandler.handleError(err.message);
        reject(err);
      });
    });
  }

  onGetRoles = () => {
    return new Promise((resolve, reject) => {
      this.projectMemberService.getProjectRolesLookupByProject(this.projectKey).subscribe(res => {
        this.roleModels = res.content ? <AuthorizationLookupValueModel[]>[...res.content] : [];
        resolve(this.roleModels);
      }, (err: ApiError) => {
        this.authErrorHandler.handleError(err.message);
        reject(err);
      });
    });
  }

  onGetAuthorisation = () => {
    return new Promise((resolve, reject) => {
      this.projectMemberService.getAuthorizationLevelLookup().subscribe(res => {
        this.authorisationLevelModels = res.content ? <AuthorizationLookupValueModel[]>[...res.content] : [];
        resolve(this.authorisationLevelModels);
      }, (err: ApiError) => {
        this.authErrorHandler.handleError(err.message);
        reject(err);
      });
    });
  }

  onSaveData = (form: NgForm) => {
    if (!form || form.invalid) {
      return;
    }
    this.clientState.isBusy = true;
    let updationModel = <ProjectMemberUpdatingModel>{
      ...this.updationModel
    };
    // let projectId = this.activatedRoute.snapshot.params['projectKey'];
    updationModel.projectId = this.projectId;
    this.projectMemberService.updateProjectMember(updationModel).subscribe({
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

  onCancel = () => {
    this.onSuccess.emit(false);
  }
}
