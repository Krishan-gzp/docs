import { Routes } from '@angular/router';
import { CrackDetectionComponent } from './components/crack-detection/crack-detection.component';

export const routes: Routes = [
  { path: '', component: CrackDetectionComponent },
  { path: '**', redirectTo: '' }
];