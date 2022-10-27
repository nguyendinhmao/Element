import { Observable } from 'rxjs';
import { ApiListResponse } from '../models/api-response/api-response';
import { RoleTypeModel } from '../models/role-type/role-type.model';

let roleTypeData: RoleTypeModel[] = [
    { roleId: 1, roleTitle: 'Project', status: 'Active' },
    { roleId: 2, roleTitle: 'System', status: 'Active' },
];

export class MockRoleTypeApi {
    public getRoleTypeData = (): Observable<ApiListResponse> => {
        let response = <ApiListResponse>{
            status: 1,
            message: '',
            content: <RoleTypeModel[]>[...roleTypeData]
        };
        return Observable.create(observer => {
            observer.next(response);
            observer.complete();
        });
    }
}