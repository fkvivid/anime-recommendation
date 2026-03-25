import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Anime, RecommendResponse, ApiResponse } from '../types';

@Injectable({
  providedIn: 'root'
})
export class AnimeService {
  private readonly http = inject(HttpClient);
  private readonly animeBase = `${environment.apiUrl}anime`;
  private readonly recBase = `${environment.apiUrl}recommendations`;

  recommend(query: string): Observable<RecommendResponse> {
    return this.http.post<RecommendResponse>(`${this.recBase}`, { query });
  }

  getById(id: string): Observable<ApiResponse<Anime>> {
    return this.http.get<ApiResponse<Anime>>(`${this.recBase}/${id}`);
  }

  getAnimes(page: number, limit: number = 10): Observable<RecommendResponse> {
    return this.http.get<RecommendResponse>(`${this.recBase}?limit=${limit}&page=${page}`);
  }

  getRandom(): Observable<ApiResponse<Anime>> {
    return this.http.get<ApiResponse<Anime>>(`${this.recBase}/random`);
  }
}