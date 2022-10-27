import { Component, Input, Output, OnInit, EventEmitter } from "@angular/core";
import { AuthErrorHandler } from "src/app/shared/services/auth/auth.error-handler";
import { AnswerPopupSettingDataSend } from "./answer-popup.model";
import GrapesjsConfig from "../itr-builder-detail/grapesJs-editor-config/grapesJs-editor-config";

@Component({
  selector: "app-itr-builder-answer-popup-setting",
  templateUrl: "./answer-popup-setting.html",
  styleUrls: ["./answer-popup-setting.scss"],
})
export class ITRBuilderAnswerPopupSetting implements OnInit {
  @Input("listIdQuestionNotLink") listIdQuestionNotLink: string[];
  @Input("idAnswer") idAnswer: string;
  @Output("onSaveOrClose") onSaveOrClose = new EventEmitter();
  @Output("onClickUnlink") onClickUnlink = new EventEmitter();

  listAnswer = [];
  listAnswerType = [
    { value: GrapesjsConfig.AnswerType.radio.value },
    { value: GrapesjsConfig.AnswerType.checkbox.value },
    { value: GrapesjsConfig.AnswerType.text.value },
    { value: GrapesjsConfig.AnswerType.dropdown.value },
  ];
  hasHiddenLabel = false;
  hasDisabledDeleteButton = false;
  hasHiddenDeleteButton = false;
  iframeWindow = (document.querySelector(".gjs-frame") as HTMLFrameElement)
    .contentWindow.document;
  maxAnswers = 5;
  oldLinkedQuestionHtmlId: string;
  answerType: string = "";
  listQuestion: any[] = [];
  questionLinked: string = "";

  constructor(private notificationError: AuthErrorHandler) {}

  isDuplicateAnswerValue(val: string): boolean {
    if (!val) return false;
    let count = 0;
    this.listAnswer.map((answer) => {
      if (answer.value === val) count++;
    });
    if (count > 1) return true;
    else return false;
  }

  handleClickToggleHiddenLabel() {
    this.hasHiddenLabel = !this.hasHiddenLabel;
  }

  canSaveChanges(): boolean {
    if (!this.answerType && !this.questionLinked) return false;
    if (this.answerType && this.listAnswer.length < 1) return false;
    else {
      let result = true;
      let listStringAnswer = [];
      this.listAnswer.map((answer) => {
        listStringAnswer.push(answer.value);
        if (!answer.value) result = false;
      });
      if (result) {
        const answersLength = listStringAnswer.length;
        const newListStringAnswer = Array.from(new Set(listStringAnswer));
        if (answersLength != newListStringAnswer.length) return false;
        else return true;
      }
    }
  }

  handleChangeAnswerType() {
    if (
      document.getElementById("customSwitchToggleLabel") &&
      (document.getElementById("customSwitchToggleLabel") as HTMLInputElement)
        .checked
    )
      document.getElementById("customSwitchToggleLabel").click();
    if (this.answerType != "Input cell") this.listAnswer = [{ value: "" }];
    else this.listAnswer = [{ value: "Input your answer" }];
  }

  flexibleStyleInput(): string {
    if (this.answerType === GrapesjsConfig.AnswerType.text.value)
      return "width:100%";
    else return "";
  }

  flexibleLabelInput(): string {
    if (this.answerType != GrapesjsConfig.AnswerType.text.value) return "value";
    else return "placeholder";
  }

  classColFlexible(): string {
    if (this.oldLinkedQuestionHtmlId) return "col-10";
    else return "col-12";
  }

  styleRowFlexible(): string {
    if (this.oldLinkedQuestionHtmlId) return "padding-right: 14px;";
    else return "";
  }

  onSelectAnswerType(value: string) {
    this.answerType = value;
  }

  handleKeyDown() {
    this.hasDisabledDeleteButton = true;
  }

  handleKeyUp() {
    this.hasDisabledDeleteButton = false;
  }

  onClickDeleteAnswer(answerId: number) {
    if (!this.hasDisabledDeleteButton) this.listAnswer.splice(answerId, 1);
  }

  onClose() {
    this.onSaveOrClose.emit(null);
  }

  onClickAddAnswer() {
    if (this.listAnswer.length < this.maxAnswers)
      this.listAnswer.push({ value: "" });
    else
      this.notificationError.handleError(
        `Answer limit reached,maximum is ${this.maxAnswers}`
      );
  }

  onClickSaveChanges() {
    const data: AnswerPopupSettingDataSend = {
      oldLinkedQuestionHtmlId: this.oldLinkedQuestionHtmlId,
      newLinkedQuestionHtmlId: this.getQuestionHtmlId(),
      linkedAnswerHtmlId: this.idAnswer,
      answerType: this.answerType,
      answerHtmlString: this.createAnswerContentHtmlString(),
      hiddenLabel: String(this.hasHiddenLabel),
    };
    this.onSaveOrClose.emit(data);
  }

  answerInputPlaceholderFlexible(): string {
    if (this.answerType === GrapesjsConfig.AnswerType.text.value)
      return "Write your description";
    else return "Write your answer";
  }

  onClickUnlinkButton() {
    this.onClickUnlink.emit({
      questionId: this.oldLinkedQuestionHtmlId,
      answerId: this.idAnswer,
    });
    this.onClose();
    this.answerType = null;
    this.listAnswer = [];
    this.questionLinked = "";
  }

