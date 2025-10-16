import { Component, OnInit } from '@angular/core';
import { PRIVACY_DATA } from './data/privacy.data';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss',
})
export class PrivacyComponent implements OnInit {
  PRIVACY_DATA!: any;

  constructor() {}

  ngOnInit(): void {
    this.PRIVACY_DATA = PRIVACY_DATA;
  }
}
