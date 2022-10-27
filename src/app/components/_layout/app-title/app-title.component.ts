import { Component, Input, OnInit } from '@angular/core';
import { JwtTokenHelper } from 'src/app/shared/common/jwt-token-helper/jwt-token-helper';
import { CompanyColorModel } from 'src/app/shared/models/company-management/company-management.model';
import { ReloadLayoutService } from 'src/app/shared/services/core/reload-layout.service';
import { Configs } from 'src/app/shared/common';

@Component({
    selector: 'app-title',
    templateUrl: './app-title.component.html',
})

export class AppTitleComponent implements OnInit {
    @Input() title: string;
    @Input() smallTitle: string;

    companyColorModel: CompanyColorModel = new CompanyColorModel();

    constructor(
        private reloadLayoutService: ReloadLayoutService,
    ) { }

    ngOnInit() {
        //--- Get colour branding title
        this.onGetColorBrandingTitle();

        //--- Reload layout
        this.reloadLayoutService.getEmitter().subscribe(message => {
            if (message === 'reloadColorBrandingTitle') {
                this.onGetColorBrandingTitle();
            }
        });
    }

    //--- Get color branding default
    onGetColorBrandingTitle = () => {
        const colorBrandings = JwtTokenHelper.GetColorBranding();
        if (colorBrandings === null) {
            this.companyColorModel.colorTextColour1 = Configs.ColorTextColour1Default;
        } else {
            this.companyColorModel.colorTextColour1 = colorBrandings.colorTextColour1;
        }
    }
}