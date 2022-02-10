import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
})
export class TermsComponent implements OnInit, OnDestroy {

  private backButtonSubscription: Subscription;

  constructor(private modalController: ModalController,
              private platform: Platform) { }

  ngOnInit() {
    this.backButtonSubscription = this.platform.backButton.subscribe(async () => {
      await this.closePopup();
    });
  }

  ngOnDestroy(): void {
    this.backButtonSubscription.unsubscribe();
  }

  public async closePopup(): Promise<void> {
    await this.modalController.dismiss(null, null, ModalService.ModalIds.Terms);
  }

}
