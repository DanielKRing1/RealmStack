import DynamicRealm from 'dynamic-realm';

import { getStackNames } from '../stackMethods';
import { getSnapshotSchemaName, COLUMN_NAME_SNAPSHOT_TIMESTAMP, getStackSchemaName, PK_STACK_LIST_ROW, DEFAULT_META_REALM_PATH, DEFAULT_LOADABLE_REALM_PATH } from '../stackMethods/constants';
import { SUFFIX_DELIMITER } from './constants';

type RealmPaths = {
    metaRealmPath: string;
    loadableRealmPath: string;
};

export type CreateStackParams = {
    metaRealmPath: string;
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
    _stackCache: Dict<RealmPaths> = {};
    _realmCache: Dict<Realm> = {};

    constructor() {}

    async tryInitMetaRealm(metaRealmPath: string) {
        await DynamicRealm.openMetaRealm({ metaRealmPath, force: false });
    }

    async createStack({ metaRealmPath = DEFAULT_META_REALM_PATH, stackRealmPath = DEFAULT_LOADABLE_REALM_PATH, stackName, snapshotProperties }: CreateStackParams): Promise<Realm> {
        const { snapshotSchema, stackSchema } = genStackSchemas(stackName, snapshotProperties);

        // 1. Init DynamicRealm if not already initialized
        await this.tryInitMetaRealm(metaRealmPath);

        // 2. Save Snapshot schema to DynamicRealm
        DynamicRealm.saveSchema({ metaRealmPath, loadableRealmPath: stackRealmPath, schema: snapshotSchema, overwrite: false });

        // 3. Save Stack schema to DynamicRealm
        DynamicRealm.saveSchema({ metaRealmPath, loadableRealmPath: stackRealmPath, schema: stackSchema, overwrite: false });

        // 4. Create stack row in Stack schema
        const newRealm: Realm = await DynamicRealm.loadRealm(metaRealmPath, stackRealmPath);
        try {
            newRealm.write(() => {
                newRealm.create(stackSchema.name, {
                    name: PK_STACK_LIST_ROW,
                    list: [],
                });
            });
        } catch (err) {
            // Error thrown to prevent writing duplicate; Do nothing
            console.log(err);
        }

        // 5. Add to StackCache
        this.addStackRealm(metaRealmPath, stackRealmPath, stackName, newRealm);

        return newRealm;
    }

    async loadStacks(metaRealmPath: string, loadableRealmPath: string) {
        // 1. Init DynamicRealm if not already initialized
        await this.tryInitMetaRealm(metaRealmPath);

        // 2. Get stacks
        const stackNames: string[] = getStackNames(metaRealmPath, loadableRealmPath);

        // 3. Track stacks and new Realm
        const newRealm: Realm = await DynamicRealm.loadRealm(metaRealmPath, loadableRealmPath);
        for (let stackName of stackNames) this.addStackRealm(metaRealmPath, loadableRealmPath, stackName, newRealm, false);
        
        // for (let stackName of stackNames) this._addStack(metaRealmPath, loadableRealmPath, stackName);

        // // 4. Track realm
        // this._addRealm(metaRealmPath, loadableRealmPath, newRealm);
    }

    /**
     *
     * @param stackName Realm will modify the user's chosen realm path into a longer path string (saved as Realm.path),
     *  so to give the user full control, while abstracting the underlying Realm object,
     *  StackRealmCache caches Realms and Stack names by the user's chosen realm path
     * @param realm
     */
    addStackRealm(metaRealmPath: string, loadableRealmPath: string, stackName: string, realm: Realm, forceClose: boolean = true) {
        // Force close existing Realms
        if (forceClose && this.hasStackRealm(stackName)) this.getStackRealm(stackName)?.close();

        this._addStack(metaRealmPath, loadableRealmPath, stackName);
        this._addRealm(metaRealmPath, loadableRealmPath, realm);
    }

    _genRealmPathKey(metaRealmPath: string, loadableRealmPath: string) { return `${metaRealmPath}${SUFFIX_DELIMITER}${loadableRealmPath}`; }

    _addStack(metaRealmPath: string, loadableRealmPath: string, stackName: string) {
        this._stackCache[stackName] = {
            metaRealmPath,
            loadableRealmPath,
        };
    }
    /**
     *
     * @param userRealmPath Realm will modify the user's chosen realm path into a longer path string (saved as Realm.path),
     *  so to give the user full control, while abstracting the underlying Realm object,
     *  StackRealmCache caches Realms and Stack names by the user's chosen realm path
     * @param realm
     */
    _addRealm(metaRealmPath: string, loadableRealmPath: string, realm: Realm) {
        const realmPathKey: string = this._genRealmPathKey(metaRealmPath, loadableRealmPath);
        this._realmCache[realmPathKey] = realm;
    }

    getStackRealm(stackName: string): Realm | undefined {
        if (this.hasStackRealm(stackName)) {
            const { metaRealmPath, loadableRealmPath }: RealmPaths = this._stackCache[stackName];
            return this.getRealm(metaRealmPath, loadableRealmPath);
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

    getRealm(metaRealmPath, loadableRealmPath): Realm | undefined {
        const realmPathKey: string = this._genRealmPathKey(metaRealmPath, loadableRealmPath);
        if (this.hasRealm(metaRealmPath, loadableRealmPath)) return this._realmCache[realmPathKey];
    }

    hasStackRealm(stackName: string): boolean {
        // 1. Does not have stack name key
        if (!this._stackCache.hasOwnProperty(stackName)) return false;

        // 2. Get RealmPath -> Realm
        const { metaRealmPath, loadableRealmPath }: RealmPaths = this._stackCache[stackName];
        return this.hasRealm(metaRealmPath, loadableRealmPath);
    }

    hasRealm(metaRealmPath: string, loadableRealmPath: string): boolean {
        const realmPathKey: string = this._genRealmPathKey(metaRealmPath, loadableRealmPath);
        return !!this._realmCache[realmPathKey];
    }
}

export default new _StackRealmCache();
