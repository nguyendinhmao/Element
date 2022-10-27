import * as HTML_DATA_CUSTOM_NAME from "./html-data-custom";
import * as VALUE_DATA_CUSTOM_TYPE from "./value-of-data-custom-type";
import { InfoDevice } from "src/app/shared/models/common/global-variables";

var ListStyleSheetHaveResult: CSSStyleSheet[] = [];

function GetCssPropertyByCssSelector(cssSelector: string) {
  let _result = null;
  ListStyleSheetHaveResult.map((_styleSheet) => {
    try {
      //@ts-ignore
      Array.from(_styleSheet.cssRules).map((_cssRule) => {
        //@ts-ignore
        if (_cssRule.cssText.includes(cssSelector)) {
          _result = _cssRule;
        }
      });
    } catch (error) {}
  });
  if (!_result)
    Array.from(document.styleSheets).map((_styleSheet) => {
      try {
        //@ts-ignore
        Array.from(_styleSheet.cssRules).map((_cssRule) => {
          //@ts-ignore
          if (_cssRule.cssText.includes(cssSelector)) {
            _result = _cssRule;
            //@ts-ignore
            ListStyleSheetHaveResult.push(_styleSheet);
          }
        });
      } catch (error) {}
    });
  if (_result) return _result.style;
  return _result;
}

function OffsetRight(child: any): number {
  return child.offsetLeft + child.offsetWidth;
}

export function removeOuterMostRowDuplicateBorderV2(isTablet: boolean = true) {
  const _currentDeviceIsDesktop = screen.width > 767;
  if (_currentDeviceIsDesktop) removeOuterMostRowDuplicateBorderDesktop();
  else removeOuterMostRowDuplicateBorderTablet();
}

function removeOuterMostRowDuplicateBorderTablet() {
  const listOuterMostCell = Array.from(
    document.querySelectorAll(`div[${HTML_DATA_CUSTOM_NAME.DATA_CELL_OF}]`)
  );
  Array.from(listOuterMostCell).map((_cell, _cellIndex) => {
    const _belowCell = listOuterMostCell[_cellIndex + 1];
    if (_belowCell) {
      const _cellStyle = GetCssPropertyByCssSelector(`#${_cell.id}`);
      const _belowCellStyle = GetCssPropertyByCssSelector(`#${_belowCell.id}`);
      if (
        _cellStyle &&
        _belowCellStyle &&
        _cellStyle.borderBottom === _belowCellStyle.borderTop
      ) {
        (_cell as HTMLDivElement).style.borderBottom = "0px";
      }
    }
  });
}

function removeOuterMostRowDuplicateBorderDesktop() {
  const listOuterMostRow = Array.from(
    document.querySelectorAll(
      `div[${HTML_DATA_CUSTOM_NAME.DATA_CUSTOM_TYPE}='${VALUE_DATA_CUSTOM_TYPE.OUTER_MOST_ROW}']`
    )
  );
  listOuterMostRow.map((_row, _indexRow) => {
    const _rowBelow = listOuterMostRow[_indexRow + 1];
    const _listCell = Array.from(_row.children);
    _listCell.map((_cell, _indexCell) => {
      const _cellNext = _listCell[_indexCell + 1];
      if (_cellNext) {
        const _cellStyle = GetCssPropertyByCssSelector(`#${_cell.id}`);
        const _cellNextStyle = GetCssPropertyByCssSelector(`#${_cellNext.id}`);
        if (
          _cellStyle &&
          _cellNextStyle &&
          _cellStyle.borderRight === _cellNextStyle.borderLeft
        ) {
          (_cell as HTMLDivElement).style.borderRight = "0px";
        }
      }
    });
    if (_rowBelow) {
      const _listCellBelow = Array.from(_rowBelow.children);
      _listCell.map((_cell) => {
        let _isDone = false;
        _listCellBelow.map((_cellBelow) => {
          if (_isDone) return;
          const _leftPoint1 = (_cell as HTMLDivElement).offsetLeft;
          const _leftPoint2 = (_cellBelow as HTMLDivElement).offsetLeft;
          const _rightPoint1 = OffsetRight(_cell);
          const _rightPoint2 = OffsetRight(_cellBelow);
          const _middleCell = _leftPoint1 + (_rightPoint1 - _leftPoint1) / 2;
          if (_middleCell <= _rightPoint2 && _middleCell >= _leftPoint2) {
            const _cellStyle = GetCssPropertyByCssSelector(`#${_cell.id}`);
            const _cellBelowStyle = GetCssPropertyByCssSelector(
              `#${_cellBelow.id}`
            );
            if (
              _cellStyle &&
              _cellBelowStyle &&
              _cellStyle.borderBottom === _cellBelowStyle.borderTop
            ) {
              (_cell as HTMLDivElement).style.borderBottom = "0px";
            }
            _isDone = true;
          }
        });
      });
    }
  });
}

export function reNameClassRowToRowFix(rawString: string) {
  let result = rawString.slice();
  result = result.replace(/class=\"row\"/g, `class="rowFix"`);
  result = result.replace(/\.row\{/g, ".rowFix{");
  return result;
}

export function removeSubContent(rawString: string) {
  let result = rawString.slice();
  const listContentRemove = [
    `<span>▼<\/span>`,
    `<button>Choose field<\/button>`,
    `<button>Choose other field<\/button>`,
  ];
  listContentRemove.map((content) => {
    let RegExpContent = new RegExp(content, "g");
    result = result.replace(RegExpContent, "");
  });
  return result;
}

export function bindingDataFieldFromDatabase(
  rawTemplate,
  fieldDataObject
): string {
  let result = rawTemplate;
  return result;
}
