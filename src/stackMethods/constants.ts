// Realm paths
export const DEFAULT_REALM_PATH_DYNAMIC_REALM = 'dynamic-realm.path';
export const DEFAULT_REALM_PATH_STACK = 'stack-realm.path';

// Primary keys
export const PK_STACK_LIST_ROW = 'STACK_LIST_ROW';

// Column names
export const COLUMN_NAME_SNAPSHOT_TIMESTAMP = 'timestamp';

// Schema naming
const SUFFIX_STACK_SCHEMA: string = 'STACK';
const SUFFIX_SNAPSHOT_SCHEMA: string = 'SNAPSHOT';
export const SCHEMA_NAME_DELIMITER: string = '_';
export const getStackSchemaName = (stackName: string) => `${stackName}${SCHEMA_NAME_DELIMITER}${SUFFIX_STACK_SCHEMA}`;
export const getSnapshotSchemaName = (stackName: string) => `${stackName}${SCHEMA_NAME_DELIMITER}${SUFFIX_SNAPSHOT_SCHEMA}`;
export const getBaseNameFromSchemaName = (schemaName: string) => {
    const index: number = schemaName.lastIndexOf(SCHEMA_NAME_DELIMITER);
    const plainSchemaName: string = schemaName.slice(0, index);

    return plainSchemaName;
}
