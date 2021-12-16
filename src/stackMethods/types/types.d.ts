import { COLUMN_NAME_SNAPSHOT_TIMESTAMP } from "../constants";

declare global {

    type StackSnapshotRow = Dict<number | string | Date> & {
        [COLUMN_NAME_SNAPSHOT_TIMESTAMP]: Date;
    };
    type StackListRow = {
        name: string;
        list: Realm.List<StackSnapshotRow>;
    };

}
