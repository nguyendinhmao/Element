export interface AnswerPopupSettingDataSend {
  oldLinkedQuestionHtmlId?: string;
  newLinkedQuestionHtmlId?: string;
  linkedAnswerHtmlId?: string;
  answerType?: string;
  answerHtmlString?: string;
  hiddenLabel?: string;
}

export interface AnswerPopupSettingDataSendUnlink {
  questionId: string;
  answerId: string;
}