  hasShowToggleHiddeLabel(): boolean {
    if (
      this.answerType === GrapesjsConfig.AnswerType.radio.value ||
      this.answerType === GrapesjsConfig.AnswerType.checkbox.value
    )
      return true;
    return false;
  }

  createAnswerContentHtmlString(): string {
    let result = "";
    const styleFlexible =
      this.hasHiddenLabel && this.listAnswer.length < 2
        ? ""
        : `style="margin-right:10px;"`;
    switch (this.answerType) {
      case GrapesjsConfig.AnswerType.radio.value:
        {
          this.listAnswer.map((answer) => {
            result += ` <label ${styleFlexible} ${
              GrapesjsConfig.AnswerQuestionCustomDataAttribute.answer
                .CustomLabel
            }="${answer.value}">
            <input type="radio" style="margin-right:5px"  name="${
              this.idAnswer
            }" value="${answer.value}"/>${
              this.hasHiddenLabel ? "" : answer.value
            }
            </label>`;
          });
        }
        break;
      case GrapesjsConfig.AnswerType.checkbox.value:
        {
          this.listAnswer.map((answer) => {
            result += `<label ${styleFlexible} ${
              GrapesjsConfig.AnswerQuestionCustomDataAttribute.answer
                .CustomLabel
            }="${answer.value}">
            <input type="checkbox" ${styleFlexible} ${
              GrapesjsConfig.AnswerQuestionCustomDataAttribute.answer
                .CheckBoxAnswer
            }="${this.idAnswer}" 
            name="${this.idAnswer}" value="${answer.value}"/>${
              this.hasHiddenLabel ? "" : answer.value
            }
            </label>`;
          });
        }
        break;
      case GrapesjsConfig.AnswerType.text.value:
        {
          // result += `<span name="${this.idAnswer}" style="pointer-events:none;padding: 5px;" data-custom-type="span-contenteditable">${this.listAnswer[0].value}</span>`;
          result += `<input type="text" data-id="input-itr-editor" disabled class="form-control" name="${this.idAnswer}" placeholder="${this.listAnswer[0].value}" />`;
        }
        break;
      case GrapesjsConfig.AnswerType.dropdown.value:
        {
          result += `<select name=${this.idAnswer}" class="form-control">`;
          this.listAnswer.map((answer) => {
            result += `<option ${GrapesjsConfig.AnswerQuestionCustomDataAttribute.answer.CustomLabel}="${answer.value}" value="${answer.value}">${answer.value}</option>`;
          });
          result += "</select>";
        }
        break;
    }
    return result;
  }

  getValueFromAnswerHTML(htmlElement: HTMLElement) {
    let listChildren = Array.from(htmlElement.children);
    let listAnswerCollect = [];
    switch (this.answerType) {
      case GrapesjsConfig.AnswerType.radio.value:
      case GrapesjsConfig.AnswerType.checkbox.value:
        {
          listChildren.map((element) => {
            if (element.tagName === "LABEL")
              listAnswerCollect.push({
                value: element.getAttribute(
                  GrapesjsConfig.AnswerQuestionCustomDataAttribute.answer
                    .CustomLabel
                ),
              });
          });
        }
        break;
      case GrapesjsConfig.AnswerType.text.value:
        {
          listChildren.map((element) => {
            if (element.tagName === "INPUT")
              listAnswerCollect.push({
                value: element.getAttribute("placeholder"),
              });
          });
        }
        break;
      case GrapesjsConfig.AnswerType.dropdown.value:
        {
          listChildren.map((element) => {
            if (element.tagName === "SELECT")
              Array.from(element.children).map((optionElement) =>
                listAnswerCollect.push({
                  value: optionElement.getAttribute("value"),
                })
              );
          });
        }
        break;
    }
    this.listAnswer = listAnswerCollect;
  }

  getQuestionHtmlId(): string {
    let result = "";
    this.listQuestion.map((question) => {
      if (question.content === this.questionLinked) {
        result = question.id;
        return true;
      }
    });
    return result;
  }

  ngOnInit() {
    const answerElement = this.iframeWindow.getElementById(this.idAnswer);
    this.listIdQuestionNotLink.map((idHtmlElement) =>
      this.listQuestion.push({
        id: idHtmlElement,
        content: this.iframeWindow.getElementById(idHtmlElement).textContent,
      })
    );
    this.oldLinkedQuestionHtmlId = answerElement.getAttribute(
      GrapesjsConfig.AnswerQuestionCustomDataAttribute.answer.QuestionLinked
    );
    if (this.oldLinkedQuestionHtmlId) {
      this.questionLinked = this.iframeWindow.getElementById(
        this.oldLinkedQuestionHtmlId
      ).textContent;
      this.listQuestion.push({
        id: this.oldLinkedQuestionHtmlId,
        content: this.questionLinked,
      });
    }
    this.answerType = answerElement.getAttribute(
      GrapesjsConfig.AnswerQuestionCustomDataAttribute.answer.AnswerType
    );
    this.getValueFromAnswerHTML(answerElement);
    if (this.listAnswer.length === 0)
      this.listAnswer.push({
        value: "",
      });
  }
  ngAfterViewInit() {
    const answerElement = this.iframeWindow.getElementById(this.idAnswer);

    // handle hidden label
    if (
      answerElement.getAttribute(
        GrapesjsConfig.AnswerQuestionCustomDataAttribute.answer.HiddenLabel
      ) === "true"
    )
      document.getElementById("customSwitchToggleLabel").click();
  }
}
