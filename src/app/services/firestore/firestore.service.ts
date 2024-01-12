import { Injectable, inject } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import {
  Firestore,
  QueryConstraint,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { Craftsman, Credentials, Review } from './credentials.type';
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

  async addCraftsman(user: User, obj: Credentials) {
    if (!obj.profession) return;
    try {
      // Check whether there is an unregistered craftsman
      // representing the newly registered one
      // to copy over reviews
      const usersRef = collection(this.firestore, 'users');
      const queryConstraints: QueryConstraint[] = [];
      if (obj.profession && obj.CRN) {
        queryConstraints.push(
          where('firstName', '==', capitalize(obj.firstName))
        );
        queryConstraints.push(
          where('lastName', '==', capitalize(obj.lastName))
        );
        queryConstraints.push(
          where('profession', '==', capitalize(obj.profession))
        );
        queryConstraints.push(where('CRN', '==', +obj.CRN));
      }

      const reviewsToCopy: Review[] = [];
      let q = query(usersRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const unregisteredCraftsmanData = querySnapshot.docs[0];
        const unregCraftID = unregisteredCraftsmanData.id;
        const unregCraftRef = doc(this.firestore, `users/${unregCraftID}`);
        await deleteDoc(unregCraftRef);

        const unregCraftRevRef = doc(
          this.firestore,
          `reviews/${obj.CRN}/craftsmen/${unregCraftID}`
        );
        const unregCraftRevData = await getDoc(unregCraftRevRef);
        if (unregCraftRevData.exists()) {
          reviewsToCopy.push(...unregCraftRevData.data()['reviews']);
          await deleteDoc(unregCraftRevRef);
        }
      }

      const userDocRef = doc(
        this.firestore,
        `reviews/${obj.CRN}/craftsmen/${user.uid}`
      );
      await setDoc(
        userDocRef,
        {
          reviews: [...reviewsToCopy],
        },
        { merge: true }
      );

      return true;
    } catch (error) {
      return false;
    }
  }
}
