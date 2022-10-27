import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { CompanyUpdationModel, CompanyColorModel } from 'src/app/shared/models/company-management/company-management.model';
import { CompanyService } from 'src/app/shared/services/api/companies/company.service';
import { NgForm } from '@angular/forms';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { StorageKey } from 'src/app/shared/models/storage-key/storage-key';
import { StorageService, ReloadLayoutService } from 'src/app/shared/services';
import { ModuleProjectDefaultModel } from 'src/app/shared/models/module/module.model';
import { JwtTokenHelper } from 'src/app/shared/common/jwt-token-helper/jwt-token-helper';

@Component({
  selector: 'edit-company-management',
  styleUrls: ['./edit-company-management.component.scss'],
  templateUrl: './edit-company-management.component.html'
})

export class EditCompanyManagementComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() companyUpdationModel: CompanyUpdationModel;
  @Input() companyColorModel: CompanyColorModel;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

  colorList: CompanyColorModel[] = [];
  moduleProjectDefaultModel: ModuleProjectDefaultModel = new ModuleProjectDefaultModel();

  isLogoExist: boolean;
  newLogoImage: string;
  companyLogoUrl: string;

  constructor(
    private clientState: ClientState,
    private companyService: CompanyService,
    private authErrorHandler: AuthErrorHandler,
    private storageService: StorageService,
    private reloadLayoutService: ReloadLayoutService,
  ) { }

  public ngOnInit() {
  }
  
  //--- Select logo
  onSelectLogo = (event) => {
    let file: File = event.target.files && <File>event.target.files[0];

    if (file) {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        this.newLogoImage = event.target.result;
      }
      this.companyUpdationModel.logo = file;
      this.isLogoExist = true;
    }
  }

  onCancelLogo = () => {
    this.companyUpdationModel.logo = null;
    this.companyUpdationModel.logoUrl = null;
    this.isLogoExist = false;
  }

  //--- Change color branding
  onChangeColorBranding = (colorCode: string, colorText: string) => {
    if (colorText == 'colorHeader') {
      this.companyColorModel.colorHeader = colorCode;
    } else if (colorText == 'colorMainBackground') {
      this.companyColorModel.colorMainBackground = colorCode;
    } else if (colorText == 'colorSideBar') {
      this.companyColorModel.colorSideBar = colorCode;
    } else if (colorText == 'colorTextColour1') {
      this.companyColorModel.colorTextColour1 = colorCode;
    } else if (colorText == 'colorTextColour2') {
      this.companyColorModel.colorTextColour2 = colorCode;
    }
  }

  //--- Save data
  onSaveData = (form: NgForm) => {
    if (!form || form.invalid) {
      return;
    }
    this.clientState.isBusy = true;

    //--- Color branding all
    let colorBrandingAll = this.companyColorModel.colorHeader + ';' + this.companyColorModel.colorMainBackground + ';' + this.companyColorModel.colorSideBar + ';' + this.companyColorModel.colorTextColour1 + ';' + this.companyColorModel.colorTextColour2;
    this.companyUpdationModel.colorBranding = colorBrandingAll;

    let updationModel = <CompanyUpdationModel>{
      ...this.companyUpdationModel
    };

    updationModel.name = updationModel.companyName;

    this.companyService.updateCompany(updationModel).subscribe({
      complete: () => {
        //--- Set color branding
        this.moduleProjectDefaultModel = JwtTokenHelper.GetModuleProjectDefault();
        if (this.moduleProjectDefaultModel.companyId === updationModel.companyId) {
          this.storageService.onSetToken(StorageKey.ColourBranding, JSON.stringify(this.companyColorModel))
          this.reloadLayoutService.reloadLayout('reloadColorBranding');
        }

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
