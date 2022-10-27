import ITRBuilderCommonModel from "../../../../../shared/models/itr-tab/itr-builder-common-ddb.model";

export default (editor: ITRBuilderCommonModel.Editor) => {
  editor.I18n.addMessages({
    en: {
      styleManager: {
        sectors: { typography: "Font" },
        properties: {
          "background-repeat": "Repeat",
          "background-position": "Position",
          "background-attachment": "Attachment",
          "background-size": "Size",
        },
      },
      panels: { buttons: { titles: { "open-blocks": "Object" } } },
      assetManager: {
        addButton: "Using Url",
        inputPlh: "Input url here",
      },
    },
  });
};
