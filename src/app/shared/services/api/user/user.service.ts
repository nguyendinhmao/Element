
import { ApiResponse, ApiListResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { UserCreationModel, ForgotPasswordModel, ResetPasswordModel, UserUpdationModel, UserRegistrationModel, UserProfileModel, UserProfileUpdationModel, ChangePasswordModel, ChangePinCodeModel, RemovePinCodeModel } from 'src/app/shared/models/user/user.model';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

export interface IUserInterface {
  getUserList(firstName: string, lastName: string, email: string, role: number, pageNumber: number,pageSize:number,sortExpression:string): Observable<ApiResponse>;
  createUser(userCreationModel: UserCreationModel): Observable<ApiResponse>;
  updateUser(userUpdationModel: UserUpdationModel): Observable<ApiResponse>;
  forgotPassword(forgotPasswordModel: ForgotPasswordModel): Observable<ApiResponse>;
  resetPassword(resetPasswordModel: ResetPasswordModel): Observable<ApiResponse>;
}

@Injectable({
  providedIn: 'root',
})

export class UserService implements IUserInterface {
  constructor(
    private http: HttpService
  ) { }

  getUserList(firstName: string, lastName: string, email: string, role: any, pageNumber: number,pageSize: number,sortExpression): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('pageNumber', pageSize.toString());
    params = params.append('filterFirstName', firstName || "");
    params = params.append('filterSurname', lastName || "");
    params = params.append('filterEmail', email || "");
    params = params.append('filterRole', role);
    params = params.append('sortExpression',sortExpression);

    return this.http.HttpGet(ApiUrl.UserList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  createUser(userCreationModel: UserCreationModel): Observable<ApiResponse> {
    let body = JSON.stringify(userCreationModel);
    return this.http.HttpPost(ApiUrl.CreateUser, body, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  updateUser(userUpdationModel: UserUpdationModel): Observable<ApiResponse> {
    let body = JSON.stringify(userUpdationModel);
    return this.http.HttpPost(ApiUrl.UpdateUser, body, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  deactivateUser(id: string): Observable<ApiResponse> {
    let params = new HttpParams();
    params = params.append('id', id);
    return this.http.HttpPut(ApiUrl.DeactivateUser, null, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  activateUser(id: string, loginLink?: string): Observable<ApiResponse> {
    var body = {
      userId: id,
      loginLink: loginLink || '/login'
    };
    return this.http.HttpPost(ApiUrl.ActivateUser, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  forgotPassword(forgotPasswordModel: ForgotPasswordModel): Observable<ApiResponse> {
    let body = JSON.stringify(forgotPasswordModel);
    return this.http.HttpPost(ApiUrl.ForgotPassword, body).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  resetPassword(resetPasswordModel: ResetPasswordModel): Observable<ApiResponse> {
    let body = JSON.stringify(resetPasswordModel);
    return this.http.HttpPost(ApiUrl.ResetPassword, body).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getUserById(id: string): Observable<UserUpdationModel> {
    let params = new HttpParams();
    params = params.append('userId', id);
    return this.http.HttpGet(ApiUrl.GetUserById, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  registerUser(userRegistrationModel: UserRegistrationModel): Observable<ApiResponse> {
    let body = JSON.stringify(userRegistrationModel);
    return this.http.HttpPost(ApiUrl.RegisterUser, body, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  activateRegisteredUser(userId: string, token: string): Observable<ApiResponse> {
    var bodyObj = {
      userId: userId,
      token: token
    };
    let body = JSON.stringify(bodyObj);
    return this.http.HttpPost(ApiUrl.ActivateRegisteredUser, body, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  resetAccountPassword(userId: string, changePasswordLink: string): Observable<ApiResponse> {
    let body = {
      userId: userId,
      changePasswordLink: changePasswordLink
    };
    let bodyContent = JSON.stringify(body);
    return this.http.HttpPost(ApiUrl.AdminResetAccountPassword, bodyContent, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getUserProfile(userId: string): Observable<UserProfileModel> {
    let params = new HttpParams();
    params = params.append('userId', userId);
    return this.http.HttpGet(ApiUrl.GetUserProfile, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  updateUserProfile(profile: UserProfileUpdationModel): Observable<string> {
    let formData: FormData = new FormData();
    if (profile.photoUpload) {
      formData.append('avatar', profile.photoUpload, profile.photoUpload.name);
    }
    formData.append('data', JSON.stringify(profile));
    return this.http.HttpPostFormData(ApiUrl.UpdateUserProfile, formData, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  changePassword(changePasswordModel: ChangePasswordModel): Observable<ApiResponse> {
    let body = JSON.stringify(changePasswordModel);
    return this.http.HttpPost(ApiUrl.ChangePassword, body, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getUserLookup(pageNumber: number, filter: string, isNoPaging: boolean): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('filter', filter);
    params = params.append('isNoPaging', isNoPaging + "");
    return this.http.HttpGet(ApiUrl.GetUserLookUp, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));

  }

  changePinCode(changePinCodeModel: ChangePinCodeModel): Observable<ApiResponse> {
    let body = JSON.stringify(changePinCodeModel);
    return this.http.HttpPost(ApiUrl.ChangePinCode, body, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  createPinCode(changePinCodeModel: ChangePinCodeModel): Observable<ApiResponse> {
    let body = JSON.stringify(changePinCodeModel);
    return this.http.HttpPost(ApiUrl.CreatePinCode, body, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  removePinCode(removePinCodeModel: RemovePinCodeModel): Observable<ApiResponse> {
    let body = JSON.stringify(removePinCodeModel);
    return this.http.HttpPost(ApiUrl.RemovePinCode, body, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
}
