import ITRBuilderCommonModel from "../../../../../shared/models/itr-tab/itr-builder-common-ddb.model";
import { ListBorderDivIds } from '../data/data';

const createBorderObjForStyleManage = (direct, name) => ({
  name: name,
  property: `border-${direct}`,
  type: "composite",
  properties: [
    {
      name: "Border Width",
      property: `border-${direct}-width`,
      type: "select",
      defaults: "1px",
      list: [
        {
          value: "1px",
          name: "Default",
        },
        {
          value: "2px",
          name: "Thick",
        },
        {
          value: "4px",
          name: "Thicker",
        },
        {
          value: "8px",
          name: "Thickness",
        },
      ],
    },
    {
      name: "Border Style",
      property: `border-${direct}-style`,
      type: "select",
      defaults: "solid",
      list: [
        {
          value: "solid",
          name: "Solid",
        },
        {
          value: "dashed",
          name: "Dashed",
        },
        {
          value: "dotted",
          name: "Dotted",
        },
        {
          value: "double",
          name: "Double",
        },
        {
          value: "initial",
          name: "Initial",
        },
      ],
    },
    {
      name: "Border Color",
      property: `border-${direct}-color`,
      type: "color",
    },
  ],
});

export default {
  AddChangeDisplayArrowOfAlignSector: () => {
    document
      .getElementById("align-style-manage-sector")
      .addEventListener("click", () => {
        const listIcons = document.getElementsByClassName(
          "align-style-manage-sector-icon-arrows"
        );
        const rightButton = listIcons[1] as HTMLElement;
        const downButton = listIcons[0] as HTMLElement;
        if (rightButton.style.display != "none")
          rightButton.style.display = "none";
        else rightButton.style.display = "initial";
        if (downButton.style.display != "none")
          downButton.style.display = "none";
        else downButton.style.display = "initial";
      });
  },

  AutoAddEventBorderButtonInStyleManage: (
    editor: ITRBuilderCommonModel.Editor
  ) => {
    const ListDirect = ["bottom", "top", "right", "left"];
    const ListBorderButton = Array.from(
      document.querySelectorAll(".itr-border-btn-wrap")
    );

    const addAnimationArrowIcon = () => {
      document
        .getElementById("border-style-manage-sector")
        .addEventListener("click", () => {
          const listIcons = document.getElementsByClassName(
            "border-style-manage-sector-icon-arrows"
          );
          const rightButton = listIcons[1] as HTMLElement;
          const downButton = listIcons[0] as HTMLElement;
          if (rightButton.style.display != "none")
            rightButton.style.display = "none";
          else rightButton.style.display = "initial";
          if (downButton.style.display != "none")
            downButton.style.display = "none";
          else downButton.style.display = "initial";
        });
    };

    const handleChangeInputAttributeBorder = (id: string, property: string) => {
      document.getElementById(id).addEventListener("change", (event: any) => {
        const ListComponentSelected = editor.getSelectedAll();
        ListComponentSelected.map((ComponentSelected) => {
          const ComponentStyle = ComponentSelected.getStyle();
          ListDirect.map((direct) => {
            if (ComponentStyle[`border-${direct}-style`])
              ComponentStyle[`border-${direct}-${property}`] =
                event.target.value;
          });
          ComponentSelected.setStyle(ComponentStyle);
        });
      });
    };

    const deleteBorderAttribute = (Component: any, direct: string) => {
      delete Component[`border-${direct}-style`];
      delete Component[`border-${direct}-width`];
      delete Component[`border-${direct}-color`];
    };

    const addBorderAttribute = (
      Component: any,
      direct: string,
      StyleValue: string,
      WidthValue: string,
      ColorValue: string
    ) => {
      Component[`border-${direct}-style`] = StyleValue;
      Component[`border-${direct}-width`] = WidthValue;
      Component[`border-${direct}-color`] = ColorValue;
    };

    const handleClickBorderDirect = (direct: string) => {
      const ListComponentSelected = editor.getSelectedAll();
      const StyleValue = (document.getElementById(
        "border-style-select-custom"
      ) as HTMLInputElement).value;
      const WidthValue = (document.getElementById(
        "border-width-select-custom"
      ) as HTMLInputElement).value;
      const ColorValue = (document.getElementById(
        "border-color-select-custom"
      ) as HTMLInputElement).value;
      // const IsSelectMulti = ListComponentSelected.length > 1 ? true : false;
      ListComponentSelected.map((ComponentSelected) => {
        if (ComponentSelected.props().name != "Row") {
          const ComponentStyle = ComponentSelected.getStyle();
          // if (IsSelectMulti) {
          //   addBorderAttribute(
          //     ComponentStyle,
          //     direct,
          //     StyleValue,
          //     WidthValue,
          //     ColorValue
          //   );
          // } else {
            if (ComponentStyle[`border-${direct}-style`]) {
              deleteBorderAttribute(ComponentStyle, direct);
            } else {
              addBorderAttribute(
                ComponentStyle,
                direct,
                StyleValue,
                WidthValue,
                ColorValue
              );
            }
          // }
          ComponentSelected.setStyle(ComponentStyle);
          changeSelectedBorderBy(direct, ComponentStyle[`border-${direct}-style`]);
          checkAllBorderDivOn(ComponentStyle);
        }
      });
    };

    const changeSelectedBorderBy = (direct: String, isDirect: boolean) => {
      const _selected = 'row itr-border-selected', _unselected = 'row itr-border-unselected';
      let _classAssign = isDirect ? _selected : _unselected;
      switch (direct){
        case 'bottom':
            (document.getElementById("bottomBorderDiv") as HTMLInputElement).className = _classAssign;
            break;
        case 'top':
            (document.getElementById("topBorderDiv") as HTMLInputElement).className = _classAssign;
            break;
        case 'right':
            (document.getElementById("rightBorderDiv") as HTMLInputElement).className = _classAssign;
            break;
        case 'left':
            (document.getElementById("leftBorderDiv") as HTMLInputElement).className = _classAssign;
            break;
      }
    };

    const checkAllBorderDivOn = (componentSelectedStyle) => {
      const _selected = 'row itr-border-selected', _unselected = 'row itr-border-unselected';
      let _count = 0;
      Object.keys(componentSelectedStyle).forEach(key => {
        switch (key) {
          case 'border-top-style':
            _count++;
            break;
          case 'border-left-style':
            _count++;
            break;
          case 'border-right-style':
            _count++;
            break;
          case 'border-bottom-style':
            _count++;
            break;
        }
      });

      if(_count === 0){
        (document.getElementById("allBorderDiv") as HTMLInputElement).className = _unselected;
        (document.getElementById("noBorderDiv") as HTMLInputElement).className = _selected;
      } else if (_count === 4){
        (document.getElementById("allBorderDiv") as HTMLInputElement).className = _selected;
        (document.getElementById("noBorderDiv") as HTMLInputElement).className = _unselected;
      } else {
        (document.getElementById("allBorderDiv") as HTMLInputElement).className = _unselected;
        (document.getElementById("noBorderDiv") as HTMLInputElement).className = _unselected;
      }
    }

    const handleClickNoBorder = () => {
      const ListComponentSelected = editor.getSelectedAll();
      ListComponentSelected.map((ComponentSelected) => {
        if (ComponentSelected.props().name != "Row") {
          const ComponentStyle = ComponentSelected.getStyle();
          ListDirect.map((direct) => {
            deleteBorderAttribute(ComponentStyle, direct);
          });
          ComponentSelected.setStyle(ComponentStyle);
        }
      });
      changeNoOrAllBorder('no');
    };

    const handleClickAllBorder = () => {
      const StyleValue = (document.getElementById(
        "border-style-select-custom"
      ) as HTMLInputElement).value;
      const WidthValue = (document.getElementById(
        "border-width-select-custom"
      ) as HTMLInputElement).value;
      const ColorValue = (document.getElementById(
        "border-color-select-custom"
      ) as HTMLInputElement).value;
      const ListComponentSelected = editor.getSelectedAll();
      ListComponentSelected.map((ComponentSelected) => {
        if (ComponentSelected.props().name != "Row") {
          const ComponentStyle = ComponentSelected.getStyle();
          ListDirect.map((direct) => {
            addBorderAttribute(
              ComponentStyle,
              direct,
              StyleValue,
              WidthValue,
              ColorValue
            );
          });
          ComponentSelected.setStyle(ComponentStyle);
        }
      });
      changeNoOrAllBorder('all');
    };

    const changeNoOrAllBorder = (type: String) => {
      const _listBorderDivIds = ListBorderDivIds;
      const _selected = 'row itr-border-selected', _unselected = 'row itr-border-unselected';
      let _classAssign = type === "all" ? _selected : _unselected;
      _listBorderDivIds.forEach(_id => {
          (document.getElementById(_id) as HTMLInputElement).className =  _classAssign;
      });
      if(type === 'all'){
        (document.getElementById("noBorderDiv") as HTMLInputElement).className = _unselected;
      } else {
        (document.getElementById("noBorderDiv") as HTMLInputElement).className = _selected;
      }
    };

    ListBorderButton.map((Button) => {
      const ButtonHtml = Button as HTMLElement;
      switch (ButtonHtml.getAttribute("data-control-border")) {
        case "no":
          ButtonHtml.addEventListener("click", () => handleClickNoBorder());
          break;
        case "all":
          ButtonHtml.addEventListener("click", () => handleClickAllBorder());
          break;
        default:
          ButtonHtml.addEventListener("click", () =>
            handleClickBorderDirect(
              ButtonHtml.getAttribute("data-control-border")
            )
          );
          break;
      }
    });

    handleChangeInputAttributeBorder("border-color-select-custom", "color");
    handleChangeInputAttributeBorder("border-style-select-custom", "style");
    handleChangeInputAttributeBorder("border-width-select-custom", "width");
    addAnimationArrowIcon();
  },

  AutoAddEventAlignButtonInStyleManage: (
    editor: ITRBuilderCommonModel.Editor
  ) => {
    const listButtonAndValue = [
      {
        className: "id-buttonLeft",
        value: {
          display: "initial",
          "justify-content": "initial",
          "align-items": "baseline",
        },
      },
      {
        className: "id-buttonCenter",
        value: {
          display: "flex",
          "justify-content": "center",
          "align-items": "baseline",
        },
      },
      {
        className: "id-buttonRight",
        value: {
          display: "flex",
          "justify-content": "flex-end",
          "align-items": "baseline",
        },
      },
      {
        className: "id-buttonBottomVertically",
        value: {
          display: "flex",
          "justify-content": "initial",
          "align-items": "flex-end",
        },
      },
      {
        className: "id-buttonCenterVertically",
        value: {
          display: "flex",
          "justify-content": "initial",
          "align-items": "center",
        },
      },
      {
        className: "id-buttonCenterParent",
        value: {
          display: "flex",
          "justify-content": "center",
          "align-items": "center",
        },
      },
      {
        className: "id-buttonBottomCenter",
        value: {
          display: "flex",
          "justify-content": "center",
          "align-items": "flex-end",
        },
      },
      {
        className: "id-buttonBottomRight",
        value: {
          display: "flex",
          "justify-content": "flex-end",
          "align-items": "flex-end",
        },
      },
      {
        className: "id-buttonRightCenterVertically",
        value: {
          display: "flex",
          "justify-content": "flex-end",
          "align-items": "center",
        },
      },
    ];
    const addEventToButton = (className, valueToBind) => {
      document.querySelector("." + className).addEventListener("click", () => {
        const listElementSelect = editor.getSelectedAll();
        listElementSelect.map((childElement) => {
          if (childElement.getName() != "Row") {
            if (childElement.getName() != "Cell") {
              const parentElement = childElement.parent();
              const parentELementStyle = parentElement.getStyle();
              parentElement.setStyle({ ...parentELementStyle, ...valueToBind });
            } else {
              const childElementStyle = childElement.getStyle();
              childElement.setStyle({ ...childElementStyle, ...valueToBind });
            }
          }
        });
      });
    };
    listButtonAndValue.map((buttonValue) =>
      addEventToButton(buttonValue.className, buttonValue.value)
    );
  },
};
