import {TRANSACTION_TYPES} from "../../domain/model/enum/TransactionTypes.js";

export class TransactionInitiator {
        constructor(shceduledWithdrawalRepo, transactionServiceFactory) {
            this.shceduledWithdrawalRepository = shceduledWithdrawalRepo;
            this.transactionServiceFactory = transactionServiceFactory;
        }

        async run() {
            const scheduledItems = await this.shceduledWithdrawalRepository.fetchForUpdate();
            for (const item of scheduledItems) {
                try {
                    await this.transactionServiceFactory.getService(TRANSACTION_TYPES.WITHDRAWAL)
                        .initiateTransaction(item);
                } catch { /* empty */ }
            }
        }
    }