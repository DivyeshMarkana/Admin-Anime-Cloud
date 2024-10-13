import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiService } from 'src/app/shared/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private API: ApiService) { }

  ngOnInit(): void {
  }

  form: FormGroup = new FormGroup({
    username: new FormControl('dev@delight.com'),
    password: new FormControl('Dev@123'),
  })

  login() {
    console.log(this.form.value);
    let params = this.form.value;

    this.API.logIn(params.username, params.password)
  }

}
