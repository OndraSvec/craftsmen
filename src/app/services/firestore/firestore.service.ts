import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { Craftsman } from './credentials.type';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);

  constructor() {}

  craftsmenChanged = new Subject<Promise<Craftsman[]>>();
}
