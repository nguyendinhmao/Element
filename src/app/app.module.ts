import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { JwtModule } from "@auth0/angular-jwt";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { SharedModule } from "./share.module";
import { StorageKey } from "./shared/models/storage-key/storage-key";
//--- ToastrModule
import { ToastrModule } from "ngx-toastr";
//--- DeviceDetectorModule
import { DeviceDetectorModule } from "ngx-device-detector";
//--- NgIdleKeepaliveModule
import { NgIdleKeepaliveModule } from "@ng-idle/keepalive";
//--- NgSelectModule
import { NgSelectModule } from '@ng-select/ng-select';
//--- LightboxModule
import { LightboxModule } from 'ngx-lightbox';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgSelectModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SharedModule,
    JwtModule.forRoot({
      config: {
        throwNoTokenError: false,
        tokenGetter: GetToken,
      },
    }),
    ToastrModule.forRoot({
      timeOut: 8000,
    }),
    DeviceDetectorModule.forRoot(),
    NgIdleKeepaliveModule.forRoot(),
    LightboxModule,
    ServiceWorkerModule.register('custom-service-worker.js', { enabled: environment.production })
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }

export function GetToken() {
  return localStorage.getItem(StorageKey.Token);
}
