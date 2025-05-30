import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit {

  @ViewChild('fileinput') public fileInput: ElementRef;

  logoDP = null;
  loading = false;
  photo: Photo = {
    base64: '',
    src: '',
    fileName: '',
    type: ''
  }

  data: any = null;
  groups = [
    'Recommendation',
    'Latest',
    'Trending',
    'Most Popular',
    'Landing Page',
  ]
  STORAGE = getStorage();


  private GUID;

  constructor(
    private firestore: Firestore,
    private _change: ChangeDetectorRef,
    private dialogRef: MatDialogRef<AddProductComponent>
  ) { }

  form: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
  })
  group = new FormControl('');

  ngOnInit(): void {
    console.log(this.data);
    if (this.data) {
      // this.GUID = {
      //   value: this.data['categoryId']
      // };

      this.group.setValue(this.data.groups);
      this.photo['src'] = this.data['poster'];
      this.form.setValue({
        name: this.data['name']
      })
    } else {
      // this.GUID = Guid.create();
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
    this.loading = true;
    if (this.photo['src'] !== '' && !this.photo['src'].includes('https')) {
      console.log('has photo');

      const reference = ref(this.STORAGE, 'posters/' + this.photo['fileName']);

      uploadString(reference, this.photo['src'], 'data_url').then((snapshot) => {
        getDownloadURL(ref(this.STORAGE, 'posters/' + this.photo['fileName'])).then(url => {
          console.log(url);

          if (url) {
            const params = {
              name: this.form.value.name,
              poster: url,
              groups: this.group.value
              // categoryId: this.GUID.value
            }
            console.log(params);
            const databaseInstance = collection(this.firestore, 'anime');

            if (this.data) {
              const dataToUpdate = doc(this.firestore, 'anime', this.data['id']);

              updateDoc(dataToUpdate, params).then(() => {
                this.dialogRef.close();
                this.loading = false;
              }).catch((err) => {
                this.loading = false;
                alert(err.message)
              })
            } else {
              addDoc(databaseInstance, params).then(() => {
                this.dialogRef.close();
                this.loading = false;
              }).catch((err) => {
                this.loading = false;
                alert(err.message)
              })
            }
          }
        })
      });
    } else {
      console.log('not have any image');
      const params = {
        name: this.form.value.name,
        poster: this.photo['src'],
        groups: this.group.value
        // categoryId: this.GUID.value
      }
      console.log(params);
      const databaseInstance = collection(this.firestore, 'anime');
      if (this.data) {
        const dataToUpdate = doc(this.firestore, 'anime', this.data['id']);

        updateDoc(dataToUpdate, params).then(() => {
          this.dialogRef.close();
          this.loading = false;
        }).catch((err) => {
          this.loading = false;
          alert(err.message)
        })
      } else {
        addDoc(databaseInstance, params).then(() => {
          this.dialogRef.close();
          this.loading = false;
        }).catch((err) => {
          this.loading = false;
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
