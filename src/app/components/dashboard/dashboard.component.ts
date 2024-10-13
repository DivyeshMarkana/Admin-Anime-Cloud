import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/shared/api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  showFiller = false;

  constructor(private API: ApiService) { }

  ngOnInit(): void {
  }

  getMobile() {
    if (window.innerWidth < 600) {
      return true;
    } else {
      return false;
    }
  }

  logout() {
    this.API.logout();
  }

}
