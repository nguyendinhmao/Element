import SubModel from "./grapesjs-sub-model-ddb.model";
namespace ITRBuilderCommonModel {
  export interface Editor {
    on: Function; 
    getHtml: Function;
    getCss: Function;
    getComponents: Function;
    getWrapper: Function;
    setComponents: Function;
    addComponents: Function;
    getStyle: Function;
    setStyle: Function;
    getSelected: SubModel.EditorGetSelected;
    getSelectedAll: SubModel.EditorGetSelectedAll;
    getSelectedToStyle: Function;
    select: Function;
    selectAdd: Function;
    selectRemove: Function;
    runCommand: Function;
    stopCommand: SubModel.EditorStopCommand;
    store: Function;
    load: Function;
    getContainer: Function;
    off: Function; 
    destroy: Function;
    once: Function;
    getConfig: Function; 
    setDevice: Function;
    
    Canvas: CanvasManage;
    Panels: PanelsManager;
    StyleManager: StyleManager;
    DomComponents: DomComponentManager;
    BlockManager: any;
    AssetManager: any;
    Keymaps: any;
    UndoManager: any;
    I18n: any;
    Commands: CommandsManage;
    TraitManager: any;
    SelectorManager: SelectorManager;
    Modal: any;
    RichTextEditor: any;
  }

  export interface SelectorManager {
    getConfig?: Function;
    setState?: Function;
    getState?: Function;
    add?: Function;
    addClass?: Function;
    get?: Function; 
    getAll?: Function;
    escapeName?: Function;
  }

  export interface StyleManager {
    getConfig: Function;
    addSector: Function;
    getSector: Function; 
    removeSector: Function;
    getSectors: Function;
    addProperty: Function;
    getProperty: Function;
    removeProperty: Function;
    getProperties: Function;
    getModelToStyle: Function;
    addType: Function;
    getType: Function;
    getTypes: Function;
    createType: Function;
    setTarget: Function;
  }

  export interface PanelsManager {
    getPanels: Function;
    getPanelsEl: Function;
    addPanel: Function;
    removePanel: Function;
    getPanel: Function;
    addButton: Function;
    removeButton: Function;
    getButton: SubModel.PanelsManagerGetButton;
  }

  export interface CanvasManage {
    getConfig: Function;
    getElement: Function;
    getFrameEl: Function;
    getWindow: Function;
    getDocument: Function;
    getBody: Function;
    getWrapperEl: Function;
    setCustomBadgeLabel: Function;
    getRect: Function;
    hasFocus: Function;
    scrollTo: Function;
    setZoom: Function;
    getZoom: Function;
    addFrame: Function;
  }

  export interface DomComponentManager {
    getWrapper: SubModel.DomComponentManagerWetWrapper;
    getComponents: Function;
    addComponent: Function;
    clear: Function;
    addType: Function;
    getType: Function;
    removeType: Function;
    getTypes: SubModel.DomComponentManagerGetTypes;
  }

  export interface ComponentGrapes {
    removed: Function; 
    is: Function; 
    props: SubModel.ComponentGrapesProps; 
    setDragMode: Function;
    find: Function; 
    findType: Function;
    closest: Function;
    closestType: Function;
    replaceWith: Function; 
    setAttributes: Function; 
    addAttributes: Function; 
    getStyle: Function; 
    setStyle: Function;
    getAttributes: Function; 
    addClass: Function;
    setClass: Function;
    removeClass: Function;
    getClasses: Function;
    append: Function;
    components: SubModel.ComponentGrapesComponents; 
    empty: Function; 
    parent: SubModel.ComponentGrapesParent; 
    getTrait: Function;
    updateTrait: Function;
    getTraitIndex: Function;
    removeTrait: Function;
    addTrait: Function;
    getName: Function; 
    getIcon: Function;
    toHTML: Function;
    getId: Function;
    setId: Function;
    getEl: SubModel.ComponentGrapesGetEl;
    getView: Function;
    remove: Function; 
    getList: Function;
    checkId: Function;
  }

  export interface ComponentProperties {
    type?: string;
    tagName?: string;
    attributes?: any; 
    name?: string;
    removable?: boolean;
    draggable?: boolean | string; 
    droppable?: any;
    badgable?: boolean;
    stylable?: boolean;
    unstylable?: string[];
    highlightable?: boolean;
    copyable?: boolean;
    resizable?: boolean | any;
    editable?: boolean;
    layerable?: boolean;
    selectable?: boolean;
    hoverable?: boolean;
    void?: boolean;
    content?: string;
    icon?: string;
    script?: string;
    traits?: any[];
    propagate?: string[];
    toolbar?: any[];
    components?: any;
    state?: string;
    status?: boolean;
  }

  export interface CommandsManage {
    add?: Function;
    get?: Function;
    extend?: Function;
    has?: Function;
    getAll?: Function; 
    run?: Function;
    stop?: Function;
    isActive?: Function;
    getActive?: Function;
  }

  export interface EventEditorOnComponentCreateModel extends ComponentGrapes {
    attributes?: ComponentProperties;
    ccid?: string; 
    changed?: any;
    cid?: string;
    collection?: any;
    config?: any;
    em?: any;
    frame?: any;
    opt?: any;
    rule?: any;
    view?: any;
    views?: any;
    _changing?: boolean;
    _events?: any;
    _listenId?: string;
    _listeners?: any;
    _listeningTo?: any;
    _pending?: boolean;
    _previousAttributes?: ComponentProperties;
  }

  export interface EventComponetDragStart {
    index?: number;
    parent?: ComponentGrapes;
    target?: ComponentGrapes;
  }

  export interface EventClickComponentInCanvas {
    type?: string;
    path?: SubModel.EventClickComponentInCanvasPaths;
  }
}

export default ITRBuilderCommonModel;
