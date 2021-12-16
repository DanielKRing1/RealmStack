import DynamicRealm from 'dynamic-realm';

import { getSnapshotSchemaName, COLUMN_NAME_SNAPSHOT_TIMESTAMP, getStackSchemaName, PK_STACK_LIST_ROW, DEFAULT_REALM_PATH_STACK, DEFAULT_REALM_PATH_DYNAMIC_REALM } from './constants';

import StackRealmCache from '../stackRealmCache';

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

type CreateStackParams = {
    dynamicRealmPath: string;
    stackRealmPath: string;
    stackName: string;
    snapshotProperties: Dict<any>;
};
export const createStack = async ({ dynamicRealmPath = DEFAULT_REALM_PATH_DYNAMIC_REALM, stackRealmPath = DEFAULT_REALM_PATH_STACK, stackName, snapshotProperties }: CreateStackParams): Promise<Realm> => {
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
    StackRealmCache.add(stackName, newRealm);

    return newRealm;
};
