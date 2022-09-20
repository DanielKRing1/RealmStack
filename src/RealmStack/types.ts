import { Dict } from '@asianpersonn/dict-utils/dist/types';
import Realm from 'realm';

import { COLUMN_NAME_SNAPSHOT_TIMESTAMP } from "../constants/naming";

export type RSCreateParams = {
    snapshotProperties: Dict<any>;
} & RSLoadableParams;

export type RSLoadStackParams = {
    shouldReloadRealm?: boolean;
} & RSLoadableParams;

export type RSPushParams = {
    timestamp?: Date;
};

export type RSLoadableParams = {
    metaRealmPath: string;
    loadableRealmPath: string;
    stackName: string;
}

export type RSDeleteStackParams = {
    reloadRealm: () => Promise<Realm>;
} & RSLoadableParams;

export type RSUpdatePropertiesParams = {
    newSnapshotProperties: Dict<any>;

    reloadRealm: () => Promise<Realm>;
} & RSLoadableParams;

export type RealmStack = {
    getStackName: () => string;
    getMetaRealmPath: () => string;
    getLoadableRealmPath: () => string;
    getPropertyNames: () => string[];
    getProperties: () => Dict<any>;

    getAllSnapshots: () => Promise<Realm.Results<RSSnapshot & Realm.Object>>;
    getStackRow: () => Promise<(RealmStackRow & Realm.Object) | undefined>;
    getListJSON: () => Promise<RSSnapshot[]>;

    deleteStack: () => Promise<void>;
    updateStack: (newSnapshotProperties: Dict<any>) => Promise<void>;

    push: (args: RSPushParams, ...snapshots: Dict<any>[]) => Promise<boolean>;
    getClosestDate: (searchDate: Date) => Promise<number>;

    loadRealm: () => Promise<Realm>;
    reloadRealm: () => Promise<Realm>;
    loadRealmSync: () => Realm;
    reloadRealmSync: () => Realm;

}
export type RealmStackRow = {
    name: string;
    list: Realm.List<RSSnapshot>;
}

type RSSnapshotKeys = typeof COLUMN_NAME_SNAPSHOT_TIMESTAMP;
export type RSSnapshot = Record<RSSnapshotKeys, Date> & Dict<any>;
