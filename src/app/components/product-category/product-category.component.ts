import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from 'src/app/shared/api.service';
import { collection, Firestore, onSnapshot, deleteDoc, updateDoc, doc } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { AddProductCategoryComponent } from './add-product-category/add-product-category.component';

export interface UserData {
  id: string;
  name: string;
  progress: string;
  fruit: string;
}

@Component({
  selector: 'app-product-category',
  templateUrl: './product-category.component.html',
  styleUrls: ['./product-category.component.scss']
})
export class ProductCategoryComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['photo', 'category', 'categoryId', 'id', 'actions'];
  dataSource: MatTableDataSource<UserData>;

  categories: any = [];

  // @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private api: ApiService,
    private firestore: Firestore,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.getCategories();

    // this.dialog.open(AddProductCategoryComponent, {
    //   id: 'product-dialog',
    //   width: '500px',
    //   height: '455px',
    //   disableClose: true
    // })
    // this.api.getData('categories', this.categories);
  }

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  }

  getCategories() {
    const databaseInstance = collection(this.firestore, 'categories');

    onSnapshot(databaseInstance, snapshot => {
      let data: any[] = []
      snapshot.forEach(doc => {
        data.push({ ...doc.data(), id: doc.id })
        this.categories = data;
        // console.log(this.categories);
        this.dataSource = new MatTableDataSource(this.categories);
      });
    })
  }

  addCategory() {
    this.dialog.open(AddProductCategoryComponent, {
      id: 'product-dialog',
      width: '500px',
      height: '500px'
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    // if (this.dataSource.paginator) {
    //   this.dataSource.paginator.firstPage();
    // }
  }

  edit(row) {
    const ref = this.dialog.open(AddProductCategoryComponent, {
      id: 'product-dialog',
      width: '500px',
      height: '500px'
    });
    ref.componentInstance.data = row;

  }

  delete(row) {
    const contactToDelete = doc(this.firestore, 'categories', row.id)
    deleteDoc(contactToDelete).then((response) => {
      alert('category deleted successfully')
    }).catch((err) => {
      alert(err.message)
    })
  }



}