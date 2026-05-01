import {TRANSACTION_STATUSES} from "../../domain/model/enum/TransactionStatuses.js";
import {StateMachine, STATES} from "../../domain/model/TransactionState.js";

export class TransactionSynchronizer {
    constructor(transactionServiceFactory, transactionRepo, externalService) {
        this.transactionServiceFactory = transactionServiceFactory;
        this.transactionRepository = transactionRepo;
        this.externalService = externalService;

    }

    async execute() {
        let transactions = await this.transactionRepository.fetchBatchByStatusAndRetryTime(
            [TRANSACTION_STATUSES.UNKNOWN, TRANSACTION_STATUSES.INITIATED, TRANSACTION_STATUSES.RESERVED]);

        for (const trx in transactions) {
            const service = this.transactionServiceFactory.getService(trx.type);
            const {status, description, reference} = await this.externalService.inquiry(trx.id);
            if(status === STATES.COMMITED.ID) {
                await StateMachine.transit(
                    trx,
                    STATES.COMMITED,
                    service.followSuccessScenario.bind(this),
                    {reference})
            }
            else if(status === STATES.FAILED.ID) {
                await StateMachine.transit(
                    trx,
                    STATES.FAILED,
                    service.followFailureScenario.bind(this),
                    {description})
            }
            else {
                // push to outbox
            }

        }

    }

}