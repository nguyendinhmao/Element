import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})

export class DownloadFileService {
    constructor(private http: HttpClient) { }

    download(url: string, filename?: string) {
        this.http.get(url, {
            responseType: 'blob'
        }).subscribe(blob => saveAs(blob, `${filename || 'archive'}.zip`));
    }
}