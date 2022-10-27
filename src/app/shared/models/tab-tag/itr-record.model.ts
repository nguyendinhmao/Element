export interface SignatureReturnedModel {
  id: any;
  label: string;
  number: number;
  signDate: string;
  signatureId: string;
  userCompany: string;
  userName: string;
  isTurn?: boolean;
  authorizationLevel?: number;
}
export interface RecordSignValidateCommand {
  recordId: string;
}

export interface UpdateItrRecordModel {
  recordId: string;
  isSubmit: boolean;
  questions: QuestionsModel[];
  pinCode?: string;
  projectKey?: string;
  isDifferentUser?: boolean;
  userName?: string;
  password?: string;
}

export interface QuestionsModel {
  questionId: string;
  answer: string;
}

// respone from getItrRecord
export interface ItrRecordDetail {
  fieldData: any; // field from database
  form: RecordFormModel;
  questions: RecordQuestionsModel[];
  signatures: RecordSignaturesModel[];
  canAction: boolean;
  status: string;
  rejectReason?: string;
  recordId?: string;
  isEdited?: boolean;
  referenceName?: string;
}

export interface RecordSignaturesModel {
  id: any;
  label: string;
  number: number;
  signDate: string;
  signatureId: string;
  userCompany: string;
  userName: string;
  isTurn?: boolean;
  authorizationLevel?: number;
}

export interface RecordQuestionsModel {
  question: { customId: string; value: string };
  id: string;
  currentAnswer: string;
  answer: {
    customId: string;
    type: string;
    values: string[];
  }[];
}

export interface RecordFormModel {
  headerHtml: string;
  headerCss: string;
  bodyHtml: string;
  bodyCss: string;
  footerHtml: string;
  footerCss: string;
}

export interface ApprovedRecordCommand {
  recordId: string;
  projectKey: string;
  pinCode?: string;
  isDifferentUser?: boolean;
  userName?: string;
  password?: string;
}