import { COLUMN_NAME_SNAPSHOT_TIMESTAMP } from './constants';
import { NO_STACK_REALM_ERROR } from './errors';

import StackRealmCache from '../stackRealmCache';
import { getStack } from './readStack';

type PushOntoStackParams = {
    stackName: string;
    timestamp?: Date;
};
export const pushOntoStack = ({ stackName, timestamp = new Date() }: PushOntoStackParams, ...snapshots: Dict<any>[]): void => {
    // 1. Get realm, using plain stack name
    const realm: Realm | undefined = StackRealmCache.getStackRealm(stackName);
    if(!realm) throw NO_STACK_REALM_ERROR(stackName);

    // 2. Get Stack
    const stack: StackListRow & Realm.Object = getStack(stackName);

    // 3. Append timestamp to snapshot
    const formatedSnapshots: StackSnapshotRow[] = snapshots.map((snapshot: Dict<any>) => ({
        ...snapshot,
        [COLUMN_NAME_SNAPSHOT_TIMESTAMP]: timestamp,
    }));

    // 4. Add snapshot to front of stack
    realm.write(() => {
        stack.list.unshift(...formatedSnapshots);
    });
};
