export class IThirdParty {
    deposit(idempotencyKey, data){
        throw {message: "NOT_IMPLEMENTED_ERROR"}
    }
    credit(idempotencyKey, data){
        throw {message: "NOT_IMPLEMENTED_ERROR"}
    }
    inquiry(idempotencyKey){
        throw {message: "NOT_IMPLEMENTED_ERROR"}
    }
}