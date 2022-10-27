import { HttpErrorResponse, HttpParameterCodec } from '@angular/common/http';
import { throwError } from 'rxjs';
import { ApiError, ApiResponse, ApiListResponse } from '../../models/api-response/api-response';

export module ApiHelper {
    export function extractData(res: any | any): any {
        let body = res;
        return body;
    }

    export function onFail(err: HttpErrorResponse | any) {
        return throwError(<ApiError>err.error);
    }

    export function extractJsonData(res: ApiResponse): any {
        let body = res.content;
        return body;
    }

    export function extractJsonListData(res: ApiListResponse): any {
        let body = res.content;
        return body;
    }
}

export class CustomEncoder implements HttpParameterCodec {
    encodeKey(key: string): string {
        return encodeURIComponent(key);
    }

    encodeValue(value: string): string {
        return encodeURIComponent(value);
    }

    decodeKey(key: string): string {
        return decodeURIComponent(key);
    }

    decodeValue(value: string): string {
        return decodeURIComponent(value);
    }
}