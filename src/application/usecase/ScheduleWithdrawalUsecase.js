import {Usecase} from "./Usecase.js";
import {ScheduledWithdrawal} from "../../domain/model/ScheduledWithdrawal.js";
import {SCHEDULED_WITHDRAWAL_STATUSES} from "../../domain/model/enum/ScheduledWithdrawalStatus.js";
import {randomUUID} from "crypto";

export class ScheduleWithdrawalUsecase extends  Usecase {
    constructor(scheduledWithdrawalRepo) {
        super();
        this.scheduledWithdrawalRepository = scheduledWithdrawalRepo;

    }


    async execute(context) {
        const {amount, time, walletId} = context;
        await this.validate(walletId, time, amount);
        const obj = new ScheduledWithdrawal({
            id: randomUUID().toString(),
            amount,
            status: SCHEDULED_WITHDRAWAL_STATUSES.PENDING,
            walletId,
            time,
        });
        await this.scheduledWithdrawalRepository.insert(obj);

    }

    async validate(walletId, time , amount) {
        const wallet = await this.walletRepository.getWalletById(walletId);
        if(!wallet) {
            throw {message: 'WALLET_NOT_FOUND'}
        }
        if(time < Date.now()) {
            throw {message: 'INVALID_TIME'}
        }
        if(amount <= 0) {
            throw {message: 'INVALID_AMOUNT'}
        }
    }
}