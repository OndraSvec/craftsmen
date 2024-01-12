import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth/auth.service';
import { FirestoreService } from '../services/firestore/firestore.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Craftsman } from '../services/firestore/credentials.type';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage implements OnInit, OnDestroy {
  private authService: AuthService = inject(AuthService);
  private firestoreService: FirestoreService = inject(FirestoreService);
  private router: Router = inject(Router);
  craftsmenSub!: Subscription;
  public craftsmen: Craftsman[] = [];
  public filteredCraftsmen: Craftsman[] = [];
  public orderByAsc = true;
  public sortBy = 'Last Name';
  public searchValue = '';
  public loading = false;

  constructor() {}

  ngOnInit(): void {
    this.loadCraftsmen();
    this.craftsmenSub = this.firestoreService.craftsmenChanged.subscribe(
      (craftsmenData) =>
        craftsmenData.then((data) => {
          this.orderByAsc = true;
          this.sortBy = 'Last Name';
          this.searchValue = '';
          this.craftsmen = data;
          this.filteredCraftsmen = this.craftsmen;
        })
    );
  }

  loadCraftsmen() {
    this.loading = true;

    this.firestoreService
      .getCraftsmen()
      .then((data) => {
        this.craftsmen = data;
        this.filteredCraftsmen = data;
      })
      .finally(() => (this.loading = false));
  }

  ngOnDestroy(): void {
    this.craftsmenSub.unsubscribe();
  }
}
