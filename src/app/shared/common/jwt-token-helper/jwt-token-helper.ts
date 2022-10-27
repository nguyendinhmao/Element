import * as CryptoJS from 'crypto-js';
import * as decode from 'jwt-decode';
import { UserModel } from '../../models/user/user.model';
import { StorageKey } from '../../models/storage-key/storage-key';
import { ProjectSettingsModel, MilestonesProjectSettingsModel } from '../../models/project-settings/project-settings.model';
import { AuthInProjectDto, AuthSignInProjectModel, CompanyInfoModel, ManagerInProject } from "src/app/shared/models/project-management/project-management.model";
import { ModuleProjectDefaultModel } from '../../models/module/module.model';
import { CompanyColorModel } from '../../models/company-management/company-management.model';

export class JwtTokenHelper {
    static base64url = (source) => {
        // Encode in classical base64
        let encodedSource = CryptoJS.enc.Base64.stringify(source);

        // Remove padding equal characters
        encodedSource = encodedSource.replace(/=+$/, '');

        // Replace characters according to base64url specifications
        encodedSource = encodedSource.replace(/\+/g, '-');
        encodedSource = encodedSource.replace(/\//g, '_');

        return encodedSource;
    }

    public static CreateUnsignedToken = (data: any): string => {
        let header = {
            "alg": "HS256",
            "typ": "JWT"
        };

        let stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
        let encodedHeader = JwtTokenHelper.base64url(stringifiedHeader);
        let jwtData = { ...data, exp: Math.floor(Date.now() / 1000) + (60 * 60) };
        let stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(jwtData));
        let encodedData = JwtTokenHelper.base64url(stringifiedData);

        let token = encodedHeader + "." + encodedData;

        return token;
    }

    public static CreateSigningToken = (data: any): string => {
        let token = JwtTokenHelper.CreateUnsignedToken(data);
        let secret = "My very confidential secret!";

        let signature = CryptoJS.HmacSHA256(token, secret);
        signature = JwtTokenHelper.base64url(signature);

        let signedToken = token + "." + signature;
        return signedToken;
    }

    public static DecodeToken = (token: string): any => {
        if (token == null) {
            return null;
        }
        try {
            let tokenPayload = decode(token);
            if (tokenPayload) {
                return tokenPayload;
            }
        } catch (error) {
            return null;
        }
    }

    public static GetUserInfo = (): UserModel => {
        let userInfoToken = localStorage.getItem(StorageKey.UserInfo);
        let userInfo = JwtTokenHelper.DecodeToken(userInfoToken);
        if (userInfo) {
            return <UserModel>{ ...userInfo };
        }

        return null;
    }

    public static GetAuthSignInProject = (): AuthSignInProjectModel => {
        let info = localStorage.getItem(StorageKey.AuthSignInProject);
        if (info) {
            return <AuthSignInProjectModel>{ ...JSON.parse(info) };
        }
        return null;
    }

    public static GetCompanyInfo = (): CompanyInfoModel => {
        let info = localStorage.getItem(StorageKey.CompanyInfo);
        if (info) {
            return <CompanyInfoModel>{ ...JSON.parse(info) };
        }
        return null;
    }

    public static GetAuthProject = (): AuthInProjectDto[] => {
        let authInProjectDto = JSON.parse(localStorage.getItem(StorageKey.AuthInProject));
        if (authInProjectDto) {
            return <AuthInProjectDto[]>[...authInProjectDto];
        }

        return [];
    }

    public static IsAuthInProject = (KEY_NAME: string, AuthInProjectList: AuthInProjectDto[]): boolean => {
        return KEY_NAME && AuthInProjectList && AuthInProjectList.length > 0 && AuthInProjectList.some(item => item.code === KEY_NAME && item.status);
    }

    public static GetModuleProjectDefault = (): ModuleProjectDefaultModel => {
        let moduleProjectDefault = JSON.parse(localStorage.getItem(StorageKey.ModuleProjectDefault));

        if (moduleProjectDefault) {
            return <ModuleProjectDefaultModel>{ ...moduleProjectDefault };
        }

        return null;
    }

    public static GetMilestonesProjectSettings = (): MilestonesProjectSettingsModel[] => {
        let milestonesToken = localStorage.getItem(StorageKey.MilestonesAdmin);
        let milestones = JwtTokenHelper.DecodeToken(milestonesToken);

        if (milestones) {
            var resultMilestonesArray = Object.keys(milestones).map(function (milestonesIndex) {
                if (milestonesIndex !== "exp") {
                    let milestone = milestones[milestonesIndex];
                    return milestone;
                }
            });

            resultMilestonesArray = resultMilestonesArray.slice(0, resultMilestonesArray.length - 1);

            return <MilestonesProjectSettingsModel[]>[...resultMilestonesArray];
        }

        return null;
    }

    public static GetColorBranding = (): CompanyColorModel => {
        let colorBrandings = JSON.parse(localStorage.getItem(StorageKey.ColourBranding))

        if (colorBrandings) {
            return <CompanyColorModel>{ ...colorBrandings };
        }

        return null;
    }

    public static GetManagerInProject = (): ManagerInProject => {
        let managerInProject = JSON.parse(localStorage.getItem(StorageKey.ManagerInProject));

        if (managerInProject) {
            return <ManagerInProject>{ ...managerInProject };
        }
        return null;
    }
}