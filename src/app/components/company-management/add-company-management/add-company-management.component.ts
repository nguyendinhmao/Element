import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { CompanyCreationModel, CompanyColorModel } from 'src/app/shared/models/company-management/company-management.model';
import { CompanyService } from 'src/app/shared/services/api/companies/company.service';
import { NgForm } from '@angular/forms';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { Configs } from 'src/app/shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';

@Component({
  selector: 'add-company-management',
  styleUrls: ['./add-company-management.component.scss'],
  templateUrl: './add-company-management.component.html'
})

export class AddCompanyManagementComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();

  companyCreationModel: CompanyCreationModel = new CompanyCreationModel();
  companyColorModel: CompanyColorModel = new CompanyColorModel();

  isLogoExist: boolean;
  newLogoImage: string;

  colorHeader: string;
  colorMainBackground: string;
  colorSideBar: string;
  colorTextColour1: string;
  colorTextColour2: string;

  constructor(
    private clientState: ClientState,
    private companyService: CompanyService,
    private authErrorHandler: AuthErrorHandler
  ) { }

  public ngOnInit() {
    this.onGetColorBrandingDefault();
  }

  onGetColorBrandingDefault = () => {
    this.companyColorModel.colorHeader = Configs.ColorHeaderDefault;
    this.companyColorModel.colorMainBackground = Configs.ColorMainBackgroundDefault;
    this.companyColorModel.colorSideBar = Configs.ColorSideBarDefault;
    this.companyColorModel.colorTextColour1 = Configs.ColorTextColour1Default;
    this.companyColorModel.colorTextColour2 = Configs.ColorTextColour2Default;
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
      this.companyCreationModel.logo = file;
      this.isLogoExist = true;
    }
  }

  onCancelLogo = () => {
    this.companyCreationModel.logo = null;
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
    this.companyCreationModel.colorBranding = colorBrandingAll;

    let creationModel = <CompanyCreationModel>{
      ...this.companyCreationModel
    };

    this.companyService.createCompany(creationModel).subscribe({
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
