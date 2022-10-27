export default {
  AddAttributeToHtmlExport: (rawCode: string) => {
    let rawString = rawCode;
    let regExpRow = /class="row"/g;
    let regExpCell = /class="cell"/g;
    let replaceStringRow = `class="row" data-gjs-droppable=".cell" data-gjs-resizable='{"tl":0,"tc":0,"tr":0,"cl":0,"cr":0,"bl":0,"br":0,"minDim":1}' data-gjs-name="Row"`;
    let replaceStringCell = `class="cell" data-gjs-draggable=".row" data-gjs-resizable='{"tl":0,"tc":0,"tr":0,"cl":0,"cr":1,"bl":0,"br":0,"minDim":1,"bc":0,"currentUnit":1,"step":0.2,"keyWidth":"flex-basis"}' data-gjs-name="Cell" data-gjs-unstylable='["width, height"]' data-gjs-stylable-require='["flex-basis"]'`;
    rawString = rawString.replace(regExpRow, replaceStringRow);
    rawString = rawString.replace(regExpCell, replaceStringCell);
    return rawString;
  },
};
