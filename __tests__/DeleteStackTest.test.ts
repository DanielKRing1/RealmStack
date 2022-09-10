import fs from 'fs';

import MetaRealm from '@asianpersonn/metarealm';
import { createRealmStack, loadRealmStack } from '../src/RealmStack/realmStack';

import { RealmStack } from '../src/RealmStack/types';
import { Dict } from '@asianpersonn/dict-utils/dist/types';
import { getSnapshotSchemaName, getStackSchemaName } from '../src/constants/naming';

const TEST_NAME: string = 'DeleteStackTest';
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

    it('Should save Stacks 1-4 and then close them', async () => {
        // STACK 1
        const realmStack1: RealmStack = await createRealmStack({
            metaRealmPath: META_REALM_PATH1,
            loadableRealmPath: LOADABLE_REALM_PATH1,
            stackName: STACK_NAME1,
            snapshotProperties: PROPERTIES1,
        });
        // STACK 2
        const realmStack2: RealmStack = await createRealmStack({
            metaRealmPath: META_REALM_PATH1,
            loadableRealmPath: LOADABLE_REALM_PATH1,
            stackName: STACK_NAME2,
            snapshotProperties: PROPERTIES2,
        });
        // STACK 3
        const realmStack3: RealmStack = await createRealmStack({
            metaRealmPath: META_REALM_PATH1,
            loadableRealmPath: LOADABLE_REALM_PATH2,
            stackName: STACK_NAME3,
            snapshotProperties: PROPERTIES3,
        });
        // STACK 4
        const realmStack4: RealmStack = await createRealmStack({
            metaRealmPath: META_REALM_PATH2,
            loadableRealmPath: LOADABLE_REALM_PATH1,
            stackName: STACK_NAME4,
            snapshotProperties: PROPERTIES4,
        });

        MetaRealm.LoadableRealmManager.closeAll();
        MetaRealm.MetaRealmManager.closeAll();
    });

    it('Should load Stack1', async () => {
        const loadedRealmStack: RealmStack = await loadRealmStack({ metaRealmPath: META_REALM_PATH1, loadableRealmPath: LOADABLE_REALM_PATH1, stackName: STACK_NAME1, shouldReloadRealm: false });
        
        const snapshotSchemaName1: string = getSnapshotSchemaName(STACK_NAME1);
        const stackSchemaName1: string = getStackSchemaName(STACK_NAME1);
        const snapshotSchemaName2: string = getSnapshotSchemaName(STACK_NAME2);
        const stackSchemaName2: string = getStackSchemaName(STACK_NAME2);
        let schemaNames1: string[] = MetaRealm.getSchemaNames(META_REALM_PATH1, LOADABLE_REALM_PATH1);
        expect(schemaNames1.sort()).toEqual([ snapshotSchemaName1, stackSchemaName1, snapshotSchemaName2, stackSchemaName2 ].sort());

        let loadableRealm1: Realm = await MetaRealm.LoadableRealmManager.loadRealm({ metaRealmPath: META_REALM_PATH1, loadableRealmPath: LOADABLE_REALM_PATH1 });
        let loadedSchemaNames1: string[] = loadableRealm1.schema.map((schema) => schema.name);
        expect(loadedSchemaNames1.sort()).toEqual([ snapshotSchemaName1, stackSchemaName1, snapshotSchemaName2, stackSchemaName2 ].sort());

        // DELETE STACK1
        await loadedRealmStack.deleteStack();

        schemaNames1 = MetaRealm.getSchemaNames(META_REALM_PATH1, LOADABLE_REALM_PATH1);
        expect(schemaNames1.sort()).toEqual([ snapshotSchemaName2, stackSchemaName2 ].sort());

        loadableRealm1 = await MetaRealm.LoadableRealmManager.reloadRealm({ metaRealmPath: META_REALM_PATH1, loadableRealmPath: LOADABLE_REALM_PATH1 });
        loadedSchemaNames1 = loadableRealm1.schema.map((schema) => schema.name);
        expect(loadedSchemaNames1.sort()).toEqual([ snapshotSchemaName2, stackSchemaName2 ].sort());
    });

    afterAll(async () => {
        await MetaRealm.MetaRealmManager.closeAll();
        await MetaRealm.LoadableRealmManager.closeAll();

        if (fs.existsSync(TEST_DIRECTORY)) fs.rmSync(TEST_DIRECTORY, { recursive: true });
    });      
});
