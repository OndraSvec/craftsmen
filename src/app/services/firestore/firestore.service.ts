import { Injectable, inject } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { Craftsman, Credentials } from './credentials.type';
import { capitalize, capitalizeCity } from 'src/app/utils/utils';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);

  constructor() {}

  craftsmenChanged = new Subject<Promise<Craftsman[]>>();

  async addUser(user: User, obj: Credentials) {
    try {
      const { firstName, lastName, email, type } = obj;

      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      await setDoc(
        userDocRef,
        obj.profession && obj.city && obj.company && obj.CRN
          ? {
              firstName: capitalize(firstName),
              lastName: capitalize(lastName),
              email,
              type: capitalize(type),
              profession: capitalize(obj.profession),
              company: obj.company,
              city: capitalizeCity(obj.city),
              CRN: +obj.CRN,
            }
          : {
              firstName: capitalize(firstName),
              lastName: capitalize(lastName),
              email,
              type: capitalize(type),
            },
        { merge: true }
      );

      return userDocRef;
    } catch (error) {
      return false;
    }
  }
}
