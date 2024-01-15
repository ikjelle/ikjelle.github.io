import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap, catchError, throwError, delay, switchMap, timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpCacheService {
  /**
   * For as long as session exists, remember results. 
   * The data used is never real time data, so someone not getting the latest data is not an issue
   */
  private cache: { [url: string]: any } = {};

  constructor(private http: HttpClient) { }

  get<T>(url: string): Observable<T> {
    if (this.cache[url]) {
      // If data is already in the cache, return it as an observable
      return timer(0).pipe(
        switchMap(() => of(this.cache[url])));
    } else {
      // If data is not in the cache, make the HTTP request
      return this.http.get<T>(url).pipe(
        tap((data) => {
          // Store the data in the cache
          this.cache[url] = data;
        }),
        catchError((error) => {
          // Handle errors and propagate them to the application
          console.error(`Error fetching data from ${url}:`, error);
          return throwError(() => error);
        })
      );
    }
  }
}