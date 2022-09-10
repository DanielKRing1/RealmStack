import { Dict } from "@asianpersonn/dict-utils/dist/types";
import { COLUMN_NAME_SNAPSHOT_TIMESTAMP, getSnapshotSchemaName, getStackSchemaName } from "./naming";

export type StackSchemas = {
    snapshotSchema: Realm.ObjectSchema;
    listSchema: Realm.ObjectSchema;
};
export const genStackSchemas = (stackName: string, snapshotProperties: Dict<any>): StackSchemas => {
    // 1. Create snapshot schema, adding timestamp
    const snapshotSchema: Realm.ObjectSchema = {
        name: getSnapshotSchemaName(stackName),
        properties: {
            ...snapshotProperties,
            [COLUMN_NAME_SNAPSHOT_TIMESTAMP]: 'date',
        },
    };

    // 2. Create list schema, linking the snapshot schema
    const listSchema: Realm.ObjectSchema = {
        name: getStackSchemaName(stackName),
        primaryKey: 'name',
        properties: {
            name: 'string',
            list: `${getSnapshotSchemaName(stackName)}[]`,
        },
    };

    return {
        snapshotSchema,
        listSchema,
    };
};