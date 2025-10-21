import { Injectable } from '@angular/core';
import { HotToastService } from '@ngneat/hot-toast';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { DOC_ORIENTATION, NgxImageCompressService } from 'ngx-image-compress';
import { Observable, Subscriber, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private _maxSizeByte = 10 * 1024 * 1024; // 10MB

  constructor(
    private imageCompress: NgxImageCompressService,
    private toast: HotToastService
  ) {}

  toBase64(file: File): Observable<string> {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    return new Observable((observer: Subscriber<string>) => {
      // if success
      fileReader.onload = (ev: ProgressEvent) => {
        observer.next((ev.target as any).result);
        observer.complete();
      };

      // if failed
      fileReader.onerror = (error) => {
        observer.error(error);
      };
    });
  }

  compressImage(
    base64: string,
    maxWidth = 1920,
    maxHeight = 1920
  ): Observable<string> {
    // console.log(this.imageCompress.byteCount(base64) / 1024);
    return from(
      this.imageCompress.compressFile(
        base64,
        DOC_ORIENTATION.Default,
        100,
        50,
        maxWidth,
        maxHeight
      )
    );
  }

  checkValidImageSize(base64: string): boolean {
    return this.imageCompress.byteCount(base64) > this._maxSizeByte;
  }

  getValidDroppedImages(droppedFiles: NgxFileDropEntry[]): NgxFileDropEntry[] {
    const invalidImages: NgxFileDropEntry[] = [];

    for (const droppedFile of droppedFiles) {
      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Here you can access the real file
          if (this.isImageFile(file) && file.size > this._maxSizeByte) {
            this.toast.error(
              `Cannot upload file "${file.name}", max file size allowed is 10MB.`
            );
            invalidImages.push(droppedFile);
          }
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }

    const validImages = droppedFiles.filter(
      (file) => !invalidImages.includes(file)
    );

    return validImages;
  }

  parseAbsoluteUrl(url: string): string {
    url = url.trim();
    url = url.replace(/\\/g, '/');
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('//')) {
      return window.location.protocol + url;
    }
    return window.location.protocol + '//' + url;
  }

  public isImageFile(file: File): boolean {
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension) {
      return allowedExtensions.includes(fileExtension);
    } else {
      return false;
    }
  }
}
