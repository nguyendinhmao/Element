import { ItrQuestion } from "../itr-builder/itr-builder.model";
import { ItrSignature } from "../itr-builder/itr-builder.model";
export class ItrTemplateModel {
  id: string;
  name: string;
  headerHtml: string;
  bodyHtml: string;
  footerHtml: string;
  headerCss: string;
  bodyCss: string;
  footerCss: string;
}
export class ItrTemplateUpdationModel {
  id: string;
  name: string;
  headerHtml: string;
  bodyHtml: string;
  footerHtml: string;
  headerCss: string;
  bodyCss: string;
  footerCss: string;
  questions: ItrQuestion[] = [];
  signatures: ItrSignature[] = [];
}
export class ItrTemplateCreationModel {
  name: string;
  headerHtml: string;
  bodyHtml: string;
  footerHtml: string;
  headerCss: string;
  bodyCss: string;
  footerCss: string;
}
