import { Component, Output, EventEmitter, OnInit } from "@angular/core";
import { TagTabService } from "../../../shared/services/api/tag-tab/tag-tab.service";
import { ClientState } from "src/app/shared/services/client/client-state";
import {
  ApprovedRecordCommand,
  ItrRecordDetail,
  RecordQuestionsModel,
  SignatureReturnedModel,
  UpdateItrRecordModel,
} from "../../../shared/models/tab-tag/itr-record.model";
import { SafeHtml, DomSanitizer } from "@angular/platform-browser";
import {
  removeSubContent,
  reNameClassRowToRowFix,
  removeOuterMostRowDuplicateBorderV2,
} from "../../itr-tab/itr-builder/itr-builder-detail/grapesJs-editor-config/handling-code-function";
import * as HTML_TAG_CUSTOM_BLOCK from "../../itr-tab/itr-builder/itr-builder-detail/grapesJs-editor-config/grapesjs-component-tagName";
import * as HTML_DATA_CUSTOM_NAME from "../../itr-tab/itr-builder/itr-builder-detail/grapesJs-editor-config/html-data-custom";
import { AnswerTypeFromBE } from "../../itr-tab/itr-builder/itr-builder-detail/grapesJs-editor-config/const-collect";
import { AuthErrorHandler } from "src/app/shared/services/auth/auth.error-handler";
import StatusList from "./config/status-list";
import { Constants, JwtTokenHelper } from "src/app/shared/common";
import { Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { InfoDevice } from "src/app/shared/models/common/global-variables";
import { IdbService } from "src/app/shared/services";
import { StoreNames } from "src/app/shared/models/common/common.model";
import { TagItrStatus } from "src/app/shared/models/tab-tag/tab-tag.model";
import { KeyLookups } from "src/app/shared/models/punch-item/punch-item.model";
import { BCryptHelper } from "src/app/shared/common/bcrypt/bcrypt";
declare var $: any;

@Component({
  selector: "allocated-itrs",
  templateUrl: "./allocated-itrs.component.html",
  styleUrls: ["./allocated-itrs.component.scss"],
})
export class AllocatedITRsComponent implements OnInit {
  @Output() handleGoBackTagList = new EventEmitter();

  canEvaluation: boolean = false;
  canAction: boolean = false;
  hasShowWarningReset: boolean = false;
  hasShowWarningSave: boolean = false;
  hasShowWarningApprove: boolean = false;
  hasShowWarningReject: boolean = false;
  hasShowWarningSaveAndSubmit: boolean = false;
  hasShowPinCodeSubmitModal: boolean = false;
  hasShowPinCodeApproveModal: boolean = false;
  hasShowLoginModal: boolean = false;
  itrTemplateCode: SafeHtml = null;
  stringHTMLCode: string = "";
  isUserCreatedPinCode: boolean = false;
  isLoadTagItrByTag: boolean = false;
  fieldFromDataBase: any = {};
  idCheckItrTemplateCodeGetValue = null;
  listQuestionData: RecordQuestionsModel[] = [];
  progressStage: string = "";
  signatureList: SignatureReturnedModel[] = [];
  StatusList = StatusList;
  sub: Subscription;
  projectKey: string;
  moduleKey: string;
  recordId: string;
  typeLogin: string;
  requestModel: any;
  itrDetail: ItrRecordDetail;
  isShowRightSideBar: boolean = true;
  isShowITRBuilder: boolean = true;
  tagId: string;
  tagNo: string;
  tagDescription: string;
  _storeName: string;
  isToggleRightSide: boolean = false;
  title: string;

  constructor(
    private tagTabService: TagTabService,
    public clientState: ClientState,
    private sanitizer: DomSanitizer,
    private notificationError: AuthErrorHandler,
    private route: ActivatedRoute,
    private router: Router,
    private idbService: IdbService
  ) {
    this._storeName = StoreNames.records;
    this.sub = this.route.params.subscribe((params) => {
      this.projectKey = params["projectKey"];
      this.moduleKey = params["moduleKey"];
      this.recordId = params["recordId"];
      if (!this.projectKey || !this.moduleKey || !this.recordId) {
        this.router.navigate([""]);
      } else {
        this.getRecordDetail(this.recordId);
      }
    });
  }

  //--- Check info device
  get isTablet() {
    return InfoDevice.isTablet;
  }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  ngOnInit() {
    if (this.isTablet) {
      this.isShowRightSideBar = false;
    }
  }

  toggleRightSide = () => {
    if (!this.isTablet) return;

    if ($('body').hasClass("overflow-hidden")) {
      $('body').removeClass("overflow-hidden");
    }

    if (this.isToggleRightSide) {
      $(".mat-drawer-content").addClass("overflow-hidden");
      this.isToggleRightSide = !this.isToggleRightSide;
      this.isShowRightSideBar = false;
    } else {
      $(".mat-drawer-content").removeClass("overflow-hidden");
    }
  };

  //--- action call api
  getRecordDetail(recordId) {
    // reset default
    this.hasShowWarningSave = false;
    this.hasShowWarningSaveAndSubmit = false;
    this.hasShowLoginModal = false;
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

    if (recordId) {
      this.clientState.isBusy = true;
      if (this.isOffline) {
        this.idbService.getItem(this._storeName, recordId).then(
          (res) => {
            this.assignItrRecord(res);
            this.clientState.isBusy = false;
          },
          (err) => { }
        );
      } else {
        this.tagTabService.getItrRecord(recordId).subscribe(
          (res) => {
            this.assignItrRecord(res.content);
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

  assignItrRecord(response) {
    this.itrDetail = response;
    this.fieldFromDataBase = this.itrDetail.fieldData;
    this.title = this.fieldFromDataBase.itrNo ? `[${this.itrDetail.referenceName}]-${this.fieldFromDataBase.itrNo}` : null;
    this.signatureList = this.itrDetail.signatures;
    const FormHTML = this.itrDetail.form;
    this.tagId = this.fieldFromDataBase.tagId;
    this.tagNo = this.fieldFromDataBase.tagNo;
    this.tagDescription = this.fieldFromDataBase.tagDescription;
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
    this.listQuestionData = this.itrDetail.questions;
    this.canAction = this.itrDetail.canAction;
    this.progressStage = this.itrDetail.status;

    if (this.progressStage === StatusList.NOTSTARTED.label ||
      this.progressStage === StatusList.REJECTED.label) {
      this.canEvaluation = true;
    }
  }

  isLockForm() {
    return !this.canAction ? true : !this.canEvaluation;
  }

  isSign() {
    if (!this.isOffline) {
      return true;
    }
    const _currentSignature = this.signatureList.find((sign) => sign.isTurn);
    const infoProject = JwtTokenHelper.GetAuthSignInProject();
    return (
      _currentSignature &&
      _currentSignature.authorizationLevel >= infoProject.authLevel
    );
  }

  isSignSubmit() {
    if (!this.isOffline) {
      return true;
    }
    return (
      this.signatureList ||
      (this.signatureList && this.signatureList.length < 1)
    );
  }

  saveAndSubmitAction(event) {
    if (event) {
      this.clientState.isBusy = true;
      if (this.isOffline) {
        const _snLookup = StoreNames.lookups;
        this.idbService.getItem(_snLookup, KeyLookups.pinCode).then((_pc) => {
          if (BCryptHelper.comparison(event, _pc)) {
            const _userinfo = JwtTokenHelper.GetUserInfo();
            const _companyInfo = JwtTokenHelper.GetCompanyInfo();
            const _tempItrDetail = { ...this.itrDetail };
            const _signNo1 = 1,
              _signNo2 = 2;
            let _currentIndex, _nextIndex;
            if (_tempItrDetail.signatures && _tempItrDetail.signatures.length > 0) {
              // _currentIndex = this.signatureList.findIndex(sign => sign.isTurn);
              _currentIndex = this.signatureList.findIndex(
                (sign) => sign.number === _signNo1
              );
              const _temp = {
                signDate: new Date(),
                signUserId: _userinfo.userId,
                userCompany: _companyInfo.companyName,
                userName: _userinfo.userName,
                isTurn: false,
              };
              Object.assign(_tempItrDetail.signatures[_currentIndex], _temp);

              if (_tempItrDetail.signatures.length === 1) {
                _tempItrDetail.status = TagItrStatus.Completed;
                this.updateItrStatusOffline(TagItrStatus.Completed);
              } else {
                _nextIndex = this.signatureList.findIndex(
                  (sign) => sign.number === _signNo2
                );
                _tempItrDetail.signatures[_nextIndex].isTurn = true;
                _tempItrDetail.status = TagItrStatus.Inprogress;
                this.updateItrStatusOffline(TagItrStatus.Inprogress);
              }
            }
            _tempItrDetail.isEdited = true;
            _tempItrDetail.questions = [...this.listQuestionData];
            // update tag changed
            const _snTags = StoreNames.tags;
            this.idbService.getItem(_snTags, this.tagId).then(_t => {
              this.idbService.updateItem(_snTags, { ..._t, ...{ isChanged: true } }, this.tagId);
            });
            // update record
            this.idbService
              .updateItem(this._storeName, _tempItrDetail, this.recordId).then((res) => {
                this.clientState.isBusy = false;
                this.notificationError.handleSuccess(
                  Constants.TagTabSignAndSubmitItrTag
                );
              }, (err) => {
                this.clientState.isBusy = false;
              });
            this.getRecordDetail(this.recordId);
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
        };
        this.tagTabService.updateItrRecordDetail(_model).subscribe(
          (res) => {
            this.clientState.isBusy = false;
            this.tagNo = null;
            this.getRecordDetail(this.recordId);
            this.notificationError.handleSuccess(
              Constants.TagTabSignAndSubmitItrTag
            );
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

  handleSaveAndSubmitRecord(type: string) {
    this.hasShowWarningSaveAndSubmit = false;
    if (type) {
      this.extractAnswerValueFromRecord();
      if (this.isAllQuestionHasAnAnswer()) {
        this.removeWarningRequiredBackground();
        if (type === "confirm") {
          if (this.isOffline) {
            this.onSignAndSubmitOffline();
          } else {
            this.onSignAndSubmitOnline();
          }
        } else if (type === "login") {
          this.hasShowLoginModal = true;
          this.hasShowPinCodeSubmitModal = false;
          this.typeLogin = "saveAndSubmit";
          let _modelSS: UpdateItrRecordModel = {
            recordId: this.recordId,
            projectKey: this.projectKey,
            isSubmit: true,
            questions: this.getQuestionsDataForApiSave(),
            isDifferentUser: true,
          };
          this.requestModel = { ..._modelSS, ...{ tagId: this.tagId, listQuestionData: this.listQuestionData } };
          $("#loginAnotherUserSection").modal("show");
        }
      } else {
        this.hasShowPinCodeSubmitModal = false;
      }
    }
  }

  onSignAndSubmitOnline() {
    this.clientState.isBusy = true;
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

  onSignAndSubmitOffline() {
    this.hasShowPinCodeSubmitModal = true;
    this.isUserCreatedPinCode = true;
    this.clientState.isBusy = false;
  }

  handleSaveRecord(event) {
    this.hasShowWarningSave = false;
    if (event) {
      this.clientState.isBusy = true;
      this.extractAnswerValueFromRecord();
      if (this.isOffline) {
        const _tempItrDetail = { ...this.itrDetail };
        _tempItrDetail.isEdited = true;
        _tempItrDetail.questions = [...this.listQuestionData];
        // update tag changed
        const _snTags = StoreNames.tags;
        this.idbService.getItem(_snTags, this.tagId).then(_t => {
          this.idbService.updateItem(_snTags, { ..._t, ...{ isChanged: true } }, this.tagId);
        });
        // save record
        this.idbService
          .updateItem(this._storeName, _tempItrDetail, this.recordId)
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
        this.tagTabService
          .updateItrRecordDetail({
            recordId: this.recordId,
            isSubmit: false,
            questions: this.getQuestionsDataForApiSave(),
            pinCode: null,
          })
          .subscribe(
            (res) => {
              this.clientState.isBusy = false;
              this.notificationError.handleSuccess(Constants.TagTabSaveItrTag);
            },
            (err) => {
              this.clientState.isBusy = false;
              this.notificationError.handleError(err.message);
            }
          );
      }
    }
  }

  turnOffReloadItr(isShow: boolean) {
    if (isShow) {
      this.isLoadTagItrByTag = false;
    }
  }

  updateItrStatusOffline(status: string) {
    const _sn = StoreNames.tags;
    this.idbService.getItem(_sn, this.tagId).then(
      (res) => {
        if (res) {
          let _tagData = res;
          const _index = _tagData.tagSideMenu.itrs.findIndex(
            (itr) => itr.tagItrId === this.recordId
          );

          if (status === TagItrStatus.Completed) {
            _tagData.tagSideMenu.detailChart.noOfItrCompleted += 1;
          }

          _tagData.tagSideMenu.itrs[_index].status = status;
          _tagData.isChanged = true;

          this.idbService.updateItem(_sn, _tagData, this.tagId).then(() => {
            this.isLoadTagItrByTag = true;
          });
        }
      },
      (err) => { }
    );
  }

  //--- action logic
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
    removeOuterMostRowDuplicateBorderV2(this.isTablet);
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
        Constants.TagTabRequireAnswerQuestionnaireItrTag
      );
    return result;
  }

  removeWarningRequiredBackground() {
    this.listQuestionData.map((question) => {
      if (question.currentAnswer) {
        document
          .getElementById(question.answer[0].customId)
          .parentElement.style.removeProperty("background-color");
      }
    });
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

  enableEditedInputAnswer() {
    document
      .querySelectorAll("input[data-id='input-itr-editor']")
      .forEach((inputElement) => {
        inputElement.removeAttribute("disabled");
      });
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

  handleClickGoBackTagList = () => {
    this.handleGoBackTagList.emit();
  };

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
          const _tempItrDetail = { ...this.itrDetail };
          _tempItrDetail.isEdited = true;
          _tempItrDetail.questions = [...this.listQuestionData];

          // update tag changed
          const _snTags = StoreNames.tags;
          this.idbService.getItem(_snTags, this.tagId).then(_t => {
            this.idbService.updateItem(_snTags, { ..._t, ...{ isChanged: true } }, this.tagId);
          });
          // save after resetting
          this.idbService
            .updateItem(this._storeName, _tempItrDetail, this.recordId);
        } else {
          this.tagTabService
            .updateItrRecordDetail({
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

  getDisplayStatusByStatusLabel(statusLabel: string): string {
    switch (statusLabel) {
      case StatusList.COMPLETED.label:
        return StatusList.COMPLETED.displayLabel;
      case StatusList.DELETED.label:
        return StatusList.DELETED.displayLabel;
      case StatusList.REJECTED.label:
        return StatusList.REJECTED.displayLabel;
      case StatusList.INPROGRESS.label:
        return StatusList.INPROGRESS.displayLabel;
      case StatusList.NOTSTARTED.label:
        return StatusList.NOTSTARTED.displayLabel;
    }
  }

  //--- Binding data
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

  //-- get value from record

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

  //--- control modal
  onLoginModalRes(isSign: boolean) {
    this.hasShowLoginModal = false;
    if (isSign) {
      this.tagNo = null;
      this.getRecordDetail(this.recordId);
    }
  }

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

  handleApproveRecord(type: string) {
    if (type && type === "confirm") {
      this.clientState.isBusy = true;
      if (this.isOffline) {
        this.onApproveOffline();
      } else {
        this.onApproveOnline();
      }
    } else if (type && type === "login") {
      this.hasShowLoginModal = true;
      this.typeLogin = "approve";
      let _modelA: ApprovedRecordCommand = {
        recordId: this.recordId,
        projectKey: this.projectKey,
        isDifferentUser: true,
      };
      this.requestModel = { ..._modelA, ...{ tagId: this.tagId } };
      $("#loginAnotherUserSection").modal("show");
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

  onApproveAction(event) {
    if (event) {
      this.clientState.isBusy = true;
      if (this.isOffline) {
        const _snLookup = StoreNames.lookups;
        this.idbService.getItem(_snLookup, KeyLookups.pinCode).then((_pc) => {
          if (BCryptHelper.comparison(event, _pc)) {
            const _userinfo = JwtTokenHelper.GetUserInfo();
            const _companyInfo = JwtTokenHelper.GetCompanyInfo();
            const _tempItrDetail = { ...this.itrDetail };
            let _signNo = -1;
            const _currentIndex = this.signatureList.findIndex((sign) => {
              _signNo = sign.number;
              return sign.isTurn;
            });
            const _temp = {
              signDate: new Date(),
              signUserId: _userinfo.userId,
              userCompany: _companyInfo.companyName,
              userName: _userinfo.userName,
              isTurn: false,
            };
            Object.assign(_tempItrDetail.signatures[_currentIndex], _temp);

            if ((_signNo + 1) > this.signatureList.length) {
              _tempItrDetail.status = TagItrStatus.Completed;
              this.updateItrStatusOffline(TagItrStatus.Completed);
            } else {
              const _nextSignIndex = this.signatureList.findIndex(
                (sign) => sign.number === _signNo + 1
              );
              _tempItrDetail.signatures[_nextSignIndex].isTurn = true;
            }
            _tempItrDetail.isEdited = true;

            // update tag changed
            const _snTags = StoreNames.tags;
            this.idbService.getItem(_snTags, this.tagId).then(_t => {
              this.idbService.updateItem(_snTags, { ..._t, ...{ isChanged: true } }, this.tagId);
            });
            // update record
            this.idbService
              .updateItem(this._storeName, _tempItrDetail, this.recordId)
              .then(
                (res) => {
                  this.clientState.isBusy = false;
                  this.notificationError.handleSuccess(Constants.TagTabApproveItrTag);
                },
                (err) => {
                  this.clientState.isBusy = false;
                }
              );

            this.getRecordDetail(this.recordId);
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
          pinCode: event,
        };
        this.tagTabService.approveRecord(_model).subscribe(
          (res) => {
            this.clientState.isBusy = false;
            this.tagNo = null;
            this.getRecordDetail(this.recordId);
            this.notificationError.handleSuccess(Constants.TagTabApproveItrTag);
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
          .rejectRecord(this.recordId, this.projectKey, reasonText)
          .subscribe(
            (res) => {
              this.clientState.isBusy = false;
              this.tagNo = null;
              this.getRecordDetail(this.recordId);
              this.notificationError.handleSuccess(Constants.TagNoReject);
            },
            (err) => {
              this.clientState.isBusy = false;
              this.notificationError.handleError(err.message);
            }
          );
      }
    }
    this.hasShowWarningReject = false;
  };

  onRejectOffline(reason: string) {
    const _tempItrDetail = { ...this.itrDetail };
    const _signNo1 = 1;
    this.itrDetail.signatures.forEach((sign, i) => {
      const _t = {
        signDate: null,
        userCompany: null,
        userName: "",
        isTurn: sign.number === _signNo1,
      };
      Object.assign(_tempItrDetail.signatures[i], _t);
    });
    _tempItrDetail.isEdited = true;
    _tempItrDetail.status = TagItrStatus.Rejected;
    _tempItrDetail.rejectReason = reason;
    //having questionnaire
    this.updateItrStatusOffline(TagItrStatus.Rejected);
    // update tag changed
    const _snTags = StoreNames.tags;
    this.idbService.getItem(_snTags, this.tagId).then(_t => {
      this.idbService.updateItem(_snTags, { ..._t, ...{ isChanged: true } }, this.tagId);
    });
    // update record
    this.idbService
      .updateItem(this._storeName, _tempItrDetail, this.recordId)
      .then(
        (res) => {
          this.clientState.isBusy = false;
          this.notificationError.handleSuccess(Constants.TagTabRejectItrTag);
        },
        (err) => {
          this.clientState.isBusy = false;
        }
      );

    this.getRecordDetail(this.recordId);
  }

  onShowITRBuilder($event?) { }

  openRightSide = () => {
    this.isShowRightSideBar = true;
    this.isToggleRightSide = this.isTablet;

    if (!$('body').hasClass("overflow-hidden")) {
      $('body').addClass("overflow-hidden");
    }
  };

  closeRightSideBar = () => {
    this.isShowRightSideBar = false;
    this.isToggleRightSide = false;

    if ($('body').hasClass("overflow-hidden")) {
      $('body').removeClass("overflow-hidden");
    }
  };
}
