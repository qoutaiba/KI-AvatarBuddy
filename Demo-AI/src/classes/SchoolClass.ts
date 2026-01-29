export class SchoolClass {
    number: number
    letter: string
    readonly name: string

    constructor(number: number, letter: string) {
        this.number = number;
        this.letter = letter;
        this.name = number + letter;
    }
}