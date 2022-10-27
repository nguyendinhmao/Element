import * as GRAPESJS_COMPONENT_TAGNAME from "./grapesjs-component-tagName";
import * as GRAPESJS_COMPONENT_TYPE from "./grapesjs-component-type";
import BlockCustom from "./blocks-custom";

export default {
  listCustomBlockManage: [
    {
      id: BlockCustom.Add3CellConfig.id,
      label: BlockCustom.Add3CellConfig.label,
      content: BlockCustom.Add3CellConfig.content,
    },
    // {
    //   id: BlockCustom.Add4CellConfig.id,
    //   label: BlockCustom.Add4CellConfig.label,
    //   content: BlockCustom.Add4CellConfig.content,
    // },
    {
      id: GRAPESJS_COMPONENT_TYPE.FIELD_FROM_DATABASE,
      label: `<div class="mb-2"><img src="/assets/img/itr-builder/database.png"/></div><span>Field from database</span>`,
      content: `<${GRAPESJS_COMPONENT_TAGNAME.FIELD_FORM_DATABASE} style="margin-left:5px;"></${GRAPESJS_COMPONENT_TAGNAME.FIELD_FORM_DATABASE}>`,
    },
    {
      id: GRAPESJS_COMPONENT_TYPE.SPECIAL_SYMBOL,
      label: `<div class="mb-2"><img src="/assets/img/itr-builder/text-unit.png"/></div><span>Unit Symbol</span>`,
      content: `<${GRAPESJS_COMPONENT_TAGNAME.SYMBOL_UNIT}></${GRAPESJS_COMPONENT_TAGNAME.SYMBOL_UNIT}>`,
    },
    {
      id: "qrcode-template-type",
      label: `<div class="mb-2"><img src="/assets/img/itr-builder/qr-code.png"/></div><span>QRCode</span>`,
      content: `<img style="width: 150px" src="data:image/png;base64,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"/>`,
    },
    {
      id: "question-template-type",
      label: `<div class="mb-2"><img src="/assets/img/itr-builder/question.png"/></div><span>Question</span>`,
      content: `<span style="padding:5px" data-custom-type="question">Input Question Here</span>`,
    },
    {
      id: GRAPESJS_COMPONENT_TYPE.ANSWER,
      label: `<div class="mb-2"><img style="height: 33px;" src="/assets/img/itr-builder/answer3.png"/></i></div><span>Answer</span>`,
      content: `<${GRAPESJS_COMPONENT_TAGNAME.ANSWER} data-custom-type="answer"></${GRAPESJS_COMPONENT_TAGNAME.ANSWER}>`,
    },
    {
      id: GRAPESJS_COMPONENT_TYPE.SIGNATURE,
      label: `<div class="mb-2"><img style="height: 33px;" src="/assets/img/itr-builder/signatureIcon.png"/></i></div><span>Signature</span>`,
      content: `<${GRAPESJS_COMPONENT_TAGNAME.SIGNATURE}></${GRAPESJS_COMPONENT_TAGNAME.SIGNATURE}>`,
    },
    {
      id: GRAPESJS_COMPONENT_TYPE.FIELD_FROM_SIGNATURE,
      label: `<div class="mb-2"><img style="height: 33px;" src="/assets/img/itr-builder/contact.png"/></i></div><span>Field from Signature</span>`,
      content: `<${GRAPESJS_COMPONENT_TAGNAME.FIELD_FROM_SIGNATURE}></${GRAPESJS_COMPONENT_TAGNAME.FIELD_FROM_SIGNATURE}>`,
    },
  ],
};
