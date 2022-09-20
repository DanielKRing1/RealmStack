import Realm from 'realm';
import MetaRealm, { SaveSchemaParams } from '@asianpersonn/metarealm';

import { genStackSchemas } from "../constants/schemas";
import { RealmStack, RealmStackRow, RSCreateParams, RSDeleteStackParams, RSLoadStackParams, RSPushParams, RSSnapshot, RSUpdatePropertiesParams } from "./types";
import { COLUMN_NAME_SNAPSHOT_TIMESTAMP, getSnapshotSchemaName, getStackSchemaName, PK_STACK_LIST_ROW } from '../constants/naming';
import { binarySearchClosest } from '../utils/binarySearch';
import { Dict } from '@asianpersonn/dict-utils/dist/types';


export const createRealmStack = async({ metaRealmPath, loadableRealmPath, stackName, snapshotProperties }: RSCreateParams): Promise<RealmStack> => {
    // 1. Save new Stack Snapshot and List schemas
    _saveStackSchemas(metaRealmPath, loadableRealmPath, stackName, snapshotProperties);
    
    // 2. Reload LoadableRealm with new schemas, so propertyNames can be accessed from LoadableSchema
    await MetaRealm.LoadableRealmManager.reloadRealm({ metaRealmPath, loadableRealmPath });

    // 3. Add defauly StackList row
    await _initStackListRow(metaRealmPath, loadableRealmPath, stackName);

    // 4. Setup RealmStack
    const realmGraph: RealmStack = initializeRealmStack({ metaRealmPath, loadableRealmPath, stackName, snapshotProperties });

    return realmGraph;
}

export const loadRealmStack = async ({ metaRealmPath, loadableRealmPath, stackName, shouldReloadRealm=true }: RSLoadStackParams): Promise<RealmStack> => {
    // 1. Get propertyNames from saved Node schema
    // Can use Node or Edge schema
    const snapshotSchemaName: string = getSnapshotSchemaName(stackName);
    const snapshotProperties: Realm.PropertiesTypes = MetaRealm.getProperties(metaRealmPath, snapshotSchemaName);
    
    // 2. Remove unrelated keys
    delete snapshotProperties[COLUMN_NAME_SNAPSHOT_TIMESTAMP];
    
    // 3. Initialize RealmStack
    const realmStack: RealmStack = await initializeRealmStack({ metaRealmPath, loadableRealmPath, stackName, snapshotProperties });

    // 4. Reload realm (optional bcus may be loading multiple RealmStqacks)
    if(shouldReloadRealm) await realmStack.reloadRealm();
    
    return realmStack;
};

