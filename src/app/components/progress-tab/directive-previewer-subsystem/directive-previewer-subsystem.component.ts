import {
  OnInit,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { SubSystemRenderModel } from "src/app/shared/models/progress-tab/progress-tab.model";
declare var $: any;

@Component({
  selector: "directive-previewer-subsystem",
  templateUrl: "./directive-previewer-subsystem.component.html",
  styleUrls: ["./directive-previewer-subsystem.component.scss"],
})
export class DirectivePreviewerSubSystemComponent implements OnInit, OnChanges {
  @Input() data2Drawing: SubSystemRenderModel = null;
  @Input() isPdfShow: boolean = true;

  removeHandleScrollbar = false;
  renderModel = {};

  ngOnInit() {
    this.onScroll();
    this.updateTableView();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      !changes.data2Drawing.isFirstChange() &&
      this.data2Drawing &&
      JSON.stringify(changes.data2Drawing.currentValue) !==
        JSON.stringify(changes.data2Drawing.previousValue)
    ) {
      this.updateTableView();
    }
  }

  updateTableView() {
    setTimeout(() => {
      // resize content
      const _elContentId = this._createGuid();
      const _elId = this._createGuid();
      document.getElementById("contentSystem").id = _elContentId;
      document.getElementById("scrollContent").id = _elId;

      const _elContent = document.getElementById(_elContentId);
      const _el = document.getElementById(_elId);
      const _scale =
        _elContent.offsetWidth < _el.offsetWidth
          ? _elContent.offsetWidth / _el.offsetWidth
          : 1;

      _elContent.classList.add("scalable-wrap");
      _el.classList.add("scalable-specific");
      _el.style.transform = `translate(-50%) scale(${_scale})`;
      if (_scale !== 1) {
        _elContent.style.height = `${Math.round(_el.offsetHeight * _scale)}px`;
      } else {
        const _restPixel = _elContent.offsetWidth - _el.offsetWidth;
        const _pixel4Each = Math.floor(
          _restPixel / (this.data2Drawing.milestones.length + 3)
        );
        const setWidth = (querySelector, addWidth) => {
          let elements = document.querySelectorAll(querySelector);
          if (elements.length===0) return;
          const baseWidth = elements[0]["offsetWidth"];
          for (let i = 0; i < elements.length; i++) {
            elements[i]["style"].width = `${baseWidth + addWidth}px`;
          }
        };

        setWidth(".block-system", _pixel4Each);
        setWidth(".block-punch", Math.floor(_pixel4Each * 0.33));
        setWidth(".block-itrs", Math.floor(_pixel4Each * 0.35));
        setWidth(".block-handover", Math.floor(_pixel4Each * 0.65));
        setWidth(".block-completion", _pixel4Each);
      }
      this.addPaddingContainer();
    }, 1);
  }
 

  addPaddingContainer() {
    document
      .querySelectorAll(".container-content-preview")
      .forEach((element) => {
        element.classList.add("pt-4");
      });
  }
  onScroll() {
    $("#scrollContent").on("scroll", function () {
      var scrollTop = $(this).scrollTop();

      if (scrollTop <= 0) {
        document.getElementById("header").classList.remove("sticky-header");
      } else {
        document.getElementById("header").classList.add("sticky-header");
      }
    });
  }

  _createGuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
