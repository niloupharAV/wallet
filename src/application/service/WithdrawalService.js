import {TRANSACTION_STATUSES} from "../../domain/model/enum/TransactionStatuses.js";
import {Transaction} from "../../domain/model/Transaction.js";
import {SCHEDULED_WITHDRAWAL_STATUSES} from "../../domain/model/enum/ScheduledWithdrawalStatus.js";
import {TransactionService} from "./TransactionService.js";

export class WithdrawalService extends TransactionService{
    constructor(walletRepo, transactionRepo, unitOfWork, ledgerRepo, shceduledWithdrawalRepo, externalService) {
        super();
        this.walletRepository = walletRepo;
        this.transactionRepository = transactionRepo;
        this.unitOfWork = unitOfWork;
        this.ledgerRepository = ledgerRepo;
        this.externalService = externalService;
        this.shceduledWithdrawalRepository = shceduledWithdrawalRepo;
    }


    async initiateTransaction(scheduledWithdrawal) {
        await this.unitOfWork.beginTransaction();
        let transaction;
        try {
            transaction = Transaction.createFromScheduledWithdrawal(scheduledWithdrawal)
            const wallet = await this.getWalletWithLock(transaction.walletId);
            await this.applyWithdrawalToWallet(wallet, transaction.amount)
            transaction.balanceAfter = wallet.balance;
            transaction = await this.transactionRepository.insertTransaction(transaction);
            await this.shceduledWithdrawalRepository.updateStatus(transaction.scheduleId, SCHEDULED_WITHDRAWAL_STATUSES.PROCESSED);
            await this.unitOfWork.commit();
        } catch (e) {
            await this.unitOfWork.rollback();
            throw e;
        }
        const {reference, status, description} = await this.externalService.credit(transaction.id, {transaction});
        await this.callStateMachine(transaction, status, reference, description)
    }


    async inquiryLater({transaction}){
        transaction = await this.getReservedTransactionWithLock(transaction.id);
        transaction.retryCount +=1;
        transaction.retryTime = new Date(Date.now()+60000);
        await this.transactionRepository.updateRetryTime(transaction);
    }

    async followFailureScenario({transaction, args: {description}}){
        await this.unitOfWork.beginTransaction();
        try {
            await this.getReservedTransactionWithLock(transaction.id);
            const wallet = await this.getWalletWithLock(transaction.walletId);
            await this.revertWithdrawalFromWallet(wallet, transaction.amount);
            transaction.description = description;
            await this.transactionRepository.updateTransaction(transaction);
            await this.unitOfWork.commit();
        } catch (e) {
            await this.unitOfWork.rollback();
            throw e;
        }
    }
    async followSuccessScenario({transaction, args:{reference}}){
        await this.unitOfWork.beginTransaction();
        try {
            await this.getReservedTransactionWithLock(transaction.id);
            transaction.reference = reference;
            await this.transactionRepository.updateTransaction(transaction, reference);
            await this.ledgerRepository.insert(transaction, transaction.balanceAfter);
            await this.unitOfWork.commit();
        } catch (e) {
            await this.unitOfWork.rollback();
            throw e;
        }
    }

    async getReservedTransactionWithLock(transactionId) {
        const transaction = await this.transactionRepository.fetchForUpdate(
            transactionId,
            [TRANSACTION_STATUSES.RESERVED]);
        if(!transaction) {
            throw {message: 'TRANSACTION_NOT_FOUND'};
        }
        return transaction;
    }

    async getWalletWithLock(walletId) {
        return await this.walletRepository.getWalletById(walletId, true)
    }

    async revertWithdrawalFromWallet(wallet, returnedValue) {
        wallet.balance += returnedValue;
        await this.walletRepository.updateBalance(wallet);
    }

    async applyWithdrawalToWallet(wallet, amount) {
        if(wallet.balance < amount) {
            throw {message: 'INSUFFICIENT_BALANCE'};
        }
        wallet.balance -= amount;
        await this.walletRepository.updateBalance(wallet);
    }
}