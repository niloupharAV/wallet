import {randomUUID} from "crypto";
import {STATES} from "./TransactionState.js";
import {TRANSACTION_TYPES} from "./enum/TransactionTypes.js";

export class Transaction {
    constructor({id, amount, state, walletId, type, createdAt= null,
                    balanceAfter = null, scheduleId = null, reference = null,
                    description = null, retryTime = null, retryCount = null}) {
        this.amount = amount;
        this.state = state;
        this.walletId = walletId;
        this.type = type;
        this.id = id;
        this.balanceAfter = balanceAfter;
        this.createdAt = createdAt;
        this.reference = reference;
        this.description = description;
        this.scheduleId = scheduleId;
        this.retryTime = retryTime
        this.retryCount = retryCount
    }

    static createFromScheduledWithdrawal(scheduled){
        return new Transaction(
            {
                id: randomUUID().toString(),
                state: STATES.RESERVED,
                type: TRANSACTION_TYPES.WITHDRAWAL,
                walletId: scheduled.walletId,
                amount: scheduled.amount,
                scheduleId: scheduled.id,
                retryCount: 0,
                retryTime: new Date(Date.now() + 60000)
            }
        )
    }

}