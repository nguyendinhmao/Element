import { OnInit, Component } from "@angular/core";
import { UserModel } from "src/app/shared/models/user/user.model";
import { ClientState } from "src/app/shared/services/client/client-state";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { Subscription } from "rxjs/internal/Subscription";
import { ActivatedRoute, Router } from "@angular/router";
import { ProjectSettingsModel } from "src/app/shared/models/project-settings/project-settings.model";
import { ProjectUpdatingModel } from "src/app/shared/models/project-management/project-management.model";
import { ProjectService } from "src/app/shared/services/api/projects/project.service";
import { NgForm } from "@angular/forms";
import { Configs } from "../../shared/common/configs/configs";
import { CompanyUpdationModel, CompanyColorModel } from "src/app/shared/models/company-management/company-management.model";
import { AuthErrorHandler } from "src/app/shared/services/auth/auth.error-handler";
import * as $ from "jquery";
import { JwtTokenHelper } from 'src/app/shared/common';

@Component({
  selector: "project-settings",
  styleUrls: ["./project-settings.component.scss"],
  templateUrl: "./project-settings.component.html",
})

export class ProjectSettingsComponent implements OnInit {
  //--- Boolean
  isClientLogoExist: boolean;
  isProjectLogoExist: boolean = false;
  isResetLogo: boolean;
  hasShowPunchSetup: boolean = false;
  isAddedMember: boolean = false;

  //--- Model
  userInfo: UserModel;
  projectSettingsModel: ProjectSettingsModel = new ProjectSettingsModel();
  projectManagementModel: ProjectUpdatingModel = new ProjectUpdatingModel();
  companyUpdationModel: CompanyUpdationModel = new CompanyUpdationModel();
  companyColorModel: CompanyColorModel = new CompanyColorModel();

  //--- Variables
  clientLogoUrl: string;
  pageUrl: string;
  projectLogoUrl: string;
  projectLogoFile: File;
  sub: Subscription;
  projectId: string;
  projectKey: string;
  moduleKey: string;
  isAdmin: boolean = false;

  constructor(
    public clientState: ClientState,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private authErrorHandler: AuthErrorHandler
  ) {
    this.sub = this.route.params.subscribe((params) => {
      this.projectKey = params["projectKey"];
      this.moduleKey = params["moduleKey"];
      if (!this.projectKey || !this.moduleKey) {
        this.router.navigate([""]);
      } else {
        this.onGetProjectByKey();
      }
    });
    this.pageUrl = window.location.pathname;
  }

  ngOnInit(): void {
    //--- Hide left menu
   // $("#top-header .project-name").hide();
    //$("#matSideNavMenu").hide();
    //$(".toggle-nav").hide();

    //--- Get userInfo
    this.userInfo = JwtTokenHelper.GetUserInfo();
    if(this.userInfo){
      this.isAdmin = this.userInfo.userType === "Admin";
    }
  }

  //--- Get project by key
  onGetProjectByKey = () => {
    this.clientState.isBusy = true;

    this.projectService.getProjectByKey(this.projectKey).subscribe((res) => {
      this.projectManagementModel = res ? <ProjectUpdatingModel>{ ...res } : null;

      if (this.projectManagementModel) {
        this.projectSettingsModel.projectName = this.projectManagementModel.projectName;
        this.projectSettingsModel.projectKey = this.projectManagementModel.projectKey;
        this.projectSettingsModel.isProjectExist = true;
        this.projectLogoUrl = this.projectManagementModel.projectLogoUrl ? this.projectManagementModel.projectLogoUrl : Configs.DefaultClientLogo;
        this.projectSettingsModel.projectLogoUrl = this.projectLogoUrl;
        this.projectSettingsModel.companyId = this.projectManagementModel.companyId;
        this.projectId = this.projectManagementModel.id;
      }

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  };

  //--- Upload Project Logo
  onUploadProjectLogo = (event) => {
    let file: File = event.target.files && <File>event.target.files[0];

    if (file) {
      this.projectLogoFile = file;
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        this.projectLogoUrl = event.target.result;
      };

      this.isProjectLogoExist = true;
    }
  };

  onCancelProjectLogo = () => {
    this.projectLogoUrl = Configs.DefaultClientLogo;
    this.projectLogoFile = null;
    this.projectManagementModel.projectLogoUrl = null;
    this.isProjectLogoExist = false;
    this.isResetLogo = true;
  };

  onSaveProjectLogo = (form: NgForm) => {
    let isReset = !this.projectLogoFile && !this.projectManagementModel.projectLogoUrl;
    if (this.projectLogoFile || this.isResetLogo) {
      this.clientState.isBusy = true;
      this.projectService.updateProjectLogo(this.projectId, this.projectLogoFile, isReset).subscribe((res) => {
        this.projectLogoUrl = isReset ? Configs.DefaultClientLogo : res;
        this.projectManagementModel.projectLogoUrl = res;
        this.projectSettingsModel.projectLogoUrl = this.projectLogoUrl;

        this.clientState.isBusy = false;
        this.authErrorHandler.handleSuccess("Logo is updated succesfully!");
      });
    }
    else {
      this.authErrorHandler.handleError("No image to upload");
    }
  };
  //--- End Upload Project Logo

  checkAddedMember = (event) => {
    this.isAddedMember = event;
  }
}
