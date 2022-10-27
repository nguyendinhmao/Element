import { OnInit, Component, Input, Output, EventEmitter } from "@angular/core";
import { Signature } from "src/app/shared/models/punch-page/punch-page.model";
import { JwtTokenHelper } from "src/app/shared/common/jwt-token-helper/jwt-token-helper";
import { AuthInProjectDto } from "src/app/shared/models/project-management/project-management.model";
import { PermissionsViews } from "src/app/shared/common/constants/permissions";

@Component({
  selector: "signatures-info-change",
  templateUrl: "./signatures-info-change.component.html",
})
export class SignaturesInfoChangeComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() signatureModel: Signature[];
  @Input() changeId: string;
  @Input() isShowSubmit: boolean = false;
  @Output() onSuccess: EventEmitter<string> = new EventEmitter();

  permissionsViews = PermissionsViews;
  authInProjectDto: AuthInProjectDto[] = [];

  constructor() {
    this.authInProjectDto = JwtTokenHelper.GetAuthProject()
      ? <AuthInProjectDto[]>[...JwtTokenHelper.GetAuthProject()]
      : [];
  }

  public ngOnInit() { }

  onCheckPermission = (key: string) => {
    return JwtTokenHelper.IsAuthInProject(key, this.authInProjectDto);
  };

  onSubmit = () => {
    this.onSuccess.emit(this.changeId);
  };

  onCancel = () => {
    this.onSuccess.emit(null);
  };
}
