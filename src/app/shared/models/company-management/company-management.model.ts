export class CompanyManagementModel {
  companyId: string;
  companyName: string;
  logoUrl: string;
  colorBranding: string;
}

export class CompanyCreationModel {
  name: string;
  colorBranding: string;
  logo: File;
}

export class CompanyUpdationModel {
  companyId: string;
  companyName: string;
  name?: string;
  colorBranding: string;
  logo: File;
  logoUrl?: string;
  fullPathLogoUrl?: string;
}

export class CompanyColorModel {
  companyId: string;
  colorHeader: string;
  colorMainBackground: string;
  colorSideBar: string;
  colorTextColour1: string;
  colorTextColour2: string;
}