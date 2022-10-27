import { Observable } from 'rxjs';
import { ApiListResponse } from '../models/api-response/api-response';
import { RolesModel } from '../models/roles/roles.model';

let rolesData: RolesModel[] = [
    { rolesId: 1, rolesTitle: 'Project Leader', rolesType: 'Project', status: 'Active' },
    { rolesId: 2, rolesTitle: 'System Admin', rolesType: 'System', status: 'Active' },
    { rolesId: 3, rolesTitle: 'Member', rolesType: 'Project', status: 'Active' },
    { rolesId: 4, rolesTitle: 'User', rolesType: 'System', status: 'Active' },
];

export class MockRolesApi {
    public getRolesData = (): Observable<ApiListResponse> => {
        let response = <ApiListResponse>{
            status: 1,
            message: '',
            content: <RolesModel[]>[...rolesData]
        };
        return Observable.create(observer => {
            observer.next(response);
            observer.complete();
        });
    }
}