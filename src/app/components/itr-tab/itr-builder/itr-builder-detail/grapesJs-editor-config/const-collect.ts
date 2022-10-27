import "../itr-builder-detail.component.scss";
import * as HTML_DATA_CUSTOM from "./html-data-custom";

export const AnswerTypeFromBE = {
  CHECKBOX: "CHECKBOX",
  RADIO: "RADIO",
  INPUTCELL: "INPUTCELL",
  DROPDOWN: "DROPDOWN",
};

export default {
  SignatureConst: {
    DataSignatureType: "data-signature-type",
    DataSignatureLabel: "data-signature-label",
    DataSignatureSignatureId: "data-signature-signatureid",
    DefaultView: `Signature <button class="hidden-sub">Setup</button>`,
  },

  HEADER_CONSTANT: "Header",
  BODY_CONSTANT: "Body",
  FOOTER_CONSTANT: "Footer",

  AnswerTypeBackEnd: {
    checkbox: {
      value: "CHECKBOX",
      id: 1,
    },
    radio: {
      value: "RADIO",
      id: 2,
    },
    dropdown: {
      value: "DROPDOWN",
      id: 3,
    },
    inputCell: {
      value: "INPUTCELL",
      id: 4,
    },
  },

  AnswerTypeFrontEnd: {
    radio: {
      label: "Radio",
      value: "Radio",
    },
    checkbox: {
      label: "Checkbox",
      value: "Checkbox",
    },
    dropdown: {
      label: "Dropdown",
      value: "Dropdown",
    },
    text: {
      label: "Input cell",
      value: "Input cell",
    },
  },

  AnswerQuestionCustomDataAttribute: {
    question: {
      CustomType: HTML_DATA_CUSTOM.DATA_CUSTOM_TYPE,
      AnswerLinked: HTML_DATA_CUSTOM.DATA_ANSWER_LINKED,
    },
    answer: {
      CustomType: HTML_DATA_CUSTOM.DATA_CUSTOM_TYPE,
      QuestionLinked: HTML_DATA_CUSTOM.DATA_QUESTION_LINKED,
      AnswerType: HTML_DATA_CUSTOM.DATA_ANSWER_TYPE,
      CustomLabel: HTML_DATA_CUSTOM.DATA_CUSTOM_LABEL,
      CheckBoxAnswer: HTML_DATA_CUSTOM.DATA_CHECK_BOX_ANSWER,
      HiddenLabel: HTML_DATA_CUSTOM.DATA_HIDDEN_LABEL,
      IdChildInGroup: HTML_DATA_CUSTOM.DATA_INDEX_IN_GROUP,
    },
  },

  TemplateSourceCodeDefault: {
    id: null,
    idItrTemplate: null,
    Header: {
      id: null,
      name: "Header Template New",
      originalTemplateName: "Header Template New",
      html: "",
      css: "",
      isEdited: false,
      isRename: false,
    },
    Body: {
      id: null,
      name: "Body Template New",
      originalTemplateName: "Body Template New",
      html: "",
      css: "",
      isEdited: false,
      isRename: false,
    },
    Footer: {
      id: null,
      name: "Footer Template New",
      originalTemplateName: "Footer Template New",
      html: "",
      css: "",
      isEdited: false,
      isRename: false,
    },
    questionAndAnswer: { id: null },
  },
  listBlockRemove: [
    "video",
    "map",
    "column3-7",
    "link",
    "link-block",
    "countdown",
    "quote",
    "h-navbar",
    "column1",
    "column2",
    "column3",
    "form",
    "input",
    "button",
    "text-basic",
    "radio",
    "textarea",
    "checkbox",
    "label",
    "select",
  ],
  listButtonOfOptionsPanelRemove: [
    "preview",
    "export-template",
    "gjs-open-import-webpage",
  ],
  listEventChangeStatusIsEdited: [
    "component:add",
    "component:update",
    "component:styleUpdate",
  ],
  listBlockSetDefaultAlignTrait: ["text", "image", "input", "checkbox"],
  htmlStringAlignStyleManage: `
  <div data-toggle="collapse"
   style="font-weight: lighter;
  background-color: rgba(0, 0, 0, 0.1);
  letter-spacing: 1px;
  padding: 9px 10px 9px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.25);
  text-align: left;
  position: relative;
  cursor: pointer;" 
  id="align-style-manage-sector" href="#collapseAlignStyleManager" role="button" aria-expanded="false" class="gjs-sm-sector no-select" aria-controls="collapseAlignStyleManager">
   <i class="fa fa-caret-down align-style-manage-sector-icon-arrows" style="margin-right: 4px; display: none;"></i><i class="fa fa-caret-right align-style-manage-sector-icon-arrows" style="margin-right: 4px;"></i> Align
  </div>
<div class="collapse container" id="collapseAlignStyleManager" style="padding-top: 10px;">
<div class="row">
<div class="col-4 text-center">
<img src="assets/img/layout-2.png" class="itr-builder-align-custom-icon id-buttonLeft" alt="Top left" title="Top left" /></div>
<div class="col-4 text-center">
<img src="assets/img/layout-5.png" class="itr-builder-align-custom-icon id-buttonCenter" alt="Center Top" title="Center Top" />
</div>
<div class="col-4 text-center">
<img src="assets/img/layout-6.png" class="itr-builder-align-custom-icon id-buttonRight" alt="Right Top" title="Right Top"/>
</div>
<div class="col-4 text-center">
<img src="assets/img/layout-1.png" class="itr-builder-align-custom-icon id-buttonCenterVertically" alt="Center Vertically" title="Center Vertically" />
</div>
<div class="col-4 text-center">
<img src="assets/img/layout-7.png" class="itr-builder-align-custom-icon id-buttonCenterParent" alt="Center perant" title="Center parent" />
</div>
<div class="col-4 text-center">
<img src="assets/img/layout-9.png" class="itr-builder-align-custom-icon id-buttonRightCenterVertically" alt="Vertically right" title="Vertically right"/>
</div>
<div class="col-4 text-center">
<img src="assets/img/layout-3.png" class="itr-builder-align-custom-icon id-buttonBottomVertically" alt="Bottom left" title="Bottom left"/>
</div>
<div class="col-4 text-center">
<img src="assets/img/layout-4.png" class="itr-builder-align-custom-icon id-buttonBottomCenter" alt="Bottom center" title="Bottom center"/>
</div>
<div class="col-4 text-center">
<img src="assets/img/layout-8.png" class="itr-builder-align-custom-icon id-buttonBottomRight" alt="Bottom right" title="Bottom right"/>
</div>
</div>
</div>
`,
  htmlStringBorderStyleManage: `
  <div
      data-toggle="collapse"
      style="
        font-weight: lighter;
        background-color: rgba(0, 0, 0, 0.1);
        letter-spacing: 1px;
        padding: 9px 10px 9px 20px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.25);
        text-align: left;
        position: relative;
        cursor: pointer;
      "
      id="border-style-manage-sector"
      href="#collapseBorderStyleManager"
      role="button"
      aria-expanded="false"
      class="gjs-sm-sector no-select"
      aria-controls="collapseBorderStyleManager"
    >
      <i
        class="fa fa-caret-down border-style-manage-sector-icon-arrows"
        style="margin-right: 4px; display: none;"
      ></i
      ><i
        class="fa fa-caret-right border-style-manage-sector-icon-arrows"
        style="margin-right: 4px;"
      ></i>
      Border
    </div>
    <div
      class="collapse container"
      id="collapseBorderStyleManager"
      style="padding-top: 10px;"
    >
      <div class="row" id="border-direct-control-custom-id">
        <div class="itr-row-contain-border">
          <div id="bottomBorderDiv" class="row">
            <div class="itr-border-btn-wrap" data-control-border="bottom">
              <div class="col-4 itr-border-icon-wrap">
                <input type="image" id="bottomBorder" src="assets/img/itr-builder/border-bottom.png" class="itr-border-icon" alt="Bottom border"
                title="Bottom border" />
              </div>
              <span class="col-8 itr-border-label">Bottom Border</span>
            </div>
          </div>
        </div>
        <div class="itr-row-contain-border">
          <div id="topBorderDiv" class="row">
            <div class="itr-border-btn-wrap" data-control-border="top">
              <div class="col-4 itr-border-icon-wrap">
                <input type="image" id="topBorder" src="assets/img/itr-builder/border-top.png"
                  class="itr-border-icon" alt="Top Border" title="Top border" />
              </div>
              <span class="col-8 itr-border-label">Top Border</span>
            </div>
          </div>
        </div>
        <div class="itr-row-contain-border">
          <div id="leftBorderDiv" class="row">
            <div class="itr-border-btn-wrap" data-control-border="left">
              <div class="col-4 itr-border-icon-wrap">
                <input type="image" id="leftBorder" src="assets/img/itr-builder/border-left.png"
                  class="itr-border-icon" alt="Left border" title="Left border" />
              </div>
              <span class="col-8 itr-border-label">Left Border</span>
            </div>
          </div>
        </div>
        <div class="itr-row-contain-border">
          <div id="rightBorderDiv" class="row">
            <div class="itr-border-btn-wrap" data-control-border="right">
              <div class="col-4 itr-border-icon-wrap">
                <input type="image" id="rightBorder" src="assets/img/itr-builder/border-right.png"
                  class="itr-border-icon" alt="Right border" title="Right border" />
              </div>
              <span class="col-8 itr-border-label">Right Border</span>
            </div>
          </div>
        </div>
        <div class="col-12">
          <hr style="border-top: 1px solid rgb(234, 224, 224);" />
        </div>
        <div class="itr-row-contain-border">
          <div id="noBorderDiv" class="row">
            <div class="itr-border-btn-wrap" data-control-border="no">
              <div class="col-4 itr-border-icon-wrap">
                <input type="image" id="noBorder" src="assets/img/itr-builder/border-none.png"
                  class="itr-border-icon" alt="No border" title="No border" />
              </div>
              <span class="col-8 itr-border-label">No Border</span>
            </div>
          </div>
        </div>
        <div class="itr-row-contain-border">
          <div id="allBorderDiv" class="row">
            <div class="itr-border-btn-wrap" data-control-border="all">
              <div class="col-4 itr-border-icon-wrap">
                <input type="image" id="allBorder" src="assets/img/itr-builder/border-all.png"
                  class="itr-border-icon" alt="Border all" title="Border all" />
              </div>
              <span class="col-8 itr-border-label">All Border</span>
            </div>
          </div>
        </div>
      </div>
  <div class="row">
    <div class="col-12">
      <hr style="border-top: 1px solid rgb(234, 224, 224);" />
    </div>
    <div class="col-6 text-left">Width</div>
    <div class="col-6 text-right" style="margin-bottom: 10px;">
      <select style="width: 67px;" id="border-width-select-custom">
        <option value="1px">Default</option>
        <option value="2px">Medium</option>
        <option value="3px">Thick</option>
        <option value="4px">Thicker</option>
      </select>
    </div>
    <div class="col-6 text-left">
      Style
    </div>
    <div class="col-6 text-right" style="margin-bottom: 10px;">
      <select style="width: 67px;" id="border-style-select-custom">
        <option value="solid">Solid</option>
        <option value="dotted">Dotted</option>
        <option value="dashed">Dashed</option>
        <option value="double">Double</option>
      </select>
    </div>
    <div class="col-12" id="border-color-editor-develop-mode" hidden>
      <div class="container" style="padding: 0;">
        <div class="row">
          <div class="col-6 text-left">Color</div>
          <div class="col-6 text-right">
            <input type="color" id="border-color-select-custom" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`,
};
