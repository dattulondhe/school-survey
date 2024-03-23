import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  form: FormGroup;

  constructor(private formBuilder: FormBuilder, private router: Router) {
    this.form = this.formBuilder.group({
      representativeName: ['', Validators.required]
    });
  }

  ngOnInit() {
    let data: any = localStorage.getItem('basic_info');
    if (data != null) {
      this.router.navigateByUrl('/tabhome');
    }
  }

  login() {
    if (this.form.valid) {
      localStorage.setItem('basic_info', JSON.stringify(this.form.value));
      this.router.navigateByUrl('/tabhome');
    }
  }

}
