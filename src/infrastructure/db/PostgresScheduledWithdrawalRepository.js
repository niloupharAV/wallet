import {toScheduledWithdrawalDomainModel, toTransactionDomainModel} from "./mapper/Mappers.js";
import {client} from "./config/PgConfig.js";
import {IScheduledWithdrawalRepository} from "../../application/port/out/repository/IScheduledWithdrawalRepository.js";

export class PostgresScheduledWithdrawalRepository extends IScheduledWithdrawalRepository{
    async insert(scheduled) {
        const query =
            `insert into scheduled_withdrawal (id, amount, status, wallet_id, time, created_at, updated_at)
                values ($1, $2, $3, $4, $5, NOW(), NOW())
                returning *`;

        const values = [scheduled.id, scheduled.amount, scheduled.status, scheduled.walletId, scheduled.time];

        const result = await client.query(query, values);

        return toScheduledWithdrawalDomainModel(result.rows[0]);
    }



    async fetchForUpdate(){
        const result = await client.query(`
                     SELECT *
                    FROM scheduled_withdrawal
                    WHERE status = 'PENDING' and time < NOW()
                    ORDER BY time 
                    LIMIT 1000
                    FOR UPDATE SKIP LOCKED`);
        return result.rows.map(x => toScheduledWithdrawalDomainModel(x));
    }

    async updateStatus(id, status){
        const result = await client.query(` update scheduled_withdrawal set status = '${status}' where id = '${id}'`)
        return toScheduledWithdrawalDomainModel(result.rows[0]);
    }
}
