import { Component } from '@angular/core';
import { PhotoListComponent } from './components/photo-list/photo-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PhotoListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'tp-angular-users';
}