export class ItrTemplateModel {
  id: string;
  name: string;
  dataHtml: string;
  dataCss: string;
  type: string;
}
export class ItrTemplateUpdationModel {
  id: string;
  name: string;
  dataHtml: string;
  dataCss: string;
  type: string;
  signatures?: any;
  questions?: any;
  isPublished?: boolean;
}
export class ItrTemplateCreationModel {
  name: string;
  dataHtml: string;
  dataCss: string;
  type: string;
  projectKey: string;
}
