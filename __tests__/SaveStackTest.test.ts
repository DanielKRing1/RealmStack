import fs from 'fs';

import MetaRealm from '@asianpersonn/metarealm';
import { createRealmStack } from '../src/RealmStack/realmStack';
import { RealmStack } from '../src/RealmStack/types';
import { getStackSchemaName, getSnapshotSchemaName } from '../src/constants/naming';
import { Dict } from '@asianpersonn/dict-utils/dist/types';

const TEST_NAME: string = 'SaveStackTest';
const TEST_DIRECTORY: string = `__tests__/${TEST_NAME}`;
const META_REALM_PATH1: string = `${TEST_DIRECTORY}/MetaRealm1.path`;
const META_REALM_PATH2: string = `${TEST_DIRECTORY}/MetaRealm2.path`;
const LOADABLE_REALM_PATH1: string = `LoadableRealm1.path`;
const LOADABLE_REALM_PATH2: string = `LoadableRealm2.path`;

const STACK_NAME1: string = 'TestStack1';
const STACK_NAME2: string = 'TestStack2';
const STACK_NAME3: string = 'TestStack3';
const STACK_NAME4: string = 'TestStack4';
const PROPERTIES1: Dict<any> = {
    'prop1': 'int',
    'prop2': 'string',
};
const PROPERTIES2: Dict<any> = {
    'prop3': 'int',
    'prop4': 'string',
};
const PROPERTIES3: Dict<any> = {
    'prop5': 'int',
    'prop6': 'string',
};
const PROPERTIES4: Dict<any> = {
    'prop7': 'int',
    'prop8': 'string',
};

