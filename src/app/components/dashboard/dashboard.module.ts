import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
// import { DashboardRoutingModule } from './dashboard-routing.module';
import { MaterialModule } from 'src/app/material/material.module';
import { Route, RouterModule } from '@angular/router';

const routes: Route[] = [
  {
    path: '',
    component: DashboardComponent
  }
]



@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes),
    // DashboardRoutingModule,
    MaterialModule
  ]
})
export class DashboardModule { }
