import LanguageConfig from "./language";
import BlocksCustom from "./blocks-custom";
import ExchangeRawData from "./exchanges-raw-data";
import StyleManageCustom from "./style-manage";
import ConstCollect from "./const-collect";
import DomComponentManage from "./dom-component-manage";
import BlockManage from "./blocks-manage";
import HTMLExportConfig from "./html-export-config";
import Tools from "./tools";
import EditorOnManage from "./editor-on-manage";
import * as HTML_DATA_CUSTOM from "./html-data-custom";
import * as VALUE_OF_DATA_CUSTOM_TYPE from "./value-of-data-custom-type";
import * as GRAPESJS_COMPONENT_TYPE from "./grapesjs-component-type";
import * as GRAPESJS_COMPONENT_TAGNAME from "./grapesjs-component-tagName";

export default {
  GRAPESJS_COMPONENT_TAGNAME: GRAPESJS_COMPONENT_TAGNAME,
  GRAPESJS_COMPONENT_TYPE: GRAPESJS_COMPONENT_TYPE,

  VALUE_OF_DATA_CUSTOM_TYPE: VALUE_OF_DATA_CUSTOM_TYPE,

  HTML_DATA_CUSTOM: HTML_DATA_CUSTOM,
  SignatureConst: ConstCollect.SignatureConst,

  EditorOnManage: EditorOnManage,
  DisabledBadgeAllComponentTypes:
    DomComponentManage.DisabledBadgeAllComponentTypes,

  Tools: Tools,

  AnswerQuestionCustomDataAttribute:
    ConstCollect.AnswerQuestionCustomDataAttribute,
  AnswerTypeBackEnd: ConstCollect.AnswerTypeBackEnd,
  AnswerType: ConstCollect.AnswerTypeFrontEnd,

  configLanguagePlugin: LanguageConfig,

  listCustomBlockManage: BlockManage.listCustomBlockManage,

  HEADER_CONSTANT: ConstCollect.HEADER_CONSTANT,
  BODY_CONSTANT: ConstCollect.BODY_CONSTANT,
  FOOTER_CONSTANT: ConstCollect.FOOTER_CONSTANT,
  TemplateSourceCodeDefault: ConstCollect.TemplateSourceCodeDefault,

  AddAttributeToHtmlExport: HTMLExportConfig.AddAttributeToHtmlExport,

  Add1CellConfig: BlocksCustom.Add1CellConfig,

  Add2CellConfig: BlocksCustom.Add2CellConfig,
  Add3CellConfig: BlocksCustom.Add3CellConfig,
  Add4CellConfig: BlocksCustom.Add4CellConfig,

  ExchangeRawDataGetItrBuilderByItrNo:
    ExchangeRawData.ExchangeRawDataGetItrBuilderByItrNo,
  ExchangeRawDataItrBuilderTemplateLookUp:
    ExchangeRawData.ExchangeRawDataItrBuilderTemplateLookUp,
  ExchangeRawDataGetItrTemplateById:
    ExchangeRawData.ExchangeRawDataGetItrTemplateById,
  ExchangeRawDataGetImageStorage:
    ExchangeRawData.ExchangeRawDataGetImageStorage,

  ExChangeRawDataGetSignatureLookUp:
    ExchangeRawData.ExchangeDataSignatureLookup,

  listBlockRemove: ConstCollect.listBlockRemove,
  listButtonOfOptionsPanelRemove: ConstCollect.listButtonOfOptionsPanelRemove,

  listEventChangeStatusIsEdited: ConstCollect.listEventChangeStatusIsEdited,

  listBlockSetDefaultAlignTrait: ConstCollect.listBlockSetDefaultAlignTrait,

  htmlStringAlignStyleManage: ConstCollect.htmlStringAlignStyleManage,
  htmlStringBorderStyleManage: ConstCollect.htmlStringBorderStyleManage,
  AddChangeDisplayArrowOfAlignSector:
    StyleManageCustom.AddChangeDisplayArrowOfAlignSector,

  AutoAddEventAlignButtonInStyleManage:
    StyleManageCustom.AutoAddEventAlignButtonInStyleManage,
  AutoAddEventBorderButtonInStyleManage:
    StyleManageCustom.AutoAddEventBorderButtonInStyleManage,
};
