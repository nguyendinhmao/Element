import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  Input,
  AfterViewInit,
} from "@angular/core";
import { SafeHtml, DomSanitizer } from "@angular/platform-browser";
import GrapesjsConfig from "../itr-builder-detail/grapesJs-editor-config/grapesJs-editor-config";
import {
  removeOuterMostRowDuplicateBorderV2,
  removeSubContent,
  reNameClassRowToRowFix,
} from "../itr-builder-detail/grapesJs-editor-config/handling-code-function";
@Component({
  selector: "app-dashboard-child-template-preview",
  templateUrl: "./previewTemplate.component.html",
  styleUrls: ["./previewTemplate.component.scss"],
})
export class ITRBuilderTemplatePreviewComponent
  implements OnInit, AfterViewInit {
  @Input() getBodyTemplateParent: string = "<h3>Body</h3>";
  @Input() getHeaderTemplateParent: string = "<h3>Header</h3>";
  @Input() getFooterTemplateParent: string = "<h3>Footer</h3>";
  @Input() getFullHTMLandCSS: string = "";
  @Output() setClosePreviewScreen = new EventEmitter();

  PreviewTemplateCode: SafeHtml;

  constructor(private sanitizer: DomSanitizer) {}

  public ngOnInit() {
    let val =
      this.getFullHTMLandCSS ||
      this.getHeaderTemplateParent +
        this.getBodyTemplateParent +
        this.getFooterTemplateParent;
    val = reNameClassRowToRowFix(val);
    val = removeSubContent(val);
    val += `
    <style>
    .rowFix{padding:0}.hidden-sub {display:none}
    </style>
    `;
    this.PreviewTemplateCode = this.sanitizer.bypassSecurityTrustHtml(val);
  }

  public ngAfterViewInit() {
    document
      .querySelectorAll("input[data-id='input-itr-editor']")
      .forEach((inputElement) => {
        inputElement.removeAttribute("disabled");
      });
    const previewContainerElement = document.getElementsByClassName(
      "container-preview-template-itr-builder"
    ) as HTMLCollectionOf<HTMLElement>;
    if (previewContainerElement[0]) {
      let heightView = window.innerHeight;
      let topPosition = previewContainerElement[0].getBoundingClientRect().top;
      previewContainerElement[0].style.minHeight =
        heightView - topPosition - 50 + "px";
    }
    // handle click single checkbox of a group
    document
      .querySelectorAll(
        `[${GrapesjsConfig.AnswerQuestionCustomDataAttribute.answer.AnswerType}=Checkbox]`
      )
      .forEach((answerElement) => {
        const listChildrenInputCheckBox = Array.from(
          document.querySelectorAll(
            `[${GrapesjsConfig.AnswerQuestionCustomDataAttribute.answer.CheckBoxAnswer}=${answerElement.id}]`
          )
        );
        listChildrenInputCheckBox.map((inputElement, index) => {
          inputElement.setAttribute(
            GrapesjsConfig.AnswerQuestionCustomDataAttribute.answer
              .IdChildInGroup,
            String(index)
          );
          inputElement.addEventListener("click", (event) =>
            this.handleClickToCheckbox(event, answerElement.id, index)
          );
        });
      });

    // add edit able to span answer
    Array.from(
      document.querySelectorAll("span[data-custom-type=span-contenteditable]")
    ).map((element) => {
      const elementHtml = element as HTMLElement;
      elementHtml.setAttribute("contenteditable", "true");
      elementHtml.style["pointer-events"] = "auto";
      elementHtml.addEventListener("click", (event: any) => {
        if (event.target.textContent === "Input your answer")
          event.target.innerHTML = "";
      });
      elementHtml.addEventListener("blur", (event: any) => {
        if (event.target.textContent === "")
          event.target.innerHTML = "Input your answer";
      });
    });
    removeOuterMostRowDuplicateBorderV2();
  }

  handleClickToCheckbox(
    event: any,
    dataCheckBoxAnswerId: string,
    indexEvent: number | string
  ) {
    const listCheckBoxOfGroup = Array.from(
      document.querySelectorAll(
        `[${GrapesjsConfig.AnswerQuestionCustomDataAttribute.answer.CheckBoxAnswer}=${dataCheckBoxAnswerId}]`
      )
    ) as HTMLInputElement[];
    if (event.target.checked)
      listCheckBoxOfGroup.map((inputCheckbox, index) => {
        if (indexEvent != index && inputCheckbox.checked) inputCheckbox.click();
      });
  }

  close() {
    this.setClosePreviewScreen.emit();
  }
}
