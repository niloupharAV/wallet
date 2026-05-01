import {randomUUID} from "crypto";
import {TRANSACTION_STATUSES} from "../../../domain/model/enum/TransactionStatuses.js";

export function toResult(){
    const random = Math.random();
    if(random < 0.5) {
        return {status: TRANSACTION_STATUSES.COMMITTED, reference: randomUUID().toString()}
    }
    if(random < 0.7) {
        return {status: TRANSACTION_STATUSES.UNKNOWN}
    }
    return {status: TRANSACTION_STATUSES.FAILED, description: 'INVALID_ACCOUNT'}
}