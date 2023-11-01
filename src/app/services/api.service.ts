import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient){}
  
  private baseUrl = 'https://rickandmortyapi.com/api/character';
  
  public getCharacters(page = 1, name = '', gender = '', status = ''): Observable<any> {
    const requestUrl = `${this.baseUrl}?page=${page}&name=${name}&gender=${gender}&status=${status}`;
    return this.http.get<any>(requestUrl);
  }
}
