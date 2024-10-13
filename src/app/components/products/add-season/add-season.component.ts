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
  selector: 'app-add-season',
  templateUrl: './add-season.component.html',
  styleUrls: ['./add-season.component.scss']
})
export class AddSeasonComponent implements OnInit {

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
  episodes: any = [];
  isShow = false;
  poster = null
  isNewSeason;
  STORAGE = getStorage();

  private GUID;

  constructor(
    private firestore: Firestore,
    private _change: ChangeDetectorRef,
    private dialogRef: MatDialogRef<AddSeasonComponent>
  ) { }

  form: FormGroup = new FormGroup({
    season: new FormControl('', Validators.required),
  })

  episodeForm: FormGroup = new FormGroup({
    title: new FormControl(''),
    episodeNumber: new FormControl(),
    fileId: new FormControl('vid_111'),
    url: new FormControl('')
  })

  ngOnInit(): void {
    console.log(this.data);
    if (this.data) {
      this.poster = this.data.poster;
      this.episodes = this.data.episodes;
      console.log(this.episodes);

      // this.GUID = {
      //   value: this.data['categoryId']
      // };
      this.photo['src'] = this.data['teaser'];
      this.form.patchValue({
        season: this.data['season'],
        teaser: this.data.teaser
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
    if (this.photo['src'] !== '' && !this.photo['src'].includes('https')) {
      console.log('has photo');

      const reference = ref(this.STORAGE, 'posters/' + this.photo['fileName']);

      uploadString(reference, this.photo['src'], 'data_url').then((snapshot) => {
        getDownloadURL(ref(this.STORAGE, 'posters/' + this.photo['fileName'])).then(url => {
          // console.log(url);

          if (url) {
            const params = {
              teaser: url,
              season: this.form.value.season,
              masterId: this.isNewSeason ? this.data.id : this.data.masterId,
              poster: this.poster,
              episodes: this.episodes,
              // categoryId: this.GUID.value
            }
            console.log(params);
            // return;
            const databaseInstance = collection(this.firestore, 'seasons');

            if (!this.isNewSeason) {
              const dataToUpdate = doc(this.firestore, 'seasons', this.data['id']);

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
        season: this.form.value.season,
        masterId: this.data.id,
        teaser: this.photo['src'],
        poster: this.poster,
        episodes: this.episodes
        // categoryId: this.GUID.value
      }
      console.log(params);
      // return;
      const databaseInstance = collection(this.firestore, 'seasons');
      if (this.data) {
        const dataToUpdate = doc(this.firestore, 'seasons', this.data['id']);

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


  discardEpisodeChange() {
    this.isShow = false;

    this.episodeForm.patchValue({
      title: '',
      url: '',
      episodeNumber: ''
    });
  }

  addEpisode() {

    const episode = {
      episodeNumber: this.episodeForm.value.episodeNumber,
      title: this.episodeForm.value.title,
      url: this.episodeForm.value.url,
      fileId: 'vid_111'
    }

    if (this.episodes.length > 0) {
      const isExist = this.episodes.find(x => x.episodeNumber == this.episodeForm.value.episodeNumber);

      if (isExist) {
        // TODO ******** T H R O W - A N -  E R R O R ********

        alert('Episode number is exists');
      } else {
        this.episodes.push(episode);
        this.discardEpisodeChange();
      }
    } else {
      this.episodes.push(episode);
      this.discardEpisodeChange();
    }

    console.log(this.episodes);
    this._change.detectChanges();


  }

}