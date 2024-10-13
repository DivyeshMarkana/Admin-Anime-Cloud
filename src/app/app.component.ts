import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { collection, Firestore, onSnapshot, deleteDoc, updateDoc, doc } from '@angular/fire/firestore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  title = 'contacts';

  categories: any = [];

  constructor(private firestore: Firestore) { }

  ngOnInit(): void {
    // this.getContacts()
  }

  // getContacts() {
  //   const databaseInstance = collection(this.firestore, 'categories')

  //   onSnapshot(databaseInstance, snapshot => {
  //     let contacts: any[] = []
  //     snapshot.forEach(doc => {
  //       contacts.push({ ...doc.data(), id: doc.id })
  //       this.categories = contacts;
  //       console.log(this.categories);

  //     });
  //   })
  // }

}
