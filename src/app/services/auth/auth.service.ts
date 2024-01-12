import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import { Credentials } from '../firestore/credentials.type';
import { FirestoreService } from '../firestore/firestore.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestoreService: FirestoreService = inject(FirestoreService);

  constructor() {}

  getUser() {
    return this.auth.currentUser?.uid;
  }

  async validateUser(action: string, obj: Credentials) {
    try {
      let userCred;
      if (action === 'registration') {
        userCred = await createUserWithEmailAndPassword(
          this.auth,
          obj.email,
          obj.password
        );

        const user = this.auth.currentUser;
        if (user) {
          await this.firestoreService.addUser(user, obj);
          await this.firestoreService.addCraftsman(user, obj);
        }
      } else if (action === 'login') {
        userCred = await signInWithEmailAndPassword(
          this.auth,
          obj.email,
          obj.password
        );
      }
      return userCred;
    } catch (error) {
      return null;
    }
  }

  register(obj: Credentials) {
    return this.validateUser('registration', obj);
  }
}
