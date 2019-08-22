/**
 * The StudentRecord class encapsulate a single student item.
 */
export class StudentRecord {
    studentId: number;
    firstName: string;
    lastName: string;
    schoolName: string;
    grade: Date; // Timestamps

    constructor(firrtName: string, lastName: string, schoolName: string, grade: Date);
    constructor(studentId: number, firrtName: string, lastName: string, schoolName: string, grade: Date);
    constructor(arg1: number | string, arg2: string, arg3: string, arg4: string | Date, arg5?: Date) {
        if(typeof arg5 === 'undefined') {
            this.studentId = 0; // 0 = autoincrement
            this.firstName = arg1 as string;
            this.lastName = arg2;
            this.schoolName = arg3 as string;
            this.grade = arg4 as Date;
        } else {
            this.studentId = arg1 as number;
            this.firstName = arg2;
            this.lastName = arg3;
            this.schoolName = arg4 as string;
            this.grade = arg5;
        }
    }
}
