import DynamicRealm from 'dynamic-realm';

import { binarySearch } from '../utils/binarySearch';
import { COLUMN_NAME_SNAPSHOT_TIMESTAMP, PK_STACK_LIST_ROW, DEFAULT_LOADABLE_REALM_PATH, SCHEMA_NAME_DELIMITER, getSnapshotSchemaName, getStackSchemaName, getBaseNameFromSchemaName } from './constants';
import { MISSING_STACK_LIST_ROW_ERROR, NO_STACK_REALM_ERROR } from './errors';

import StackRealmCache from '../stackRealmCache';

export const getStackNames = (metaRealmPath: string, stackRealmPath: string | undefined = undefined): string[] => {
    const schemaNames: Set<string> = new Set<string>();

    // 1. Get all schema names
    const allSchemaNames: string[] = DynamicRealm.getSchemaNames(metaRealmPath, stackRealmPath);

    // 2. Remove schema name suffix and add to set (removes duplicate StackList and StackSnapshot schema names)
    allSchemaNames.forEach((schemaName) => {
        // 2.1. Remove suffix
        const plainSchemaName: string = getBaseNameFromSchemaName(schemaName);

        // 2.2. Add to set
        schemaNames.add(plainSchemaName);
    });

    return Array.from(schemaNames);
};

export const getStackProperties = (metaRealmPath: string, stackName: string): Realm.PropertiesTypes => {
    return DynamicRealm.getProperties(metaRealmPath, getSnapshotSchemaName(stackName));
};

export const getStack = (stackName: string): StackListRow & Realm.Object => {
    // 1. Get realm, using plain stack name
    const realm: Realm | undefined = StackRealmCache.getStackRealm(stackName);
    if(!realm) throw NO_STACK_REALM_ERROR(stackName);

    // console.log(realm);
    // console.log('oooooo');
    // 2. Get Stack list
    const stackSchemaName: string = getStackSchemaName(stackName);
    const stack: (StackListRow & Realm.Object) | undefined = realm.objectForPrimaryKey(stackSchemaName, PK_STACK_LIST_ROW);
    if (!stack) throw MISSING_STACK_LIST_ROW_ERROR(stackSchemaName);

    return stack;
};

export const getClosestDate = (stackName: string, searchDate: Date): number => {
    // 1. Get Stack
    const stack: StackListRow & Realm.Object = getStack(stackName);
    const list: Realm.List<StackSnapshotRow> = stack.list;

    // EDGE CASES
    // [ newest time, ..., oldest time ] (Descending order)

    // 2. No dates gte searchDate
    if (list.length > 0 && searchDate > list[0][COLUMN_NAME_SNAPSHOT_TIMESTAMP]) return -1;

    // 3. All dates gte searchDate
    if (list.length > 0 && list[list.length - 1][COLUMN_NAME_SNAPSHOT_TIMESTAMP] > searchDate) return list.length - 1;

    // 4. Binary search
    return getDateInStackGTE(searchDate, list);
};

export function getDateInStackGTE(searchDate: Date, list: Realm.List<StackSnapshotRow>): number {
    const comparator = (midValue: StackSnapshotRow, searchDate: Date): -1 | 0 | 1 => {
        if(midValue[COLUMN_NAME_SNAPSHOT_TIMESTAMP] < searchDate) return -1;
        else if (searchDate < midValue[COLUMN_NAME_SNAPSHOT_TIMESTAMP]) return 1;
        else  return 0;
    };

    // 1. Get index at which dates to the left are gte
    const foundIndex: number = binarySearch<StackSnapshotRow>(searchDate, <any>list, comparator, 0, list.length - 1);
    if(foundIndex == -1) return -1;

    // 2. If exact date is found during binary search
    //      and there are duplicates of this date in the stack,
    //      then might not return index for right-most date
    // Check to the right of list for first instance of (duplicate) date
    for(let earliestDuplicateIndex = foundIndex + 1; earliestDuplicateIndex < list.length; earliestDuplicateIndex++) {
        const entry: StackSnapshotRow = list[earliestDuplicateIndex];
        const timestamp: Date = entry[COLUMN_NAME_SNAPSHOT_TIMESTAMP];

        // Not a duplicate, so return last duplicate index (currentIndex - 1)
        if(list[foundIndex][COLUMN_NAME_SNAPSHOT_TIMESTAMP].getTime() != timestamp.getTime()) return earliestDuplicateIndex - 1;
    }

    // Duplicates until the last index
    return list.length - 1;
}
