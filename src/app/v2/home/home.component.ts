import { Component } from '@angular/core';

@Component({
  selector: 'ngx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  isLoading = false;

  refreshEvent() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 2000)
    
  }
}
