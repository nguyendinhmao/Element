import GrapesJsConfig from "./grapesJs-editor-config";

export default {
  converAnswerTypeFEToBE: (answerTypeFE: string): string => {
    switch (answerTypeFE) {
      case GrapesJsConfig.AnswerType.radio.value:
        return GrapesJsConfig.AnswerTypeBackEnd.radio.value;
      case GrapesJsConfig.AnswerType.checkbox.value:
        return GrapesJsConfig.AnswerTypeBackEnd.checkbox.value;
      case GrapesJsConfig.AnswerType.dropdown.value:
        return GrapesJsConfig.AnswerTypeBackEnd.dropdown.value;
      case GrapesJsConfig.AnswerType.text.value:
        return GrapesJsConfig.AnswerTypeBackEnd.inputCell.value;
      default: {
        return GrapesJsConfig.AnswerTypeBackEnd.radio.value;
      }
    }
  },

  /**
   * @example
   * replace signature-component to default
   */
  converHTMLBeforeSaveTemplate: (htmlRaw: string): string => {
    const regSearch = /<\s*signatures-component[^>]*>(.*?)<\s*\/\s*signatures-component>/g;
    const listSignatures = htmlRaw.match(regSearch);
    if (listSignatures) {
      const idRegSearch = /id="[^"]+"/g;
      listSignatures.map((signature) => {
        const arrayResult = signature.match(idRegSearch);
        htmlRaw = htmlRaw.replace(
          signature,
          `<signatures-component ${arrayResult[0]}>Signature <button class="hidden-sub">Setup</button></signatures-component>`
        );
      });
    }
    return htmlRaw;
  },
  getListValueFromHTMLSource: (
    htmlRaw: string,
    dataName: string = "signatureid"
  ): string[] => {
    const result = [];
    const regSearch = new RegExp(`${dataName}="[^"]+"`, "g");
    const resultSearch = htmlRaw.match(regSearch) || [];
    resultSearch.map((resultString) => {
      result.push(resultString.replace(`${dataName}="`, "").replace('"', ""));
    });
    return result;
  },
};
