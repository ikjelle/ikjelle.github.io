import { Injectable } from '@angular/core';
import { Party } from './OData/models/models';
import { ODataResponse } from './OData/models/response';
import { ResultService } from './result.service';
import { BehaviorSubject } from 'rxjs';
import { HttpCacheService } from './http-cache.service';

@Injectable({
  providedIn: 'root'
})
export class PartyService {

  constructor(private http: HttpCacheService, private resultsService: ResultService) { }

  parties: { [id: string]: BehaviorSubject<Party | null> } = {}
  retrieving: string[] = []

  preSetParties(partyIds: string[]) {
    let ids = [];
    for (let id of partyIds) {
      if (!(this.parties[id]) && id.length > 10)
        if (!this.retrieving.find(r => r == id)) {
          ids.push(id)
          this.parties[id] = new BehaviorSubject<Party | null>(null);
        }
    }
    if (ids.length == 0) return;
    let url = this.resultsService.getPartiesByIds(ids).generateUrl()

    this.retrieving.push(...ids)
    this.http.get<ODataResponse<Party>>(url).subscribe({
      next: (response) => {
        for (let p of response.value) {
          this.parties[p.Id].next(p);
          this.retrieving.filter(r => r != p.Id)
        }
      },
      error: err => { }
    })
  }

  getPartyById(id: string): BehaviorSubject<Party | null> {
    if (!(id in this.parties))
      this.preSetParties([id])
    return this.parties[id]
  }
}
