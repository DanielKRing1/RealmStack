type RealmPath = string;

export class _StackRealmCache {
    _stackCache: Dict<RealmPath> = {};
    _realmCache: Dict<Realm> = {};

    constructor() {}

    add(stackName: string, realm: Realm) {
        // Force close existing Realms
        if(this.hasStackRealm(stackName)) this.getStackRealm(stackName)?.close();

        const realmPath: RealmPath = realm.path;
        this._stackCache[stackName] = realmPath;
        this._realmCache[realmPath] = realm;
    }

    getStackRealm(stackName: string): Realm | undefined {
        if(this.hasStackRealm(stackName)) {
            const realmPath: RealmPath = this._stackCache[stackName];
            return this.getRealm(realmPath);
        }
    }

    getRealm(realmPath: RealmPath): Realm | undefined {
        if(this.hasRealm(realmPath)) return this._realmCache[realmPath];
    }

    hasStackRealm(stackName: string): boolean {
        // 1. Does not have stack name key
        if(!this._stackCache.hasOwnProperty(stackName)) return false;

        // 2. Get RealmPath -> Realm
        const realmPath: RealmPath = this._stackCache[stackName];
        return this.hasRealm(realmPath);
    }

    hasRealm(realmPath: RealmPath): boolean {
        return !!this._realmCache[realmPath];
    }
}

export default new _StackRealmCache();