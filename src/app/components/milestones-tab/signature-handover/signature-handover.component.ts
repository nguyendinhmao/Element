import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HandoverDetail, RecordQuestionsHandoverModel, SignatureHandoverReturnedModel } from 'src/app/shared/models/milestones-tab/handover.model';
import { AuthErrorHandler, ClientState, IdbService } from 'src/app/shared/services';
import {
  removeSubContent,
  reNameClassRowToRowFix,
  removeOuterMostRowDuplicateBorderV2,
} from "../../itr-tab/itr-builder/itr-builder-detail/grapesJs-editor-config/handling-code-function";
import * as HTML_TAG_CUSTOM_BLOCK from "../../itr-tab/itr-builder/itr-builder-detail/grapesJs-editor-config/grapesjs-component-tagName";
import * as HTML_DATA_CUSTOM_NAME from "../../itr-tab/itr-builder/itr-builder-detail/grapesJs-editor-config/html-data-custom";
import { AnswerTypeFromBE } from "../../itr-tab/itr-builder/itr-builder-detail/grapesJs-editor-config/const-collect";
import { MockHandoverDetailApi } from 'src/app/shared/mocks/mock.milestones-tab';
import { Constants, JwtTokenHelper } from 'src/app/shared/common';
import { TagTabService } from 'src/app/shared/services/api/tag-tab/tag-tab.service';
import { ApprovedRecordCommand, UpdateItrRecordModel } from 'src/app/shared/models/tab-tag/itr-record.model';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { StoreNames } from 'src/app/shared/models/common/common.model';
import { BCryptHelper } from 'src/app/shared/common/bcrypt/bcrypt';
import { KeyLookups } from 'src/app/shared/models/punch-item/punch-item.model';
import { TagItrStatus } from 'src/app/shared/models/tab-tag/tab-tag.model';
import { HandoverStatus, HandoverStatusEnum, MilestonesTabModel } from 'src/app/shared/models/milestones-tab/milestones-tab.model';
declare var $: any;

export const StatusList = {
  INPROGRESS: {
    label: "Inprogress",
    id: 1,
    color: "badge-warning",
    displayLabel: "Inprogress",
  },
  COMPLETED: {
    label: "Completed",
    id: 2,
    color: "badge-success",
    displayLabel: "Completed",
  },
  REJECTED: {
    label: "Rejected",
    id: 3,
    color: "badge-danger",
    displayLabel: "Rejected",
  },
  DELETED: {
    label: "Deleted",
    id: 4,
    color: "badge-secondary",
    displayLabel: "Deleted",
  },
  NOTSTARTED: {
    // stage , user can make report
    label: "NotStarted",
    id: 5,
    color: "badge-primary",
    displayLabel: "Not started",
  },
};

@Component({
  selector: "signature-handover",
  templateUrl: "./signature-handover.component.html",
  styleUrls: ["./signature-handover.component.scss"],
})
export class SignatureHandoverComponent {
  // Variables
  sub: Subscription;
  projectKey: string;
  moduleKey: string;
  recordId: string;
  progressStage: string = "";
  idCheckItrTemplateCodeGetValue = null;
  typeLogin: string;
  requestModel: any;
  handoverId: string = '';

  // Boolean
  canEvaluation: boolean = false;
  canAction: boolean = false;
  hasShowWarningReset: boolean = false;
  hasShowWarningSave: boolean = false;
  hasShowWarningApprove: boolean = false;
  hasShowWarningReject: boolean = false;
  hasShowWarningSaveAndSubmit: boolean = false;
  hasShowPinCodeSubmitModal: boolean = false;
  hasShowPinCodeApproveModal: boolean = false;
  isUserCreatedPinCode: boolean = false;
  hasShowLoginModal = false;

  // Model
  itrTemplateCode: SafeHtml = null;
  stringHTMLCode: string = "";
  fieldFromDataBase: any = {};
  handoverDetail: HandoverDetail;
  listQuestionData: RecordQuestionsHandoverModel[] = [];
  signatureList: SignatureHandoverReturnedModel[] = [];
  statusList = StatusList;
  title: string;
  handoverFull: MilestonesTabModel;

