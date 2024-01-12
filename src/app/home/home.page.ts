import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  IonAccordion,
  IonAccordionGroup,
  IonAvatar,
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSearchbar,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  logOutOutline,
  personCircleOutline,
  arrowUpOutline,
  arrowDownOutline,
} from 'ionicons/icons';
import { AuthService } from '../services/auth/auth.service';
import { FirestoreService } from '../services/firestore/firestore.service';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Craftsman } from '../services/firestore/credentials.type';
import { sortCraftsmen } from '../utils/utils';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { AveragePipe } from '../pipes/average/average.pipe';
import { ToFixedOnePipe } from '../pipes/toFixedOne/to-fixed-one.pipe';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    AveragePipe,
    ToFixedOnePipe,
    FormsModule,
    IonAccordion,
    IonAccordionGroup,
    IonAvatar,
    IonBadge,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSearchbar,
    IonSkeletonText,
    IonTitle,
    IonToolbar,
    LoadingSpinnerComponent,
    RouterLink,
  ],
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

  constructor() {
    addIcons({
      logOutOutline,
      personCircleOutline,
      arrowUpOutline,
      arrowDownOutline,
    });
  }

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

  async onNavigate(reviewID: string, CRN: number, craftsmanID: string) {
    const review = await this.firestoreService.getReview(
      CRN,
      craftsmanID,
      reviewID
    );
    const currentUser = this.authService.getUser();

    if (review.reviewer.uid !== currentUser) return;

    this.router.navigate(['/add-review', 'edit'], {
      state: {
        CRN,
        craftsmanID,
        reviewID,
        message: review.message,
        rating: review.rating,
      },
    });
  }

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  ngOnDestroy(): void {
    this.craftsmenSub.unsubscribe();
  }
}
