import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecommendationComponent } from './Recommendation.component';
import { Route, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import {MatSelectModule} from '@angular/material/select';


// import { AddProductComponent } from './add-product/add-product.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { AddSeasonComponent } from './add-season/add-season.component';


const routes: Route[] = [
  {
    path: '', component: RecommendationComponent
  }
]



@NgModule({
  declarations: [
    RecommendationComponent,
    // AddProductComponent,
    // AddSeasonComponent
  ],
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatExpansionModule,
    RouterModule.forChild(routes)
  ]
})
export class RecommendationModule { }