  constructor(
    public clientState: ClientState,
    private sanitizer: DomSanitizer,
    private notificationError: AuthErrorHandler,
    private route: ActivatedRoute,
    private router: Router,
    private tagTabService: TagTabService,
    private idbService: IdbService,
  ) {

    this.sub = this.route.params.subscribe((params) => {
      this.projectKey = params["projectKey"];
      this.moduleKey = params["moduleKey"];
      if (this.isOffline) {
        this.handoverId = params["handoverId"];
        this.getRecordDetailBy(this.handoverId);
      } else {
        this.recordId = params["recordId"];
        if (!this.projectKey || !this.moduleKey || !this.recordId) {
          this.router.navigate([""]);
        } else {
          this.getRecordDetailBy(this.recordId);
        }
      }
    });
  }

  //--- Check info device
  // get isTablet() {
  //   return InfoDevice.isTablet;
  // }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  getRecordDetailBy(id: string) {
    // reset default
    this.hasShowWarningSave = false;
    this.hasShowWarningSaveAndSubmit = false;
    this.hasShowWarningReset = false;
    this.itrTemplateCode = null;
    this.stringHTMLCode = "";
    this.fieldFromDataBase = {};
    this.listQuestionData = [];
    this.canAction = false;
    this.canEvaluation = false;
    this.progressStage = "";
    this.isUserCreatedPinCode = false;
    this.hasShowPinCodeSubmitModal = false;
    this.hasShowPinCodeApproveModal = false;
    this.idCheckItrTemplateCodeGetValue = null;
    this.signatureList = [];

