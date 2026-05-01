export class IUnitOfWork {
    async beginTransaction(isolation){}
    async commit(){}
    async rollback(){}
}