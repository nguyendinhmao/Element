import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ProjectMemberCreationModel } from 'src/app/shared/models/project-settings/project-user.model';
import { ProjectMemberService } from 'src/app/shared/services/api/project-settings/project-member.service';
import { CompanyLookUpModel } from 'src/app/shared/models/common/common.model'
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Configs } from 'src/app/shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { Subscription } from 'rxjs';

@Component({
  selector: 'add-project-user',
  templateUrl: './add-project-user.component.html'
})

export class AddProjectUserComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() projectId: string;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

  creationModel: ProjectMemberCreationModel;
  userManagementModels: CompanyLookUpModel[] = [];
  roleModels: CompanyLookUpModel[] = [];
  authorisationLevelModels: CompanyLookUpModel[] = [];
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
    this.creationModel = new ProjectMemberCreationModel();
    //--- Get user
    this.onGetUser();
    //--- Get roles
    this.onGetRoles();
    this.onGetAuthorisation();
  }

  //--- Get user
  onGetUser = () => {
    this.clientState.isBusy = true;
    this.projectMemberService.getProjectMemberLookup().subscribe(res => {
      this.userManagementModels = res.items ? <CompanyLookUpModel[]>[...res.items] : [];

      this.userManagementModels.map(u => {
        if (u.photoUrl) {
          u.photoUrl = Configs.BaseSitePath + u.photoUrl;
        }
      });

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Get roles
  onGetRoles = () => {
    this.clientState.isBusy = true;
    this.projectMemberService.getProjectRolesLookupByProject(this.projectKey).subscribe(res => {
      this.roleModels = res.content ? <CompanyLookUpModel[]>[...res.content] : [];
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }
  onGetAuthorisation = () => {
    this.clientState.isBusy = true;
    this.projectMemberService.getAuthorizationLevelLookup().subscribe(res => {
      this.authorisationLevelModels = res.content ? <CompanyLookUpModel[]>[...res.content] : [];
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

    let creationModel = <ProjectMemberCreationModel>{
      ...this.creationModel
    };

    creationModel.projectId = this.projectId;

    this.projectMemberService.createProjectMember(creationModel).subscribe({
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

  //--- Cancel
  onCancel = () => {
    this.onSuccess.emit(false);
  }
}
