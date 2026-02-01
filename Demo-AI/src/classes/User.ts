
export class User {
    id: number;
    readonly class_id: number;
    name : string;
    readonly username: string;
    password? : string;
    currentClass? : String | null = null;
    
    

    constructor(id: number, name: string, username: string, currentClass: String | null, class_id: number, password?: string) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.currentClass = currentClass ;
        this.class_id = class_id;
        this.password = password;
    }
}