import {PostgresWalletRepository} from "./infrastructure/db/PostgresWalletRepository.js";
import {GetBalanceUsecase} from "./application/usecase/GetBalanceUsecase.js";
import {WalletController} from "./adapter/in/http/WalletController.js";
import {DepositUsecase} from "./application/usecase/DepositUsecase.js";
import {PostgresTransactionRepository} from "./infrastructure/db/PostgresTransactionRepository.js";
import {ExternalServiceAdapter} from "./adapter/out/external/ExternalServiceAdapter.js";
import {PostgresUnitOfWork} from "./infrastructure/db/PostgresUnitOfWork.js";
import {connectToDb} from "./infrastructure/db/config/PgConfig.js";
import {PostgresLedgerRepository} from "./infrastructure/db/PostgresLedgerRepository.js";
import {PostgresScheduledWithdrawalRepository} from "./infrastructure/db/PostgresScheduledWithdrawalRepository.js";
import {ScheduleWithdrawalUsecase} from "./application/usecase/ScheduleWithdrawalUsecase.js";
import {TransactionInitiator} from "./application/jobs/TransactionInitiator.js";
import {TransactionSynchronizer} from "./application/jobs/TransactionSynchronizer.js";
import {DepositService} from "./application/service/DepositService.js";
import {WithdrawalService} from "./application/service/WithdrawalService.js";
import {TransactionServiceFactory} from "./application/service/TransactionServiceFactory.js";

// db connection
await connectToDb();

// adapter to third party
const externalServiceAdapter = new ExternalServiceAdapter();

// repositories
const walletRepository = new PostgresWalletRepository();
const scheduledWithdrawalRepository = new PostgresScheduledWithdrawalRepository();
const ledgerRepository = new PostgresLedgerRepository();
const transactionRepository = new PostgresTransactionRepository();
const unitOfWork = new PostgresUnitOfWork();



// application services
const depositService = new DepositService(walletRepository, transactionRepository, externalServiceAdapter, unitOfWork, ledgerRepository);
const withdrawalService = new WithdrawalService(walletRepository, transactionRepository, unitOfWork, ledgerRepository, scheduledWithdrawalRepository, externalServiceAdapter);
const transactionServiceFactory = new TransactionServiceFactory(depositService, withdrawalService);


//use cases
const getBalanceUsecase = new GetBalanceUsecase(walletRepository);
const depositUsecase = new DepositUsecase(walletRepository, transactionServiceFactory);
const scheduledWithdrawalUsecase = new ScheduleWithdrawalUsecase(scheduledWithdrawalRepository)


// workers
// eslint-disable-next-line no-unused-vars
const scheduledTransactionInitiator = new TransactionInitiator(scheduledWithdrawalRepository, transactionServiceFactory);
// eslint-disable-next-line no-unused-vars
const transactionSynchronizer = new TransactionSynchronizer(transactionServiceFactory, transactionRepository, externalServiceAdapter);


const controllers = [
    new WalletController(getBalanceUsecase,scheduledWithdrawalUsecase, depositUsecase)
]


export function register(app) {
    controllers.forEach(c => c.register(app));
}

