import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  WatchedAnime,
  AddToWatchlistRequest,
  UpdateWatchlistRequest,
  ApiResponse,
  Anime,
} from '../types';

@Injectable({ providedIn: 'root' })
export class UserAnimeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}anime`;

  getUserAnime(limit: number, page: number): Observable<ApiResponse<WatchedAnime[]>> {
    return this.http.get<ApiResponse<WatchedAnime[]>>(`${this.base}?limit=${limit}&page=${page}`);
  }

  add(payload: AddToWatchlistRequest): Observable<ApiResponse<WatchedAnime>> {
    return this.http.post<ApiResponse<WatchedAnime>>(this.base, payload);
  }

  update(id: string, payload: UpdateWatchlistRequest): Observable<ApiResponse<WatchedAnime>> {
    return this.http.patch<ApiResponse<WatchedAnime>>(`${this.base}/${id}`, payload);
  }

  remove(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/${id}`);
  }

  getWatchedAnimeIds(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.base}/ids`);
  }
}