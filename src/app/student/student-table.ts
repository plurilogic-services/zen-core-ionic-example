import {
    BtrieveFileAttributes, BtrieveIndexAttributes, Btrieve, BtrieveKeySegment, BtrieveFile, BtrieveClient
} from 'cordova-plugin-actian-zen-core/www';
import { StudentRecord } from './student-record';
import { BtrieveHelper } from '../btrieve-helper';

/**
 *  The StudentTable class.  Students are stored in a table in the Zen database.
 *  The StudentTable class encapsulates the database record layout and associated
 *  operations.
 */
export class StudentTable {
    // #region Record Layout
    // Student records have five (5) fields
    // 1) STUDENT_ID - a unique (auto-incremented) number
    // 2) FIRST_NAME - a null terminated string (max length of 32)
    // 3) LAST_NAME - a null terminated string (max length of 32)
    // 4) SCHOOL_NAME - a null terminated string (max length of 32)
    // 5) GRADE - a timestamp (number)
    //  Begin Record layout
    //   0 --------------------- STUDENT_ID_OFFSET=0
    //                   /|\
    //     STUDENT_ID     |      STUDENT_ID_SIZE=4
    //                   \|/
    //   4 --------------------- FIRST_NAME_OFFSET=0+4
    //                   /|\
    //     FIRST_NAME     |      FIRST_NAME_SIZE=32
    //                   \|/
    //   36 -------------------- LAST_NAME_OFFSET=4+32
    //                   /|\
    //     LAST_NAME      |      FIRST_NAME_SIZE=32
    //                   \|/
    //   68 -------------------- SCHOOL_NAME_OFFSET=36+32
    //                   /|\
    //     SCOOL_NAME     |      SCHOOL_NAME_SIZE=32
    //                   \|/
    //   100 ------------------- GRADE_OFFSET=68+32
    //                   /|\
    //     GRADE          |      GRADE_SIZE=16
    //                   \|/
    //  116 -------------------- RECORD_SIZE=100+16
    // #region STUDENT_ID
    static readonly STUDENT_ID_OFFSET: number = 0;
    static readonly STUDENT_ID_SIZE: number = 4;
    // #endregion
    // #region FIRST_NAME
    static readonly FIRST_NAME_OFFSET: number = 4;
    static readonly FIRST_NAME_SIZE: number = 32;
    // #endregion
    // #region LAST_NAME
    static readonly LAST_NAME_OFFSET: number = 36;
    static readonly LAST_NAME_SIZE: number = 32;
    // #endregion
    // #region FIRST_NAME
    static readonly SCHOOL_NAME_OFFSET: number = 68;
    static readonly SCHOOL_NAME_SIZE: number = 32;
    // #endregion
    // #region GRADE
    static readonly GRADE_OFFSET: number = 100;
    static readonly GRADE_SIZE: number = 16;
    // #endregion
    static readonly RECORD_SIZE: number = StudentTable.STUDENT_ID_SIZE + StudentTable.FIRST_NAME_SIZE
        + StudentTable.LAST_NAME_SIZE + StudentTable.SCHOOL_NAME_SIZE + StudentTable.GRADE_SIZE;
    // #endregion

    private static tableFilename: string = 'students_demo_v1.0.btr';
    private static instance: StudentTable;

    private tablePath: string;
    private client: BtrieveClient;
    private file: BtrieveFile;

    static async table(): Promise<StudentTable> {
        if (!(StudentTable.instance instanceof StudentTable)) {
            StudentTable.instance = new StudentTable(StudentTable.tableFilename);
            await StudentTable.instance.init();
        }

        return StudentTable.instance;
    }

    constructor(filename: string) {
        this.tablePath = filename;
    }

    private async init() {
        this.client = await new Promise<BtrieveClient>((resolve, reject) => {
            BtrieveClient.Create(0xAAAB, 0x0102, resolve, reject);
        });

        await this.createIfNeeded();
        await this.openFile();
    }

    private async createIfNeeded() {
        await this.createFile(this.tablePath);
    }

