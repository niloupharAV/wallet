import {IUnitOfWork} from "../../application/port/out/repository/IUnitOfWork.js";
import {client} from "./config/PgConfig.js";

export class PostgresUnitOfWork extends IUnitOfWork {
    async beginTransaction(isolationLevel ) {
        await client.query('BEGIN' + (isolationLevel? ` ISOLATION LEVEL ${isolationLevel}` : ' '));

    }
    async commit() {
        await client.query('COMMIT');

    }

    async rollback(){
        await client.query('ROLLBACK');

    }

}