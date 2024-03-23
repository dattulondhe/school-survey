import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabhomePageRoutingModule } from './tabhome-routing.module';

import { TabhomePage } from './tabhome.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabhomePageRoutingModule
  ],
  declarations: [TabhomePage]
})
export class TabhomePageModule {}