describe('createRealmStack', () => {
    beforeAll(() => {
        if (fs.existsSync(TEST_DIRECTORY)) fs.rmSync(TEST_DIRECTORY, { recursive: true });

        fs.mkdirSync(TEST_DIRECTORY);
    });

    it('Should save Stack1 Node and Edge Schemas to the LoadableRealm1 LoadableSchemas table', async () => {
        const realmStack: RealmStack = await createRealmStack({
            metaRealmPath: META_REALM_PATH1,
            loadableRealmPath: LOADABLE_REALM_PATH1,
            stackName: STACK_NAME1,
            snapshotProperties: PROPERTIES1,
        });

        const snapshotSchemaName: string = getSnapshotSchemaName(STACK_NAME1);
        const stackSchemaName: string = getStackSchemaName(STACK_NAME1);
        const schemaNames: string[] = MetaRealm.getSchemaNames(META_REALM_PATH1, LOADABLE_REALM_PATH1);

        expect(schemaNames.sort()).toEqual([ snapshotSchemaName, stackSchemaName ].sort());
        expect(realmStack.getPropertyNames().sort()).toEqual(Object.keys(PROPERTIES1).sort());
        expect(realmStack.getProperties()).toEqual(PROPERTIES1);
    });

    it('Should load the LoadableRealm with Stack1 schemas', async () => {
        const loadableRealm: Realm = await MetaRealm.LoadableRealmManager.loadRealm({ metaRealmPath: META_REALM_PATH1, loadableRealmPath: LOADABLE_REALM_PATH1 });

        const snapshotSchemaName: string = getSnapshotSchemaName(STACK_NAME1);
        const stackSchemaName: string = getStackSchemaName(STACK_NAME1);
        
        const loadedSchemaNames: string[] = loadableRealm.schema.map((schema) => schema.name);
        expect(loadedSchemaNames.sort()).toEqual([ snapshotSchemaName, stackSchemaName ].sort());
    });

    it('Should save Stack2 to LoadableRealm1 without affecting Stack1', async () => {
        // STACK 1 and 2
        const realmStack: RealmStack = await createRealmStack({
            metaRealmPath: META_REALM_PATH1,
            loadableRealmPath: LOADABLE_REALM_PATH1,
            stackName: STACK_NAME2,
            snapshotProperties: PROPERTIES2,
        });

        const snapshotSchemaName1: string = getSnapshotSchemaName(STACK_NAME1);
        const stackSchemaName1: string = getStackSchemaName(STACK_NAME1);
        const snapshotSchemaName2: string = getSnapshotSchemaName(STACK_NAME2);
        const stackSchemaName2: string = getStackSchemaName(STACK_NAME2);
        const schemaNames: string[] = MetaRealm.getSchemaNames(META_REALM_PATH1, LOADABLE_REALM_PATH1);

        expect(schemaNames.sort()).toEqual([ snapshotSchemaName1, stackSchemaName1, snapshotSchemaName2, stackSchemaName2 ].sort());
        expect(realmStack.getPropertyNames().sort()).toEqual(Object.keys(PROPERTIES2).sort());
        expect(realmStack.getProperties()).toEqual(PROPERTIES2);
    });

    it('Should load LoadableRealm1 with Stack1 AND Stack2 schemas', async () => {
        // STACK 1 and 2
        const loadableRealm: Realm = await MetaRealm.LoadableRealmManager.loadRealm({ metaRealmPath: META_REALM_PATH1, loadableRealmPath: LOADABLE_REALM_PATH1 });

        const snapshotSchemaName1: string = getSnapshotSchemaName(STACK_NAME1);
        const stackSchemaName1: string = getStackSchemaName(STACK_NAME1);
        const snapshotSchemaName2: string = getSnapshotSchemaName(STACK_NAME2);
        const stackSchemaName2: string = getStackSchemaName(STACK_NAME2);
        
        const loadedSchemaNames: string[] = loadableRealm.schema.map((schema) => schema.name);
        expect(loadedSchemaNames.sort()).toEqual([ snapshotSchemaName1, stackSchemaName1, snapshotSchemaName2, stackSchemaName2 ].sort());
    });

    it('Should save Stack3 to MetaRealm1.LoadableRealm2 without affecting Stack1 or Stack2', async () => {
        // STACK 3
        const realmStack3: RealmStack = await createRealmStack({
            metaRealmPath: META_REALM_PATH1,
            loadableRealmPath: LOADABLE_REALM_PATH2,
            stackName: STACK_NAME3,
            snapshotProperties: PROPERTIES3,
        });

        const snapshotSchemaName3: string = getSnapshotSchemaName(STACK_NAME3);
        const stackSchemaName3: string = getStackSchemaName(STACK_NAME3);
        const schemaNames3: string[] = MetaRealm.getSchemaNames(META_REALM_PATH1, LOADABLE_REALM_PATH2);

        expect(schemaNames3.sort()).toEqual([ snapshotSchemaName3, stackSchemaName3 ].sort());
        expect(realmStack3.getPropertyNames().sort()).toEqual(Object.keys(PROPERTIES3).sort());
        expect(realmStack3.getProperties()).toEqual(PROPERTIES3);

        // STACK 1 and 2
        const snapshotSchemaName1: string = getSnapshotSchemaName(STACK_NAME1);
        const stackSchemaName1: string = getStackSchemaName(STACK_NAME1);
        const snapshotSchemaName2: string = getSnapshotSchemaName(STACK_NAME2);
        const stackSchemaName2: string = getStackSchemaName(STACK_NAME2);
        const schemaNames1: string[] = MetaRealm.getSchemaNames(META_REALM_PATH1, LOADABLE_REALM_PATH1);

        expect(schemaNames1.sort()).toEqual([ snapshotSchemaName1, stackSchemaName1, snapshotSchemaName2, stackSchemaName2 ].sort());
    });

    it('Should load LoadableRealm2 with Stack3 schemas without affecting Stack 1 or 2', async () => {
        // STACK 3
        const loadableRealm3: Realm = await MetaRealm.LoadableRealmManager.loadRealm({ metaRealmPath: META_REALM_PATH1, loadableRealmPath: LOADABLE_REALM_PATH2 });

        const snapshotSchemaName3: string = getSnapshotSchemaName(STACK_NAME3);
        const stackSchemaName3: string = getStackSchemaName(STACK_NAME3);
        
        const loadedSchemaNames2: string[] = loadableRealm3.schema.map((schema) => schema.name);
        expect(loadedSchemaNames2.sort()).toEqual([ snapshotSchemaName3, stackSchemaName3 ].sort());

        // STACK 1 and 2
        const loadableRealm1: Realm = await MetaRealm.LoadableRealmManager.loadRealm({ metaRealmPath: META_REALM_PATH1, loadableRealmPath: LOADABLE_REALM_PATH1 });

        const snapshotSchemaName1: string = getSnapshotSchemaName(STACK_NAME1);
        const stackSchemaName1: string = getStackSchemaName(STACK_NAME1);
        const snapshotSchemaName2: string = getSnapshotSchemaName(STACK_NAME2);
        const stackSchemaName2: string = getStackSchemaName(STACK_NAME2);
        
        const loadedSchemaNames1: string[] = loadableRealm1.schema.map((schema) => schema.name);
        expect(loadedSchemaNames1.sort()).toEqual([ snapshotSchemaName1, stackSchemaName1, snapshotSchemaName2, stackSchemaName2 ].sort());
    });

    it('Should save Stack4 to MetaRealm2.LoadableRealm1 without affecting Stack 1-3', async () => {
        // STACK 4
        const realmStack4: RealmStack = await createRealmStack({
            metaRealmPath: META_REALM_PATH2,
            loadableRealmPath: LOADABLE_REALM_PATH1,
            stackName: STACK_NAME4,
            snapshotProperties: PROPERTIES4,
        });

        const snapshotSchemaName4: string = getSnapshotSchemaName(STACK_NAME4);
        const stackSchemaName4: string = getStackSchemaName(STACK_NAME4);
        const schemaNames4: string[] = MetaRealm.getSchemaNames(META_REALM_PATH2, LOADABLE_REALM_PATH1);

        expect(schemaNames4.sort()).toEqual([ snapshotSchemaName4, stackSchemaName4 ].sort());
        expect(realmStack4.getPropertyNames().sort()).toEqual(Object.keys(PROPERTIES4).sort());
        expect(realmStack4.getProperties()).toEqual(PROPERTIES4);

        // STACK 3
        const snapshotSchemaName3: string = getSnapshotSchemaName(STACK_NAME3);
        const stackSchemaName3: string = getStackSchemaName(STACK_NAME3);
        const schemaNames3: string[] = MetaRealm.getSchemaNames(META_REALM_PATH1, LOADABLE_REALM_PATH2);

        expect(schemaNames3.sort()).toEqual([ snapshotSchemaName3, stackSchemaName3 ].sort());

        // STACK 1 and 2
        const snapshotSchemaName1: string = getSnapshotSchemaName(STACK_NAME1);
        const stackSchemaName1: string = getStackSchemaName(STACK_NAME1);
        const snapshotSchemaName2: string = getSnapshotSchemaName(STACK_NAME2);
        const stackSchemaName2: string = getStackSchemaName(STACK_NAME2);
        const schemaNames1: string[] = MetaRealm.getSchemaNames(META_REALM_PATH1, LOADABLE_REALM_PATH1);

        expect(schemaNames1.sort()).toEqual([ snapshotSchemaName1, stackSchemaName1, snapshotSchemaName2, stackSchemaName2 ].sort());
    });

    it('Should load MetaRealm2.LoadableRealm1 with Stack3 schemas without affecting Stack 1-3', async () => {
        // STACK 4
        const loadableRealm4: Realm = await MetaRealm.LoadableRealmManager.loadRealm({ metaRealmPath: META_REALM_PATH2, loadableRealmPath: LOADABLE_REALM_PATH1 });

        const snapshotSchemaName4: string = getSnapshotSchemaName(STACK_NAME4);
        const stackSchemaName4: string = getStackSchemaName(STACK_NAME4);
        
        const loadedSchemaNames4: string[] = loadableRealm4.schema.map((schema) => schema.name);
        expect(loadedSchemaNames4.sort()).toEqual([ snapshotSchemaName4, stackSchemaName4 ].sort());

        // STACK 3
        const loadableRealm3: Realm = await MetaRealm.LoadableRealmManager.loadRealm({ metaRealmPath: META_REALM_PATH1, loadableRealmPath: LOADABLE_REALM_PATH2 });

        const snapshotSchemaName3: string = getSnapshotSchemaName(STACK_NAME3);
        const stackSchemaName3: string = getStackSchemaName(STACK_NAME3);
        
        const loadedSchemaNames2: string[] = loadableRealm3.schema.map((schema) => schema.name);
        expect(loadedSchemaNames2.sort()).toEqual([ snapshotSchemaName3, stackSchemaName3 ].sort());

        // STACK 1 and 2
        const loadableRealm1: Realm = await MetaRealm.LoadableRealmManager.loadRealm({ metaRealmPath: META_REALM_PATH1, loadableRealmPath: LOADABLE_REALM_PATH1 });

        const snapshotSchemaName1: string = getSnapshotSchemaName(STACK_NAME1);
        const stackSchemaName1: string = getStackSchemaName(STACK_NAME1);
        const snapshotSchemaName2: string = getSnapshotSchemaName(STACK_NAME2);
        const stackSchemaName2: string = getStackSchemaName(STACK_NAME2);
        
        const loadedSchemaNames1: string[] = loadableRealm1.schema.map((schema) => schema.name);
        expect(loadedSchemaNames1.sort()).toEqual([ snapshotSchemaName1, stackSchemaName1, snapshotSchemaName2, stackSchemaName2 ].sort());
    });

    afterAll(async () => {
        await MetaRealm.MetaRealmManager.closeAll();
        await MetaRealm.LoadableRealmManager.closeAll();

        if (fs.existsSync(TEST_DIRECTORY)) fs.rmSync(TEST_DIRECTORY, { recursive: true });
    });      
});
