import {Usecase} from "./Usecase.js";
import {randomUUID} from "crypto";
import {Transaction} from "../../domain/model/Transaction.js";
import {STATES} from "../../domain/model/TransactionState.js";
import {TRANSACTION_TYPES} from "../../domain/model/enum/TransactionTypes.js";

export class DepositUsecase extends Usecase {
    constructor(walletRepo, transactionServiceFactory) {
        super();
        this.walletRepository = walletRepo;
        this.transactionServiceFactory = transactionServiceFactory;
    }


    async execute(context) {
        const {walletId, amount}= context;
        await this.validate(walletId, amount);
        const transactionId = randomUUID().toString();
        let transaction = new Transaction({
                id: transactionId,
                amount,
                state: STATES.INITIATED,
                walletId,
                type: TRANSACTION_TYPES.DEPOSIT,
                retryCount: 0,
                retryTime: new Date(Date.now() + 60000)
            }
        );
        await this.transactionServiceFactory.getService(TRANSACTION_TYPES.DEPOSIT)
            .initiateTransaction(transaction);
    }

    async validate(walletId, amount) {
        if (amount <= 0) {
            throw {message: 'INVALID_AMOUNT'}
        }
        const wallet = await this.walletRepository.getWalletById(walletId);
        if(!wallet) {
            throw {message: 'WALLET_NOT_FOUND'}
        }
    }
}