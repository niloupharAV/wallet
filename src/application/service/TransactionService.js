import {TRANSACTION_STATUSES} from "../../domain/model/enum/TransactionStatuses.js";
import {StateMachine, STATES} from "../../domain/model/TransactionState.js";

export class TransactionService {
    async initiateTransaction(data) {
        throw {message: 'NOT_IMPLEMENTED'}
    }
    async inquiryLater(data) {
        throw {message: 'NOT_IMPLEMENTED'}
    }
    async followSuccessScenario(data) {
        throw {message: 'NOT_IMPLEMENTED'}
    }
    async followFailureScenario(data) {
        throw {message: 'NOT_IMPLEMENTED'}
    }

    async callStateMachine(transaction,status, reference, description) {
        if(status === TRANSACTION_STATUSES.COMMITTED) {
            await StateMachine.transit(
                transaction,
                STATES.COMMITED,
                this.followSuccessScenario.bind(this),
                {reference});
        } else if(status === TRANSACTION_STATUSES.FAILED) {
            await StateMachine.transit(transaction,
                STATES.FAILED,
                this.followFailureScenario.bind(this),
                {description});

        } else {
            await StateMachine.transit(transaction,
                STATES.UNKNOWN,
                this.inquiryLater.bind(this),
                {});

        }

    }
}