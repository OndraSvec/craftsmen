import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { FirestoreService } from '../services/firestore/firestore.service';
import { NavigationState } from './NavigationState.type';
import { Craftsman } from '../services/firestore/credentials.type';

@Component({
  selector: 'app-add-review',
  templateUrl: './add-review.page.html',
  styleUrls: ['./add-review.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class AddReviewPage implements OnInit {
  addReviewForm!: FormGroup;
  private formSub!: Subscription;
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private navigationState!: NavigationState;
  private firestoreService: FirestoreService = inject(FirestoreService);
  private alertController: AlertController = inject(AlertController);
  public craftsmen: Craftsman[] = [];
  public filteredCraftsmen: Craftsman[] = [];
  public loading = false;
  public editMode = false;

  constructor() {
    this.navigationState = this.router.getCurrentNavigation()?.extras
      .state as NavigationState;
  }

  get existing() {
    return this.addReviewForm.get('existing');
  }

  get selectedCRN() {
    return this.addReviewForm.get('selectCRN');
  }

  get selectedCraftsman() {
    return this.addReviewForm.get('selectCraftsman');
  }

  get firstName() {
    return this.addReviewForm.get('firstName');
  }

  get lastName() {
    return this.addReviewForm.get('lastName');
  }

  get profession() {
    return this.addReviewForm.get('profession');
  }

  get company() {
    return this.addReviewForm.get('company');
  }

  get CRN() {
    return this.addReviewForm.get('CRN');
  }

  get city() {
    return this.addReviewForm.get('city');
  }

  get rating() {
    return this.addReviewForm.get('rating');
  }

  get message() {
    return this.addReviewForm.get('message');
  }

  private formInit() {
    this.addReviewForm = new FormGroup({
      existing: new FormControl(true, [Validators.required]),
      selectCRN: new FormControl('', [Validators.required]),
      selectCraftsman: new FormControl('', [Validators.required]),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      profession: new FormControl(''),
      company: new FormControl(''),
      CRN: new FormControl(''),
      city: new FormControl(''),
      rating: new FormControl('', [
        Validators.required,
        Validators.pattern('^[1-5]$'),
        Validators.maxLength(1),
        Validators.minLength(1),
      ]),
      message: new FormControl('', [Validators.required]),
    });

    if (this.existing) {
      this.formSub = this.existing.valueChanges.subscribe((val) => {
        if (val === false) {
          this.selectedCRN?.clearValidators();
          this.selectedCraftsman?.clearValidators();
          this.firstName?.setValidators([Validators.required]);
          this.lastName?.setValidators([Validators.required]);
          this.profession?.setValidators([Validators.required]);
          this.company?.setValidators([Validators.required]);
          this.city?.setValidators([Validators.required]);
          this.CRN?.setValidators([
            Validators.required,
            Validators.pattern('^[0-9]+$'),
          ]);
        } else {
          this.selectedCRN?.setValidators([Validators.required]);
          this.selectedCraftsman?.setValidators([Validators.required]);
          this.firstName?.clearValidators();
          this.lastName?.clearValidators();
          this.profession?.clearValidators();
          this.company?.clearValidators();
          this.city?.clearValidators();
          this.CRN?.clearValidators();
        }
        this.selectedCRN?.updateValueAndValidity();
        this.selectedCraftsman?.updateValueAndValidity();
        this.firstName?.updateValueAndValidity();
        this.lastName?.updateValueAndValidity();
        this.profession?.updateValueAndValidity();
        this.company?.updateValueAndValidity();
        this.city?.updateValueAndValidity();
        this.CRN?.updateValueAndValidity();
      });
    }

    if (this.editMode) {
      this.loading = true;

      this.addReviewForm.patchValue({
        selectCRN: this.navigationState.CRN,
        selectCraftsman: this.navigationState.craftsmanID,
        rating: this.navigationState.rating,
        message: this.navigationState.message,
      });

      this.selectedCRN?.disable();
      this.selectedCraftsman?.disable();
    }

    setTimeout(() => (this.loading = false), 700);
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      const paramID = params['id'];
      this.editMode = paramID === 'new' ? false : true;
      if (paramID !== 'new' && paramID !== 'edit')
        this.router.navigateByUrl('/home');
    });

    this.firestoreService.getCraftsmen().then((data) => {
      this.craftsmen = data;
      this.filteredCraftsmen = this.craftsmen;
    });
    this.formInit();
  }

  onCRNChange() {
    this.filteredCraftsmen = this.craftsmen.filter(
      (craftsman) => craftsman['CRN'] === this.selectedCRN?.value
    );
  }

  async onSubmit() {
    this.loading = true;

    let success = false;

    if (this.editMode) {
      success = await this.firestoreService.updateReview(
        +this.selectedCRN?.value,
        this.selectedCraftsman?.value,
        this.navigationState.reviewID,
        this.message?.value,
        +this.rating?.value
      );
    } else {
      if (this.existing?.value) {
        success = await this.firestoreService.addReview(
          this.message?.value,
          +this.rating?.value,
          +this.selectedCRN?.value,
          this.selectedCraftsman?.value
        );
      } else {
        const craftsmanID =
          await this.firestoreService.addUnregisteredCraftsman({
            firstName: this.firstName?.value,
            lastName: this.lastName?.value,
            profession: this.profession?.value,
            company: this.company?.value,
            CRN: +this.CRN?.value,
            city: this.city?.value,
          });
        if (craftsmanID) {
          success = await this.firestoreService.addReview(
            this.message?.value,
            +this.rating?.value,
            +this.CRN?.value,
            craftsmanID
          );
        }
      }
    }
    this.loading = false;
    if (success) {
      this.router.navigateByUrl('/home');
    } else {
      this.showAlert(`Oops..something went wrong!`, 'Please try again.');
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
