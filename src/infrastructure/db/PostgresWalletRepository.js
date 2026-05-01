import {toWalletDomainModel} from "./mapper/Mappers.js";
import {IWalletRepository} from "../../application/port/out/repository/IWalletRepository.js";
import {client} from "./config/PgConfig.js";


export class PostgresWalletRepository extends IWalletRepository{
    async getWallet(userId, walletType)  {
        const result = await client.query(`select * from wallet 
         where user_id = '${userId}' 
           and type = '${walletType}' 
           and active = true `)
        if (result.rows.length === 0) return null;

        return toWalletDomainModel(result.rows[0])
    }

    async getWalletById(id, withLock = false)  {
        const q = `select * from wallet 
         where id = ${id}
           and active = true ` + (withLock? ' FOR UPDATE SKIP LOCKED' : ' ');
        const result = await client.query(q);
        if (result.rows.length === 0) return null;

        return toWalletDomainModel(result.rows[0])
    }

    async updateBalance(wallet){
        await client.query(
            `update wallet 
                    set balance = $1 
                    where id = $2`,
            [wallet.balance, wallet.id]
        );

    }
}
