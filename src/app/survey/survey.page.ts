import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IndexedDbService } from '../indexed-db.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.page.html',
  styleUrls: ['./survey.page.scss'],
})
export class SurveyPage implements OnInit {
  studentForm!: FormGroup;
  childGroup!: FormGroup;
  genders = ['Male', 'Female', 'Other'];
  constructor(private fb: FormBuilder, private indexedDbService: IndexedDbService, private router: Router) {
  }
  get studentFormControls() {
    return this.studentForm.controls;
  }
  onSubmit() {
    // <edit-config file = "AndroidManifest.xml" target = "/manifest/application" mode = "merge" >
    //   <application android: allowBackup = "true" />
    //     </edit-config>
    if (this.studentForm.valid) {
      let Localdata: any = localStorage.getItem('basic_info');
      if (Localdata !== null) {
        Localdata = JSON.parse(Localdata)
      }
      const data: any = { ...this.studentForm.value, ...Localdata }
      this.indexedDbService.saveStudentForm(data);

      this.studentForm.reset();
      this.studentForm.patchValue({
        townName: data.townName
      });
    } else {
      console.log('Form has errors.');
    }
  }
  logout() {
    this.router.navigateByUrl('/home')
  }
  ngOnInit() {
    this.createStudentForm();
    this.indexedDbService.getStudentForms().subscribe(data => {
      console.log(data)
    })
  }
  createStudentForm() {
    this.studentForm = this.fb.group({
      parentName: ['', Validators.required],
      parentMobile: ['', [Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      number_of_children: [0],
      townName: ['', Validators.required],
      children: this.fb.array([])
    });
    this.subscribeToNumberOfChildrenChanges();
  }
  subscribeToNumberOfChildrenChanges() {
    this.studentForm.get('number_of_children')?.valueChanges.subscribe(value => {
      const childrenFormArray = this.studentForm.get('children') as FormArray;
      childrenFormArray.clear(); // Clear existing form controls
      for (let i = 0; i < value; i++) {
        const childGroup = this.fb.group({
          studentName: ['', Validators.required],
          studentMobile: ['', [Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
          standard: ['', Validators.required],
          comments: [''],
          branch: ['']
        });
        childrenFormArray.push(childGroup);
      }
    });
  }
  get childrenFormArray(): FormArray {
    return this.studentForm.get('children') as FormArray;
  }

  isFormGroup(control: AbstractControl): boolean {
    return control instanceof FormGroup;
  }
  getChildFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }
  exportToExel() {
    this.indexedDbService.exportToExcel()
  }
}
