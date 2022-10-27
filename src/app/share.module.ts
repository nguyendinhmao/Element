import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//--- Shared module
import { SharedControls } from './share-controls';
import { SharedServices } from './share-services';
import { SharedComponents } from './share-components';
import { SharedAngularMaterial } from './share-angular-material';
import { SharedDirectives } from './share-directives';
//--- NgSelectModule
import { NgSelectModule } from '@ng-select/ng-select';
//--- ColorPickerModule
import { ColorPickerModule } from 'ngx-color-picker';
//--- GridsterModule
import { GridsterModule } from 'angular-gridster2';
//--- AvatarModule
import { AvatarModule } from 'ngx-avatar';
//--- ChartsModule
import { ChartsModule } from 'ng2-charts';
//--- LightboxModule
// import { LightboxModule } from 'ngx-lightbox';
//--- MomentModule
import { MomentModule } from "angular2-moment";
//--- MatSnackBarModule
import { MatSnackBarModule } from '@angular/material/snack-bar';
//--- NgxGaugeModule use to draw gauge graph
import { NgxGaugeModule } from 'ngx-gauge';
//--- NgxExtendedPdfViewerModule use to preview pdf
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@NgModule({
    declarations: [
        SharedComponents,
        SharedControls,
        SharedDirectives
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        RouterModule,
        BrowserAnimationsModule,

        GridsterModule,
        NgSelectModule,
        ColorPickerModule,
        AvatarModule,
        SharedAngularMaterial,
        ChartsModule,
        // LightboxModule,
        MomentModule,
        MatSnackBarModule,
        NgxGaugeModule,
        NgxExtendedPdfViewerModule,
    ],
    // exports: [
    //     SharedComponents,
    //     SharedControls,
    //     SharedAngularMaterial,
    //     SharedDirectives
    // ],
    providers: [
        HttpClientModule,
        SharedServices,
    ]
})

export class SharedModule { }