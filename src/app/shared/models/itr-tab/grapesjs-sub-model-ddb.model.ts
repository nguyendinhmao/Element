import ITRBuilderCommonModel from "./itr-builder-common-ddb.model";

namespace SubModel {
  export interface PanelsButton {
    set?: PanelsButtonSet;
    attributes?: PanelsButtonAttributes;
  }

  export interface ComponentGrapesProps {
    (): ITRBuilderCommonModel.ComponentProperties;
  }

  export interface ComponentGrapesParent {
    (): ITRBuilderCommonModel.ComponentGrapes;
  }

  export interface EditorGetSelected {
    (): ITRBuilderCommonModel.ComponentGrapes;
  }

  export interface EditorGetSelectedAll {
    (): ITRBuilderCommonModel.ComponentGrapes[];
  }
  export interface WrapperComponentGrapes
    extends ITRBuilderCommonModel.ComponentGrapes {
    set: Function;
  }
  export interface DomComponentManagerWetWrapper {
    (): WrapperComponentGrapes;
  }
  export interface PanelsManagerGetButton {
    (panelId: string, buttonId: string): PanelsButton;
  }
  export interface EditorStopCommand {
    (id: string, option?: any): any;
  }

  export interface DomComponentManagerGetTypes {
    (): DomComponentManagerComponentType[];
  }

  export interface ComponentGrapesProps {
    (): ITRBuilderCommonModel.ComponentProperties
  }

  export interface EditorAddComponents {
    (component: any): ITRBuilderCommonModel.ComponentGrapes
  }

  export interface DomComponentManagerComponentType {
    id: string;
    model: any;
    view: any;
  }

  export interface UndoManageGetStack {
    (): UndoManageGetStackCollection;
  }

  export interface ComponentGrapesComponents {
    (components: ITRBuilderCommonModel.ComponentGrapes | string): ITRBuilderCommonModel.ComponentGrapes[]
  }

  export interface ComponentGrapesGetEl {
    (): HTMLElement;
  }

  export interface UndoManageGetStackCollection {
    length?: number;
    maximumStackLength?: 500;
    models?: any[];
    pointer?: number;
    track?: boolean;
    _byId?: any;
  }
  export interface EventClickComponentInCanvasPaths {
    id?: string;
    innerHTML?: string;
    innerText?: string;
    localName?: string;
    outerHTML?: string;
    tagName?: string;
  }
  export interface PanelsButtonSet {
    (attribute: string, value: any): any;
  }
  export interface PanelsButtonAttributes {
    className: any;
  }
}

export default SubModel;
