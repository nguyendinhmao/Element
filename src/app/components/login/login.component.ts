import { Component, OnInit, AfterViewInit } from "@angular/core";
import { FormControl, Validators, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { UserModel, UserLoginModel } from "src/app/shared/models/user/user.model";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { StorageService } from "src/app/shared/services/core/storage.service";
import { ClientState } from "src/app/shared/services/client/client-state";
import { StorageKey } from "src/app/shared/models/storage-key/storage-key";
import { JwtTokenHelper } from "src/app/shared/common/jwt-token-helper/jwt-token-helper";
import { LoginService, AuthErrorHandler, IdbService } from "src/app/shared/services";
import { ModuleService } from "src/app/shared/services/api/module/module.service";
import { ModuleByUserModel, ModuleProjectDefaultModel, } from "src/app/shared/models/module/module.model";
import { ProjectUpdatingModel } from "src/app/shared/models/project-management/project-management.model";
import { CompanyService } from "src/app/shared/services/api/companies/company.service";
import { CompanyManagementModel, CompanyColorModel } from "src/app/shared/models/company-management/company-management.model";
import { Idle } from "@ng-idle/core";
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { PunchPageService } from 'src/app/shared/services/api/punch-page/punch-page.service';
import { StoreNames } from 'src/app/shared/models/common/common.model';

@Component({
  selector: "login",
  styleUrls: ["./login.component.scss"],
  templateUrl: "./login.component.html",
})

export class LoginComponent implements OnInit, AfterViewInit {
  userInfo: UserModel = new UserModel();
  moduleByUserModels: ModuleByUserModel[] = [];
  moduleProjectDefaultModel: ModuleProjectDefaultModel = new ModuleProjectDefaultModel();
  projectManagementModel: ProjectUpdatingModel = new ProjectUpdatingModel();
  companyManagementModel: CompanyManagementModel = new CompanyManagementModel();
  companyColorModel: CompanyColorModel = new CompanyColorModel();

  idleState = "Not started.";
  timedOut = false;
  lastPing?: Date = null;

  projectKey: string;
  public loginForm: FormGroup;

  constructor(
    private router: Router,
    private storageService: StorageService,
    public clientState: ClientState,
    private loginService: LoginService,
    private authErrorHandler: AuthErrorHandler,
    private moduleService: ModuleService,
    private companyService: CompanyService,
    private idle: Idle,
    private idbService: IdbService,
    private punchPageService: PunchPageService,
  ) {
    this.idbService.connectToIDB();
  }

  get isTablet() {
    return InfoDevice.isTablet;
  }

  public ngOnInit() {
    this.createFormGroup();
    //---Check authenticated
    this.userInfo = JwtTokenHelper.GetUserInfo();
    if (this.userInfo) {
      this.router.navigate([""]);
    }
  }

  public ngAfterViewInit() {
    let count = 0;
    const idInterval = setInterval(() => {
      count++;
      const userNameInput = document.getElementById("userNameInputId") as HTMLInputElement;
      const passwordInput = document.getElementById("passwordInputId") as HTMLInputElement;
      if (userNameInput && userNameInput.value) {
        setTimeout(() => {
          userNameInput.value = userNameInput.value;
          passwordInput.value = passwordInput.value;
        }, 150);
        clearInterval(idInterval);
      }
      if (count > 20) {
        clearInterval(idInterval)
      };
    }, 250);
  }

  //--- Create form group
  createFormGroup = () => {
    this.loginForm = new FormGroup({
      email: new FormControl("", [Validators.required]),
      password: new FormControl("", [Validators.required]),
    });
  };

  public hasError = (controlName: string, errorName: string) => {
    return this.loginForm.controls[controlName].hasError(errorName);
  };
  //--- End Create form group

  //--- Login
  onLogin = (loginFormValue) => {
    if (!this.loginForm.valid) {
      return;
    }

    this.clientState.isBusy = true;

    let userLoginData = <UserLoginModel>{
      username: loginFormValue.email,
      password: loginFormValue.password,
    };

    this.storageService.onRemoveTokens([StorageKey.UserInfo, StorageKey.Token]);

    this.loginService.login(userLoginData).subscribe((res) => {
      this.storageService.onSetToken(StorageKey.Token, res.access_token);
      this.storageService.onSetToken(StorageKey.UserInfo, JwtTokenHelper.CreateSigningToken(res));

      //--- Swipe out Indexed Data
      this.idbService.clearDataInAllStores();

      //--- Get module by user
      this.onGetModuleByUserId();
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.error_description);
    });
  };

  //--- Get module by user
  onGetModuleByUserId = () => {
    this.userInfo = JwtTokenHelper.GetUserInfo();

    if (this.userInfo) {
      this.moduleService.getListModuleByUserId(this.userInfo.userId).subscribe((res) => {
        this.moduleByUserModels = res.items ? <ModuleByUserModel[]>[...res.items] : [];

        if (this.moduleByUserModels.length == 0 && this.userInfo.userType !== "Admin") {
          this.storageService.onRemoveTokens([StorageKey.UserInfo, StorageKey.Token]);
          this.router.navigate(["not-project-allocated"]);
          this.clientState.isBusy = false;
        } else {
          this.moduleByUserModels.map((m) => {
            if (m.moduleDefault === true) {
              this.moduleProjectDefaultModel.moduleId = m.moduleId;
              this.moduleProjectDefaultModel.moduleName = m.moduleName;
              this.moduleProjectDefaultModel.moduleKey = m.moduleKey;
              this.moduleProjectDefaultModel.defaultProjectId = m.defaultProjectId;
              this.moduleProjectDefaultModel.projectName = m.projectName;
              this.moduleProjectDefaultModel.projectKey = m.projectKey;
              this.moduleProjectDefaultModel.logoProject = m.logoProject;
              this.moduleProjectDefaultModel.companyId = m.companyId;
              this.storageService.onSetToken(StorageKey.ModuleProjectDefault, JSON.stringify(this.moduleProjectDefaultModel));

              if (!this.moduleProjectDefaultModel.projectKey && this.userInfo.userType === "Admin") {
                this.router.navigate(["modules", this.moduleProjectDefaultModel.moduleKey, "project-management"]);
                this.clientState.isBusy = false;
              } else {
                this.onGetCompanyById(this.moduleProjectDefaultModel.companyId);
              }
            }
          });

          if (this.isTablet) {
            this.downloadPunchLookup();
          }
        }
      }, (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      });
    }
  };

  //--- Get company
  onGetCompanyById = (companyId: string) => {
    this.companyService.getCompanyById(companyId).subscribe((res) => {
      this.companyManagementModel = res ? <CompanyManagementModel>{ ...res } : null;

      if (this.companyManagementModel.colorBranding) {
        let colorBrandingArr = this.companyManagementModel.colorBranding.toString().split(";");
        this.companyColorModel.colorHeader = colorBrandingArr[0];
        this.companyColorModel.colorMainBackground = colorBrandingArr[1];
        this.companyColorModel.colorSideBar = colorBrandingArr[2];
        this.companyColorModel.colorTextColour1 = colorBrandingArr[3];
        this.companyColorModel.colorTextColour2 = colorBrandingArr[4];
      }

      this.storageService.onSetToken(StorageKey.ColourBranding, JSON.stringify(this.companyColorModel));

      this.idle.watch();
      this.router.navigate([""]);
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  };

  downloadPunchLookup = () => {
    const _moduleProjectD = JwtTokenHelper.GetModuleProjectDefault();
    this.onGetPunchLookup(_moduleProjectD.projectKey);
  }

  onGetPunchLookup = (projectKey: string) => {
    this.punchPageService.downloadPunchLookup(projectKey).subscribe(
      (res) => {
        this.assignLookup2Storage(res);
        this.assignPunchSignTemplate2Storage(res["punchSignatureTemplate"]);
        this.clientState.isBusy = false;
      },
      (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      }
    );
  }

  assignLookup2Storage = (lookupData) => {
    const _sn = StoreNames.lookups;
    this.idbService.addLookups(_sn, lookupData);
  }

  assignPunchSignTemplate2Storage = (punchSignTemplate) => {
    const _sn = StoreNames.punchSignatureTemplate;
    this.idbService.addItem(_sn, 'templates', punchSignTemplate);
  }
}