    if (id) {
      if (this.isOffline) {
        this.clientState.isBusy = true;
        const _snHandovers = StoreNames.handovers;
        this.idbService.getItem(_snHandovers, id).then(res => {
          this.handoverFull = res ? { ...res } : null;
          if (this.handoverFull) {
            const _recordHandover = { ...this.handoverFull.recordHandover } as HandoverDetail;
            this.assignRecordHandover(_recordHandover);
          }
          this.clientState.isBusy = false;
        }, err => {
          this.clientState.isBusy = false;
        });
      } else {
        this.clientState.isBusy = true;
        this.tagTabService.getItrRecord(id).subscribe(
          (res) => {
            const _recordHandover = res && res.content ? { ...res.content } as HandoverDetail : null;
            this.assignRecordHandover(_recordHandover);
            this.clientState.isBusy = false;
          },
          (err) => {
            this.clientState.isBusy = false;
            this.notificationError.handleError(err.message);
          }
        );
      }
    }
  }

  assignRecordHandover(response: HandoverDetail) {
    this.handoverDetail = <HandoverDetail>response;
    this.signatureList = this.handoverDetail.signatures;
    const FormHTML = this.handoverDetail.form;
    this.title = this.handoverDetail.referenceName ? `${this.handoverDetail.referenceName}` : '';

    const rawTemplateCode = `<style>${FormHTML.headerCss}</style>${FormHTML.headerHtml}<style>${FormHTML.bodyCss}</style>${FormHTML.bodyHtml}<style>${FormHTML.footerCss}</style>${FormHTML.footerHtml}<style>
        .rowFix{padding:0}.hidden-sub {display:none}
        </style>`;
    const rawTemplateRenameRow = reNameClassRowToRowFix(rawTemplateCode);
    const finallyTemplate = removeSubContent(rawTemplateRenameRow);
    this.stringHTMLCode = finallyTemplate;
    this.itrTemplateCode = this.sanitizer.bypassSecurityTrustHtml(
      finallyTemplate
    );
    this.autoRunAfterGetDataFromApi();
    this.listQuestionData = this.handoverDetail.questions;
    this.canAction = this.handoverDetail.canAction;
    this.progressStage = this.handoverDetail.status;

    if (
      this.progressStage === this.statusList.NOTSTARTED.label ||
      this.progressStage === this.statusList.REJECTED.label
    ) {
      this.canEvaluation = true;
    }
  }

  getDisplayStatusByStatusLabel(statusLabel: string): string {
    switch (statusLabel) {
      case this.statusList.COMPLETED.label:
        return this.statusList.COMPLETED.displayLabel;
      case this.statusList.DELETED.label:
        return this.statusList.DELETED.displayLabel;
      case this.statusList.REJECTED.label:
        return this.statusList.REJECTED.displayLabel;
      case this.statusList.INPROGRESS.label:
        return this.statusList.INPROGRESS.displayLabel;
      case this.statusList.NOTSTARTED.label:
        return this.statusList.NOTSTARTED.displayLabel;
    }
  }
  //--- action logic

  removeWarningRequiredBackground() {
    this.listQuestionData.map((question) => {
      if (question.currentAnswer) {
        document
          .getElementById(question.answer[0].customId)
          .parentElement.style.removeProperty("background-color");
      }
    });
  }

  extractAnswerValueFromRecord() {
    this.listQuestionData.map((question) => {
      switch (question.answer[0].type) {
        case AnswerTypeFromBE.CHECKBOX:
          question.currentAnswer = this.getValueFromCheckboxAnswer(
            question.answer[0].customId
          );
          break;
        case AnswerTypeFromBE.INPUTCELL:
          question.currentAnswer = this.getValueFromInputCellAnswer(
            question.answer[0].customId
          );
          break;
        case AnswerTypeFromBE.DROPDOWN:
          question.currentAnswer = this.getValueFromSelectboxAnswer(
            question.answer[0].customId
          );
          break;
        case AnswerTypeFromBE.RADIO:
          question.currentAnswer = this.getValueFromRadioAnswer(
            question.answer[0].customId
          );
          break;
      }
    });
  }

  //#region  get value from record
  getValueFromInputCellAnswer(idAnswer: string): string {
    return (
      (document.getElementById(idAnswer).children[0] as HTMLInputElement)
        .value || ""
    );
  }

  getValueFromSelectboxAnswer(idAnswer: string): string {
    return (
      (document.getElementById(idAnswer).children[0] as HTMLSelectElement)
        .value || ""
    );
  }

  getValueFromRadioAnswer(idAnswer: string): string {
    let result = "";
    Array.from(document.getElementById(idAnswer).children).map(
      (labelElement) => {
        const radioInputElement = labelElement.children[0] as HTMLInputElement;
        if (radioInputElement?.checked) {
          result = radioInputElement.value;
          return;
        }
      }
    );
    return result;
  }

  getValueFromCheckboxAnswer(idAnswer: string): string {
    let result = "";
    Array.from(document.getElementById(idAnswer).children).map(
      (labelElement) => {
        const checkboxInputElement = labelElement
          .children[0] as HTMLInputElement;
        if (checkboxInputElement?.checked) {
          result = checkboxInputElement.value;
          return;
        }
      }
    );
    return result;
  }

  isAllQuestionHasAnAnswer(): boolean {
    let result = true;
    this.listQuestionData.map((question) => {
      if (!question.currentAnswer) {
        document.getElementById(
          question.answer[0].customId
        ).parentElement.style.backgroundColor = "#ffff0154";
        result = false;
      }
    });
    if (!result)
      this.notificationError.handleError(
        "Please complete all questions before submit!"
      );
    return result;
  }

  getQuestionsDataForApiSave() {
    const questions = [];
    this.listQuestionData.map((questionObject) =>
      questions.push({
        questionId: questionObject.id,
        answer: questionObject.currentAnswer,
      })
    );
    return questions;
  }

  autoRunAfterGetDataFromApi() {
    let countIntervalRun = 0;
    this.idCheckItrTemplateCodeGetValue = setInterval(() => {
      if (this.itrTemplateCode) {
        clearInterval(this.idCheckItrTemplateCodeGetValue);
        this.autoConfigRecordControl();
        //-- binding data
        this.bindingQuestionAnswerValueToRecord();
        this.bindingFieldFromDatabaseData();
        this.bindingFieldFromSignature();
      }
      countIntervalRun++;
      if (countIntervalRun > 50) {
        clearInterval(this.idCheckItrTemplateCodeGetValue);
      }
    }, 250);
  }

  autoConfigRecordControl() {
    this.handleSingleClickCheckboxIngroup();
    this.enableEditedInputAnswer();
    removeOuterMostRowDuplicateBorderV2();
  }

  handleSingleClickCheckboxIngroup() {
    const handleClickToCheckbox = (
      event: any,
      dataCheckBoxAnswerId: string,
      indexEvent: number | string
    ) => {
      const listCheckBoxOfGroup = Array.from(
        document.querySelectorAll(
          `[${HTML_DATA_CUSTOM_NAME.DATA_CHECK_BOX_ANSWER}=${dataCheckBoxAnswerId}]`
        )
      ) as HTMLInputElement[];
      if (event.target.checked)
        listCheckBoxOfGroup.map((inputCheckbox, index) => {
          if (indexEvent != index && inputCheckbox.checked)
            inputCheckbox.click();
        });
    };
    document
      .querySelectorAll(`[${HTML_DATA_CUSTOM_NAME.DATA_ANSWER_TYPE}=Checkbox]`)
      .forEach((answerElement) => {
        const listChildrenInputCheckBox = Array.from(
          document.querySelectorAll(
            `[${HTML_DATA_CUSTOM_NAME.DATA_CHECK_BOX_ANSWER}=${answerElement.id}]`
          )
        );
        listChildrenInputCheckBox.map((inputElement, index) => {
          inputElement.setAttribute(
            HTML_DATA_CUSTOM_NAME.DATA_INDEX_IN_GROUP,
            String(index)
          );
          inputElement.addEventListener("click", (event) =>
            handleClickToCheckbox(event, answerElement.id, index)
          );
        });
      });
  }

  enableEditedInputAnswer() {
    document
      .querySelectorAll("input[data-id='input-itr-editor']")
      .forEach((inputElement) => {
        inputElement.removeAttribute("disabled");
      });
  }

  bindingQuestionAnswerValueToRecord() {
    this.listQuestionData.map((question) => {
      if (question.currentAnswer) {
        const answer = question.answer[0];
        switch (answer.type) {
          case AnswerTypeFromBE.CHECKBOX:
            this.bindingCheckboxAnswerData(
              answer.customId,
              question.currentAnswer
            );
            break;
          case AnswerTypeFromBE.INPUTCELL:
            this.bindingInputAnswerData(
              answer.customId,
              question.currentAnswer
            );
            break;
          case AnswerTypeFromBE.DROPDOWN:
            this.bindingSelectBoxAnswerData(
              answer.customId,
              question.currentAnswer
            );
            break;
          case AnswerTypeFromBE.RADIO:
            this.bindingRadioAnswerData(
              answer.customId,
              question.currentAnswer
            );
            break;
        }
      }
    });
  }

  bindingInputAnswerData(idAnswer: string, defaultValue: string) {
    (document.getElementById(idAnswer)
      .children[0] as HTMLInputElement).value = defaultValue;
  }

  bindingSelectBoxAnswerData(idAnswer: string, defaultValue: string) {
    const selectBoxElement = document.getElementById(idAnswer)
      .children[0] as HTMLSelectElement;
    Array.from(selectBoxElement.children).map((optionElement) => {
      if (optionElement.getAttribute("value") === defaultValue) {
        optionElement.setAttribute("selected", "");
        return;
      }
    });
  }

  bindingRadioAnswerData(idAnswer: string, defaultValue: string) {
    Array.from(document.getElementById(idAnswer).children).map(
      (labelElement) => {
        const InputElement = labelElement.children[0] as HTMLInputElement;
        if (InputElement && InputElement.value === defaultValue) {
          InputElement.click();
          return;
        }
      }
    );
  }

  bindingCheckboxAnswerData(idAnswer: string, defaultValue: string) {
    Array.from(document.getElementById(idAnswer).children).map(
      (labelElement) => {
        const InputElement = labelElement.children[0] as HTMLInputElement;
        if (InputElement && InputElement.value === defaultValue) {
          InputElement.click();
          return;
        }
      }
    );
  }

  bindingFieldFromDatabaseData() {
    const listElement = Array.from(
      document.getElementsByTagName(
        HTML_TAG_CUSTOM_BLOCK.FIELD_FORM_DATABASE
      ) as HTMLCollectionOf<HTMLElement>
    );
    listElement.map((htmlElemnt) => {
      if (htmlElemnt.getAttribute(HTML_DATA_CUSTOM_NAME.DATA_TABLE_NAME))
        htmlElemnt.innerHTML = this.fieldFromDataBase[
          htmlElemnt.getAttribute(HTML_DATA_CUSTOM_NAME.DATA_TABLE_NAME) +
          htmlElemnt.getAttribute(
            HTML_DATA_CUSTOM_NAME.DATA_FIELD_NAME_FORM_TABLE
          )
        ];
    });
  }

  bindingFieldFromSignature() {
    this.signatureList?.map((signature) => {
      if (!signature.signDate) return;
      const signatureElement = document.querySelector(
        `[${HTML_DATA_CUSTOM_NAME.DATA_SIGNATURE_LABEL}='${signature.label}']`
      );
      if (signatureElement) {
        signatureElement.innerHTML = signature.userName;
        const listFieldOfSignatureElement = Array.from(
          document.querySelectorAll(
            `[${HTML_DATA_CUSTOM_NAME.DATA_ID_SIGNATURE_LINKED}='${signatureElement.id}']`
          )
        );
        listFieldOfSignatureElement.map((fieldElement) => {
          switch (
          fieldElement.getAttribute(
            HTML_DATA_CUSTOM_NAME.DATA_LABEL_FIELD_OF_SIGNATURE
          )
          ) {
            case "Name":
              fieldElement.innerHTML = signature.userName;
              break;
            case "Company":
              fieldElement.innerHTML = signature.userCompany;
              break;
            case "SignatureDate": {
              const DateObject = new Date(signature.signDate);
              fieldElement.innerHTML = `${DateObject.getDate()}/${DateObject.getMonth() + 1
                }/${DateObject.getFullYear()}`;
              break;
            }
          }
        });
      }
    });
  }
  //#endregion


  //#region control modal
  handleShowWarningSaveAndSubmit() {
    this.hasShowWarningSaveAndSubmit = true;
    this.hasShowLoginModal = true;
  }

  handleShowWarningSave() {
    this.hasShowWarningSave = true;
  }

  handleShowWarningResetModal() {
    this.hasShowWarningReset = true;
  }

  handleShowWarningApprove() {
    this.hasShowWarningApprove = true;
    this.hasShowLoginModal = true;
  }

  handleShowWarningReject() {
    this.hasShowWarningReject = true;
  }
  //#endregion control modal


  //#region control actions
  handleResetData(event) {
    if (event) {
      this.itrTemplateCode = this.sanitizer.bypassSecurityTrustHtml(
        this.stringHTMLCode
      );
      setTimeout(() => {
        this.autoConfigRecordControl();
        this.bindingFieldFromDatabaseData();
        this.extractAnswerValueFromRecord();
        if (this.isOffline) {
          const _tempHandoverDetail = { ...this.handoverDetail };
          _tempHandoverDetail.isEdited = true;
          _tempHandoverDetail.questions = [...this.listQuestionData];

          const _editedHandover = { ...this.handoverFull, ...{ recordHandover: { ..._tempHandoverDetail }, isChanged: true } };
          const _snHandovers = StoreNames.handovers;
          this.idbService
            .updateItem(_snHandovers, _editedHandover, this.handoverId);
        } else {
          this.tagTabService.updateItrRecordDetail({
            recordId: this.recordId,
            isSubmit: false,
            questions: this.getQuestionsDataForApiSave(),
            pinCode: null,
          })
            .subscribe((res) => { }, (err) => { });
        }
      }, 100);
    }
    this.hasShowWarningReset = false;
  }

  handleSaveRecord(event) {
    this.hasShowWarningSave = false;
    if (event) {
      this.clientState.isBusy = true;
      this.extractAnswerValueFromRecord();
      if (this.isOffline) {
        const _tempHandoverDetail = { ...this.handoverDetail };
        _tempHandoverDetail.isEdited = true;
        _tempHandoverDetail.questions = [...this.listQuestionData];

        const _editedHandover = { ...this.handoverFull, ...{ recordHandover: { ..._tempHandoverDetail }, isChanged: true } };
        const _snHandovers = StoreNames.handovers;
        this.idbService
          .updateItem(_snHandovers, _editedHandover, this.handoverId)
          .then(
            (res) => {
              this.clientState.isBusy = false;
              this.notificationError.handleSuccess(Constants.TagTabSaveItrTag);
            },
            (err) => {
              this.clientState.isBusy = false;
            }
          );
      } else {
        this.tagTabService.updateItrRecordDetail({
          recordId: this.recordId,
          isSubmit: false,
          questions: this.getQuestionsDataForApiSave(),
          pinCode: null,
        })
          .subscribe(
            (res) => {
              this.clientState.isBusy = false;
              this.notificationError.handleSuccess("Save Record success");
            },
            (err) => {
              this.clientState.isBusy = false;
              this.notificationError.handleError(err.message);
            }
          );
      }
    }
  }

  handleSaveAndSubmitRecord(type: string) {
    this.hasShowWarningSaveAndSubmit = false;
    if (type) {
      this.extractAnswerValueFromRecord();
      if (this.isAllQuestionHasAnAnswer()) {
        this.removeWarningRequiredBackground();
        if (type === 'confirm') {
          this.clientState.isBusy = true;
          if (this.isOffline) {
            this.onSignAndSubmitOffline();
          } else {
            this.onSignAndSubmitOnline();
          }
        } else if (type === 'login') {
          this.hasShowLoginModal = true;
          this.typeLogin = 'saveAndSubmit';
          let _modelSS: UpdateItrRecordModel = {
            recordId: this.recordId,
            projectKey: this.projectKey,
            isSubmit: true,
            questions: this.getQuestionsDataForApiSave(),
            isDifferentUser: true,
          }
          this.requestModel = { ..._modelSS, ...{ handoverId: this.handoverId, listQuestionData: this.listQuestionData } };
          $("#loginAnotherUserHandoverSection").modal("show");
        }
      }
    }
  }

  onSignAndSubmitOffline() {
    this.hasShowPinCodeSubmitModal = true;
    this.isUserCreatedPinCode = true;
    this.clientState.isBusy = false;
  }

  onSignAndSubmitOnline() {
    this.tagTabService.signValidate({ recordId: this.recordId }).subscribe(
      (res) => {
        this.clientState.isBusy = false;
        this.isUserCreatedPinCode = true;
        this.hasShowPinCodeSubmitModal = true;
      },
      (err) => {
        this.clientState.isBusy = false;
        this.isUserCreatedPinCode = false;
        this.hasShowPinCodeSubmitModal = true;
      }
    );
  }

  handleApproveRecord(type: string) {
    if (type && type === 'confirm') {
      this.clientState.isBusy = true;
      if (this.isOffline) {
        this.onApproveOffline();
      } else {
        this.onApproveOnline();
      }
    } else if (type && type === 'login') {
      this.hasShowLoginModal = true;
      this.typeLogin = 'approve';
      let _modelA: ApprovedRecordCommand = {
        recordId: this.recordId,
        projectKey: this.projectKey,
        isDifferentUser: true,
      }
      this.requestModel = { ..._modelA, ...{ handoverId: this.handoverId } };
      $("#loginAnotherUserHandoverSection").modal("show");
    }
    this.hasShowWarningApprove = false;
  }

  onApproveOnline() {
    this.tagTabService.signValidate({ recordId: this.recordId }).subscribe(
      (res) => {
        this.clientState.isBusy = false;
        this.isUserCreatedPinCode = true;
        this.hasShowPinCodeApproveModal = true;
      },
      (err) => {
        this.clientState.isBusy = false;
        this.isUserCreatedPinCode = false;
        this.hasShowPinCodeApproveModal = true;
      }
    );
  }

  onApproveOffline() {
    this.hasShowPinCodeApproveModal = true;
    this.isUserCreatedPinCode = true;
    this.clientState.isBusy = false;
  }

  onSaveAndSubmitAction(event) {
    if (event) {
      this.clientState.isBusy = true;
      if (this.isOffline) {
        const _snLookup = StoreNames.lookups;
        this.idbService.getItem(_snLookup, KeyLookups.pinCode).then((_pc) => {
          if (BCryptHelper.comparison(event, _pc)) {
            const _userInfo = JwtTokenHelper.GetUserInfo();
            const _companyInfo = JwtTokenHelper.GetCompanyInfo();
            const _tempHandoverDetail = { ...this.handoverDetail };
            const _signNo1 = 1, _signNo2 = 2;
            let _isComplete = false;
            let _currentIndex, _nextIndex;
            if (_tempHandoverDetail.signatures && _tempHandoverDetail.signatures.length > 0) {
              // _currentIndex = this.signatureList.findIndex(sign => sign.isTurn);
              _currentIndex = this.signatureList.findIndex(
                (sign) => sign.number === _signNo1
              );
              const _temp = {
                signDate: new Date(),
                userCompany: _companyInfo.companyName,
                userName: _userInfo.userName,
                signUserId: _userInfo.userId,
                isTurn: false,
              };
              Object.assign(_tempHandoverDetail.signatures[_currentIndex], _temp);

              if (_tempHandoverDetail.signatures.length === 1) {
                _tempHandoverDetail.status = TagItrStatus.Completed;
                _isComplete = true;
              } else {
                _nextIndex = this.signatureList.findIndex(
                  (sign) => sign.number === _signNo2
                );
                _tempHandoverDetail.signatures[_nextIndex].isTurn = true;
                _tempHandoverDetail.status = TagItrStatus.Inprogress;
              }
            }
            _tempHandoverDetail.isEdited = true;
            _tempHandoverDetail.questions = [...this.listQuestionData];

            const _snHandovers = StoreNames.handovers;
            const _editedHandover = { ...this.handoverFull, ...{ recordHandover: { ..._tempHandoverDetail }, isChanged: true } };
            // Update handover status
            if (_isComplete) {
              _editedHandover.status = HandoverStatus.Completed;
              _editedHandover.statusId = HandoverStatusEnum.Completed;
            }

            this.idbService
              .updateItem(_snHandovers, _editedHandover, this.handoverId).then((res) => {
                this.clientState.isBusy = false;
                this.notificationError.handleSuccess(
                  Constants.HandoverRecordSignAndSubmitted
                );
              }, (err) => {
                this.clientState.isBusy = false;
              });
            this.getRecordDetailBy(this.handoverId);
          } else {
            this.clientState.isBusy = false;
            this.notificationError.handleError(
              Constants.InvalidPinCode
            );
          }

        }, (err) => { })
      } else {
        let _model: UpdateItrRecordModel = {
          recordId: this.recordId,
          isSubmit: true,
          questions: this.getQuestionsDataForApiSave(),
          pinCode: event,
        }
        this.tagTabService
          .updateItrRecordDetail(_model)
          .subscribe(
            (res) => {
              this.clientState.isBusy = false;
              this.getRecordDetailBy(this.recordId);
              this.notificationError.handleSuccess("Save and Submit success");
            },
            (err) => {
              this.clientState.isBusy = false;
              this.notificationError.handleError(err.message);
            }
          );
      }
    }
    this.hasShowPinCodeSubmitModal = false;
  }

  onApproveAction(event) {
    if (event) {
      this.clientState.isBusy = true;
      if (this.isOffline) {
        const _snLookup = StoreNames.lookups;
        this.idbService.getItem(_snLookup, KeyLookups.pinCode).then((_pc) => {
          if (BCryptHelper.comparison(event, _pc)) {
            const _userInfo = JwtTokenHelper.GetUserInfo();
            const _companyInfo = JwtTokenHelper.GetCompanyInfo();
            const _tempHandoverDetail = { ...this.handoverDetail };
            let _signNo = -1;
            let _isComplete = false;
            const _currentIndex = this.signatureList.findIndex((sign) => {
              _signNo = sign.number;
              return sign.isTurn;
            });
            const _temp = {
              signDate: new Date(),
              userCompany: _companyInfo.companyName,
              userName: _userInfo.userName,
              signUserId: _userInfo.userId,
              isTurn: false,
            };
            Object.assign(_tempHandoverDetail.signatures[_currentIndex], _temp);

            if ((_signNo + 1) > this.signatureList.length) {
              _tempHandoverDetail.status = TagItrStatus.Completed;
              _isComplete = true;
            } else {
              const _nextSignIndex = this.signatureList.findIndex(
                (sign) => sign.number === _signNo + 1
              );
              _tempHandoverDetail.signatures[_nextSignIndex].isTurn = true;
            }
            _tempHandoverDetail.isEdited = true;

            const _snHandovers = StoreNames.handovers;
            const _editedHandover = { ...this.handoverFull, ...{ recordHandover: { ..._tempHandoverDetail }, isChanged: true } };
            // Update handover status
            if (_isComplete) {
              _editedHandover.status = HandoverStatus.Completed;
              _editedHandover.statusId = HandoverStatusEnum.Completed;
            }

            this.idbService
              .updateItem(_snHandovers, _editedHandover, this.handoverId)
              .then(
                (res) => {
                  this.clientState.isBusy = false;
                  this.notificationError.handleSuccess(Constants.HandoverRecordApproved);
                },
                (err) => {
                  this.clientState.isBusy = false;
                }
              );

            this.getRecordDetailBy(this.handoverId);
          } else {
            this.clientState.isBusy = false;
            this.notificationError.handleError(
              Constants.InvalidPinCode
            );
          }
        });
      } else {
        let _model: ApprovedRecordCommand = {
          recordId: this.recordId,
          projectKey: this.projectKey,
          pinCode: event
        }
        this.tagTabService.approveRecord(_model).subscribe(
          (res) => {
            this.clientState.isBusy = false;
            this.getRecordDetailBy(this.recordId);
            this.notificationError.handleSuccess(Constants.HandoverUpdated);
          },
          (err) => {
            this.clientState.isBusy = false;
            this.notificationError.handleError(err.message);
          }
        );
      }
    }
    this.hasShowPinCodeApproveModal = false;
  }

  onRejectAction = (reasonText: string) => {
    if (typeof reasonText !== "undefined") {
      this.clientState.isBusy = true;
      if (this.isOffline) {
        this.onRejectOffline(reasonText);
      } else {
        this.tagTabService
          .rejectRecord(this.recordId, null, reasonText)
          .subscribe(
            (res) => {
              this.clientState.isBusy = false;
              this.getRecordDetailBy(this.recordId);
              this.notificationError.handleSuccess(Constants.TagNoUpdated);
            },
            (err) => {
              this.clientState.isBusy = false;
              this.notificationError.handleError(err.message);
            }
          );
      }
    }
    this.hasShowWarningReject = false;
  }

  onRejectOffline(reason: string) {
    const _tempHandoverDetail = { ...this.handoverDetail };
    const _signNo1 = 1;
    this.handoverDetail.signatures.forEach((sign, i) => {
      const _t = {
        signDate: null,
        userCompany: null,
        userName: "",
        isTurn: sign.number === _signNo1,
      };
      Object.assign(_tempHandoverDetail.signatures[i], _t);
    });
    _tempHandoverDetail.isEdited = true;
    _tempHandoverDetail.status = TagItrStatus.Rejected;
    _tempHandoverDetail.rejectReason = reason;
    //having questionnaire

    const _editedHandover = { ...this.handoverFull, ...{ recordHandover: { ..._tempHandoverDetail }, isChanged: true } };
    const _snHandovers = StoreNames.handovers;
    this.idbService
      .updateItem(_snHandovers, _editedHandover, this.handoverId)
      .then(
        (res) => {
          this.clientState.isBusy = false;
          this.notificationError.handleSuccess(Constants.HandoverRecordRejected);
        },
        (err) => {
          this.clientState.isBusy = false;
        }
      );

    this.getRecordDetailBy(this.handoverId);
  }
  //#endregion control actions

  onLoginModalRes(isSign: boolean) {
    if (isSign) {
      if (this.isOffline) {
        this.getRecordDetailBy(this.handoverId);
      } else {
        this.getRecordDetailBy(this.recordId);
      }
    }
    this.hasShowLoginModal = false;
  }
}