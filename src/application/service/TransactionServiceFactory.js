import {TRANSACTION_TYPES} from "../../domain/model/enum/TransactionTypes.js";

export class TransactionServiceFactory {
    constructor(depositService, withdrawalService) {
        this.depositService = depositService;
        this.withdrawalService = withdrawalService;
    }

    getService(transactionType){
        if(transactionType === TRANSACTION_TYPES.WITHDRAWAL)
            return this.withdrawalService;
        else if(transactionType === TRANSACTION_TYPES.DEPOSIT) {
            return  this.depositService
        }
        throw {message: 'INVALID_TRANSACTION_TYPE'};
    }
}