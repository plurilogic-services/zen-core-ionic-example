import { Component, OnInit } from '@angular/core';
import { StudentRecord } from './student-record';
import { Platform } from '@ionic/angular';
import { StudentService } from './student.service';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss'],
})
export class StudentComponent implements OnInit {

  students: Promise<Array<StudentRecord>>;

  constructor(private platform: Platform, private studentService: StudentService) { }

  ngOnInit() {
    console.log('Init Student');
  }

  ionViewWillEnter() {
    console.log('Will Enter Student');
    this.platform.ready().then(() => {
      this.students = this.studentService.fetchStudentList();
    });
  }

  doDelete(id: number) {
    this.studentService.deleteStudentById(id).then((deleted) => {
      console.log('Deleted: ', id, deleted);
      this.students = this.studentService.fetchStudentList();
    });
  }

}