    private async createFile(filename): Promise<Btrieve.StatusCode> {
        let status: Btrieve.StatusCode;

        const fileAttrs: BtrieveFileAttributes = await new Promise<BtrieveFileAttributes>((resolve, reject) => {
            BtrieveFileAttributes.Create(resolve, reject);
        });

        status = await new Promise<Btrieve.StatusCode>((resolve, reject) => {
            fileAttrs.SetFixedRecordLength(StudentTable.RECORD_SIZE, resolve, reject);
        });

        status = await new Promise<Btrieve.StatusCode>((resolve, reject) => {
            this.client.FileCreate(fileAttrs, this.tablePath, Btrieve.CreateMode.CREATE_MODE_NO_OVERWRITE, undefined, resolve, (error) => {
                if (error === Btrieve.StatusCode.STATUS_CODE_FILE_ALREADY_EXISTS) {
                    resolve(error);
                } else {
                    reject(error);
                }
            });
        });

        // Make an index on the ID field
        if (status === Btrieve.StatusCode.STATUS_CODE_NO_ERROR) {
            return await this.createIndexes();
        }

        return status;
    }

    private async createIndexes(): Promise<Btrieve.StatusCode> {
        let status: Btrieve.StatusCode;

        const indexAttrs: BtrieveIndexAttributes = await new Promise<BtrieveIndexAttributes>((resolve, reject) => {
            BtrieveIndexAttributes.Create(resolve, reject);
        });

        const ks: BtrieveKeySegment = await new Promise<BtrieveKeySegment>((resolve, reject) => {
            BtrieveKeySegment.Create(resolve, reject);
        });

        status = await new Promise<Btrieve.StatusCode>((resolve, reject) => {
            // tslint:disable-next-line: max-line-length
            ks.SetField(StudentTable.STUDENT_ID_OFFSET, StudentTable.STUDENT_ID_SIZE, Btrieve.DataType.DATA_TYPE_AUTOINCREMENT, resolve, reject);
        });

        status = await new Promise<Btrieve.StatusCode>((resolve, reject) => {
            indexAttrs.AddKeySegment(ks, resolve, reject);
        });

        const handle: BtrieveFile = await new Promise<BtrieveFile>((resolve, reject) => {
            this.client.FileOpen(this.tablePath, null, Btrieve.OpenMode.OPEN_MODE_NORMAL, undefined, resolve, reject);
        });

        status = await new Promise<Btrieve.StatusCode>((resolve, reject) => {
            handle.IndexCreate(indexAttrs, resolve, reject);
        });

        indexAttrs.Destroy();
        ks.Destroy();

        status = await new Promise<Btrieve.StatusCode>((resolve, reject) => {
            this.client.FileClose(handle, resolve, reject);
        });

        return status;
    }

    private async openFile() {
        this.file = await new Promise<BtrieveFile>((resolve, reject) => {
            this.client.FileOpen(this.tablePath, null, Btrieve.OpenMode.OPEN_MODE_NORMAL, undefined, resolve, reject);
        });
    }

    private getRecord(rawbuf: Uint8Array): StudentRecord {
        const studentId = BtrieveHelper.getInt32(rawbuf, StudentTable.STUDENT_ID_OFFSET);
        const firstName = BtrieveHelper.getString(rawbuf, StudentTable.FIRST_NAME_OFFSET, StudentTable.FIRST_NAME_SIZE);
        const lastName = BtrieveHelper.getString(rawbuf, StudentTable.LAST_NAME_OFFSET, StudentTable.LAST_NAME_SIZE);
        const schoolName = BtrieveHelper.getString(rawbuf, StudentTable.SCHOOL_NAME_OFFSET, StudentTable.SCHOOL_NAME_SIZE);
        const grade = BtrieveHelper.getDate(rawbuf, StudentTable.GRADE_OFFSET);

        return new StudentRecord(studentId, firstName, lastName, schoolName, grade);
    }

    private putRecord(student: StudentRecord): Uint8Array {
        const rawbuf = new Uint8Array(StudentTable.RECORD_SIZE);

        BtrieveHelper.setInt32(rawbuf, StudentTable.STUDENT_ID_OFFSET, student.studentId)
        BtrieveHelper.setString(rawbuf, StudentTable.FIRST_NAME_OFFSET, student.firstName, StudentTable.FIRST_NAME_SIZE);
        BtrieveHelper.setString(rawbuf, StudentTable.LAST_NAME_OFFSET, student.lastName, StudentTable.LAST_NAME_SIZE);
        BtrieveHelper.setString(rawbuf, StudentTable.SCHOOL_NAME_OFFSET, student.schoolName, StudentTable.SCHOOL_NAME_SIZE);
        BtrieveHelper.setDate(rawbuf, StudentTable.GRADE_OFFSET, student.grade);

        return rawbuf;
    }

