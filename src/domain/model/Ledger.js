
export class Ledger {
    constructor(transactionId, amount, walletId, type, createdAt, balanceAfter = null, reference = null) {
        this.amount = amount;
        this.walletId = walletId;
        this.type = type;
        this.transactionId = transactionId;
        this.balanceAfter = balanceAfter;
        this.createdAt = createdAt;
        this.reference = reference

    }


}