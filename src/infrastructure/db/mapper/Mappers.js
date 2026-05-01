import {Wallet} from "../../../domain/model/Wallet.js";
import {Transaction} from "../../../domain/model/Transaction.js";
import {STATES} from "../../../domain/model/TransactionState.js";
import {ScheduledWithdrawal} from "../../../domain/model/ScheduledWithdrawal.js";

export function toWalletDomainModel(row) {
    return new Wallet(
        row.id,
        Number(row.balance)
    );
}

export function toTransactionDomainModel(row){
    const state = STATES[row.status];
    return new Transaction({
        id: row.id,
        amount: Number(row.amount),
        state,
        walletId: row.wallet_id,
        type: row.type,
        reason: row.reason,
        createdAt: row.created_at,
        retryCount: Number(row.retry_count),
        retryTime: new Date(row.retry_time),
    });
}

export function toScheduledWithdrawalDomainModel(row){
    return new ScheduledWithdrawal({
        amount: Number(row.amount),
        createdAt: new Date(row.created_at).getTime(),
        id: row.id,
        status: row.status,
        time: new Date(row.time),
        walletId: row.wallet_id,
    })
}