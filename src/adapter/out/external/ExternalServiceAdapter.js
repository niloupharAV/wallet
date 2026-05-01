import {toResult} from "./Mappers.js";
import {IExternalServiceAdapter} from "../../../application/port/out/external/IExternalServiceAdapter.js";

export class ExternalServiceAdapter extends IExternalServiceAdapter{
    deposit(idempotencyKey, data){
        return toResult();

    }
    credit(idempotencyKey, data) {
        return toResult();
    }

    inquiry(idempotencyKey) {
        return toResult();
    }
}