    // Retrieve the first record using the specified index.
    // index may be Btrieve.INDEX_NONE.
    private async retrieveFirst(index: Btrieve.Index): Promise<StudentRecord> {
        try {
            const rawbuf = await new Promise<Uint8Array>((resolve, reject) => {
                this.file.RecordRetrieveFirst(index, StudentTable.RECORD_SIZE, undefined, resolve, reject);
            });

            return this.getRecord(rawbuf);
        } catch (e) {
            console.log(Btrieve.StatusCode[e] || e);
            return null;
        }
    }

    private async retrieveNext(): Promise<StudentRecord> {
        try {
            const rawbuf = await new Promise<Uint8Array>((resolve, reject) => {
                this.file.RecordRetrieveNext(StudentTable.RECORD_SIZE, undefined, resolve, reject);
            });

            return this.getRecord(rawbuf);
        } catch(e) {
            console.log(Btrieve.StatusCode[e] || e);
            return null;
        }
    }

    private async retrieveAt(index: Btrieve.Index, cursorPosition: number): Promise<StudentRecord> {
        try {
            const rawbuf = await new Promise<Uint8Array>((resolve, reject) => {
                this.file.RecordRetrieveByCursorPosition(index, cursorPosition, StudentTable.RECORD_SIZE, undefined, resolve, reject);
            });

            return this.getRecord(rawbuf);
        } catch(e) {
            console.log(Btrieve.StatusCode[e] || e);
            return null;
        }
    }

    // #region CRUD
    // Find the record which has the given id field.
    async findByStudentId(id: number): Promise<StudentRecord> {
        // Set up a key buffer with the student id
        const keybuf: Uint8Array = new Uint8Array(StudentTable.STUDENT_ID_SIZE);

        BtrieveHelper.setInt32(keybuf, 0, id);

        try {
            const rawbuf = await new Promise<Uint8Array>((resolve, reject) => {
                // tslint:disable-next-line: max-line-length
                this.file.RecordRetrieve(Btrieve.Comparison.COMPARISON_EQUAL, Btrieve.Index.INDEX_1, keybuf, StudentTable.RECORD_SIZE, undefined, resolve, reject);
            });

            return this.getRecord(rawbuf);
        } catch(e) {
            console.log(Btrieve.StatusCode[e] || e);
            return null;
        }
    }

    async insert(student: StudentRecord): Promise<StudentRecord> {
        const rawbuf: Uint8Array = this.putRecord(student);

        try {
            const record = await new Promise<Uint8Array>((resolve, reject) => {
                this.file.RecordCreate(rawbuf, resolve, reject);
            });
            return this.getRecord(record);
        } catch(e) {
            console.log(Btrieve.StatusCode[e] || e);
            return null;
        }
    }

    // Delete the current record (record that the cursor is positioned on).
    async deleteByStudentId(id: number): Promise<Btrieve.StatusCode> {
        try {
            // Set the cursor by retrieving the record
            const student: StudentRecord = await this.findByStudentId(id);
            return await new Promise<Btrieve.StatusCode>((resolve, reject) => {
                this.file.RecordDelete(resolve, reject);
            });
        } catch (e) {
            console.log('In deleteByStudentId', Btrieve.StatusCode[e] || e);
            return e;
        }
    }

    // tslint:disable-next-line: max-line-length
    async list(index: Btrieve.Index = Btrieve.Index.INDEX_NONE, offset: number = 0, limit: number = Infinity): Promise<Array<StudentRecord>> {
        let count: number = 0;
        let prefetch: StudentRecord;
        const result: Array<StudentRecord> = [];

        try {
            prefetch = offset > 0
                ? await this.retrieveAt(index, offset)
                : await this.retrieveFirst(index);

            do {
                if (prefetch) {
                    count++;
                    result.push(prefetch);
                }
                prefetch = await this.retrieveNext();
            } while(prefetch && count <= limit);
        } catch(e) {
            console.log('In list if catch', Btrieve.StatusCode[e] || e);
        }

        return result;
    }
    // #endregion
}

