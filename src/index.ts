import * as RealmStack from './stackMethods';
import StackRealmCache from './stackRealmCache';
import { COLUMN_NAME_SNAPSHOT_TIMESTAMP } from './stackMethods/constants';

export default {
    ...RealmStack,
    realmCache: StackRealmCache,
    TIMESTAMP_COLUMN_KEY: COLUMN_NAME_SNAPSHOT_TIMESTAMP,
};
