import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
// import { ApiService } from 'src/app/shared/api.service';
import { collection, Firestore, onSnapshot, deleteDoc, updateDoc, doc, query, where, getDocs } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { AddProductComponent } from './add-product/add-product.component';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AddSeasonComponent } from './add-season/add-season.component';

export interface UserData {
  id: string;
  name: string;
  progress: string;
  fruit: string;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  styles: [
    `
        .mat-column-details {
            width:100px !important;
        }
        .example-table {
            width: 100%
        }

        .example-detail-row {
    height: 0px !important;
}

tr.example-element-row:not(.example-expanded-row):hover {
    background: whitesmoke;
}

tr.example-element-row:not(.example-expanded-row):active {
    background: #efefef;
}

.example-element-row td {
    border-bottom-width: 0;
}

.example-element-detail {
    overflow: hidden;
    display: flex;
}

.example-element-diagram {
    min-width: 80px;
    border: 2px solid black;
    padding: 8px;
    font-weight: lighter;
    margin: 8px 0;
    height: 104px;
}

.example-element-symbol {
    font-weight: bold;
    font-size: 40px;
    line-height: normal;
}

.example-element-description {
    padding: 16px;
}

.example-element-description-attribution {
    opacity: 0.5;
}
        `
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ProductsComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['details', 'poster', 'name', 'id', 'actions'];
  displayedChildColumns: string[] = ['subDetails', 'poster', 'season', 'teaser', 'id', 'actions'];
  dataSource: MatTableDataSource<any>;
  childDataSource: MatTableDataSource<any>;

  categories: any = [];
  products: any = [];
  seasons: any = [];

  expandedElement: any = null;
  expandedChildElement: any = null;

  // @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private firestore: Firestore,
    private dialog: MatDialog,
    private change: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    // this.getCategories();
    this.getProducts();

    this.seasons = [
      // {
      //   poster: '',
      //   season: '1',
      //   teaser: 'Video 11',
      //   id: 600
      // },
      // {
      //   poster: '',
      //   season: '2',
      //   teaser: 'Video 22',
      //   id: 601
      // },
    ]

    this.childDataSource = new MatTableDataSource(this.seasons);


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

  expandRow(row) {
    this.expandedElement = this.expandedElement === row ? null : row;
    if(this.expandedElement === row){
      this.getAnimeSeasons(row.id);
    }
  }

  expandChildRow(row) {
    this.expandedChildElement = this.expandedChildElement === row ? null : row;
  }


  getProducts() {
    // const databaseInstance = collection(this.firestore, 'products');

    // const q = query(collection(this.firestore, "products"), where("categoryId", "==", "rBaPFykOrcWfANR6PZpG"));

    // getDocs(q).then((snapshot) => {
    //   let data: any[] = []
    //   snapshot.forEach(doc => {
    //     data.push({ ...doc.data(), id: doc.id })
    //     this.products = data;
    //   });
    //   // this.dataSource = new MatTableDataSource(this.products);
    //   console.log(this.products);
    // })

    const databaseInstance = collection(this.firestore, 'anime');

    onSnapshot(databaseInstance, snapshot => {
      let data: any[] = []
      snapshot.forEach(doc => {
        data.push({ ...doc.data(), id: doc.id })
        this.categories = data;
        // console.log(this.categories);
      });
      this.dataSource = new MatTableDataSource(this.categories);
    })
  }

  getAnimeSeasons(id) {
    this.seasons = [];
    this.childDataSource = new MatTableDataSource();

    console.log(id);

    const databaseInstance = collection(this.firestore, 'seasons');

    const q = query(collection(this.firestore, "seasons"), where("masterId", "==", id));

    getDocs(q).then((snapshot) => {
      let data: any[] = []
      snapshot.forEach(doc => {
        console.log(doc.data());
        data.push({ ...doc.data(), id: doc.id })
        this.seasons = data;
      });

      this.childDataSource = new MatTableDataSource(this.seasons);
      this.change.detectChanges();
    })


    // const databaseInstance = collection(this.firestore, 'categories');

    // onSnapshot(databaseInstance, snapshot => {
    //   let data: any[] = []
    //   snapshot.forEach(doc => {
    //     data.push({ ...doc.data(), id: doc.id })
    //     this.categories = data;
    //     // console.log(this.categories);
    //   });
    //   this.dataSource = new MatTableDataSource(this.categories);
    // })
  }

  addCategory() {
    this.dialog.open(AddProductComponent, {
      id: 'product-dialog',
      width: '500px',
      // height: '500px',
      maxWidth: '100vw',
      // minHeight: '94vh',
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
    const ref = this.dialog.open(AddProductComponent, {
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

  // *********************************
  // *********************************
  // TODO: ********* SEASONS *********
  // *********************************
  // *********************************

  addNewSeason(anime) {
    const ref = this.dialog.open(AddSeasonComponent, {
      id: 'season-dialog',
      width: '900px',
      // height: '500px',
      maxWidth: '100vw',
      // minHeight: '94vh',
    });

    ref.componentInstance.data = anime;
    ref.componentInstance.isNewSeason = true;

    ref.afterClosed().subscribe(result => {
      if(result != ''){
        this.getAnimeSeasons(anime.id);
      }
    });
  }

  editSeason(anime) {
    const ref = this.dialog.open(AddSeasonComponent, {
      id: 'season-dialog',
      width: '900px',
      // height: '500px',
      maxWidth: '100vw',
      // minHeight: '94vh',
    });

    ref.componentInstance.data = anime;
    ref.componentInstance.isNewSeason = false;

    ref.afterClosed().subscribe(result => {
      if(result != ''){
        this.getAnimeSeasons(result);
      }
    });
  }
}