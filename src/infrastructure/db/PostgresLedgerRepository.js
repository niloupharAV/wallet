import {ILedgerRepository} from "../../application/port/out/repository/ILedgerRepository.js";
import {client} from "./config/PgConfig.js";


export class PostgresLedgerRepository extends ILedgerRepository{
    async insert(trx, balanceAfter)  {
        await client.query(   `insert into ledger 
                                (amount, wallet_id, type, transaction_id, balance_after, created_at, external_reference)
                                values ($1, $2, $3, $4, $5, NOW(), $6)
                                returning *`
            , [trx.amount, trx.walletId, trx.type, trx.id, balanceAfter, trx.reference]
        );
    }
}
