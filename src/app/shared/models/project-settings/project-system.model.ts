export class ProjectSystemModel {
  elementSystemId: string;
  name: string;
  systemNo: string;
  logoUrl: string;
}


export class ProjectSystemCreationModel {
  projectId: string;
  description: string;
  systemNo: string;
  logo: File;
}

export class ProjectSystemUpdationModel {
  elementSystemId: string;
  projectId: string;
  systemName: string;
  systemNo: string;
  logo: File;
  logoUrl: string;
}


export class ProjectSystemDetailModel {
  elementSystemId: string;
  name: string;
  systemNo: string;
  logoUrl: string;
  projectId: string;
}
