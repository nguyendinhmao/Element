import GrapesJsConfig from "./grapesJs-editor-config";

export default {
  ExchangeRawDataGetItrBuilderByItrNo: (rawData) => {
    if (rawData.itrId)
      return {
        idItrTemplate: rawData.itrId,
        id: rawData.id,
        Header: {
          id: null,
          name: `Header Template ${rawData.itrNo}`,
          originalTemplateName: `Header Template ${rawData.itrNo}`,
          html: rawData.headerHtml || "",
          css: rawData.headerCss || "",
          isEdited: false,
          isRename: false,
        },
        Body: {
          id: null,
          name: `Body Template ${rawData.itrNo}`,
          originalTemplateName: `Body Template ${rawData.itrNo}`,
          html: rawData.bodyHtml || "",
          css: rawData.bodyCss || "",
          isEdited: false,
          isRename: false,
        },
        Footer: {
          id: null,
          name: `Footer Template ${rawData.itrNo}`,
          originalTemplateName: `Footer Template ${rawData.itrNo}`,
          html: rawData.footerHtml || "",
          css: rawData.footerCss || "",
          isEdited: false,
          isRename: false,
        },
        questionAndAnswer: rawData.questions,
      };
    else return null;
  },
  ExchangeRawDataItrBuilderTemplateLookUp: (rawData) => {
    let standardData = [
      {
        id: "createNew",
        value: "+ Create New Template",
      },
      {
        id: "ddb1995",
        value: "[Existing template]",
        disabled: true,
      },
    ];
    rawData.map((data) => {
      standardData.push({
        id: data.id,
        value: data.value,
      });
    });
    return standardData;
  },
  ExchangeRawDataGetItrTemplateById: (rawData) => {
    return {
      id: rawData.id,
      name: rawData.name,
      originalTemplateName: rawData.name,
      html: rawData.dataHtml,
      css: rawData.dataCss,
      isEdited: false,
      isRename: false,
    };
  },
  ExchangeRawDataGetImageStorage: (rawData) => {
    let standardData = [];
    rawData.items &&
      rawData.items.map((data) => {
        standardData.push({
          id: data.id,
          name: data.name,
          url: data.url,
        });
      });
    return standardData;
  },
  ExchangeDataSignatureLookup: (rawData) => {
    const newList = [];
    if (rawData.content && rawData.content.length > 0) {
      rawData.content.map((data) => {
        newList.push({
          id: data.id,
          value: data.value,
          number: data.number,
        });
      });
    }
    return newList;
  },
};
