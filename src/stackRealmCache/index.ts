import DynamicRealm from 'dynamic-realm';

import { getStackNames } from '../stackMethods';
import { getSnapshotSchemaName, COLUMN_NAME_SNAPSHOT_TIMESTAMP, getStackSchemaName, PK_STACK_LIST_ROW, DEFAULT_REALM_PATH_STACK, DEFAULT_REALM_PATH_DYNAMIC_REALM } from '../stackMethods/constants';

type RealmPath = string;

export type CreateStackParams = {
    dynamicRealmPath: string;
    stackRealmPath: string;
    stackName: string;
    snapshotProperties: Dict<any>;
};

type StackSchemas = {
    snapshotSchema: Realm.ObjectSchema;
    stackSchema: Realm.ObjectSchema;
};
const genStackSchemas = (stackName: string, snapshotProperties: Dict<any>): StackSchemas => {
    // 1. Create snapshot schema, adding timestamp
    const snapshotSchema: Realm.ObjectSchema = {
        name: getSnapshotSchemaName(stackName),
        properties: {
            ...snapshotProperties,
            [COLUMN_NAME_SNAPSHOT_TIMESTAMP]: 'date',
        },
    };

    // 2. Create stack schema, linking the snapshot schema
    const stackSchema: Realm.ObjectSchema = {
        name: getStackSchemaName(stackName),
        primaryKey: 'name',
        properties: {
            name: 'string',
            list: `${getSnapshotSchemaName(stackName)}[]`,
        },
    };

    return {
        snapshotSchema,
        stackSchema,
    };
};

export class _StackRealmCache {
    _stackCache: Dict<RealmPath> = {};
    _realmCache: Dict<Realm> = {};

    constructor() {}

    async createStack({ dynamicRealmPath = DEFAULT_REALM_PATH_DYNAMIC_REALM, stackRealmPath = DEFAULT_REALM_PATH_STACK, stackName, snapshotProperties }: CreateStackParams): Promise<Realm> {
        const { snapshotSchema, stackSchema } = genStackSchemas(stackName, snapshotProperties);

        // 1. Init DynamicRealm if not already initialized
        await DynamicRealm.init({ realmPath: dynamicRealmPath, force: false });

        // 2. Save Snapshot schema to DynamicRealm
        DynamicRealm.saveSchema({ realmPath: stackRealmPath, schema: snapshotSchema, overwrite: false });

        // 3. Save Stack schema to DynamicRealm
        DynamicRealm.saveSchema({ realmPath: stackRealmPath, schema: stackSchema, overwrite: false });

        // 4. Create stack row in Stack schema
        const newRealm: Realm = await DynamicRealm.loadRealm(stackRealmPath);
        newRealm.write(() => {
            newRealm.create(stackSchema.name, {
                name: PK_STACK_LIST_ROW,
                list: [],
            });
        });

        // 5. Add to StackCache
        this.addStackRealm(stackName, stackRealmPath, newRealm);

        return newRealm;
    }

    async loadStacks(stackRealmPath: string) {
        // 1. Get stacks
        const stackNames: string[] = getStackNames(stackRealmPath);

        // 2. Track stacks
        const newRealm: Realm = await DynamicRealm.loadRealm(stackRealmPath);
        for (let stackName of stackNames) this._addStack(stackName, stackRealmPath);

        // 3. Track realm
        this._addRealm(stackRealmPath, newRealm);
    }

    /**
     *
     * @param stackName Realm will modify the user's chosen realm path into a longer path string (saved as Realm.path),
     *  so to give the user full control, while abstracting the underlying Realm object,
     *  StackRealmCache caches Realms and Stack names by the user's chosen realm path
     * @param realm
     */
    addStackRealm(stackName: string, userRealmPath: string, realm: Realm) {
        // Force close existing Realms
        if (this.hasStackRealm(stackName)) this.getStackRealm(stackName)?.close();

        this._addStack(stackName, userRealmPath);
        this._addRealm(userRealmPath, realm);
    }

    _addStack(stackName: string, userRealmPath: string) {
        this._stackCache[stackName] = userRealmPath;
    }
    /**
     *
     * @param userRealmPath Realm will modify the user's chosen realm path into a longer path string (saved as Realm.path),
     *  so to give the user full control, while abstracting the underlying Realm object,
     *  StackRealmCache caches Realms and Stack names by the user's chosen realm path
     * @param realm
     */
    _addRealm(userRealmPath: string, realm: Realm) {
        this._realmCache[userRealmPath] = realm;
    }

    getStackRealm(stackName: string): Realm | undefined {
        if (this.hasStackRealm(stackName)) {
            const realmPath: RealmPath = this._stackCache[stackName];
            return this.getRealm(realmPath);
        }
    }

    // GETTERS: Get metadata of what is tracked by this StackRealmCache
    // This may not necessarily reflect everything that
    getLoadedRealms(): Realm[] {
        return Object.values(this._realmCache);
    }
    getLoadedRealmPaths(): string[] {
        return Object.keys(this._realmCache);
    }
    getLoadedStackNames(): string[] {
        return Object.keys(this._stackCache);
    }

    getRealm(realmPath: RealmPath): Realm | undefined {
        if (this.hasRealm(realmPath)) return this._realmCache[realmPath];
    }

    hasStackRealm(stackName: string): boolean {
        // 1. Does not have stack name key
        if (!this._stackCache.hasOwnProperty(stackName)) return false;

        // 2. Get RealmPath -> Realm
        const realmPath: RealmPath = this._stackCache[stackName];
        return this.hasRealm(realmPath);
    }

    hasRealm(realmPath: RealmPath): boolean {
        return !!this._realmCache[realmPath];
    }
}

export default new _StackRealmCache();