const initializeRealmStack = ({ metaRealmPath, loadableRealmPath, stackName }: RSCreateParams): RealmStack => {

    // REALM GRAPH METHODS
    function getStackName(): string { return stackName; };
    function getMetaRealmPath(): string { return metaRealmPath; };
    function getLoadableRealmPath(): string { return loadableRealmPath; };
    function getPropertyNames(): string[] { return Object.keys(getProperties()); };
    function getProperties(): Dict<any> {
        const properties: Dict<any> = MetaRealm.getProperties(metaRealmPath, getSnapshotSchemaName(stackName));
        delete properties[COLUMN_NAME_SNAPSHOT_TIMESTAMP];

        return properties;
    };

    const getAllSnapshots = async (): Promise<Realm.Results<RSSnapshot & Realm.Object>> => {
        const loadedGraphRealm: Realm = await loadRealm();
        return loadedGraphRealm.objects(getSnapshotSchemaName(stackName));
    }

    /**
     * Get the Stack row Realm.Result
     * 
     * @returns 
     */
    const getStackRow = async (): Promise<(RealmStackRow & Realm.Object) | undefined> => {
        const loadedGraphRealm: Realm = await loadRealm();
        const stackRow: (RealmStackRow & Realm.Object) | undefined = loadedGraphRealm.objectForPrimaryKey(getStackSchemaName(stackName), PK_STACK_LIST_ROW);

        return stackRow;
    }

    /**
     * Get the JSON-ified stack as a list
     * 
     * @returns 
     */
    const getListJSON = async (): Promise<RSSnapshot[]> => {
        const stackRow: (RealmStackRow & Realm.Object) | undefined = await getStackRow();

        try {
            return stackRow !== undefined ? stackRow.list.toJSON() : [];
        }
        catch(err) {
            console.log(err);
        }
    }

    const deleteStack = async (): Promise<void> => await _deleteStackSchemas({ metaRealmPath, loadableRealmPath, stackName, reloadRealm });

    const updateStack = async (newSnapshotProperties: Dict<any>): Promise<void> => await _updateStackSchemas({ metaRealmPath, loadableRealmPath, stackName, newSnapshotProperties, reloadRealm });

    // PUSH

    /**
     * Push a list of snapshots onto the RealmStack
     * Returns true if snapshots are successfully added
     * 
     * @param param0 
     * @param snapshots 
     * @returns 
     */
    const push = async ({ timestamp = new Date() }: RSPushParams, ...snapshots: RSSnapshot[]): Promise<boolean> => {
        // 1. Get realm
        const realm: Realm = await MetaRealm.LoadableRealmManager.loadRealm({ metaRealmPath, loadableRealmPath });

        // 2. Get Stack
        const stack: (RealmStackRow & Realm.Object) | undefined = await getStackRow();

        // 3. Append timestamp to snapshot
        const formatedSnapshots: RSSnapshot[] = snapshots.map((snapshot: Dict<any>) => ({
            ...snapshot,
            [COLUMN_NAME_SNAPSHOT_TIMESTAMP]: timestamp,
        }));

        // 4. Add snapshots to front of stack
        realm.write(() => {
            stack.list.unshift(...formatedSnapshots);
        });

        return true;
    }

    // SEARCH
    
    /**
     * Returns the index of the oldest snapshot gte to the search date
     * 
     * @param searchDate 
     * @returns 
     */
    const getClosestDate = async (searchDate: Date): Promise<number> => {
        // 1. Get Stack
        const list: RSSnapshot[] = await getListJSON();

        if(list.length === 0 ) return -1;

        // EDGE CASES
        // [ newest time, ..., oldest time ] (Descending order)

        // 2. No dates gte searchDate
        // Search date is more recent than latest snapshot
        if (searchDate < list[list.length - 1][COLUMN_NAME_SNAPSHOT_TIMESTAMP]) return list.length - 1;

        // 3. All dates gte searchDate
        // Search date is older than oldest snapshot
        if (searchDate > list[0][COLUMN_NAME_SNAPSHOT_TIMESTAMP]) return 0;

        // 4. Binary search
        return _getDateInStackLTE(searchDate, list);
    };

    // INTERNAL UTILITY
    async function loadRealm(): Promise<Realm> { return await MetaRealm.LoadableRealmManager.loadRealm({ metaRealmPath, loadableRealmPath }) };
    async function reloadRealm(): Promise<Realm> { return await MetaRealm.LoadableRealmManager.reloadRealm({ metaRealmPath, loadableRealmPath }) };
    function loadRealmSync(): Realm { return MetaRealm.LoadableRealmManager.loadRealmSync({ metaRealmPath, loadableRealmPath }) };
    function reloadRealmSync(): Realm { return MetaRealm.LoadableRealmManager.reloadRealmSync({ metaRealmPath, loadableRealmPath }) };

    return {
        getStackName,
        getMetaRealmPath,
        getLoadableRealmPath,
        getPropertyNames,
        getProperties,

        getAllSnapshots,
        getStackRow,
        getListJSON,

        deleteStack,
        updateStack,

        push,
        getClosestDate,

        loadRealm,
        reloadRealm,
        loadRealmSync,
        reloadRealmSync,
    }
}

