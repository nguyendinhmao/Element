import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ProjectRoleCreationModel } from 'src/app/shared/models/project-settings/project-user.model';
import { ProjectRoleService } from 'src/app/shared/services/api/project-settings/project-role.service';
import { CompanyLookUpModel, LookUpModel } from 'src/app/shared/models/common/common.model'
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';

@Component({
  selector: 'add-project-role',
  templateUrl: './add-project-role.component.html'
})

export class AddProjectRoleComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() projectId: string;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

  creationModel: ProjectRoleCreationModel;
  roleModels: LookUpModel[] = [];

  constructor(
    public clientState: ClientState,
    public projectRoleService: ProjectRoleService,
    public activatedRoute: ActivatedRoute,
    private authErrorHandler: AuthErrorHandler
  ) { }

  public ngOnInit() {
    this.creationModel = new ProjectRoleCreationModel();
    //--- Get roles
    this.onGetRoles();
  }

  //--- Get roles
  onGetRoles = () => {
    this.clientState.isBusy = true;
    this.projectRoleService.getProjectRolesLookup().subscribe(res => {
      this.roleModels = res.content ? <LookUpModel[]>[...res.content] : [];
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

    let creationModel = <ProjectRoleCreationModel>{
      ...this.creationModel
    };

    creationModel.projectId = this.projectId;

    this.projectRoleService.createProjectRole(creationModel).subscribe({
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
