export class Subject {
    readonly name: string
    badgeNumber: number

    constructor(name: string)
    constructor(name: string, badgeNumber: number)

    constructor(name: string, badgeNumber?: number) {
        this.name = name;
        this.badgeNumber = badgeNumber ?? 0;
    }
}