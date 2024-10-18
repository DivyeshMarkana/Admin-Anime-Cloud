import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/auth/login/login.component';
import { AuthGuard } from './shared/auth.guard';
// import { ContactsComponent } from './components/contacts/contacts.component';

const routes: Routes = [
  {
    path: '', redirectTo: 'dashboard', pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      {
        path: 'category', loadChildren: () => import('./components/product-category/product-category.module').then(m => m.ProductCategoryModule)
      },
      {
        path: 'recommendation', loadChildren: () => import('./components/Recommendation/Recommendation.module').then(m => m.RecommendationModule)
      },
      {
        path: 'latest', loadChildren: () => import('./components/latest/latest.module').then(m => m.LatestModule)
      },
      {
        path: 'products', loadChildren: () => import('./components/products/products.module').then(m => m.ProductsModule)
      },
    ],
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
    // children: [
    //   {
    //     path: 'category', loadChildren: () => import('./components/product-category/product-category.module').then(m => m.ProductCategoryModule)
    //   }
    // ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
