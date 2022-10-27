import { Injectable, ErrorHandler } from "@angular/core";
import { Router } from "@angular/router";
import { StorageService } from "../core/storage.service";
import { StorageKey } from "../../models/storage-key/storage-key";
import { ToastrService } from "ngx-toastr";
import * as $ from "jquery";
import { Constants } from "../../common";

@Injectable()
export class AuthErrorHandler implements ErrorHandler {
  constructor(
    private storageService: StorageService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  handleError(errorMessage: string) {
    if (errorMessage === Constants.DeniedAuthorization) {
      this.storageService.onRemoveTokens([
        StorageKey.UserInfo,
        StorageKey.Token,
        StorageKey.ModuleProjectDefault,
        StorageKey.ColourBranding,
      ]);
      this.router.navigate(["login"]);

      if ($("body").hasClass("modal-open")) {
        $("body").removeClass("modal-open");
        $("body").removeAttr("style");
      }
    } else {
      //let errorMultipleLines = errorMessage.replace(/\n\n--/g, '<br/>--');
      // this.toastr.error(errorMessage ? errorMessage.replace(/\r\n/g, '<br />').replace('<br /><br />-', '<br />-') : '', '', { enableHtml: true });
      this.toastr.error(
        errorMessage ? errorMessage.replace(/\r\n/g, "<br />").replace(/(<br\s*\/?>){2,}(-)/gi, "<br />-") : "", "", { enableHtml: true }
      );

      if ($("body").hasClass("modal-open")) {
        $("body").removeClass("modal-open");
        $("body").removeAttr("style");
      }
    }

    throw errorMessage;
  }

  handleSuccess(message: string) {
    this.toastr.success(message);
    
    if ($("body").hasClass("modal-open")) {
      $("body").removeClass("modal-open");
      $("body").removeAttr("style");
    }
  }
}
