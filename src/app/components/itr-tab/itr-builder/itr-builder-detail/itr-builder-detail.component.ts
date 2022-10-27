import { Component, OnInit, AfterViewInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import grapesjs from "grapesjs";
import GrapesJsConfig from "./grapesJs-editor-config/grapesJs-editor-config";
import { ModuleProjectDefaultModel } from "src/app/shared/models/module/module.model";
import { ClientState } from "src/app/shared/services/client/client-state";
import { AuthErrorHandler } from "src/app/shared/services/auth/auth.error-handler";
import { Router } from "@angular/router";
import { JwtTokenHelper } from "src/app/shared/common/jwt-token-helper/jwt-token-helper";
import { ITRService } from "src/app/shared/services/api/itr/itr.service";
import {
  ItrBuilderUpdationModel,
  ItrBuilderCreationModel,
  ItrSignature,
} from "../../../../shared/models/itr-builder/itr-builder.model";
import ITRBuilderCommonModel from "../../../../shared/models/itr-tab/itr-builder-common-ddb.model";
import "./itr-builder-detail.component.scss";
import {
  AnswerPopupSettingDataSend,
  AnswerPopupSettingDataSendUnlink,
} from "src/app/components/itr-tab/itr-builder/answer-popup-setting/answer-popup.model";
import * as ITRBuilderSubModels from "../../../../shared/models/itr-tab/itr-builder-sub-ddb.model";
import { EventFieldFromDataBase } from "../../../../shared/models/itr-tab/itr-builder-event-field-from-database.model";
import {
  SignatureObject,
  EventFieldFromSignature,
} from "../../../../shared/models/itr-tab/itr-builder-signature-created";
import * as VALUE_OF_DATA_CUSTOM_TYPE from "./grapesJs-editor-config/value-of-data-custom-type";
import { SafeHtml, DomSanitizer } from "@angular/platform-browser";
import {
  removeSubContent,
  reNameClassRowToRowFix,
  removeOuterMostRowDuplicateBorderV2,
} from "./grapesJs-editor-config/handling-code-function";
import { ListBorderDivIds } from "./data/data";
import { Subscription } from "rxjs";
import { ItrConfirmModalComponent } from "./itr-confirm-modal/itr-confirm-modal.component";

const HTML_DATA_CUSTOM = GrapesJsConfig.HTML_DATA_CUSTOM;
const GRAPESJS_COMPONENT_TYPE = GrapesJsConfig.GRAPESJS_COMPONENT_TYPE;
const GRAPESJS_COMPONENT_TAGNAME = GrapesJsConfig.GRAPESJS_COMPONENT_TAGNAME;

@Component({
  selector: "itr-builder",
  templateUrl: "./itr-builder-detail.component.html",
  styleUrls: ["./itr-builder-detail.component.scss"],
})
export class ITRBuilderDetailComponent implements OnInit, AfterViewInit {

  //#region For Constants
  HEADER_CONSTANT = GrapesJsConfig.HEADER_CONSTANT;
  BODY_CONSTANT = GrapesJsConfig.BODY_CONSTANT;
  FOOTER_CONSTANT = GrapesJsConfig.FOOTER_CONSTANT;
  editorViewName = GrapesJsConfig.HEADER_CONSTANT;
  templateSourceCode = GrapesJsConfig.TemplateSourceCodeDefault;
  //#endregion For Constants

  //#region For Boolean Variables
  hasShowConfirmApplyItr = false;
  isShowModalSaveTemplate = false;
  isShowDeleteWarningModal = false;
  hasShowEditTemplateName = false;
  hasShowConfirmPublishModal: boolean = false;
  isLoading = false;
  hasShowPreview = false;
  hasShowWarningUnsaveWhenClickBack = false;
  isPublished: boolean = false;
  hasGetDataFromApi: boolean = false;
  hasShowAnswerPopupSetting: boolean = false;
  hasShowSignaturePopupSetting: boolean = false;
  hasShowFieldFromDataBasePopup: boolean = false;
  //#endregion For Boolean Variables

  //#region For Models
  listQuestionsGetFromApiGetItr = [];
  moduleProjectDefaultModel: ModuleProjectDefaultModel = new ModuleProjectDefaultModel();
  listExistingImage = [];
  listTemplateExisting = [];
  fieldDataToBind = [];
  listIdQuestionNotLinked: string[] = [];
  signatureLookUp = [];
  signatureIdIndex = []; // list property id of signatures get from template
  listSignatureCreated: SignatureObject[] = [];
  saveOptions = [
    {
      name: "Save",
      value: "save",
    },
    {
      name: "Save As",
      value: "saveAs",
    },
  ];
  //#endregion For Models

  //#region For Common Variables
  valueTableOfFieldFromDataBaseSelected: string = "";
  valueFieldOfFieldFromDataBaseSelected: string = "";
  editorDevelopMode = false;
  idAnswerElementSelected: string;
  clientState: any;
  _editor: ITRBuilderCommonModel.Editor;
  notificationError: any;
  heightEditorView: string;
  templateToPreview = ``;
  chooseSaveType = "save";
  editorViewWidth: number;
  valueTemplateNameEdited: string;
  placeholderSelectTemplateExisting: string = "Select Templace Existing";
  signatureIdSelected: string = "";
  idOfTableSelected: number = 0;
  idFieldOfTableSelected: number = 0;
  hasShowFieldFromSignaturePopup: boolean = false;
  idSignatureLinked: string = "";
  labelFieldFromSignatureSelected: string = "";
  templateCodePreviewWhenPublished: SafeHtml = "";
  isOpenConfirmCleanEditor: boolean = false;
  itrNo: string;
  projectKey: string;
  sub: Subscription;
  _settingFunc4Component = {
    load: 'load',
    clone: 'component:clone',
    selected: 'component:selected',
    create: 'component:create',
    remove: 'component:remove',
    deselected: 'component:deselected',
    dragStart: 'component:drag:start',
    dragEnd: 'component:drag:end',
  }
  //#endregion Common Variables

  constructor(
    private itrService: ITRService,
    clientState: ClientState,
    notificationError: AuthErrorHandler,
    public dialogWarningUnsaveData: MatDialog,
    private router: Router,
    private urlData: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
  ) {
    this.itrService = itrService;
    this.clientState = clientState;
    this.notificationError = notificationError;

    this.sub = this.route.params.subscribe((params) => {
      this.projectKey = params["projectKey"];
      if (!this.projectKey) {
        this.router.navigate([""]);
      }
    });
  }

  public ngOnInit() {
    this.urlData.params.subscribe((res) => {
      this.itrNo = res.itrNo;
      setTimeout(() => {
        this.clientState.isBusy = true;
        this.itrService
          .getItrBuilderByItrNo(this.projectKey, this.itrNo)
          .subscribe(
            (res) => {
              const resultExchange = GrapesJsConfig.ExchangeRawDataGetItrBuilderByItrNo(res);
              if (resultExchange) this.templateSourceCode = resultExchange;
              this.isPublished = res.isPublished;
              if (res.isPublished) {
                const rawTemplateCode = `<style>${resultExchange.Header.css}</style>${resultExchange.Header.html}
                <style>${resultExchange.Body.css}</style>${resultExchange.Body.html}
                <style>${resultExchange.Footer.css}</style>${resultExchange.Footer.html}
                <style>.rowFix{padding:0}.hidden-sub {display:none}</style>`;
                const rawTemplateRenameRow = reNameClassRowToRowFix(rawTemplateCode);
                const finallyTemplate = removeSubContent(rawTemplateRenameRow);
                this.templateCodePreviewWhenPublished = this.sanitizer.bypassSecurityTrustHtml(finallyTemplate);
                setTimeout(() => {
                  removeOuterMostRowDuplicateBorderV2();
                  this.clientState.isBusy = false;
                }, 200);
              } else {
                setTimeout(() => {
                  this.clientState.isBusy = false;
                }, 200);
                this.hasGetDataFromApi = true;
                if (this.templateSourceCode.Header.html) {
                  let idInterval = setInterval(() => {
                    if (this._editor) {
                      this.onBindingDataToEditor(this.HEADER_CONSTANT);
                      if (document.getElementById("body-tab")) { document.getElementById("body-tab").click(); }
                      if (document.getElementById("header-tab")) { document.getElementById("header-tab").click(); }
                      clearInterval(idInterval);
                    }
                  }, 250);
                }
              }
            }, (err) => {
              this.clientState.isBusy = false;
              this.notificationError.handleError(err.message);
            }
          );
      }, 100);
    });
  }

  public ngAfterViewInit() {
    let intervalRunCount = 0;
    this.moduleProjectDefaultModel = JwtTokenHelper.GetModuleProjectDefault();
    const IdIntervalCheckLoadedData = setInterval(() => {
      if (this.hasGetDataFromApi) {
        if (!document.getElementById("gjs-view-port")) return false;
        this.editorViewWidth = document.getElementById(
          "gjs-view-port"
        ).offsetWidth;
        let idInterval = setInterval(() => {
          this.heightEditorView = String(window.innerHeight - document.getElementById("gjs-view-port").getBoundingClientRect().top - 50);
          if (Number(this.heightEditorView) > 0) {
            this.heightEditorView += "px";
            this._editor = this.initializeEditor();
            this.itrService.getImageStorage().subscribe(
              (res) => {
                this.listExistingImage = GrapesJsConfig.ExchangeRawDataGetImageStorage(res);
                if (this.listExistingImage.length > 0) {
                  let listImage = [];
                  this.listExistingImage.forEach((image) => listImage.push(image.url));
                  this._editor.AssetManager.add(listImage);
                }
              },
              (err) => {
                this.notificationError.handleError(err.message);
              }
            );
            clearInterval(idInterval);
          }
        }, 200);
        this.itrService
          .getItrSignatureLookUp(this.projectKey, this.itrNo)
          .subscribe(
            (res) => {
              this.signatureLookUp = GrapesJsConfig.ExChangeRawDataGetSignatureLookUp(
                res
              );
            },
            (error) => {
              console.log(error);
            }
          );
        clearInterval(IdIntervalCheckLoadedData);
      }
      intervalRunCount++;
      if (intervalRunCount === 50) clearInterval(IdIntervalCheckLoadedData);
    }, 250);
    this.onLoadTemplateExistingByType();
  }

  isSignatureDataHasStaffSignature = (): boolean => {
    const regSearch = /data-signature-type="Staff"/g;
    let result = false;
    if (this.getFullHTML().match(regSearch).length === 1) result = true;
    return result;
  };
  isTemplateEdited(editorName = null) {
    if (editorName)
      return (
        this.templateSourceCode[editorName].isEdited ||
        this.templateSourceCode[editorName].isRename
      );
    return (
      this.templateSourceCode[this.editorViewName].isEdited ||
      this.templateSourceCode[this.editorViewName].isRename
    );
  }
  titleSaveTemplateButton = () => {
    return this.templateSourceCode[this.editorViewName].isEdited ||
      this.templateSourceCode[this.editorViewName].isRename
      ? ""
      : "Nothing changes, don't need save";
  };
  getFullHTML = (): string => {
    switch (this.editorViewName) {
      case this.HEADER_CONSTANT:
        return (
          this._editor.getHtml() +
          this.templateSourceCode.Body.html +
          this.templateSourceCode.Footer.html
        );
      case this.BODY_CONSTANT:
        return (
          this._editor.getHtml() +
          this.templateSourceCode.Header.html +
          this.templateSourceCode.Footer.html
        );
      case this.FOOTER_CONSTANT:
        return (
          this._editor.getHtml() +
          this.templateSourceCode.Header.html +
          this.templateSourceCode.Body.html
        );
      default:
        return "";
    }
  };

  onBindingDataToEditor(optionValue = null) {
    const oldStatusEdited = this.templateSourceCode[
      optionValue || this.editorViewName
    ].isEdited;
    this._editor.setComponents(
      GrapesJsConfig.AddAttributeToHtmlExport(this.templateSourceCode[optionValue || this.editorViewName].html)
      + `<style>${this.templateSourceCode[optionValue || this.editorViewName].css}</style>`
    );
    this.templateSourceCode[
      optionValue || this.editorViewName
    ].isEdited = oldStatusEdited;
    this._editor.Panels.getButton("views", "open-blocks").set("active", 1);
  }

  onClickShowEditTemplateName() {
    this.valueTemplateNameEdited = this.templateSourceCode[this.editorViewName].name;
    this.hasShowEditTemplateName = true;
  }

  onCloseEditTemplateName() {
    this.hasShowEditTemplateName = false;
    if (this.valueTemplateNameEdited.trim())
      this.templateSourceCode[this.editorViewName].name = this.valueTemplateNameEdited;
  }

  onCheckWindowResize() {
    if (
      this.editorViewWidth !=
      document.getElementById("gjs-view-port").offsetWidth
    ) {
      this.editorViewWidth = document.getElementById("gjs-view-port").offsetWidth;
      this.removeErrorLayoutTool1();
    }
  }

  removeErrorLayoutTool1() {
    this._editor.runCommand("preview");
    this._editor.stopCommand("preview");
  }

  removeErrorLayoutTool2() {
    (document.getElementById("gjs-tools") as HTMLElement).style.opacity = "0";
  }

  onSelectPublishTemplate = (event) => {
    this.hasShowConfirmPublishModal = false;
    if (event) {
      this.callApiApplyOrPublish(true);
    }
  };

  onLoadTemplateExistingByType = () => {
    this.isLoading = true;
    this.itrService
      .ItrTemplateLookUp(this.editorViewName, this.projectKey)
      .subscribe(
        (res) => {
          this.listTemplateExisting = GrapesJsConfig.ExchangeRawDataItrBuilderTemplateLookUp(res);
          this.isLoading = false;
        },
        (err) => {
          this.notificationError.handleError(err.message);
          this.isLoading = false;
        }
      );
  };

  onSelectTemplateExisting(event: any) {
    if (this.templateSourceCode[this.editorViewName].isEdited
      || this.templateSourceCode[this.editorViewName].isRename
    ) {
      const dialogRef = this.dialogWarningUnsaveData.open(
        ItrConfirmModalComponent,
        {
          width: '20vw',
          hasBackdrop: true,
          panelClass: 'custom-modalbox',
        }
      );
      dialogRef.afterClosed().subscribe((result) => {
        if (result) { this.getTemplateExistingFromDataBase(event); }
      });
    } else { this.getTemplateExistingFromDataBase(event); }
  }

  onOpenModalSaveTemplate = () => {
    if (!this.isTemplateEdited())
      return this.notificationError.handleError(
        "Nothing changes, you don't need save template"
      );
    this.isShowModalSaveTemplate = true;
  };

  saveTemplateToDataBase() {
    this.isShowModalSaveTemplate = false;
    this.clientState.isBusy = true;
    this.saveDataByEditorViewName();
    let dataSend = {
      name: this.templateSourceCode[this.editorViewName].name,
      dataHtml: this.templateSourceCode[this.editorViewName].html,
      dataCss: this.templateSourceCode[this.editorViewName].css,
      type: this.editorViewName,
      id: this.templateSourceCode[this.editorViewName].id,
      projectKey: this.projectKey,
    };
    if (this.chooseSaveType === "saveAs") dataSend.id = null;
    if (dataSend.id) {
      this.itrService.updateItrTemplate(dataSend).subscribe(
        (res) => {
          this.clientState.isBusy = false;
          this.templateSourceCode[this.editorViewName].isEdited = false;
          this.templateSourceCode[this.editorViewName].isRename = false;
          this.notificationError.handleSuccess("Save Successfully");
        },
        (err) => {
          this.clientState.isBusy = false;
          this.notificationError.handleError(err.message);
        }
      );
    } else {
      this.itrService.createItrTemplate(dataSend).subscribe(
        (res) => {
          this.clientState.isBusy = false;
          this.templateSourceCode[this.editorViewName].id = res.content.id;
          this.templateSourceCode[this.editorViewName].isEdited = false;
          this.templateSourceCode[this.editorViewName].isRename = false;
          this.placeholderSelectTemplateExisting = this.templateSourceCode[
            this.editorViewName
          ].name;
          this.onSelectPartOfTemplate(this.editorViewName);
          this.notificationError.handleSuccess("Create template successfully");
        },
        (err) => {
          this.clientState.isBusy = false;
          this.notificationError.handleError(err.message);
        }
      );
    }
    this.chooseSaveType = "save";
  }

  onDeleteExistingTemplate(isConfirm: boolean) {
    if (isConfirm) {
      this.isShowDeleteWarningModal = false;
      this.clientState.isBusy = true;
      this.itrService
        .deleteItrBuilderTemplate(
          this.templateSourceCode[this.editorViewName].id
        )
        .subscribe(
          (res) => {
            this.onCleanEditorByThisViewName();
            this.clientState.isBusy = false;
            this.notificationError.handleSuccess("Deleted successfully");
          },
          (err) => {
            this.clientState.isBusy = false;
            this.notificationError.handleError(err.message);
          }
        );
    }
  }

  onEditTemplateName(event: any) {
    if (event.keyCode === 13) this.onCloseEditTemplateName();
    else {
      this.valueTemplateNameEdited = event.target.value;
      if (
        this.templateSourceCode[this.editorViewName].originalTemplateName !=
        this.valueTemplateNameEdited
      )
        this.templateSourceCode[this.editorViewName].isRename = true;
      else this.templateSourceCode[this.editorViewName].isRename = false;
    }
  }

  onEditTemplateNameBeforeSave(event: any) {
    if (event.target.value)
      this.templateSourceCode[this.editorViewName].name = event.target.value;
    if (
      this.templateSourceCode[this.editorViewName].originalTemplateName !=
      this.templateSourceCode[this.editorViewName].name
    )
      this.templateSourceCode[this.editorViewName].isRename = true;
    else this.templateSourceCode[this.editorViewName].isRename = false;
  }

  setSymbolValueToFreeTextWidthUnit(val: any) {
    if (val) {
      valueToBindGlobal = val;
    }
  }

  handleSetupFieldFromTable(eventData: EventFieldFromDataBase) {
    if (eventData.isSave) {
      const ElementSelected = this._editor.getSelected();
      const oldAttributes = ElementSelected.getAttributes();
      oldAttributes[HTML_DATA_CUSTOM.DATA_TABLE_ID] = eventData.tableId;
      oldAttributes[HTML_DATA_CUSTOM.DATA_FIELD_ID_FORM_TABLE] =
        eventData.fieldId;
      oldAttributes[
        HTML_DATA_CUSTOM.DATA_TABLE_NAME
      ] = eventData.tableName.toLowerCase();
      oldAttributes[HTML_DATA_CUSTOM.DATA_FIELD_NAME_FORM_TABLE] =
        eventData.FieldName;
      oldAttributes[HTML_DATA_CUSTOM.DATA_CUSTOM_TYPE] =
        GrapesJsConfig.VALUE_OF_DATA_CUSTOM_TYPE.FIELD_FROM_DATABASE;
      ElementSelected.setAttributes({ ...oldAttributes });
      ElementSelected.components(
        `[${eventData.FieldName}] from [${eventData.tableName}] <button class="hidden-sub">Choose field</button>`
      );
    }
    this.hasShowFieldFromDataBasePopup = false;
  }

  onSelectCancelToLiveThisSite = () => {
    if (
      this.isTemplateEdited(this.HEADER_CONSTANT) ||
      this.isTemplateEdited(this.BODY_CONSTANT) ||
      this.isTemplateEdited(this.FOOTER_CONSTANT)
    ) {
      this.hasShowWarningUnsaveWhenClickBack = true;
    } else this.onGoBackItrList();
  };

  onConfirmBackToITRList(_eConfirmBack: any) {
    if (_eConfirmBack) this.onGoBackItrList();
  }

  onConfirmCleanEditor(_eConfirmClear: any) {
    if (_eConfirmClear) {
      this.isOpenConfirmCleanEditor = false;
      this._editor.DomComponents.clear();
      this.removeErrorLayoutTool2();
    }
  }

  onGoBackItrList() {
    this.router.navigate([
      `modules/${this.moduleProjectDefaultModel.moduleKey}/projects/${this.moduleProjectDefaultModel.projectKey}/itr-builder`,
    ]);
  }

  getTemplateExistingFromDataBase(_eExistedTemplate: any) {
    if (!_eExistedTemplate) { return; }
    if (_eExistedTemplate && _eExistedTemplate.id === "createNew") {
      this.onCleanEditorByThisViewName();
      return;
    }
    this.clientState.isBusy = true;
    this.itrService.getItrTemplateById(String(_eExistedTemplate.id)).subscribe(
      (res) => {
        this.templateSourceCode[this.editorViewName] =
          res && GrapesJsConfig.ExchangeRawDataGetItrTemplateById(res);
        this._editor.setComponents(
          GrapesJsConfig.AddAttributeToHtmlExport(
            this.templateSourceCode[this.editorViewName].html
          ) +
          `<style>${this.templateSourceCode[this.editorViewName].css}</style>`
        );
        this.templateSourceCode[this.editorViewName].isEdited = false;
        this.clientState.isBusy = false;
      },
      (error) => {
        this.notificationError.handleError(error.message);
        this.clientState.isBusy = false;
      }
    );
  }

  onCleanEditorByThisViewName() {
    this.templateSourceCode[this.editorViewName] = {
      ...this.templateSourceCode[this.editorViewName],
      ...{
        id: null,
        name: "Create New Template",
        originalTemplateName: "Create New Template",
        html: "",
        css: "",
        isEdited: false,
        isRename: false,
      }
    };
    this.onBindingDataToEditor();
  }

  onShowPreviewTemplate() {
    // this.clientState.isBusy = true;
    this.saveDataByEditorViewName();
    this.templateToPreview = `${this.templateSourceCode.Header.html}<style>${this.templateSourceCode.Header.css}
      </style>${this.templateSourceCode.Body.html}<style>${this.templateSourceCode.Body.css}
      </style>${this.templateSourceCode.Footer.html}<style>${this.templateSourceCode.Footer.css}
      </style>`;
    this.hasShowPreview = true;
    // this.clientState.isBusy = false;
    this.removeErrorLayoutTool2();
  }

  onCancelPreviewTemplate = () => {
    this.hasShowPreview = false;
    // reset style Manager tools
    document
      .querySelector(".gjs-sm-sectors.gjs-one-bg.gjs-two-color")
      .setAttribute("style", "display:none");
    document
      .querySelector(".gjs-sm-header")
      .setAttribute("style", "display:block");
  };

  saveDataByEditorViewName() {
    this.templateSourceCode[this.editorViewName].html = this._editor.getHtml();
    this.templateSourceCode[this.editorViewName].css = this._editor.getCss();
  }

  onSelectPartOfTemplate(PART_NAME_CONSTANT: string, needSaveLastEditor = false) {
    const undoManager = this._editor.UndoManager;
    this.hasShowPreview = false;
    if (!needSaveLastEditor) this.saveDataByEditorViewName();
    this.editorViewName = PART_NAME_CONSTANT;
    this.onBindingDataToEditor(PART_NAME_CONSTANT);
    this.onLoadTemplateExistingByType();
    this.removeErrorLayoutTool2();
    undoManager.clear();
  }

  isThisTemplateNameIsNotAccept() {
    return this.templateSourceCode[this.editorViewName].name ===
      "Create New Template"
      ? true
      : false;
  }

  isThisTemplateNameIsExisting() {
    return this.listTemplateExisting.some((template) => (template.value === this.templateSourceCode[this.editorViewName].name));
  }

  isAllComponentHasSetup(): boolean {
    this.pushFullHTMLToHiddenWindow();
    const listComponentNeedSetup = [];
    const hiddenContainer = document.getElementById("hidden-full-part-html");
    const listComponentCheck = [
      {
        tagName: GRAPESJS_COMPONENT_TAGNAME.SIGNATURE,
        dataCheck: HTML_DATA_CUSTOM.DATA_SIGNATURE_ID,
        label: "Signature",
      },
      {
        tagName: GRAPESJS_COMPONENT_TAGNAME.ANSWER,
        dataCheck: HTML_DATA_CUSTOM.DATA_QUESTION_LINKED,
        label: "Answer",
      },
      {
        tagName: GRAPESJS_COMPONENT_TAGNAME.FIELD_FORM_DATABASE,
        dataCheck: HTML_DATA_CUSTOM.DATA_TABLE_NAME,
        label: "Field from database",
      },
      {
        tagName: GRAPESJS_COMPONENT_TAGNAME.FIELD_FROM_SIGNATURE,
        dataCheck: HTML_DATA_CUSTOM.DATA_ID_SIGNATURE_LINKED,
        label: "Field of Signature",
      },
    ];
    const handleCheckComponentHasSetup = (
      tagName: string,
      dataNameCheck: string,
      componentName: string
    ) => {
      const listComponent = Array.from(
        hiddenContainer.getElementsByTagName(tagName)
      );
      listComponent.map((signatureComponent) => {
        if (!signatureComponent.getAttribute(dataNameCheck)) {
          listComponentNeedSetup.push(componentName);
          return;
        }
      });
    };

    listComponentCheck.map((componentCheck) =>
      handleCheckComponentHasSetup(
        componentCheck.tagName,
        componentCheck.dataCheck,
        componentCheck.label
      )
    );

    const listQuestionCreated = Array.from(
      hiddenContainer.querySelectorAll(
        `[${HTML_DATA_CUSTOM.DATA_CUSTOM_TYPE}='question']`
      )
    );
    listQuestionCreated.map((questionElement) => {
      if (!questionElement.getAttribute(HTML_DATA_CUSTOM.DATA_ANSWER_LINKED)) {
        listComponentNeedSetup.push("Question");
        return;
      }
    });
    if (listComponentNeedSetup.length > 0) {
      let message = "";
      listComponentNeedSetup.map(
        (componentNeedSetup) => (message += ` ${componentNeedSetup},`)
      );
      this.notificationError.handleError(
        `Please complete setup all block first`
      );
    }

    return !Boolean(listComponentNeedSetup.length);
  }

  onSelectApplyITR(_eApply: any) {
    if (!_eApply) return false;
    this.callApiApplyOrPublish(false);
    this.hasShowConfirmApplyItr = false;
  }

  getListSignatureCreated(): {
    signatureId: string;
    number: number;
    id: any;
  }[] {
    const result = [];
    document.getElementById(
      "hidden-full-part-html"
    ).innerHTML = this.getFullHTML();
    const ListSignatureHasAdd = Array.from(
      document.getElementsByTagName(GRAPESJS_COMPONENT_TAGNAME.SIGNATURE)
    );
    ListSignatureHasAdd.map((Signature) => {
      if (Signature.getAttribute(HTML_DATA_CUSTOM.DATA_SIGNATURE_NUMBER))
        result.push({
          signatureId: Signature.getAttribute(
            HTML_DATA_CUSTOM.DATA_SIGNATURE_ID
          ),
          number: Signature.getAttribute(
            HTML_DATA_CUSTOM.DATA_SIGNATURE_NUMBER
          ),
          id: null,
        });
    });
    return result;
  }

  callApiApplyOrPublish(isPublish: boolean) {
    if (this.hasShowPreview) this.onCancelPreviewTemplate();
    this.saveDataByEditorViewName();
    if (isPublish && !this.isAllComponentHasSetup()) return;
    const ListSignatureCreated = this.getListSignatureCreated();

    ListSignatureCreated.map((signature, index) => {
      signature["id"] = this.signatureIdIndex[index] || null;
    });

    let dataToSend = new ItrBuilderCreationModel();
    dataToSend = {
      id: this.templateSourceCode.id,
      itrId: this.templateSourceCode.idItrTemplate,
      headerHtml: this.templateSourceCode.Header.html,
      bodyHtml: this.templateSourceCode.Body.html,
      footerHtml: this.templateSourceCode.Footer.html,
      headerCss: this.templateSourceCode.Header.css,
      bodyCss: this.templateSourceCode.Body.css,
      footerCss: this.templateSourceCode.Footer.css,
      params: "",
      paramForms: "",
      questions: this.collectListQuestionAndAswerBeforeApplyItr(),
      signatures: ListSignatureCreated,
      isPublish: isPublish,
    };
    if (dataToSend.id) {
      this.itrService.updateItrBuilder(dataToSend).subscribe(
        (res) => {
          this.notificationError.handleSuccess(
            isPublish ? "Publish successfully" : "Apply ITR template successfully"
          );
        },
        (err) => {
          this.notificationError.handleError(err.message);
        }
      );
    } else {
      this.itrService.createItrBuilder(dataToSend).subscribe(
        (res) => {
          this.templateSourceCode.id = res.content.id;
          this.notificationError.handleSuccess(
            isPublish ? "Publish successfully" : "Apply ITR template successfully"
          );
        },
        (err) => {
          this.notificationError.handleError(err.message);
        }
      );
    }
  }

  collectListQuestionNotLinked() {
    const iframeWindow = (document.querySelector(
      ".gjs-frame"
    ) as HTMLFrameElement).contentWindow.document;
    this.listIdQuestionNotLinked = [];
    let listQuestion = Array.from(
      iframeWindow.querySelectorAll(
        `[${GrapesJsConfig.AnswerQuestionCustomDataAttribute.question.CustomType}=question]`
      )
    );
    listQuestion.map((questionElement) => {
      if (
        !questionElement.getAttribute(
          GrapesJsConfig.AnswerQuestionCustomDataAttribute.question.AnswerLinked
        )
      )
        this.listIdQuestionNotLinked.push(questionElement.id);
    });
  }

  collectListSignatureCreated() {
    this.pushFullHTMLToHiddenWindow();
    const listSignatureElement = document.getElementsByTagName(
      GRAPESJS_COMPONENT_TAGNAME.SIGNATURE
    );
    const newListSignatureCreated: SignatureObject[] = [];
    Array.from(listSignatureElement).map((element) => {
      if (element.getAttribute(HTML_DATA_CUSTOM.DATA_SIGNATURE_LABEL))
        newListSignatureCreated.push({
          id: element.id,
          label: element.textContent.replace(/Setup/g, ""),
        });
    });
    this.listSignatureCreated = newListSignatureCreated;
  }

  pushFullHTMLToHiddenWindow() {
    this.saveDataByEditorViewName();
    document.getElementById(
      "hidden-full-part-html"
    ).innerHTML = this.getFullHTML();
  }

  collectListQuestionAndAswerBeforeApplyItr(): any[] {
    this.pushFullHTMLToHiddenWindow();
    const listQuestion = [];
    const listAnswer = [];
    const result = [];
    const listQuestionHtmlElement = Array.from(
      document.querySelectorAll(
        `[${GrapesJsConfig.AnswerQuestionCustomDataAttribute.question.CustomType}=question]`
      )
    );
    listQuestionHtmlElement.map((questionElement) => {
      if (
        questionElement.getAttribute(
          GrapesJsConfig.AnswerQuestionCustomDataAttribute.question.AnswerLinked
        )
      )
        listQuestion.push({
          customId: questionElement.id,
          value: questionElement.textContent,
          answerLinked: questionElement.getAttribute(
            GrapesJsConfig.AnswerQuestionCustomDataAttribute.question
              .AnswerLinked
          ),
        });
    });
    const listAnswerHtmlElement = Array.from(
      document.querySelectorAll(
        `[${GrapesJsConfig.AnswerQuestionCustomDataAttribute.answer.CustomType}=answer]`
      )
    );
    listAnswerHtmlElement.map((answerElement) => {
      if (
        answerElement.getAttribute(
          GrapesJsConfig.AnswerQuestionCustomDataAttribute.answer.QuestionLinked
        )
      )
        listAnswer.push({
          customId: answerElement.id,
          type: GrapesJsConfig.Tools.converAnswerTypeFEToBE(
            answerElement.getAttribute(
              GrapesJsConfig.AnswerQuestionCustomDataAttribute.answer.AnswerType
            )
          ),
          values: this.getValueFromAnswerHTML(answerElement),
        });
    });
    listQuestion.map((question) => {
      result.push({
        id: null,
        question: question,
        answer: listAnswer.filter(
          (answer) => answer.customId === question.answerLinked
        ),
      });
    });

    if (result.length > 0 && this.listQuestionsGetFromApiGetItr.length > 0) {
      this.listQuestionsGetFromApiGetItr.map((questionOld) => {
        result.map((questionNew) => {
          if (questionNew.question.customId === questionOld.question.customId)
            questionNew.id = questionOld.id;
        });
      });
    }

    return result;
  }

  getValueFromAnswerHTML(htmlElement: HTMLElement | Element) {
    let listChildren = Array.from(htmlElement.children);
    let listAnswerCollect = [];
    switch (
    htmlElement.getAttribute(
      GrapesJsConfig.AnswerQuestionCustomDataAttribute.answer.AnswerType
    )) {
      case GrapesJsConfig.AnswerType.radio.value:
      case GrapesJsConfig.AnswerType.checkbox.value:
        {
          listChildren.map((element) => {
            if (element.tagName === "LABEL")
              listAnswerCollect.push(element.textContent);
          });
        }
        break;
      case GrapesJsConfig.AnswerType.text.value:
        {
          listChildren.map((element) => {
            if (element.tagName === "INPUT")
              listAnswerCollect.push(element.getAttribute("placeholder"));
          });
        }
        break;
      case GrapesJsConfig.AnswerType.dropdown.value:
        {
          listChildren.map((element) => {
            if (element.tagName === "SELECT")
              Array.from(element.children).map((optionElement) =>
                listAnswerCollect.push(optionElement.getAttribute("value"))
              );
          });
        }
        break;
    }
    return listAnswerCollect;
  }

  getComponentGrapesEditorByHtmlId(id: string): ITRBuilderCommonModel.ComponentGrapes {
    const iframeWindow = (document.querySelector(
      ".gjs-frame"
    ) as HTMLFrameElement).contentWindow.document;
    if (iframeWindow.getElementById(id)) {
      this._editor.select(iframeWindow.getElementById(id));
      return this._editor.getSelected();
    } else return null;
  }

  handleAnswerPopupEventClickUnlink(_eAnswerPopupUnlink: AnswerPopupSettingDataSendUnlink) {
    const answerComponent = this.getComponentGrapesEditorByHtmlId(
      _eAnswerPopupUnlink.answerId
    );
    const answerComponentAttributes = answerComponent.getAttributes();
    answerComponentAttributes[
      GrapesJsConfig.AnswerQuestionCustomDataAttribute.answer.QuestionLinked
    ] = "";
    answerComponent.addAttributes(answerComponentAttributes);

    const questionComponent = this.getComponentGrapesEditorByHtmlId(
      _eAnswerPopupUnlink.questionId
    );
    if (questionComponent) {
      const questionComponentAttributes = {};
      questionComponentAttributes[
        GrapesJsConfig.AnswerQuestionCustomDataAttribute.question.AnswerLinked
      ] = "";
      questionComponent.addAttributes(questionComponentAttributes);
    }
  }

  handleAnswerPopupEvent(_eAnswerPopup: AnswerPopupSettingDataSend) {
    if (_eAnswerPopup) {
      const answerComponent = this.getComponentGrapesEditorByHtmlId(
        _eAnswerPopup.linkedAnswerHtmlId
      );
      const answerComponentAttribute = {};
      answerComponentAttribute[
        GrapesJsConfig.AnswerQuestionCustomDataAttribute.answer.AnswerType
      ] = _eAnswerPopup.answerType;
      answerComponentAttribute[
        GrapesJsConfig.AnswerQuestionCustomDataAttribute.answer.QuestionLinked
      ] = _eAnswerPopup.newLinkedQuestionHtmlId;
      answerComponentAttribute[
        GrapesJsConfig.AnswerQuestionCustomDataAttribute.answer.HiddenLabel
      ] = _eAnswerPopup.hiddenLabel;

      answerComponent.addAttributes(answerComponentAttribute);
      answerComponent.empty({});
      answerComponent.append(
        _eAnswerPopup.answerHtmlString + '<button class="hidden-sub">Setup</button>'
      );
      if (_eAnswerPopup.newLinkedQuestionHtmlId) {
        if (_eAnswerPopup.newLinkedQuestionHtmlId != _eAnswerPopup.oldLinkedQuestionHtmlId) {
          const questionComponent = this.getComponentGrapesEditorByHtmlId(
            _eAnswerPopup.newLinkedQuestionHtmlId
          );
          const questionComponentAttributes = {};
          questionComponentAttributes[
            GrapesJsConfig.AnswerQuestionCustomDataAttribute.question.AnswerLinked
          ] = _eAnswerPopup.linkedAnswerHtmlId;
          questionComponent.addAttributes(questionComponentAttributes);
          if (_eAnswerPopup.oldLinkedQuestionHtmlId) {
            const oldQuestionComponent = this.getComponentGrapesEditorByHtmlId(
              _eAnswerPopup.oldLinkedQuestionHtmlId
            );
            const oldQuestionComponentAttributes = {};
            oldQuestionComponentAttributes[
              GrapesJsConfig.AnswerQuestionCustomDataAttribute.question.AnswerLinked
            ] = "";
            oldQuestionComponent.addAttributes(oldQuestionComponentAttributes);
          }
        }
      } else {
        // do some thing
      }
    }
    this.hasShowAnswerPopupSetting = false;
  }

  AnswersComponentPlugin = (_editor4AnswerComp: ITRBuilderCommonModel.Editor) => {
    const self = this;
    _editor4AnswerComp.DomComponents.addType(GRAPESJS_COMPONENT_TYPE.ANSWER, {
      isComponent: (el) =>
        el.tagName === GRAPESJS_COMPONENT_TAGNAME.ANSWER.toUpperCase(),
      view: {
        init() { },
        events: {
          "click button": "clickOnElement",
        },
        clickOnElement(ev: ITRBuilderCommonModel.EventClickComponentInCanvas) {
          self.collectListQuestionNotLinked();
          self.idAnswerElementSelected = ev.path[1].id;
          self.hasShowAnswerPopupSetting = true;
          // fix not select tab
          if (
            !document.querySelector(
              ".gjs-pn-btn .fa .fa-paint-brush .style-manage-button-custom .gjs-pn-active .gjs-four-color"
            )
          )
            setTimeout(() => {
              (document.getElementsByClassName(
                "style-manage-button-custom"
              )[1] as HTMLElement).click();
            }, 200);
        },
      },

      model: {
        defaults: {
          tagName: GRAPESJS_COMPONENT_TAGNAME.ANSWER,
          draggable: "div.cell",
          droppable: true,
          attributes: {},
          components: (model) =>
            `Answer <button class="hidden-sub">Setup</button>`,
        },
      },
    });
  };

  FieldFromSignatureComponentPlugin = (_editor4FFormSignature: ITRBuilderCommonModel.Editor) => {
    const self = this;
    _editor4FFormSignature.DomComponents.addType(GRAPESJS_COMPONENT_TYPE.FIELD_FROM_SIGNATURE, {
      isComponent: (el) =>
        el.tagName ===
        GRAPESJS_COMPONENT_TAGNAME.FIELD_FROM_SIGNATURE.toUpperCase(),
      view: {
        init() { },
        events: {
          "click button": "clickOnElement",
        },
        clickOnElement(ev: ITRBuilderCommonModel.EventClickComponentInCanvas) {
          self.collectListSignatureCreated();
          const elementSelected = self._editor.getSelected();
          const attributeObject = elementSelected.getAttributes();
          self.idSignatureLinked =
            attributeObject[HTML_DATA_CUSTOM.DATA_ID_SIGNATURE_LINKED] || "";
          self.labelFieldFromSignatureSelected =
            attributeObject[HTML_DATA_CUSTOM.DATA_LABEL_FIELD_OF_SIGNATURE] ||
            "";
          self.hasShowFieldFromSignaturePopup = true;
          // fix not select tab
          if (
            !document.querySelector(
              ".gjs-pn-btn .fa .fa-paint-brush .style-manage-button-custom .gjs-pn-active .gjs-four-color"
            )
          )
            setTimeout(() => {
              (document.getElementsByClassName(
                "style-manage-button-custom"
              )[1] as HTMLElement).click();
            }, 200);
        },
      },

      model: {
        defaults: {
          tagName: GRAPESJS_COMPONENT_TAGNAME.FIELD_FROM_SIGNATURE,
          draggable: "div.cell",
          droppable: true,
          attributes: {},
          components: (model) =>
            `Field from signature <button class="hidden-sub">Setup</button>`,
        },
      },
    });
  };

  openBlockPanelAction = () => {
    (document.getElementsByClassName(
      "style-manage-button-custom"
    )[1] as HTMLElement).click();
  };

  SignaturesComponentPlugin = (_editor4Signature: ITRBuilderCommonModel.Editor) => {
    const self = this;
    _editor4Signature.DomComponents.addType(GRAPESJS_COMPONENT_TYPE.SIGNATURE, {
      isComponent: (el) =>
        el.tagName === GRAPESJS_COMPONENT_TAGNAME.SIGNATURE.toUpperCase(),
      view: {
        init() { },
        events: {
          "click button": "clickOnElement",
        },
        clickOnElement(ev: ITRBuilderCommonModel.EventClickComponentInCanvas) {
          let check = true;
          if (
            this.model.attributes.attributes[HTML_DATA_CUSTOM.DATA_SIGNATURE_ID]
          ) {
            self.signatureIdSelected = this.model.attributes.attributes[
              HTML_DATA_CUSTOM.DATA_SIGNATURE_ID
            ];
          } else self.signatureIdSelected = "";

          if (check) self.hasShowSignaturePopupSetting = true;
          // fix not select tab
          if (
            !document.querySelector(
              ".gjs-pn-btn .fa .fa-paint-brush .style-manage-button-custom .gjs-pn-active .gjs-four-color"
            )
          )
            setTimeout(() => {
              self.openBlockPanelAction();
            }, 200);
        },
      },

      model: {
        defaults: {
          tagName: GRAPESJS_COMPONENT_TAGNAME.SIGNATURE,
          draggable: "div.cell",
          droppable: true,
          attributes: {},
          components: (model) => GrapesJsConfig.SignatureConst.DefaultView,
        },
      },
    });
  };

  FieldFromDataBasePlugin = (_editor4FieldForm: ITRBuilderCommonModel.Editor) => {
    const self = this;
    _editor4FieldForm.DomComponents.addType(GRAPESJS_COMPONENT_TYPE.FIELD_FROM_DATABASE, {
      isComponent: (el) =>
        el.tagName ===
        GRAPESJS_COMPONENT_TAGNAME.FIELD_FORM_DATABASE.toUpperCase(),
      view: {
        init() { },
        events: {
          "click button": "clickOnElement",
        },
        clickOnElement(ev) {
          setTimeout(() => {
            const AttributesFromElement = _editor4FieldForm.getSelected().getAttributes();
            self.idOfTableSelected =
              Number(AttributesFromElement[HTML_DATA_CUSTOM.DATA_TABLE_ID]) ||
              0;
            self.idFieldOfTableSelected =
              Number(
                AttributesFromElement[HTML_DATA_CUSTOM.DATA_FIELD_ID_FORM_TABLE]
              ) || 0;
            self.hasShowFieldFromDataBasePopup = true;
          }, 200);
        },
      },

      model: {
        defaults: {
          tagName: GRAPESJS_COMPONENT_TAGNAME.FIELD_FORM_DATABASE,
          draggable: "div.cell",
          droppable: true,
          attributes: {},
          components: (model) =>
            `Field from Database <button class="hidden-sub">Choose field</button>`,
        },
      },
    });
  };

  handleSignaturePopupEvent = (_eSignature: ITRBuilderSubModels.SignaturePopupEvent | null) => {
    if (_eSignature) {
      const SignatureSelected = this._editor.getSelected();
      if (_eSignature.signatureId) {
        const dataCustomAttribute = {};
        dataCustomAttribute[HTML_DATA_CUSTOM.DATA_SIGNATURE_ID] =
          _eSignature.signatureId;
        dataCustomAttribute[HTML_DATA_CUSTOM.DATA_SIGNATURE_LABEL] =
          _eSignature.signatureLabel;
        dataCustomAttribute[HTML_DATA_CUSTOM.DATA_SIGNATURE_NUMBER] =
          _eSignature.signatureNumber;
        SignatureSelected.addAttributes(dataCustomAttribute);
        SignatureSelected.components(
          `[Signature] ${_eSignature.signatureLabel} <button class="hidden-sub">Setup</button>`
        );
      }
    }
    this.hasShowSignaturePopupSetting = false;
  };

  handleFieldFromSignaturePopupEvent = (_eFieldForm: EventFieldFromSignature) => {
    if (_eFieldForm.isSave && _eFieldForm.signatureId) {
      const ElementSelected = this._editor.getSelected();
      const oldAttributes = ElementSelected.getAttributes();
      oldAttributes[HTML_DATA_CUSTOM.DATA_ID_SIGNATURE_LINKED] =
        _eFieldForm.signatureId;
      oldAttributes[HTML_DATA_CUSTOM.DATA_LABEL_FIELD_OF_SIGNATURE] =
        _eFieldForm.fieldLabel;
      ElementSelected.setAttributes({ ...oldAttributes });
      ElementSelected.components(
        `[${_eFieldForm.fieldLabel}] from ${_eFieldForm.signatureLabel}<button class="hidden-sub">Setup</button>`
      );
    }
    this.hasShowFieldFromSignaturePopup = false;
  };

  defaultSettingEditor(_editor4Default: ITRBuilderCommonModel.Editor) {
    let storeCurrentButtonPanels: string = "block"; // block || style
    const modal = _editor4Default.Modal;
    const canvas = _editor4Default.Canvas;
    const panelsManager = _editor4Default.Panels;
    const styleManager = _editor4Default.StyleManager;
    const domComponents = _editor4Default.DomComponents;
    const blockManager = _editor4Default.BlockManager;
    const assetManager = _editor4Default.AssetManager;
    const keymapsManager = _editor4Default.Keymaps;
    const undoManager = _editor4Default.UndoManager;
    const i18n = _editor4Default.I18n;
    const commandsControl = _editor4Default.Commands;
    const rickTextEditor = _editor4Default.RichTextEditor;
    const listEventChangeStatusIsEdited =
      GrapesJsConfig.listEventChangeStatusIsEdited;
    const listBlockRemove = GrapesJsConfig.listBlockRemove;
    const listButtonOfOptionsPanelRemove =
      GrapesJsConfig.listButtonOfOptionsPanelRemove;
    const listBlockSetDefaultAlignTrait =
      GrapesJsConfig.listBlockSetDefaultAlignTrait;

    // config style manage manual

    // canvas setting

    // editor setting

    _editor4Default.setStyle(
      'input[type="checkbox"]{height:20px; width:20px; vertical-align: sub;}'
    );

    // load setting
    _editor4Default.once(this._settingFunc4Component.load, () => {
      // add tooltip rendo , undo
      document
        .getElementsByClassName("fa-undo")[0]
        .setAttribute("title", "Undo");
      document
        .getElementsByClassName("fa-repeat")[0]
        .setAttribute("title", "Redo");

      document
        .getElementById("preview-button-itr-buider-detail")
        .addEventListener("click", () => {
          if (storeCurrentButtonPanels != "block")
            (document.getElementsByClassName(
              "fa-paint-brush"
            )[0] as HTMLElement).click();
        });
      document
        .getElementsByClassName("fa-th-large")[0]
        .addEventListener("click", () => {
          storeCurrentButtonPanels = "block";
        });
      document
        .getElementsByClassName("fa-paint-brush")[0]
        .addEventListener("click", () => {
          storeCurrentButtonPanels = "style";
        });

      // add align to style manage
      const alignContainerStyle = document.createElement("div");
      const borderContainerStyle = document.createElement("div");
      alignContainerStyle.classList.add(
        "custom-style-manager-section-container"
      );
      borderContainerStyle.classList.add(
        "custom-style-manager-section-container"
      );
      alignContainerStyle.innerHTML = GrapesJsConfig.htmlStringAlignStyleManage;
      borderContainerStyle.innerHTML =
        GrapesJsConfig.htmlStringBorderStyleManage;
      let idInterval = setInterval(() => {
        if (
          document.querySelector(".gjs-sm-sectors.gjs-one-bg.gjs-two-color")
        ) {
          const ContainerElement = document.querySelector(
            ".gjs-sm-sectors.gjs-one-bg.gjs-two-color"
          ) as HTMLElement;
          ContainerElement.append(borderContainerStyle);
          ContainerElement.append(alignContainerStyle);

          GrapesJsConfig.AutoAddEventAlignButtonInStyleManage(_editor4Default);
          GrapesJsConfig.AutoAddEventBorderButtonInStyleManage(_editor4Default);
          GrapesJsConfig.AddChangeDisplayArrowOfAlignSector();
          clearInterval(idInterval);
        }
      }, 500);

      // hidde title block manage section
      document
        .getElementsByClassName("gjs-title")[0]
        .setAttribute("hidden", "true");

      // fix full screen

      document
        .getElementById("gjs-view-port")
        .append(document.getElementById("id-itr-builder-container-modal"));
      this.templateSourceCode.Header.isEdited = false;
    });

    const autoAddBorderCell = (
      element: ITRBuilderCommonModel.ComponentGrapes
    ) => {
      const _oldAttribute = element.getAttributes();
      if (!_oldAttribute[HTML_DATA_CUSTOM.DATA_CELL_OF]) {
        const oldStyle = element.getStyle();
        const listDirect = ["top", "left", "right", "bottom"];
        listDirect.map((direct) => {
          if (!oldStyle[`border-${direct}-width`])
            oldStyle[`border-${direct}-width`] = "1px";
          if (!oldStyle[`border-${direct}-style`])
            oldStyle[`border-${direct}-style`] = "solid";
          if (!oldStyle[`border-${direct}-color`])
            oldStyle[`border-${direct}-color`] = "rgb(0, 0, 0)";
        });
        element.setStyle(oldStyle);
      }
      element.addAttributes({
        [HTML_DATA_CUSTOM.DATA_CELL_OF]: this.editorViewName,
      });
    };

    listEventChangeStatusIsEdited.map((eventName) =>
      _editor4Default.on(eventName, () => {
        this.templateSourceCode[this.editorViewName].isEdited = true;
      })
    );

    // clone setting
    _editor4Default.on(
      this._settingFunc4Component.clone,
      (_eClone: ITRBuilderCommonModel.ComponentGrapes = null) => {
        this.templateSourceCode[this.editorViewName].isEdited = true;

        // handle clone signature

        if (_eClone.getAttributes()[HTML_DATA_CUSTOM.DATA_SIGNATURE_NUMBER]) {
          const oldAttribute = _eClone.getAttributes();
          delete oldAttribute[HTML_DATA_CUSTOM.DATA_SIGNATURE_NUMBER];
          delete oldAttribute[HTML_DATA_CUSTOM.DATA_SIGNATURE_ID];
          delete oldAttribute[HTML_DATA_CUSTOM.DATA_SIGNATURE_LABEL];
          _eClone.setAttributes(oldAttribute);
          _eClone.components(GrapesJsConfig.SignatureConst.DefaultView);
        }

        // handle when clone question or answer linked
        const _getAttributesClone = _eClone.getAttributes();
        if (_getAttributesClone[GrapesJsConfig.AnswerQuestionCustomDataAttribute.answer.QuestionLinked]
          || _getAttributesClone[GrapesJsConfig.AnswerQuestionCustomDataAttribute.question.AnswerLinked]) {
          const newAttributes = {};
          newAttributes[GrapesJsConfig.AnswerQuestionCustomDataAttribute.answer.QuestionLinked] = "";
          newAttributes[GrapesJsConfig.AnswerQuestionCustomDataAttribute.question.AnswerLinked] = "";
          _eClone.addAttributes(newAttributes);
        }
      }
    );

    // selected setting
    _editor4Default.on(
      this._settingFunc4Component.selected,
      (_eSelected: ITRBuilderCommonModel.ComponentGrapes = null) => {
        if (_eSelected.parent()) {
          switch (_eSelected.parent().props().type) {
            case GRAPESJS_COMPONENT_TYPE.FIELD_FROM_DATABASE:
            case GRAPESJS_COMPONENT_TYPE.SPECIAL_SYMBOL:
            case GRAPESJS_COMPONENT_TYPE.ANSWER:
            case GRAPESJS_COMPONENT_TYPE.SIGNATURE:
            case GRAPESJS_COMPONENT_TYPE.FIELD_FROM_SIGNATURE:
              _editor4Default.select(_eSelected.parent());
              break;
          }
          // handle select cell wrapper
          // if (document.getElementById("border-direct-control-custom-id")) {
          //   if (
          //     event.parent().parent() &&
          //     event.parent().parent().props().type ===
          //       GRAPESJS_COMPONENT_TYPE.bodyWrapper
          //   ) {
          //     (document.getElementById(
          //       "border-direct-control-custom-id"
          //     ) as HTMLElement).style.opacity = "0.5";
          //     (document.getElementById(
          //       "border-direct-control-custom-id"
          //     ) as HTMLElement).style["pointer-events"] = "none";
          //   } else {
          //     (document.getElementById(
          //       "border-direct-control-custom-id"
          //     ) as HTMLElement).style.opacity = "1";
          //     (document.getElementById(
          //       "border-direct-control-custom-id"
          //     ) as HTMLElement).style["pointer-events"] = "auto";
          //   }
          // }
        }

        if (storeCurrentButtonPanels === "block")
          (document.getElementsByClassName(
            "fa-th-large"
          )[0] as HTMLElement).click();

        if (_eSelected.props().name === "Row") {
          document
            .querySelector(".gjs-sm-sectors.gjs-one-bg.gjs-two-color")
            .setAttribute("style", "display:none");
        } else {
          document
            .querySelector(".gjs-sm-sectors.gjs-one-bg.gjs-two-color")
            .setAttribute("style", "display:block");
        }
        // handle display border. align section style manage

        if (_eSelected.props().type === GRAPESJS_COMPONENT_TYPE.BODY_WRAPPER) {
          const ListSectionsCustom = Array.from(
            document.getElementsByClassName(
              "custom-style-manager-section-container"
            )
          );
          ListSectionsCustom.map((SectionCustom) => {
            SectionCustom.setAttribute("hidden", "true");
          });
        } else {
          const ListSectionsCustom = Array.from(
            document.getElementsByClassName(
              "custom-style-manager-section-container"
            )
          );
          ListSectionsCustom.map((SectionCustom) => {
            SectionCustom.removeAttribute("hidden");
          });
        }

        // develop mode features
        if (this.editorDevelopMode) {
          const iframeWindow = (document.querySelector(".gjs-frame") as HTMLFrameElement).contentWindow.document;

          if (
            _eSelected.getAttributes()[
            GrapesJsConfig.AnswerQuestionCustomDataAttribute.question
              .AnswerLinked
            ]
          )
            iframeWindow.getElementById(
              _eSelected.getAttributes()[
              GrapesJsConfig.AnswerQuestionCustomDataAttribute.question
                .AnswerLinked
              ]
            ).style.outline = "2px solid #3b97e3";

          switch (_eSelected.props().type) {
            case GRAPESJS_COMPONENT_TYPE.ANSWER:
              {
                if (
                  _eSelected.getAttributes()[
                  GrapesJsConfig.AnswerQuestionCustomDataAttribute.answer
                    .QuestionLinked
                  ]
                ) {
                  iframeWindow.getElementById(
                    _eSelected.getAttributes()[
                    GrapesJsConfig.AnswerQuestionCustomDataAttribute.answer
                      .QuestionLinked
                    ]
                  ).style.outline = "2px solid #3b97e3";
                }
              }
              break;
            case GRAPESJS_COMPONENT_TYPE.TEXT:
              {
                if (_eSelected.getEl().textContent === "Insert text here")
                  _eSelected.components(
                    `<span style="padding: 5px; display:inline-block;">-</span>`
                  );
              }
              break;
          }
        }

        // check css border
        if (_eSelected.props().name != "Row") {
          const _divBorderIds = ListBorderDivIds;
          const ComponentStyle: Object = _eSelected.getStyle();
          const _selected = "row itr-border-selected",
            _unselected = "row itr-border-unselected";

          // reset border css
          _divBorderIds.forEach((_id) => {
            (document.getElementById(
              _id
            ) as HTMLInputElement).className = _unselected;
          });
          // set css border direct selected
          if (ComponentStyle && ComponentStyle != {}) {
            let _count = 0;
            Object.keys(ComponentStyle).forEach((key) => {
              switch (key) {
                case "border-top-style":
                  (document.getElementById(
                    "topBorderDiv"
                  ) as HTMLInputElement).className = _selected;
                  _count++;
                  break;
                case "border-left-style":
                  (document.getElementById(
                    "leftBorderDiv"
                  ) as HTMLInputElement).className = _selected;
                  _count++;
                  break;
                case "border-right-style":
                  (document.getElementById(
                    "rightBorderDiv"
                  ) as HTMLInputElement).className = _selected;
                  _count++;
                  break;
                case "border-bottom-style":
                  (document.getElementById(
                    "bottomBorderDiv"
                  ) as HTMLInputElement).className = _selected;
                  _count++;
                  break;
              }
            });

            if (_count === 4) {
              (document.getElementById(
                "allBorderDiv"
              ) as HTMLInputElement).className = _selected;
            } else if (_count === 0) {
              (document.getElementById(
                "noBorderDiv"
              ) as HTMLInputElement).className = _selected;
            }
          }
        }
      }
    );

    // create setting
    _editor4Default.on(
      this._settingFunc4Component.create,
      (
        _eCreate: ITRBuilderCommonModel.EventEditorOnComponentCreateModel = null
      ) => {
        this.templateSourceCode[this.editorViewName].isEdited = true;
        if (
          _eCreate.parent() &&
          _eCreate.parent().props().type === GRAPESJS_COMPONENT_TYPE.BODY_WRAPPER
        ) {
          const CustomAttribute = {};
          CustomAttribute[HTML_DATA_CUSTOM.DATA_CUSTOM_TYPE] =
            VALUE_OF_DATA_CUSTOM_TYPE.OUTER_MOST_ROW;
          _eCreate.addAttributes(CustomAttribute);
          _eCreate
            .props()
            .components.models.map((cellElement) =>
              autoAddBorderCell(cellElement)
            );
        }
        // handle align cell when create
        switch (_eCreate.props().type) {
          case GRAPESJS_COMPONENT_TYPE.FIELD_FROM_SIGNATURE:
          case GRAPESJS_COMPONENT_TYPE.FIELD_FROM_DATABASE:
          case GRAPESJS_COMPONENT_TYPE.ANSWER:
          case GRAPESJS_COMPONENT_TYPE.SIGNATURE: {
            _eCreate.setId(_eCreate.getId());
            if (_eCreate.parent()) {
              const parentELementStyle = _eCreate.parent().getStyle();
              if (!parentELementStyle["justify-content"]) {
                _eCreate.parent().setStyle({
                  ...parentELementStyle,
                  display: "flex",
                  "justify-content": "center",
                  "align-items": "center",
                });
              }
            }
          }
        }

        // handle set default align
        if (
          _eCreate.parent() &&
          _eCreate.parent().props().name === "Cell" &&
          _eCreate.props().name != "Row"
        ) {
          const oldParentStyle = _eCreate.parent().getStyle();
          oldParentStyle["display"] = "flex";
          oldParentStyle["align-items"] = "center";
          _eCreate.parent().setStyle(oldParentStyle);
        }
      }
    );

    // remove setting
    _editor4Default.on(
      this._settingFunc4Component.remove,
      (
        _eRemove: ITRBuilderCommonModel.EventEditorOnComponentCreateModel = null
      ) => {
        // handle when remove question
        if (
          _eRemove.attributes.attributes[
          GrapesJsConfig.AnswerQuestionCustomDataAttribute.question.CustomType
          ] === "question"
        ) {
          if (
            _eRemove.attributes.attributes[
            GrapesJsConfig.AnswerQuestionCustomDataAttribute.question
              .AnswerLinked
            ]
          ) {
            const answerLinked = this.getComponentGrapesEditorByHtmlId(
              _eRemove.attributes.attributes[
              GrapesJsConfig.AnswerQuestionCustomDataAttribute.question
                .AnswerLinked
              ]
            );
            if (answerLinked) {
              const answerLinkedAttributes = {};
              answerLinkedAttributes[
                GrapesJsConfig.AnswerQuestionCustomDataAttribute.answer.QuestionLinked
              ] = "";
              answerLinked.addAttributes(answerLinkedAttributes);
            }
          }
        }
        // handle when delete answer
        if (
          _eRemove.attributes.attributes[
          GrapesJsConfig.AnswerQuestionCustomDataAttribute.answer
            .QuestionLinked
          ]
        ) {
          const questionLinked = this.getComponentGrapesEditorByHtmlId(
            _eRemove.attributes.attributes[
            GrapesJsConfig.AnswerQuestionCustomDataAttribute.answer
              .QuestionLinked
            ]
          );
          if (questionLinked) {
            const questionLinkedAttributes = {};
            questionLinkedAttributes[
              GrapesJsConfig.AnswerQuestionCustomDataAttribute.question.AnswerLinked
            ] = "";
            questionLinked.addAttributes(questionLinkedAttributes);
          }
        }
        this.templateSourceCode[this.editorViewName].isEdited = true;

        if (_eRemove.parent()) {
          const parentProperty = _eRemove.parent().props();
          if (
            parentProperty.type != GRAPESJS_COMPONENT_TYPE.BODY_WRAPPER &&
            parentProperty.name === "Cell" &&
            parentProperty.components.length == 0
          ) {
            let ParentStyle = _eRemove.parent().getStyle();
            delete ParentStyle["display"];
            delete ParentStyle["justify-content"];
            delete ParentStyle["align-items"];
            _eRemove.parent().setStyle(ParentStyle);
          }
          if (
            parentProperty.name === "Row" &&
            parentProperty.components.length === 0
          ) {
            _eRemove.parent().remove();
          }
        }
      }
    );

    // deselected setting
    _editor4Default.on(this._settingFunc4Component.deselected, (_eDeselected) =>
      GrapesJsConfig.EditorOnManage.handleComponentDeSelected(
        _eDeselected,
        this.editorDevelopMode
      )
    );

    // drag start setting
    _editor4Default.on(
      this._settingFunc4Component.dragStart,
      GrapesJsConfig.EditorOnManage.handleComponentDragStart
    );

    // drag end setting
    _editor4Default.on(
      this._settingFunc4Component.dragEnd,
      GrapesJsConfig.EditorOnManage.handleComponentDragEnd
    );

    // trait manager setitng

    // panels manager setting
    const styleManagerButton = panelsManager.getButton("views", "open-sm");
    const blockManagerButton = panelsManager.getButton("views", "open-blocks");

    styleManagerButton.attributes.className += " style-manage-button-custom ";
    blockManagerButton.attributes.className += " style-manage-button-custom ";

    panelsManager.removePanel("devices-c");
    panelsManager.removeButton("views", "open-layers");
    panelsManager.removeButton("views", "open-tm");
    listButtonOfOptionsPanelRemove.map((buttonId) =>
      panelsManager.removeButton("options", buttonId)
    );
    panelsManager.getButton("options", "sw-visibility").set("active", 1);

    // panelsManager.addButton("options", [
    //   {
    //     className: "fa fa-flask",
    //     command: "change_editor_mode",
    //     attributes: {
    //       title: "Develop mode",
    //     },
    //   },
    // ]);

    // block manager setting
    listBlockRemove.map((blockId) => blockManager.remove(blockId));
    GrapesJsConfig.listCustomBlockManage.map((block) =>
      blockManager.add(block.id, block)
    );
    blockManager.get("text").set({
      content: `<span style="padding: 5px; display:inline-block;">Insert text here</span>`,
    });

    blockManager.add(
      GrapesJsConfig.Add1CellConfig.id,
      GrapesJsConfig.Add1CellConfig
    );

    blockManager.add(
      GrapesJsConfig.Add2CellConfig.id,
      GrapesJsConfig.Add2CellConfig
    );

    blockManager.render();

    // style manager setting
    styleManager.removeSector("decorations");
    styleManager.removeSector("general");
    styleManager.removeSector("extra");
    // domComponent setting
    listBlockSetDefaultAlignTrait.map((block) =>
      domComponents.addType(block, {
        model: {
          defaults: {
            draggable: "div.cell",
            droppable: false,
          },
        },
      })
    );

    GrapesJsConfig.DisabledBadgeAllComponentTypes(domComponents);

    domComponents.getWrapper().set({ badgable: false, selectable: false });
    // keymaps default setting
    keymapsManager.add("ns:editor-develop-mode-open", "alt+o", () => {
      commandsControl.run("change_editor_mode");
    });

    keymapsManager.add("ns:editor-develop-mode-close", "alt+c", () => {
      commandsControl.stop("change_editor_mode");
    });
    // Settings commands
    commandsControl.add("canvas-clear", () => {
      document.getElementById("showConfirmCleanEditorButton")?.click();
    });

    commandsControl.add("change_editor_mode", {
      run: () => {
        this.editorDevelopMode = true;
        document
          .getElementById("border-color-editor-develop-mode")
          .removeAttribute("hidden");

        this.notificationError.handleError(
          "Warning: Additional features in development mode are not yet stable"
        );
      },
      stop: () => {
        document
          .getElementById("border-color-editor-develop-mode")
          .setAttribute("hidden", "true");
        this.editorDevelopMode = false;
      },
    });

    //undo manage

    // i18n setting
    // modal
    // rtx

    rickTextEditor.remove("link");

    // end default setting
  }

  initializeEditor(): any {
    let editor = grapesjs.init({
      colorPicker: {
        appendTo: "parent",
        offset: { top: 26, left: -166 },
      },
      i18n: {
        locale: "en",
        localeFallback: "en",
        detectLocale: false,
      },
      storageManager: { type: null },
      avoidInlineStyle: 1,
      height: this.heightEditorView,
      container: "#gjs-view-port",
      fromElement: true,
      showOffsets: 1,
      assetManager: {
        embedAsBase64: 1,
      },
      selectorManager: { componentFirst: true },
      styleManager: {},
      plugins: [
        this.FieldFromSignatureComponentPlugin,
        this.SignaturesComponentPlugin,
        this.AnswersComponentPlugin,
        this.FieldFromDataBasePlugin,
        UnitSymbolTypePlugin,
        "grapesjs-parser-postcss",
        "grapesjs-preset-webpage",
        GrapesJsConfig.configLanguagePlugin,
      ],
      pluginsOpts: {},
    });

    this.defaultSettingEditor(editor);

    return editor;
  }
}

const showListSymbolModal = () => {
  document
    .getElementsByClassName("container-symbol-modal")[0]
    .classList.remove("d-none");
}
let valueToBindGlobal = "";
const isModalHidden = (className, type = "class") => {
  if (type === "id")
    return document.getElementById(className).classList.contains("d-none");
  return document
    .getElementsByClassName(className)[0]
    .classList.contains("d-none");
};

const UnitSymbolTypePlugin = (editor) => {
  editor.DomComponents.addType("specical-symbol-type", {
    isComponent: (el) =>
      el.tagName === GRAPESJS_COMPONENT_TAGNAME.SYMBOL_UNIT.toUpperCase(),
    view: {
      init() { },
      events: {
        "click span": "clickOnElement",
      },
      clickOnElement(ev) {
        showListSymbolModal();
        let idRun = setInterval(() => {
          if (valueToBindGlobal) {
            this.model.components(`${valueToBindGlobal}<span>▼</span>`);
            valueToBindGlobal = "";
            clearInterval(idRun);
          } else if (isModalHidden("container-symbol-modal")) {
            clearInterval(idRun);
          }
        }, 500);
      },
    },

    model: {
      defaults: {
        tagName: GRAPESJS_COMPONENT_TAGNAME.SYMBOL_UNIT,
        draggable: "div.cell",
        droppable: true,
        attributes: {},
        components: (model) => `Unit Symbol <span>▼</span>`,
      },
    },
  });
};