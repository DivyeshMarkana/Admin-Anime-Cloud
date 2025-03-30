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
  episodes: any[] = [];
  isShow = false;
  isEditEpisode = false;
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
    url: new FormControl(''),
    isFiller: new FormControl(false),
    embededHTML: new FormControl('')
  })

  ngOnInit(): void {
    console.log(this.data);
    if (this.data) {
      this.poster = this.data.poster;
      if (!this.isNewSeason) {
        this.episodes = this.data.episodes;
      }
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
              masterId: this.isNewSeason ? this.data.id.trim() : this.data.masterId.trim(),
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
        masterId: this.isNewSeason ? this.data.id.trim() : this.data.masterId.trim(),
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
          this.dialogRef.close(this.data.masterId);
        }).catch((err) => {
          alert(err.message)
        })
      } else {
        addDoc(databaseInstance, params).then(() => {
          this.dialogRef.close(this.data.id);
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

  add() {
    this.isShow = true;
    this.episodeForm.patchValue({
      episodeNumber: this.episodes.length + 1
    })
  }


  discardEpisodeChange() {
    this.isShow = false;

    this.episodeForm.patchValue({
      title: '',
      url: '',
      episodeNumber: '',
      embededHTML: ''
    });
  }

  sortEpisodes(array) {
    array.sort((a, b) => a.episodeNumber - b.episodeNumber);
  }

  addEpisode() {

    const episode = {
      episodeNumber: this.episodeForm.value.episodeNumber.trim(),
      title: this.episodeForm.value.title.trim(),
      url: this.episodeForm.value.url.trim(),
      fileId: 'vid_111',
      isFiller: this.episodeForm.value.isFiller,
      embededHTML: this.episodeForm.value.embededHTML
    }

    if (this.episodes.length > 0) {
      const isExist = this.episodes.find(x => x.episodeNumber == this.episodeForm.value.episodeNumber);

      if (isExist) {
        // TODO ******** T H R O W - A N -  E R R O R ********

        alert('Episode number is exists');
      } else {
        this.episodes.push(episode);
        this.sortEpisodes(this.episodes);
        this.discardEpisodeChange();
      }
    } else {
      this.episodes.push(episode);
      this.sortEpisodes(this.episodes);
      this.discardEpisodeChange();
    }

    console.log(this.episodes);
    this._change.detectChanges();
  }


  editEpiSode(episode) {
    this.isShow = true;
    this.isEditEpisode = true;

    this.episodeForm.patchValue({
      title: episode.title.trim() ?? '',
      episodeNumber: episode.episodeNumber ?? '',
      fileId: 'vid_111',
      url: episode.url.trim() ?? '',
      isFiller: episode.isFiller ?? false,
      embededHTML: episode.embededHTML ?? '',
    });

    setTimeout(() => {

      const form = document.getElementById('form') as HTMLFormElement;

      form.scrollIntoView({
        behavior: 'smooth'
      })

      // window.scroll({
      //   top: 0,
      //   left: 0,
      //   behavior: 'smooth'
      // });
    }, 100);

  }

  saveEpisode() {
    this.episodes.map(x => {
      if (x.episodeNumber == this.episodeForm.value.episodeNumber) {
        x['episodeNumber'] = this.episodeForm.value.episodeNumber;
        x['url'] = this.episodeForm.value.url.trim();
        x['title'] = this.episodeForm.value.title.trim();
        x['fileId'] = this.episodeForm.value.fileId;
        x['isFiller'] = this.episodeForm.value.isFiller;
        x['embededHTML'] = this.episodeForm.value.embededHTML;
        // x = this.episodeForm.value;

        console.log('sssss');

      }
    });
    this.sortEpisodes(this.episodes);
    this.isEditEpisode = false;
    this.discardEpisodeChange();

  }

  deleteEpisode(index) {
    this.episodes.splice(index, 1);
  }

}
