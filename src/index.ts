import * as RealmStack from './stackMethods';
import StackRealmCache from './stackRealmCache';

export default {
    ...RealmStack,
    realmCache: StackRealmCache,
};
