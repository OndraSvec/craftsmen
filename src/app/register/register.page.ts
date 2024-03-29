import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertController } from '@ionic/angular';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonGrid,
  IonInput,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonContent,
    IonHeader,
    IonGrid,
    IonInput,
    IonRow,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
    LoadingSpinnerComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
})
export class RegisterPage implements OnInit, OnDestroy {
  credentials!: FormGroup;
  private formSub!: Subscription;
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);
  private alertController: AlertController = inject(AlertController);
  public loading = false;

  userTypes = ['Reviewer', 'Craftsman'];

  constructor() {}

  get type() {
    return this.credentials.get('type');
  }

  get profession() {
    return this.credentials.get('profession');
  }

  get company() {
    return this.credentials.get('company');
  }

  get CRN() {
    return this.credentials.get('CRN');
  }

  get city() {
    return this.credentials.get('city');
  }

  ngOnInit() {
    this.credentials = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
      type: new FormControl('', [Validators.required]),
      profession: new FormControl(''),
      company: new FormControl(''),
      city: new FormControl(''),
      CRN: new FormControl(''),
    });

    if (this.type) {
      this.formSub = this.type.valueChanges.subscribe((val) => {
        if (val === 'Craftsman') {
          this.profession?.setValidators([Validators.required]);
          this.company?.setValidators([Validators.required]);
          this.city?.setValidators([Validators.required]);
          this.CRN?.setValidators([
            Validators.required,
            Validators.pattern('^[0-9]+$'),
          ]);
        } else {
          this.profession?.clearValidators();
          this.company?.clearValidators();
          this.city?.clearValidators();
          this.CRN?.clearValidators();
        }
        this.profession?.updateValueAndValidity();
        this.company?.updateValueAndValidity();
        this.city?.updateValueAndValidity();
        this.CRN?.updateValueAndValidity();
      });
    }
  }

  async register() {
    this.loading = true;
    const user = await this.authService.register(this.credentials.value);
    this.loading = false;

    if (user) {
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } else {
      this.showAlert(`Oops..registration failed!`, 'Please try again.');
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

  ngOnDestroy(): void {
    this.formSub.unsubscribe();
  }
}
