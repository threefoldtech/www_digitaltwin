import { Entity, EntityCreationData, Repository, Schema } from 'redis-om';

import { DbService } from './db.service';

export abstract class EntityRepository<TEntity extends Entity> {
    private _entityRepository: Repository<TEntity>;

    constructor(protected readonly _dbService: DbService, protected readonly _entitySchema: Schema<TEntity>) {
        this._entityRepository = this._dbService.createRepository(this._entitySchema);
        this._entityRepository.createIndex();
    }

    /**
     * Finds all entities.
     * @param {Object} obj - Object.
     * @param {number} obj.offset - Paginated offset.
     * @param {number} obj.count - Paginated count.
     * @return {TEntity[]} - Found entities.
     */
    protected async findAll({ offset, count }: { offset?: number; count?: number }): Promise<TEntity[]> {
        return await this._entityRepository.search().return.page(offset, count);
    }

    /**
     * Finds all entities based on search.
     * @param {Object} obj - Object.
     * @param {number} obj.offset - Paginated offset.
     * @param {number} obj.count - Paginated count.
     * @param {string} obj.where - Where entity field.
     * @param {string} obj.eq - Equals.
     * @return {TEntity[]} - Found entities.
     */
    protected async findAllWhereEq({
        offset,
        count,
        where,
        eq,
    }: {
        offset?: number;
        count?: number;
        where: string;
        eq: string | boolean;
    }): Promise<TEntity[]> {
        return await this._entityRepository.search().where(where).eq(eq).return.page(offset, count);
    }

    /**
     * Finds one entity based on search.
     * @param {Object} obj - Object.
     * @param {string} obj.where - Where entity field.
     * @param {string} obj.eq - Equals.
     * @return {TEntity} - Found entity.
     */
    protected async findOne({ where, eq }: { where: string; eq: string }): Promise<TEntity> {
        return await this._entityRepository.search().where(where).eq(eq).return.first();
    }

    /**
     * Creates a new entity in the database.
     * @param {EntityCreationData} entity - Entity creation data.
     * @return {TEntity} - Created entity.
     */
    protected async save(entity: EntityCreationData): Promise<TEntity> {
        return await this._entityRepository.createAndSave(entity);
    }

    /**
     * Updates an existing entity in the database.
     * @param {TEntity} entity - Updated entity data.
     * @return {TEntity} - Updated entity id.
     */
    protected async update(entity: TEntity): Promise<string> {
        return await this._entityRepository.save(entity);
    }

    /**
     * Deletes an entity from the database.
     * @param {string} entityId - Entity id to delete.
     */
    protected async delete(entityId: string): Promise<void> {
        return await this._entityRepository.remove(entityId);
    }
}
