import ITRBuilderCommonModel from "../../../../../shared/models/itr-tab/itr-builder-common-ddb.model";
import GrapesJsConfig from "./../grapesJs-editor-config/grapesJs-editor-config";
import * as GRAPESJS_COMPONENT_TYPE from "./grapesjs-component-type";

export default {
  handleComponentDeSelected: (
    event: ITRBuilderCommonModel.ComponentGrapes = null,
    editorDevelopMode: boolean
  ) => {
    // develop mode
    if (editorDevelopMode) {
      const iframeWindow = (document.querySelector(
        ".gjs-frame"
      ) as HTMLFrameElement).contentWindow.document;

      if (
        event.getAttributes()[
          GrapesJsConfig.AnswerQuestionCustomDataAttribute.question.AnswerLinked
        ]
      )
        iframeWindow.getElementById(
          event.getAttributes()[
            GrapesJsConfig.AnswerQuestionCustomDataAttribute.question
              .AnswerLinked
          ]
        ).style.outline = "0";

      switch (event.props().type) {
        case GRAPESJS_COMPONENT_TYPE.ANSWER:
          {
            if (
              event.getAttributes()[
                GrapesJsConfig.AnswerQuestionCustomDataAttribute.answer
                  .QuestionLinked
              ]
            ) {
              iframeWindow.getElementById(
                event.getAttributes()[
                  GrapesJsConfig.AnswerQuestionCustomDataAttribute.answer
                    .QuestionLinked
                ]
              ).style.outline = "0";
            }
          }
          break;
        case "text":
          {
            if (
              event.getEl().textContent === "" ||
              event.getEl().textContent === "-"
            )
              event.components("Insert text here");
          }
          break;
      }
    }
  },

  handleComponentDragEnd: (
    event: ITRBuilderCommonModel.EventComponetDragStart
  ) => {
    // handle drag answer,signature component

    switch (event.target.props().type) {
      case GRAPESJS_COMPONENT_TYPE.ANSWER:
      case GRAPESJS_COMPONENT_TYPE.SIGNATURE: {
        const oldStyle = event.parent.getStyle();
        oldStyle["display"] = "flex";
        oldStyle["justify-content"] = "center";
        oldStyle["align-items"] = "center";
        event.parent.setStyle(oldStyle);
      }
    }
  },

  handleComponentDragStart: (
    event: ITRBuilderCommonModel.EventComponetDragStart
  ) => {
    // handle drag answer component,signature component

    switch (event.target.props().type) {
      case GRAPESJS_COMPONENT_TYPE.ANSWER:
      case GRAPESJS_COMPONENT_TYPE.SIGNATURE: {
        const oldStyle = event.parent.getStyle();
        delete oldStyle["display"];
        delete oldStyle["justify-content"];
        delete oldStyle["align-items"];
        event.parent.setStyle(oldStyle);
      }
    }
  },
};
