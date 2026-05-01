import {BaseController} from "./BaseController.js ";


// this function is used only for local test propose
function extractUserInfo(req) {
    return {
        userId: req.userId || 'test',
        walletType: req.walletType || 'DEFAULT',
        withdrawalAt: req.withdrawalAt || null,
        amount: req.amount || 1500,
        walletId: req.walletId || 1
    };
}

export class WalletController extends BaseController {
    constructor(getBalanceUsecase, scheduleWithdrawalUsecase, depositUsecase) {
        super();
        this.getBalanceUsecase = getBalanceUsecase;
        this.scheduleWithdrawalUsecase = scheduleWithdrawalUsecase;
        this.depositUsecase = depositUsecase;

    }
    register(app) {
        app.get("/wallet/balance", async (req, res) => {
            const balance = await this.getBalanceUsecase.execute(extractUserInfo(req));
            res.json({statusCode: 200, balance});
        });

        app.get("/wallet/withdrawal/schedule", async (req, res) => {
            await this.scheduleWithdrawalUsecase.execute()
            res.json({status: "ok"});
        });

        app.get("/wallet/deposit", async (req, res) => {
            await this.depositUsecase.execute(extractUserInfo(req))
            res.json({status: "ok"});
        });


    }
}

