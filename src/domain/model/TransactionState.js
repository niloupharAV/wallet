import {TRANSACTION_STATUSES} from "./enum/TransactionStatuses.js";

export const STATES = {
        INITIATED:{
            ID: TRANSACTION_STATUSES.INITIATED,
            TRANSITIONS: [TRANSACTION_STATUSES.COMMITTED, TRANSACTION_STATUSES.FAILED, TRANSACTION_STATUSES.UNKNOWN]
        } ,
        COMMITED: {
            ID: TRANSACTION_STATUSES.COMMITTED,
            TRANSITIONS: []
        },
        FAILED: {
            ID: TRANSACTION_STATUSES.FAILED,
            TRANSITIONS: []
        },
        UNKNOWN:{
            ID: TRANSACTION_STATUSES.UNKNOWN,
            TRANSITIONS: [TRANSACTION_STATUSES.COMMITTED, TRANSACTION_STATUSES.FAILED, TRANSACTION_STATUSES.UNKNOWN]
        },
    RESERVED:{
        ID: TRANSACTION_STATUSES.RESERVED,
        TRANSITIONS: [TRANSACTION_STATUSES.COMMITTED, TRANSACTION_STATUSES.FAILED]
    } ,

}


export class StateMachine {
    static canTransit(transaction, state) {
        return transaction.state.TRANSITIONS.includes(state.ID);
    }
    static async transit(transaction, state, handler, args) {
        if(StateMachine.canTransit(transaction, state)){
            transaction.state = state
            await handler({args, transaction})
        }
    }
}