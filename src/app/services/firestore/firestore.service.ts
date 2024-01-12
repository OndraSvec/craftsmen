import { Injectable, inject } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import {
  DocumentData,
  Firestore,
  QueryConstraint,
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import {
  Craftsman,
  Credentials,
  Review,
  UnregisteredCredentials,
  UserInfo,
} from './credentials.type';
import { capitalize, capitalizeCity } from 'src/app/utils/utils';
import { nanoid } from 'nanoid';

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

  async addUnregisteredCraftsman(obj: UnregisteredCredentials) {
    try {
      const usersRef = collection(this.firestore, 'users');
      const docRef = await addDoc(usersRef, {
        firstName: capitalize(obj.firstName),
        lastName: capitalize(obj.lastName),
        type: 'Craftsman',
        profession: capitalize(obj.profession),
        company: obj.company,
        city: capitalizeCity(obj.city),
        CRN: +obj.CRN,
      });

      const userDocRef = doc(
        this.firestore,
        `reviews/${obj.CRN}/craftsmen/${docRef.id}`
      );
      await setDoc(
        userDocRef,
        {
          reviews: [],
        },
        { merge: true }
      );
      return docRef.id;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getCraftsmen() {
    try {
      const queryResult: DocumentData[] = [];

      const usersRef = collection(this.firestore, 'users');
      const q = query(
        usersRef,
        where('type', '==', 'Craftsman'),
        orderBy('lastName')
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        const dataID = doc.id;
        const data: DocumentData = doc.data();
        let dataWithReviews: DocumentData = {};

        const craftsmenRef = collection(
          this.firestore,
          `reviews/${data['CRN']}/craftsmen`
        );
        const craftsmanQ = query(
          craftsmenRef,
          where(documentId(), '==', `${dataID}`)
        );
        const craftsmanQS = await getDocs(craftsmanQ);
        craftsmanQS.forEach((doc) => {
          dataWithReviews = { ...data, ...doc.data(), id: doc.id };
        });
        queryResult.push(dataWithReviews);
      });
      return queryResult as Craftsman[];
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getUser(uid: string): Promise<UserInfo | null> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return {
        uid,
        firstName: userDocSnap.data()['firstName'],
        lastName: userDocSnap.data()['lastName'],
      };
    }
    return null;
  }

  async addReview(
    message: string,
    rating: number,
    CRN: number,
    craftsmanID: string
  ) {
    let reviewer;
    const user = this.auth.currentUser;
    if (user) {
      reviewer = await this.getUser(user.uid);
    }
    try {
      const craftsmanDocRef = doc(
        this.firestore,
        `reviews/${CRN}/craftsmen/${craftsmanID}`
      );
      if (reviewer) {
        await updateDoc(craftsmanDocRef, {
          reviews: arrayUnion({
            id: nanoid(),
            reviewer,
            message,
            rating,
          }),
        });
        this.craftsmenChanged.next(this.getCraftsmen());
        return true;
      }
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getReview(CRN: number, craftsmanID: string, reviewID: string) {
    try {
      const craftsmanDocRef = doc(
        this.firestore,
        `reviews/${CRN}/craftsmen/${craftsmanID}`
      );
      const craftsmanDocSnap = await getDoc(craftsmanDocRef);
      if (craftsmanDocSnap.exists()) {
        return craftsmanDocSnap
          .data()
          ['reviews'].find((review: Review) => reviewID === review.id);
      }
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async updateReview(
    CRN: number,
    craftsmanID: string,
    reviewID: string,
    message: string,
    rating: number
  ) {
    try {
      const craftsmanDocRef = doc(
        this.firestore,
        `reviews/${CRN}/craftsmen/${craftsmanID}`
      );
      const craftsmanDocSnap = await getDoc(craftsmanDocRef);
      if (craftsmanDocSnap.exists()) {
        const reviews = craftsmanDocSnap
          .data()
          ['reviews'].map((review: Review) =>
            review.id === reviewID
              ? {
                  ...review,
                  message,
                  rating,
                }
              : review
          );
        await updateDoc(craftsmanDocRef, {
          reviews,
        });
      }
      this.craftsmenChanged.next(this.getCraftsmen());
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
