import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabhomePage } from './tabhome.page';

const routes: Routes = [
  {
    path: '',
    component: TabhomePage,

    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'survey',
      },
      {
        path: 'survey',
        loadChildren: () => import('../survey/survey.module').then(m => m.SurveyPageModule)
      },
      {
        path: 'list',
        loadChildren: () => import('../list/list.module').then(m => m.ListPageModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabhomePageRoutingModule { }
