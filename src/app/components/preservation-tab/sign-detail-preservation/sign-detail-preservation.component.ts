import { OnInit, Component, Input, Output, EventEmitter } from "@angular/core";
import { JwtTokenHelper } from "src/app/shared/common/jwt-token-helper/jwt-token-helper";
import { AuthInProjectDto } from "src/app/shared/models/project-management/project-management.model";
import { PermissionsViews } from "src/app/shared/common/constants/permissions";
import { SignaturePres } from 'src/app/shared/models/preservation-tab/preservation-tab.model';

@Component({
  selector: "sign-detail-preservation",
  templateUrl: "./sign-detail-preservation.component.html",
  styleUrls: ['./sign-detail-preservation.component.scss']
})

export class SignDetailPreservationComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() signatureModel: SignaturePres[];
  @Input() elementId: string;
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
    this.onSuccess.emit(this.elementId);
  };

  onCancel = () => {
    this.onSuccess.emit(null);
  };

  onLoginConfirm() {
    this.onSuccess.emit('login');
  }
}