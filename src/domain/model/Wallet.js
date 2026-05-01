export class Wallet {
    constructor(id, balance) {
        this.balance = balance;
        this.id = id;
    }
    getBalance() {
        return this.balance;
    }
}