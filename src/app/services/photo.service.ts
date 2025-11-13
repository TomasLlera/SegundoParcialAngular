import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Photo } from '../models/photo.model';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private apiUrl = 'https://jsonplaceholder.typicode.com/photos';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Photo[]> {
    return this.http.get<Photo[]>(this.apiUrl);
  }

  create(photo: Photo): Observable<Photo> {
    return this.http.post<Photo>(this.apiUrl, photo);
  }

  update(id: number, photo: Photo): Observable<Photo> {
    return this.http.put<Photo>(`${this.apiUrl}/${id}`, photo);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}