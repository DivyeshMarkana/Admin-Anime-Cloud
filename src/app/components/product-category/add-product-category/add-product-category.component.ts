import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Guid } from "guid-typescript";
// import { StorageModule } from '@angular/fire/storage';
import { getStorage, ref, uploadBytes, uploadString, getDownloadURL } from "firebase/storage";
import { Firestore, collection, addDoc, updateDoc, doc } from '@angular/fire/firestore';
import { MatDialogRef } from '@angular/material/dialog';

interface Photo {
  base64: string;
  src: string;
  fileName: string,
  type: string
}

@Component({
  selector: 'app-add-product-category',
  templateUrl: './add-product-category.component.html',
  styleUrls: ['./add-product-category.component.scss']
})
export class AddProductCategoryComponent implements OnInit {

  @ViewChild('fileinput') public fileInput: ElementRef;

  logoDP = null;
  loading = false;
  photo: Photo = {
    base64: '',
    src: '',
    fileName: '',
    type: ''
  }

  data = null;

  STORAGE = getStorage();

  private GUID;

  constructor(
    private firestore: Firestore,
    private _change: ChangeDetectorRef,
    private dialogRef: MatDialogRef<AddProductCategoryComponent>
  ) { }

  form: FormGroup = new FormGroup({
    category: new FormControl('')
  })

  ngOnInit(): void {
    console.log(this.data);
    if (this.data) {
      this.GUID = {
        value: this.data['categoryId']
      };
      this.photo['src'] = this.data['photo'];
      this.form.setValue({
        category: this.data['category']
      })
    } else {
      this.GUID = Guid.create();
    }

  }

  updateFile(type, event) {
    const file = event.target.files[0];

    console.log(file);

    // this.photo = {
    //   base64: null,
    //   src: null
    // };
    this.blobToBase64(file, (base64) => {
      this.photo['base64'] = base64.split(',')[1];
      this.photo['src'] = base64;
      this.photo['fileName'] = file.name;
      this.photo['type'] = file.type;
      this._change.detectChanges();
      //   this.logoDP = base64;
      //   this.showimage = true;
      //   this.brandForm.get(type).setValue(base64.split(',')[1]);
      //   this.brandForm.get('isDeleteLogo').setValue(0);
      //   this._changeDetectorRef.detectChanges();
    });

  }

  blobToBase64(blob: Blob, callback): any {
    const reader = new FileReader();
    let base64data;
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      base64data = reader.result;
      callback(base64data);
    };
  }

  removeLogo() {
    this.photo = {
      base64: '',
      src: '',
      fileName: '',
      type: ''
    };

    this.fileInput.nativeElement.value = null;
  }

  submit() {

    if (this.photo['src'] !== '' && !this.photo['src'].includes('https')) {
      console.log('has photo');

      const reference = ref(this.STORAGE, 'Categories/' + this.photo['fileName']);

      uploadString(reference, this.photo['src'], 'data_url').then((snapshot) => {
        getDownloadURL(ref(this.STORAGE, 'Categories/' + this.photo['fileName'])).then(url => {
          console.log(url);

          if (url) {
            const params = {
              category: this.form.value.category,
              photo: url,
              categoryId: this.GUID.value
            }
            console.log(params);
            const databaseInstance = collection(this.firestore, 'categories');

            if (this.data) {
              const dataToUpdate = doc(this.firestore, 'categories', this.data['id']);

              updateDoc(dataToUpdate, params).then(() => {
                this.dialogRef.close();
              }).catch((err) => {
                alert(err.message)
              })
            } else {
              addDoc(databaseInstance, params).then(() => {
                this.dialogRef.close();
              }).catch((err) => {
                alert(err.message)
              })
            }
          }
        })
      });
    } else {
      console.log('not have any image');
      const params = {
        category: this.form.value.category,
        photo: this.photo['src'],
        categoryId: this.GUID.value
      }
      console.log(params);
      const databaseInstance = collection(this.firestore, 'categories');
      if (this.data) {
        const dataToUpdate = doc(this.firestore, 'categories', this.data['id']);

        updateDoc(dataToUpdate, params).then(() => {
          this.dialogRef.close();
        }).catch((err) => {
          alert(err.message)
        })
      } else {
        addDoc(databaseInstance, params).then(() => {
          this.dialogRef.close();
        }).catch((err) => {
          alert(err.message)
        })
      }
    }

    // uploadBytes(reference, params['src'] as Blob, { contentType: this.photo['type'] }).then((snapshot) => {
    //   console.log('Uploaded a base64 string!');

    //   getDownloadURL(ref(this.STORAGE, 'Categories/' + this.photo['fileName'])).then(url => {
    //     console.log(url);
    //   })
    // });



    // const databaseInstance = collection(this.firestore, 'categories');

    // addDoc(databaseInstance, params).then(() => {
    //   this.dialogRef.close();
    // }).catch((err) => {
    //   alert(err.message)
    // })

  }

}
