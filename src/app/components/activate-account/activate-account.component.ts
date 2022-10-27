import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/shared/services/api/user/user.service';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.scss']
})

export class ActivateAccountComponent implements OnInit {
  message: string;

  constructor(
    public clientState: ClientState,
    private userService: UserService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.message = "Activating your account ...";
    setTimeout(() => {
      this.activateAccount();
    }, 1000);
  }

  activateAccount = () => {
    var userId = this.activatedRoute.snapshot.queryParams['userid']
    var token = this.activatedRoute.snapshot.queryParams['token']
    if (!userId || !token) {
      this.message = "Invalid token";
      return;
    }
    this.userService.activateRegisteredUser(userId, token).subscribe(res => {
      this.message = 'Your account has been activated. Redirect to <a href="/login">login</a> page';
    }, error => {
      this.message = error.message;
    });
  }

}
