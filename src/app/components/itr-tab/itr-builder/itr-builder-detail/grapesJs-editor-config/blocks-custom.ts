const stepChangeWhenResizeCell = 0.2; // default 0.2

const initStyleRowCellDefault = `<style>
.row {
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  flex-wrap: nowrap;
  padding: 5px;
  outline-color: #3071b8 !important;
  min-height: 60px;
}

.cell {
  min-height: 40px;
  flex-grow: 1;
  flex-basis: 100%;
  outline-color: #3071b8 !important;
  position: relative;
}

@media (max-width: 768px) {
  .row {
    flex-wrap: wrap;
  }
}
</style>`;

export default {
  Add4CellConfig: {
    id: "add4CellConfig",
    label: `<div class="mb-2"><img src="/assets/img/itr-builder/3colum.png" style="height: 33px;"/></div><span>4 Colum</span>`,
    attributes: {
      class: "gjs-fonts gjs-f-b2",
    },
    category: {
      id: "Basic",
      label: "Basic",
    },
    content: `
        <div class="row" data-gjs-droppable=".cell" data-gjs-resizable='{"tl":0,"tc":0,"tr":0,"cl":0,"cr":0,"bl":0,"br":0,"minDim":1}' data-gjs-name="Row">
          <div class="cell" data-gjs-draggable=".row" data-gjs-resizable='{"tl":0,"tc":0,"tr":0,"cl":0,"cr":1,"bl":0,"br":0,"minDim":1,"bc":0,"currentUnit":1,"step":${stepChangeWhenResizeCell},"keyWidth":"flex-basis"}' data-gjs-name="Cell" data-gjs-unstylable='["width, height"]' data-gjs-stylable-require='["flex-basis"]'></div>
          <div class="cell" data-gjs-draggable=".row" data-gjs-resizable='{"tl":0,"tc":0,"tr":0,"cl":0,"cr":1,"bl":0,"br":0,"minDim":1,"bc":0,"currentUnit":1,"step":${stepChangeWhenResizeCell},"keyWidth":"flex-basis"}' data-gjs-name="Cell" data-gjs-unstylable='["width, height"]' data-gjs-stylable-require='["flex-basis"]'></div>
          <div class="cell" data-gjs-draggable=".row" data-gjs-resizable='{"tl":0,"tc":0,"tr":0,"cl":0,"cr":1,"bl":0,"br":0,"minDim":1,"bc":0,"currentUnit":1,"step":${stepChangeWhenResizeCell},"keyWidth":"flex-basis"}' data-gjs-name="Cell" data-gjs-unstylable='["width, height"]' data-gjs-stylable-require='["flex-basis"]'></div>
          <div class="cell" data-gjs-draggable=".row" data-gjs-resizable='{"tl":0,"tc":0,"tr":0,"cl":0,"cr":1,"bl":0,"br":0,"minDim":1,"bc":0,"currentUnit":1,"step":${stepChangeWhenResizeCell},"keyWidth":"flex-basis"}' data-gjs-name="Cell" data-gjs-unstylable='["width, height"]' data-gjs-stylable-require='["flex-basis"]'></div>
        </div>
        ${initStyleRowCellDefault}
    `,
  },
  Add3CellConfig: {
    id: "add3CellConfig",
    label: `<div class="mb-2"><img src="/assets/img/itr-builder/3colum.png" style="height: 33px;"/></div><span>3 Colum</span>`,
    attributes: {
      class: "gjs-fonts gjs-f-b2",
    },
    category: {
      id: "Basic",
      label: "Basic",
    },
    content: `
        <div class="row" data-gjs-droppable=".cell" data-gjs-resizable='{"tl":0,"tc":0,"tr":0,"cl":0,"cr":0,"bl":0,"br":0,"minDim":1}' data-gjs-name="Row">
          <div class="cell" data-gjs-draggable=".row" data-gjs-resizable='{"tl":0,"tc":0,"tr":0,"cl":0,"cr":1,"bl":0,"br":0,"minDim":1,"bc":0,"currentUnit":1,"step":${stepChangeWhenResizeCell},"keyWidth":"flex-basis"}' data-gjs-name="Cell" data-gjs-unstylable='["width, height"]' data-gjs-stylable-require='["flex-basis"]'></div>
          <div class="cell" data-gjs-draggable=".row" data-gjs-resizable='{"tl":0,"tc":0,"tr":0,"cl":0,"cr":1,"bl":0,"br":0,"minDim":1,"bc":0,"currentUnit":1,"step":${stepChangeWhenResizeCell},"keyWidth":"flex-basis"}' data-gjs-name="Cell" data-gjs-unstylable='["width, height"]' data-gjs-stylable-require='["flex-basis"]'></div>
          <div class="cell" data-gjs-draggable=".row" data-gjs-resizable='{"tl":0,"tc":0,"tr":0,"cl":0,"cr":1,"bl":0,"br":0,"minDim":1,"bc":0,"currentUnit":1,"step":${stepChangeWhenResizeCell},"keyWidth":"flex-basis"}' data-gjs-name="Cell" data-gjs-unstylable='["width, height"]' data-gjs-stylable-require='["flex-basis"]'></div>
        </div>
        ${initStyleRowCellDefault}
    `,
  },
  Add2CellConfig: {
    id: "add2CellConfig",
    label: "2 Colum",
    attributes: {
      class: "gjs-fonts gjs-f-b2",
    },
    category: {
      id: "Basic",
      label: "Basic",
    },
    content: `
        <div class="row" data-gjs-droppable=".cell" data-gjs-resizable='{"tl":0,"tc":0,"tr":0,"cl":0,"cr":0,"bl":0,"br":0,"minDim":1}' data-gjs-name="Row">
          <div class="cell" data-gjs-draggable=".row" data-gjs-resizable='{"tl":0,"tc":0,"tr":0,"cl":0,"cr":1,"bl":0,"br":0,"minDim":1,"bc":0,"currentUnit":1,"step":${stepChangeWhenResizeCell},"keyWidth":"flex-basis"}' data-gjs-name="Cell" data-gjs-unstylable='["width, height"]' data-gjs-stylable-require='["flex-basis"]'></div>
          <div class="cell" data-gjs-draggable=".row" data-gjs-resizable='{"tl":0,"tc":0,"tr":0,"cl":0,"cr":1,"bl":0,"br":0,"minDim":1,"bc":0,"currentUnit":1,"step":${stepChangeWhenResizeCell},"keyWidth":"flex-basis"}' data-gjs-name="Cell" data-gjs-unstylable='["width, height"]' data-gjs-stylable-require='["flex-basis"]'></div>
        </div>
        ${initStyleRowCellDefault}
    `,
  },
  Add1CellConfig: {
    id: "add1CellConfig",
    label: "1 Colum",
    attributes: {
      class: "gjs-fonts gjs-f-b1",
    },
    category: {
      id: "Basic",
      label: "Basic",
    },
    content: `
            <div  class="row"  data-gjs-droppable=".cell" data-gjs-resizable='{"tl":0,"tc":0,"tr":0,"cl":0,"cr":0,"bl":0,"br":0,"minDim":1}' data-gjs-name="Row">
              <div  class="cell" data-gjs-draggable=".row" data-gjs-resizable='{"tl":0,"tc":0,"tr":0,"cl":0,"cr":1,"bl":0,"br":0,"minDim":1,"bc":0,"currentUnit":1,"step":${stepChangeWhenResizeCell},"keyWidth":"flex-basis"}' data-gjs-name="Cell" data-gjs-unstylable='["width, height"]' data-gjs-stylable-require='["flex-basis"]'></div>
            </div>
            ${initStyleRowCellDefault}
        `,
  },
};
