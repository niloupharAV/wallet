import {TRANSACTION_STATUSES} from "../../domain/model/enum/TransactionStatuses.js";
import {TransactionService} from "./TransactionService.js";

export class DepositService extends TransactionService{
    constructor(walletRepo, transactionRepo, externalService, unitOfWork, ledgerRepo) {
        super();
        this.walletRepository = walletRepo;
        this.transactionRepository = transactionRepo;
        this.externalService = externalService;
        this.unitOfWork = unitOfWork;
        this.ledgerRepository = ledgerRepo;
    }

    async initiateTransaction(transaction){
        transaction.retryTime = new Date(Date.now() + 60000);
        transaction = await this.transactionRepository.insertTransaction(transaction);
        const {reference, status, description} = await this.externalService.credit(transaction.id, {transaction});
        await this.callStateMachine(transaction, status, reference, description)
    }

    async inquiryLater({transaction}){
        transaction = await this.getTransactionWithLock(transaction.id);
        transaction.retryCount +=1;
        transaction.retryTime = new Date(Date.now()+60000);
        await this.transactionRepository.updateRetryTime(transaction);
    }

    async followSuccessScenario({transaction, args:{reference}}){
        await this.unitOfWork.beginTransaction();
        try{
            const wallet = await this.getWalletWithLock(transaction.walletId, true);
            await this.getTransactionWithLock(transaction.id);
            await this.raiseWalletBalance(wallet, transaction.amount);
            transaction.reference = reference;
            transaction.balanceAfter = wallet.balance;
            await this.transactionRepository.updateTransaction(transaction);
            await this.ledgerRepository.insert(transaction, wallet.balance);
            await this.unitOfWork.commit()

        } catch (e) {
               await this.unitOfWork.rollback();
               throw e;
            }
    }


    async followFailureScenario({transaction, args:{description}}){
        await this.unitOfWork.beginTransaction();
        try {
            await this.getTransactionWithLock(transaction.id);
            transaction.description = description;
            await this.transactionRepository.updateTransaction(transaction)
            await this.unitOfWork.commit();
        } catch (e) {
            await this.unitOfWork.rollback();
            throw e;
        }

    }

    async getTransactionWithLock(transactionId) {
        const transaction = await this.transactionRepository.fetchForUpdate(
            transactionId,
            [TRANSACTION_STATUSES.UNKNOWN, TRANSACTION_STATUSES.INITIATED]);
        if(!transaction) {
            throw {message: 'TRANSACTION_NOT_FOUND'};
        }
        return transaction;
    }

    async getWalletWithLock(walletId) {
        return await this.walletRepository.getWalletById(walletId, true)
    }

    async raiseWalletBalance(wallet, amount) {
        wallet.balance += amount;
        await this.walletRepository.updateBalance(wallet);
    }
}