export class SchoolClass {
    id: number;
  name: string;
  teacher_id: number;
  grade_level: string;
  subject: string;

    constructor(id: number, number: string, letter: string, teacher_id: number, grade_level: string, subject: string) {
        this.id = id;
        this.name = number + letter;
        this.teacher_id = teacher_id;
        this.grade_level = grade_level;
        this.subject = subject;
    }
}