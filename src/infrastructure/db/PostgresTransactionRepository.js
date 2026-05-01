import {toTransactionDomainModel} from "./mapper/Mappers.js";
import {ITransactionRepository} from "../../application/port/out/repository/ITransactionRepository.js";
import {client} from "./config/PgConfig.js";

export class PostgresTransactionRepository extends ITransactionRepository{
    async insertTransaction(trx) {
        const query =
            `insert into transaction (id, amount, status, wallet_id, type, reason, created_at, updated_at, schedule_id, balance_after)
                values ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7, &8)
                returning *`;

        const values = [trx.id, trx.amount, trx.state.ID, trx.walletId, trx.type, trx.reason, trx.scheduleId, trx.balanceAfter];

        const result = await client.query(query, values);

        return toTransactionDomainModel(result.rows[0]);
    }

    async insertBatch(transactions) {
        return await Promise.all(transactions.map(t => this.insertTransaction(t)));
    }



    async fetchForUpdate(id, statuses) {
        const placeholders = statuses.map((_, i) => `$${i + 1}`).join(',');

        const result = await client.query(`select * from transaction where id = '${id}'
                          and status in (${placeholders})
                          FOR UPDATE SKIP LOCKED`);
        return toTransactionDomainModel(result.rows[0]);

    }

    async updateTransaction(trx){
        const result = await client.query(
            `update transaction 
                set status = $1, description = $2, external_ref = $3, balance_after= $4, updated_at = NOW()
                where id = $5
             RETURNING *`,
            [trx.state.ID, trx.description, trx.reference, trx.balanceAfter, trx.id]
        );
        return toTransactionDomainModel(result.rows[0]);
    }

    async updateTransactionWithNewBalanceAndStatus(trx, balanceAfter){
        await client.query(
            `update transaction
                    set status = $1, balance_after = $2, external_reference = $3, updated_at = NOW()
                    where id = $4
                 RETURNING *`,
            [trx.state.ID, balanceAfter , trx.reference, trx.id]
        );

    }

    // async fetchForUpdateBatch(ids) {
    //     const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
    //     const result = await client.query(`select * from transaction where id in (${placeholders}) FOR UPDATE SKIP LOCKED`);
    //     return result.rows.map(r => toTransactionDomainModel(r));
    // }

    async updateRetryTime(trx) {
        const result = await client.query(`update transaction  set retry_time = $1 , retry_count = $2
         where id = $3`,
            [trx.retryTime, trx.retryCount, trx.id]
            )
        return toTransactionDomainModel(result.rows[0]);
    }


        async fetchBatchByStatusAndRetryTime(statuses) {
        const placeholders = statuses.map((_, i) => `$${i + 1}`).join(',');
        const result = await client.query(`select * from transaction 
         where type = '${type}'
         and status in (${placeholders})
         and retry_time < NOW()
         order by retry_time
         limit 1000
         FOR UPDATE SKIP LOCKED`);
        return result.rows.map(r => toTransactionDomainModel(r));
    }

}
