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
import { sortCraftsmen } from '../utils/utils';

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

  onSortByChange() {
    this.sortBy === 'Last Name'
      ? (this.sortBy = 'Rating')
      : (this.sortBy = 'Last Name');
    this.craftsmen = sortCraftsmen(
      this.craftsmen,
      this.sortBy,
      this.orderByAsc ? 'asc' : 'desc'
    );
    this.filteredCraftsmen = sortCraftsmen(
      this.filteredCraftsmen,
      this.sortBy,
      this.orderByAsc ? 'asc' : 'desc'
    );
  }

  onOrderByChange() {
    this.orderByAsc ? (this.orderByAsc = false) : (this.orderByAsc = true);
    this.craftsmen = sortCraftsmen(
      this.craftsmen,
      this.sortBy,
      this.orderByAsc ? 'asc' : 'desc'
    );
    this.filteredCraftsmen = sortCraftsmen(
      this.filteredCraftsmen,
      this.sortBy,
      this.orderByAsc ? 'asc' : 'desc'
    );
  }

  onSearch() {
    this.filteredCraftsmen = this.craftsmen.filter(
      (craftsman) =>
        craftsman.CRN.toString().includes(this.searchValue) ||
        craftsman.firstName
          .toLowerCase()
          .includes(this.searchValue.toLowerCase()) ||
        craftsman.lastName
          .toLowerCase()
          .includes(this.searchValue.toLowerCase())
    );
  }

  ngOnDestroy(): void {
    this.craftsmenSub.unsubscribe();
  }
}
