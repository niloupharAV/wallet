export class ScheduledWithdrawal {
    constructor({amount, status, walletId, createdAt, time, id}) {
        this.time = time;
        this.amount = amount;
        this.status = status;
        this.walletId = walletId;
        this.id = id;
        this.createdAt = createdAt;
    }
}