import type { SchoolClass } from "./SchoolClass";

export class User {
    readonly username: string
    currentClass? : String | null = null;
    readonly id: number;
    readonly isTeacher: boolean = false;

    constructor(username: string, currentClass: String | null, id: number) {
        this.username = username;
        this.currentClass = currentClass ;
        this.id = id;
    }
}