import {Usecase} from "./Usecase.js";

export class GetBalanceUsecase extends Usecase {

    constructor(walletRepo) {
        super();
        this.walletRepository = walletRepo;

    }

    async execute(context) {
        const {userId, walletType} = context;
        const wallet = await this.walletRepository.getWallet(userId, walletType);
        return wallet.getBalance()
    }
}