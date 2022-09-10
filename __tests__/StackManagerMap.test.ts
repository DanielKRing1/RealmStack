import fs from 'fs';

import MetaRealm from '@asianpersonn/metarealm';

import StackManager from '../src/RealmStackManager/realmStackManager';
import { RealmStack } from '../src/RealmStack/types';
import { getStackSchemaName, getSnapshotSchemaName } from '../src/constants/naming';
import { createRealmStack } from '../src/RealmStack/realmStack';
import { Dict } from '@asianpersonn/dict-utils/dist/types';

const TEST_NAME: string = 'StackManagerMapTest';
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

    it('Should have no stack names loaded but should be able to load 4 RealmStacks', async () => {
        expect(StackManager.getAllLoadedStackNames().sort()).toEqual([]);
        expect(StackManager.getLoadableStackNames(META_REALM_PATH1, LOADABLE_REALM_PATH1).sort()).toEqual([ STACK_NAME1, STACK_NAME2 ].sort())
        expect(StackManager.getLoadableStackNames(META_REALM_PATH1, LOADABLE_REALM_PATH2).sort()).toEqual([ STACK_NAME3 ].sort())
        expect(StackManager.getLoadableStackNames(META_REALM_PATH2, LOADABLE_REALM_PATH1).sort()).toEqual([ STACK_NAME4 ].sort())
        expect(StackManager.getLoadableStackNames(META_REALM_PATH2, LOADABLE_REALM_PATH2).sort()).toEqual([].sort())
    });

    it('Should load all 4 RealmStacks', async () => {
        await StackManager.loadStacks(META_REALM_PATH1, LOADABLE_REALM_PATH1);
        await StackManager.loadStacks(META_REALM_PATH1, LOADABLE_REALM_PATH2);
        await StackManager.loadStacks(META_REALM_PATH2, LOADABLE_REALM_PATH1);

        expect(StackManager.getAllLoadedStackNames().sort()).toEqual([ STACK_NAME1, STACK_NAME2, STACK_NAME3, STACK_NAME4 ].sort());
        expect(StackManager.getLoadableStackNames(META_REALM_PATH1, LOADABLE_REALM_PATH1).sort()).toEqual([ STACK_NAME1, STACK_NAME2 ].sort())
        expect(StackManager.getLoadableStackNames(META_REALM_PATH1, LOADABLE_REALM_PATH2).sort()).toEqual([ STACK_NAME3 ].sort())
        expect(StackManager.getLoadableStackNames(META_REALM_PATH2, LOADABLE_REALM_PATH1).sort()).toEqual([ STACK_NAME4 ].sort())
        expect(StackManager.getLoadableStackNames(META_REALM_PATH2, LOADABLE_REALM_PATH2).sort()).toEqual([].sort())
    });

    it('Should have 4 Stacks cached', async () => {
        expect(StackManager.getAllLoadedStacks().length).toEqual(4);
    });

    it('Should get each stack in map', async () => {
        // Verify that each RealmStack is in the map by checking their property names
        const stack1: RealmStack = StackManager.getStack(STACK_NAME1);
        const stack2: RealmStack = StackManager.getStack(STACK_NAME2);
        const stack3: RealmStack = StackManager.getStack(STACK_NAME3);
        const stack4: RealmStack = StackManager.getStack(STACK_NAME4);

        expect(stack1.getPropertyNames().sort()).toEqual(Object.keys(PROPERTIES1).sort());
        expect(stack1.getProperties()).toEqual(PROPERTIES1);
        expect(stack2.getPropertyNames().sort()).toEqual(Object.keys(PROPERTIES2).sort());
        expect(stack2.getProperties()).toEqual(PROPERTIES2);
        expect(stack3.getPropertyNames().sort()).toEqual(Object.keys(PROPERTIES3).sort());
        expect(stack3.getProperties()).toEqual(PROPERTIES3);
        expect(stack4.getPropertyNames().sort()).toEqual(Object.keys(PROPERTIES4).sort());
        expect(stack4.getProperties()).toEqual(PROPERTIES4);
    });

    
    it('Should remove Stack1', async () => {
        await StackManager.rmStack(STACK_NAME1);

        expect(StackManager.getAllLoadedStackNames().sort()).toEqual([ STACK_NAME2, STACK_NAME3, STACK_NAME4 ].sort());
        expect(StackManager.getLoadableStackNames(META_REALM_PATH1, LOADABLE_REALM_PATH1).sort()).toEqual([ STACK_NAME2 ].sort());
        expect(StackManager.getLoadableStackNames(META_REALM_PATH1, LOADABLE_REALM_PATH2).sort()).toEqual([ STACK_NAME3 ].sort());
        expect(StackManager.getLoadableStackNames(META_REALM_PATH2, LOADABLE_REALM_PATH1).sort()).toEqual([ STACK_NAME4 ].sort());
    });

    it('Should remove Stack2', async () => {
        await StackManager.rmStack(STACK_NAME2);

        expect(StackManager.getAllLoadedStackNames().sort()).toEqual([ STACK_NAME3, STACK_NAME4 ].sort());
        expect(StackManager.getLoadableStackNames(META_REALM_PATH1, LOADABLE_REALM_PATH1).sort()).toEqual([].sort());
        expect(StackManager.getLoadableStackNames(META_REALM_PATH1, LOADABLE_REALM_PATH2).sort()).toEqual([ STACK_NAME3 ].sort());
        expect(StackManager.getLoadableStackNames(META_REALM_PATH2, LOADABLE_REALM_PATH1).sort()).toEqual([ STACK_NAME4 ].sort());
    });

    it('Should remove Stack3', async () => {
        await StackManager.rmStack(STACK_NAME3);

        expect(StackManager.getAllLoadedStackNames().sort()).toEqual([ STACK_NAME4 ].sort());
        expect(StackManager.getLoadableStackNames(META_REALM_PATH1, LOADABLE_REALM_PATH1).sort()).toEqual([].sort());
        expect(StackManager.getLoadableStackNames(META_REALM_PATH1, LOADABLE_REALM_PATH2).sort()).toEqual([].sort());
        expect(StackManager.getLoadableStackNames(META_REALM_PATH2, LOADABLE_REALM_PATH1).sort()).toEqual([ STACK_NAME4 ].sort());
    });

    it('Should remove Stack4', async () => {
        await StackManager.rmStack(STACK_NAME4);

        expect(StackManager.getAllLoadedStackNames().sort()).toEqual([].sort());
        expect(StackManager.getLoadableStackNames(META_REALM_PATH1, LOADABLE_REALM_PATH1).sort()).toEqual([].sort());
        expect(StackManager.getLoadableStackNames(META_REALM_PATH1, LOADABLE_REALM_PATH2).sort()).toEqual([].sort());
        expect(StackManager.getLoadableStackNames(META_REALM_PATH2, LOADABLE_REALM_PATH1).sort()).toEqual([].sort());
    });

    it('Should have deleted all LoadableRealms and now close all Realms', async () => {
        expect(StackManager.getLoadableStackNames(META_REALM_PATH1, LOADABLE_REALM_PATH1).length).toEqual(0);
        expect(StackManager.getLoadableStackNames(META_REALM_PATH1, LOADABLE_REALM_PATH2).length).toEqual(0);
        expect(StackManager.getLoadableStackNames(META_REALM_PATH2, LOADABLE_REALM_PATH1).length).toEqual(0);
        expect(StackManager.getLoadableStackNames(META_REALM_PATH2, LOADABLE_REALM_PATH2).length).toEqual(0);

        MetaRealm.LoadableRealmManager.closeAll();
        MetaRealm.MetaRealmManager.closeAll();
    });

    afterAll(async () => {
        await MetaRealm.MetaRealmManager.closeAll();
        await MetaRealm.LoadableRealmManager.closeAll();

        if (fs.existsSync(TEST_DIRECTORY)) fs.rmSync(TEST_DIRECTORY, { recursive: true });
    });      
});
