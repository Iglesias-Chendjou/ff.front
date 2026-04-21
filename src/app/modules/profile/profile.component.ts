import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FR } from '../../i18n/fr';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { LoadingSpinnerWidget } from '../../core/widgets/loading-spinner.widget';
import { User, Address } from '../../core/model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerWidget],
  template: `
    <div class="profile">
      @if (loading()) {
        <div class="loading-wrap"><ff-loading /></div>
      } @else if (error()) {
        <div class="error-state">
          <span class="error-icon">😔</span>
          <p>{{ error() }}</p>
          <button class="btn-retry" (click)="loadData()">Reessayer</button>
        </div>
      } @else {
        <!-- Profile Header -->
        <div class="profile-header">
          <div class="avatar">
            <span class="avatar-initials">{{ user()?.firstName?.charAt(0) ?? '' }}{{ user()?.lastName?.charAt(0) ?? '' }}</span>
          </div>
          <div class="profile-header-info">
            <h1>{{ user()?.firstName }} {{ user()?.lastName }}</h1>
            <p class="profile-email">{{ user()?.email }}</p>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button class="tab" [class.active]="activeTab() === 'info'" (click)="activeTab.set('info')">
            👤 Informations
          </button>
          <button class="tab" [class.active]="activeTab() === 'addresses'" (click)="activeTab.set('addresses')">
            📍 Adresses
          </button>
          <button class="tab" [class.active]="activeTab() === 'preferences'" (click)="activeTab.set('preferences')">
            ⚙️ Preferences
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Info Tab -->
          @if (activeTab() === 'info') {
            <div class="info-card" style="animation: fadeIn 0.3s ease">
              @if (user()) {
                <div class="form-grid">
                  <div class="form-group">
                    <label>{{ t.auth.firstName }}</label>
                    <input type="text" class="form-input" [(ngModel)]="firstName" />
                  </div>
                  <div class="form-group">
                    <label>{{ t.auth.lastName }}</label>
                    <input type="text" class="form-input" [(ngModel)]="lastName" />
                  </div>
                  <div class="form-group">
                    <label>{{ t.auth.email }}</label>
                    <input type="email" class="form-input" [value]="user()!.email" disabled />
                  </div>
                  <div class="form-group">
                    <label>{{ t.auth.phone }}</label>
                    <input type="tel" class="form-input" [(ngModel)]="phone" />
                  </div>
                </div>

                @if (saveSuccess()) {
                  <div class="success-msg">✅ {{ t.common.success }}</div>
                }
                @if (saveError()) {
                  <div class="error-msg">⚠️ {{ saveError() }}</div>
                }

                <button class="btn-save" (click)="saveProfile()" [disabled]="saving()">
                  @if (saving()) {
                    <span class="spinner"></span>
                    Enregistrement...
                  } @else {
                    {{ t.common.save }}
                  }
                </button>
              }
            </div>
          }

          <!-- Addresses Tab -->
          @if (activeTab() === 'addresses') {
            <div class="addresses-tab" style="animation: fadeIn 0.3s ease">
              @if (addresses().length > 0) {
                <div class="addresses-grid">
                  @for (addr of addresses(); track addr.id) {
                    <div class="address-card" [class.default]="addr.isDefault">
                      @if (addr.isDefault) {
                        <span class="default-badge">✓ Par defaut</span>
                      }

                      <div class="address-content">
                        @if (addr.label) {
                          <h4 class="address-label">{{ addr.label }}</h4>
                        }
                        <p class="address-line">{{ addr.number }} {{ addr.street }}</p>
                        <p class="address-line">{{ addr.postalCode }} {{ addr.city }}</p>
                        <p class="address-commune">{{ addr.commune }}</p>
                      </div>

                      <div class="address-actions">
                        @if (!addr.isDefault) {
                          <button class="action-btn default-btn" (click)="setDefault(addr.id)">
                            📌 Par defaut
                          </button>
                        }
                        <button class="action-btn delete-btn" (click)="deleteAddress(addr.id)">
                          🗑️
                        </button>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-addresses">
                  <span>📍</span>
                  <p>Aucune adresse enregistree</p>
                </div>
              }

              <!-- Add Address Form -->
              <div class="add-address-card">
                <h3>Ajouter une adresse</h3>
                <div class="form-grid">
                  <div class="form-group small">
                    <label>Numero</label>
                    <input type="text" class="form-input" [(ngModel)]="newAddress.number" />
                  </div>
                  <div class="form-group">
                    <label>Rue</label>
                    <input type="text" class="form-input" [(ngModel)]="newAddress.street" />
                  </div>
                  <div class="form-group small">
                    <label>Code postal</label>
                    <input type="text" class="form-input" [(ngModel)]="newAddress.postalCode" />
                  </div>
                  <div class="form-group">
                    <label>Ville</label>
                    <input type="text" class="form-input" [(ngModel)]="newAddress.city" />
                  </div>
                  <div class="form-group">
                    <label>Commune</label>
                    <input type="text" class="form-input" [(ngModel)]="newAddress.commune" />
                  </div>
                  <div class="form-group">
                    <label>Label (optionnel)</label>
                    <input type="text" class="form-input" placeholder="ex: Maison, Bureau" [(ngModel)]="newAddress.label" />
                  </div>
                </div>

                @if (addAddressError()) {
                  <div class="error-msg">⚠️ {{ addAddressError() }}</div>
                }

                <button class="btn-add" (click)="addAddress()" [disabled]="addingAddress()">
                  @if (addingAddress()) {
                    <span class="spinner"></span> Ajout en cours...
                  } @else {
                    + Ajouter
                  }
                </button>
              </div>
            </div>
          }

          <!-- Preferences Tab -->
          @if (activeTab() === 'preferences') {
            <div class="preferences-tab" style="animation: fadeIn 0.3s ease">
              <div class="pref-card">
                <h3>Notifications</h3>
                <p class="pref-desc">Gerez vos preferences de notification</p>
                <div class="pref-item">
                  <span>Notifications push</span>
                  <span class="pref-badge">Actives</span>
                </div>
                <div class="pref-item">
                  <span>Email promotionnel</span>
                  <span class="pref-badge">Actives</span>
                </div>
              </div>
              <div class="pref-card">
                <h3>Zone de livraison</h3>
                <p class="pref-desc">Votre zone determine les produits disponibles dans le catalogue</p>
                <div class="pref-item">
                  <span>Zone actuelle</span>
                  <span class="pref-badge">Bruxelles</span>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .profile {
      max-width: 850px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    /* States */
    .loading-wrap { padding: 4rem; text-align: center; }

    .error-state {
      text-align: center; padding: 4rem;
      .error-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
      p { color: var(--ff-text-light); font-size: 1.1rem; margin-bottom: 1.25rem; }
    }

    .btn-retry {
      padding: 0.65rem 1.75rem;
      background: linear-gradient(135deg, var(--ff-green-700), var(--ff-green-900));
      color: white; border: none; border-radius: var(--ff-radius);
      cursor: pointer; font-weight: 700;
    }

    /* ==========================================
       PROFILE HEADER
       ========================================== */
    .profile-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
      padding: 2rem;
      background: white;
      border-radius: var(--ff-radius-xl);
      box-shadow: var(--ff-shadow);
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--ff-green-700), var(--ff-green-900));
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 16px rgba(46, 125, 50, 0.25);
    }

    .avatar-initials {
      color: white;
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: 1px;
    }

    .profile-header-info h1 {
      color: var(--ff-green-900);
      font-size: 1.5rem;
      font-weight: 800;
      margin: 0;
    }

    .profile-email {
      color: var(--ff-text-muted);
      font-size: 0.9rem;
      margin: 0.15rem 0 0 0;
    }

    /* ==========================================
       TABS
       ========================================== */
    .tabs {
      display: flex;
      gap: 0.25rem;
      margin-bottom: 1.5rem;
      background: var(--ff-green-50);
      padding: 0.35rem;
      border-radius: var(--ff-radius);
    }

    .tab {
      flex: 1;
      padding: 0.7rem 1rem;
      border: none;
      background: transparent;
      color: var(--ff-text-muted);
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      border-radius: 0.5rem;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;

      &:hover { color: var(--ff-green-700); }

      &.active {
        background: white;
        color: var(--ff-green-700);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
      }
    }

    /* ==========================================
       FORM COMMON
       ========================================== */
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      &.small { grid-column: span 1; }

      label {
        display: block;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--ff-text);
        margin-bottom: 0.35rem;
      }
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid var(--ff-border);
      border-radius: var(--ff-radius);
      font-size: 0.95rem;
      box-sizing: border-box;
      transition: all 0.2s;
      background: white;

      &:focus { border-color: var(--ff-green-400); outline: none; box-shadow: 0 0 0 3px rgba(102, 187, 106, 0.15); }
      &:disabled { background: #f5f5f5; color: var(--ff-text-muted); }
    }

    /* ==========================================
       INFO TAB
       ========================================== */
    .info-card {
      background: white;
      border-radius: var(--ff-radius-lg);
      padding: 2rem;
      box-shadow: var(--ff-shadow);
    }

    .btn-save {
      width: 100%;
      padding: 0.85rem;
      background: linear-gradient(135deg, var(--ff-green-700), var(--ff-green-900));
      color: white; border: none; border-radius: var(--ff-radius);
      font-size: 1rem; font-weight: 700; cursor: pointer;
      margin-top: 1rem; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      box-shadow: 0 2px 8px rgba(46, 125, 50, 0.25);

      &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(46, 125, 50, 0.35); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .success-msg {
      background: var(--ff-green-50); color: var(--ff-green-700);
      padding: 0.65rem 1rem; border-radius: 0.5rem;
      font-size: 0.85rem; font-weight: 600; margin-top: 0.75rem;
    }

    .error-msg {
      background: #ffebee; color: #c62828;
      padding: 0.65rem 1rem; border-radius: 0.5rem;
      font-size: 0.85rem; margin-top: 0.75rem;
    }

    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
      border-radius: 50%; animation: spin 0.7s linear infinite;
    }

    /* ==========================================
       ADDRESSES TAB
       ========================================== */
    .addresses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .address-card {
      background: white;
      border-radius: var(--ff-radius-lg);
      padding: 1.25rem;
      box-shadow: var(--ff-shadow-sm);
      border: 2px solid transparent;
      position: relative;
      transition: all 0.2s;

      &:hover { box-shadow: var(--ff-shadow); border-color: var(--ff-green-100); }

      &.default {
        border-color: var(--ff-green-400);
        background: linear-gradient(135deg, white, var(--ff-green-50));
      }
    }

    .default-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: var(--ff-green-50);
      color: var(--ff-green-700);
      padding: 0.15rem 0.6rem;
      border-radius: 1rem;
      font-size: 0.7rem;
      font-weight: 700;
    }

    .address-label {
      color: var(--ff-green-900);
      margin: 0 0 0.35rem 0;
      font-size: 1rem;
    }

    .address-line {
      color: var(--ff-text);
      margin: 0.1rem 0;
      font-size: 0.9rem;
    }

    .address-commune {
      color: var(--ff-text-muted);
      font-size: 0.85rem;
      margin: 0.1rem 0 0.75rem 0;
    }

    .address-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      padding: 0.35rem 0.75rem;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
      transition: all 0.2s;

      &.default-btn {
        background: var(--ff-green-50);
        color: var(--ff-green-700);
        &:hover { background: var(--ff-green-100); }
      }

      &.delete-btn {
        background: var(--ff-red-light);
        color: var(--ff-red);
        &:hover { background: #ffcdd2; }
      }
    }

    .empty-addresses {
      text-align: center;
      padding: 2rem;
      color: var(--ff-text-muted);
      margin-bottom: 2rem;
      span { font-size: 3rem; display: block; margin-bottom: 0.5rem; }
    }

    .add-address-card {
      background: white;
      border-radius: var(--ff-radius-lg);
      padding: 2rem;
      box-shadow: var(--ff-shadow);

      h3 {
        color: var(--ff-green-900);
        margin: 0 0 1.25rem 0;
        font-size: 1.15rem;
      }
    }

    .btn-add {
      padding: 0.7rem 1.75rem;
      background: linear-gradient(135deg, var(--ff-green-700), var(--ff-green-900));
      color: white; border: none; border-radius: var(--ff-radius);
      cursor: pointer; font-weight: 700; margin-top: 0.75rem;
      transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.5rem;

      &:hover:not(:disabled) { transform: translateY(-1px); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    /* ==========================================
       PREFERENCES TAB
       ========================================== */
    .preferences-tab {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .pref-card {
      background: white;
      border-radius: var(--ff-radius-lg);
      padding: 1.75rem;
      box-shadow: var(--ff-shadow-sm);

      h3 { color: var(--ff-green-900); margin: 0 0 0.25rem 0; }
    }

    .pref-desc {
      color: var(--ff-text-muted);
      font-size: 0.85rem;
      margin: 0 0 1rem 0;
    }

    .pref-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.65rem 0;
      border-bottom: 1px solid #f5f5f5;
      font-size: 0.9rem;
      color: var(--ff-text);
    }

    .pref-badge {
      background: var(--ff-green-50);
      color: var(--ff-green-700);
      padding: 0.2rem 0.65rem;
      border-radius: 1rem;
      font-size: 0.8rem;
      font-weight: 600;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .profile-header { flex-direction: column; text-align: center; }
      .form-grid { grid-template-columns: 1fr; }
      .tabs { flex-direction: column; }
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class ProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);

  t = FR;
  loading = signal(true);
  error = signal('');
  user = signal<User | null>(null);
  addresses = signal<Address[]>([]);
  saving = signal(false);
  saveError = signal('');
  saveSuccess = signal(false);
  addingAddress = signal(false);
  addAddressError = signal('');
  activeTab = signal<'info' | 'addresses' | 'preferences'>('info');

  firstName = '';
  lastName = '';
  phone = '';

  newAddress = {
    street: '',
    number: '',
    postalCode: '',
    city: '',
    commune: '',
    latitude: 0,
    longitude: 0,
    isDefault: false,
    label: '',
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set('');

    let profileLoaded = false;
    let addressesLoaded = false;
    const checkDone = () => {
      if (profileLoaded && addressesLoaded) this.loading.set(false);
    };

    this.profileService.getProfile().subscribe({
      next: (user) => {
        this.user.set(user);
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.phone = user.phone;
        profileLoaded = true;
        checkDone();
      },
      error: () => {
        this.error.set(this.t.common.error);
        profileLoaded = true;
        checkDone();
      },
    });

    this.profileService.getAddresses().subscribe({
      next: (addresses) => {
        this.addresses.set(addresses);
        addressesLoaded = true;
        checkDone();
      },
      error: () => {
        addressesLoaded = true;
        checkDone();
      },
    });
  }

  saveProfile(): void {
    this.saving.set(true);
    this.saveError.set('');
    this.saveSuccess.set(false);

    this.profileService.updateProfile({
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
    }).subscribe({
      next: (updated) => {
        this.user.set(updated);
        this.saving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: () => {
        this.saveError.set(this.t.common.error);
        this.saving.set(false);
      },
    });
  }

  addAddress(): void {
    if (!this.newAddress.street || !this.newAddress.postalCode || !this.newAddress.city || !this.newAddress.commune) {
      this.addAddressError.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    this.addingAddress.set(true);
    this.addAddressError.set('');

    this.profileService.addAddress(this.newAddress).subscribe({
      next: (addr) => {
        this.addresses.update(list => [...list, addr]);
        this.newAddress = { street: '', number: '', postalCode: '', city: '', commune: '', latitude: 0, longitude: 0, isDefault: false, label: '' };
        this.addingAddress.set(false);
      },
      error: () => {
        this.addAddressError.set(this.t.common.error);
        this.addingAddress.set(false);
      },
    });
  }

  deleteAddress(id: string): void {
    this.profileService.deleteAddress(id).subscribe({
      next: () => {
        this.addresses.update(list => list.filter(a => a.id !== id));
      },
      error: () => {},
    });
  }

  setDefault(id: string): void {
    this.profileService.setDefaultAddress(id).subscribe({
      next: () => {
        this.addresses.update(list =>
          list.map(a => ({ ...a, isDefault: a.id === id }))
        );
      },
      error: () => {},
    });
  }
}