const _saveStackSchemas = (metaRealmPath: string, loadableRealmPath: string, stackName: string, snapshotProperties: Dict<any>): void => {
    const { snapshotSchema, listSchema } = genStackSchemas(stackName, snapshotProperties);

    const saveParams: SaveSchemaParams[] = [snapshotSchema, listSchema].map((schema: Realm.ObjectSchema) => ({ metaRealmPath, loadableRealmPath, schema }));
    // 2. And save new Graph schemas
    for(let saveParam of saveParams) {
        MetaRealm.saveSchema(saveParam);
    }
}

const _initStackListRow = async (metaRealmPath: string, loadableRealmPath: string, stackName: string): Promise<void> => {
    // 1. Create stack row in Stack schema
    const realm: Realm = await MetaRealm.LoadableRealmManager.loadRealm({ metaRealmPath, loadableRealmPath });
    try {
        realm.write(() => {
            realm.create(getStackSchemaName(stackName), {
                name: PK_STACK_LIST_ROW,
                list: [],
            });
        });
    } catch (err) {
        // Error thrown to prevent writing duplicate; Do nothing
        console.log(err);
    }
}

const _deleteStackSchemas = async ({ metaRealmPath, loadableRealmPath, stackName, reloadRealm }: RSDeleteStackParams): Promise<void> => {
    // 1. Get node + edge schema names
    const schemaNames: string[] = [ getSnapshotSchemaName(stackName), getStackSchemaName(stackName) ];

    // 2. Delete Graph schemas
    for(let schemaName of schemaNames) {
        MetaRealm.rmSchema({ metaRealmPath, loadableRealmPath, schemaName });
    }

    // 3. Reload Realm with updated schemas
    await reloadRealm();
}

const _updateStackSchemas = async ({ metaRealmPath, loadableRealmPath, stackName, newSnapshotProperties, reloadRealm }: RSUpdatePropertiesParams): Promise<void> => {
    // 1. Create updated stack schemas (only snapshot schema))
    const { snapshotSchema } = genStackSchemas(stackName, newSnapshotProperties);

    const updatedSchemas: Realm.ObjectSchema[] = [ snapshotSchema ];
    // 2. Save updated RealmStack schema (only snapshot schema)
    for(let schema of updatedSchemas) {
        MetaRealm.updateSchema({ metaRealmPath, loadableRealmPath, schema });
    }

    // 3. Reload Realm with updated schemas
    await reloadRealm();
}


/**
 * Returns the index of the oldest snapshot gte to the search date
 * 
 * @param searchDate 
 * @param list 
 * @returns 
 */
const _getDateInStackLTE = (searchDate: Date, list: RSSnapshot[]): number => {
    if(list.length === 0 ) return -1;

    const comparator = (midValue: RSSnapshot, searchDate: Date): -1 | 0 | 1 => {
        if(searchDate > midValue[COLUMN_NAME_SNAPSHOT_TIMESTAMP]) return -1;
        else if (searchDate < midValue[COLUMN_NAME_SNAPSHOT_TIMESTAMP]) return 1;
        else return 0;
    };

    // 1. Get index at which dates to the left are gte
    const foundIndex: number = binarySearchClosest<RSSnapshot>(searchDate, list, comparator);

    // 2. If exact date is found during binary search
    //      and there are duplicates of this date in the stack,
    //      then might not return index for right-most duplicate
    // Check to the right of list for first instance of (duplicate) date
    for(let oldestDuplicateIndex = foundIndex + 1; oldestDuplicateIndex < list.length; oldestDuplicateIndex++) {
        const snapshot: RSSnapshot = list[oldestDuplicateIndex];
        const timestamp: Date = snapshot[COLUMN_NAME_SNAPSHOT_TIMESTAMP];

        // Not a duplicate, so return last duplicate index (currentIndex - 1)
        if(list[foundIndex][COLUMN_NAME_SNAPSHOT_TIMESTAMP].getTime() != timestamp.getTime()) return oldestDuplicateIndex - 1;
    }

    // Contains duplicates until the last index
    return list.length - 1;
}
