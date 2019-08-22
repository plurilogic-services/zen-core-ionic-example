import { Component, OnInit } from '@angular/core';
import { StudentRecord } from '../student-record';
import { StudentService } from '../student.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-form',
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.scss'],
})
export class StudentFormComponent implements OnInit {

  firstName: string;
  lastName: string;
  schoolName: string;
  grade: string;

  constructor(private router: Router, private studentService: StudentService) { }

  ngOnInit() {
    console.log('Init StudentForm');
  }

  doAddStudent(){
    const student = new StudentRecord(this.firstName, this.lastName, this.schoolName, new Date(this.grade + 'T00:00'));
    this.studentService.saveStudent(student).then((saved) => {
      this.router.navigate(['student']);
    }).catch((error) => {
      console.log(error);
      alert(error);
    });
  }

}
