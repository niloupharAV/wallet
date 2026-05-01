import {PostgresWalletRepository} from "./infrastructure/db/PostgresWalletRepository.js";
import {GetBalanceUsecase} from "./application/usecase/GetBalanceUsecase.js";
import {WalletController} from "./adapter/in/http/WalletController.js";
import {DepositUsecase} from "./application/usecase/DepositUsecase.js";
import {PostgresTransactionRepository} from "./infrastructure/db/PostgresTransactionRepository.js";
import {ThirdPartyClient} from "./adapter/out/external/ThirdPartyClient.js";
import {PostgresUnitOfWork} from "./infrastructure/db/PostgresUnitOfWork.js";
import {connectToDb} from "./infrastructure/db/config/PgConfig.js";
import {PostgresLedgerRepository} from "./infrastructure/db/PostgresLedgerRepository.js";
import {PostgresScheduledWithdrawalRepository} from "./infrastructure/db/PostgresScheduledWithdrawalRepository.js";
import {ScheduleWithdrawalUsecase} from "./application/usecase/ScheduleWithdrawalUsecase.js";
import {TransactionInitiator} from "./application/jobs/TransactionInitiator.js";
import {TransactionService} from "./application/service/TransactionService.js";
import {TransactionSynchronizer} from "./application/jobs/TransactionSynchronizer.js";

await connectToDb();
const externalService = new ThirdPartyClient();
const walletRepository = new PostgresWalletRepository();
const scheduledWithdrawalRepository = new PostgresScheduledWithdrawalRepository();
const ledgerRepository = new PostgresLedgerRepository();
const transactionRepository = new PostgresTransactionRepository();
const unitOfWork = new PostgresUnitOfWork();
const getBalanceUsecase = new GetBalanceUsecase(walletRepository);
const transactionService = new TransactionService(walletRepository, transactionRepository, externalService, unitOfWork, ledgerRepository);

const depositUsecase = new DepositUsecase(walletRepository, transactionService);
const scheduledWithdrawalUsecase = new ScheduleWithdrawalUsecase(scheduledWithdrawalRepository)

// workers
const scheduledTransactionInitiator = new TransactionInitiator(unitOfWork, scheduledWithdrawalRepository, transactionRepository, walletRepository, externalService);
const transactionSynchronizer = new TransactionSynchronizer(unitOfWork, walletRepository, transactionService, transactionRepository, externalService);

const controllers = [
    new WalletController(getBalanceUsecase,scheduledWithdrawalUsecase, depositUsecase)
]
export function register(app) {
    controllers.forEach(c => c.register(app));
}
