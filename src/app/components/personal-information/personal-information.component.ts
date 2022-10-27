import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/shared/services/core/storage.service';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { JwtTokenHelper } from 'src/app/shared/common/jwt-token-helper/jwt-token-helper';
import { UserProfileModel, UserProfileUpdationModel, UserModel } from 'src/app/shared/models/user/user.model';
import { FormGroup } from '@angular/forms';
import { UserService } from 'src/app/shared/services/api/user/user.service';
import { NgForm } from '@angular/forms';
import { Configs } from 'src/app/shared/common/configs/configs';
import { StorageKey } from 'src/app/shared/models/storage-key/storage-key';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { ModuleService } from 'src/app/shared/services/api/module/module.service';
import { CompanyLookUpModel } from 'src/app/shared/models/common/common.model';
import { ProjectService } from 'src/app/shared/services/api/projects/project.service';
import { ProjectByUserAndModuleModel } from 'src/app/shared/models/project-management/project-management.model';
import { ReloadLayoutService } from 'src/app/shared/services/core/reload-layout.service';
import { Router } from '@angular/router';
import { ModuleProjectDefaultModel } from 'src/app/shared/models/module/module.model';
import { Constants } from 'src/app/shared/common';

@Component({
  selector: 'personal-information',
  styleUrls: ['./personal-information.component.scss'],
  templateUrl: './personal-information.component.html'
})

export class PersonalInformationComponent implements OnInit {
  isToggleRightSide: boolean = true;

  isPersonalLogoExist: boolean;
  personalLogoUrl: string;
  newLogoImage: string;
  moduleIdValue: number;

  userProfileModel: UserProfileModel = new UserProfileModel();
  userProfileUpdationModel: UserProfileUpdationModel = new UserProfileUpdationModel();
  personalInfoForm: FormGroup;
  moduleModels: CompanyLookUpModel[] = [];
  projectByUserAndModuleModels: ProjectByUserAndModuleModel[] = [];
  userInfo: UserModel = new UserModel();
  moduleProjectDefaultModel: ModuleProjectDefaultModel = new ModuleProjectDefaultModel();

  constructor(
    private storageService: StorageService,
    public clientState: ClientState,
    private userService: UserService,
    private reloadLayoutService: ReloadLayoutService,
    private authErrorHandler: AuthErrorHandler,
    private moduleService: ModuleService,
    private projectService: ProjectService,
    private router: Router,
  ) { }

  public ngOnInit() {
    this.userInfo = JwtTokenHelper.GetUserInfo();
    if (this.userInfo) {
      this.onGetUserProfile(true);
      this.onGetModuleList();
    }
  }

  //--- Toggle right side
  onToggleRightSide = () => {
    this.isToggleRightSide = !this.isToggleRightSide;
  }

  //--- Get user profile
  public onGetUserProfile = (isReload: boolean) => {
    this.clientState.isBusy = true;

    this.userService.getUserProfile(this.userInfo.userId + "").subscribe(res => {
      this.userProfileModel = res ? <UserProfileModel>{ ...res } : null;
      this.personalLogoUrl = this.userProfileModel.photoUrl ? Configs.BaseSitePath + this.userProfileModel.photoUrl : Configs.DefaultAvatar;
      this.userProfileUpdationModel.userId = this.userProfileModel.userId;
      this.userProfileUpdationModel.userName = this.userProfileModel.userName;
      this.userProfileUpdationModel.firstName = this.userProfileModel.firstName;
      this.userProfileUpdationModel.surname = this.userProfileModel.surname;
      this.userProfileUpdationModel.email = this.userProfileModel.email;
      this.userProfileUpdationModel.address = this.userProfileModel.address;
      this.userProfileUpdationModel.photoUrl = this.userProfileModel.photoUrl;
      this.userProfileUpdationModel.defaultProjectId = this.userProfileModel.defaultProjectId;
      this.userProfileUpdationModel.personId = this.userProfileModel.personId;
      if (isReload && this.userProfileModel.moduleId !== null) {
        this.moduleProjectDefaultModel = JwtTokenHelper.GetModuleProjectDefault();
        if (this.moduleProjectDefaultModel) {
          this.onGetProjectByUserAndModule(this.moduleProjectDefaultModel.moduleId);
        }
      }

      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Get module list
  onGetModuleList = () => {
    this.clientState.isBusy = true;
    this.moduleService.getListModule().subscribe(res => {
      this.moduleModels = res.items ? <CompanyLookUpModel[]>[...res.items] : [];
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Get project by user and module
  onGetProjectByUserAndModule = (moduleId: number) => {
    if (moduleId) {
      this.clientState.isBusy = true;

      this.projectService.getListProjectByUserAndModule(this.userInfo.userId, moduleId).subscribe(res => {
        this.projectByUserAndModuleModels = res.content ? <ProjectByUserAndModuleModel[]>[...res.content] : [];

        if (this.projectByUserAndModuleModels.length == 0) {
          this.userProfileUpdationModel.defaultProjectId = null;
        }

        this.clientState.isBusy = false;
      }, (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      });
    } else {
      this.projectByUserAndModuleModels = [];
      this.userProfileUpdationModel.defaultProjectId = null;
    }
  }

  //--- Update personal information
  onUpdateProfile = (form: NgForm) => {
    if (form.invalid) {
      return;
    }

    this.clientState.isBusy = true;

    this.userService.updateUserProfile(this.userProfileUpdationModel).subscribe((newAvatarPath) => {
      if (newAvatarPath) {
        this.userProfileUpdationModel.photoUrl = newAvatarPath;
        this.personalLogoUrl = Configs.BaseSitePath + newAvatarPath;

        this.userInfo.photoUrl = newAvatarPath;
      } else {
        this.personalLogoUrl = this.userInfo.photoUrl !== "" ? Configs.BaseSitePath + this.userInfo.photoUrl : Configs.DefaultAvatar
      }

      //--- Update user info
      this.userInfo.firstName = this.userProfileUpdationModel.firstName;
      this.userInfo.surName = this.userProfileUpdationModel.surname;
      this.storageService.onSetToken(StorageKey.UserInfo, JwtTokenHelper.CreateSigningToken(this.userInfo));

      this.reloadLayoutService.reloadLayout('reloadPersonalInformation');
      this.reloadLayoutService.reloadLayout('reloadProjectDefault');
      this.onGetUserProfile(false);

      this.clientState.isBusy = false;
      this.authErrorHandler.handleSuccess(Constants.ProfileUpdated);
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  //--- Upload Client Logo
  onSelectPersonalLogo = (event) => {
    let file: File = event.target.files && <File>event.target.files[0];

    if (file) {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        this.newLogoImage = event.target.result;
      }
      this.userProfileUpdationModel.photoUpload = file;
      this.isPersonalLogoExist = true;
    }
  }

  onCancelPersonalLogo = () => {
    this.userProfileUpdationModel.photoUrl = null;
    this.userProfileUpdationModel.photoUpload = null;
    this.newLogoImage = null;
    this.isPersonalLogoExist = false;
    this.onGetUserProfile(false);
  }
  //--- End Upload Client Logo

  onCancel = () => {
    this.router.navigate(['']);
  }
}
