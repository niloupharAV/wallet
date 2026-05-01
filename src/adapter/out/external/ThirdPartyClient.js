import {toResult} from "./Mappers.js";
import {IThirdParty} from "../../../application/port/out/external/IThirdParty.js";

export class ThirdPartyClient extends IThirdParty{
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