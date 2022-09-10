import fs from 'fs';

import MetaRealm from '@asianpersonn/metarealm';
import { createRealmStack } from '../src/RealmStack/realmStack';
import { RealmStack } from '../src/RealmStack/types';
import realmStackManager from '../src/RealmStackManager/realmStackManager';
import { Dict } from '@asianpersonn/dict-utils/dist/types';

const TEST_NAME: string = 'SearchTest';
const TEST_DIRECTORY: string = `__tests__/${TEST_NAME}`;
const META_REALM_PATH1: string = `${TEST_DIRECTORY}/MetaRealm1.path`;
const LOADABLE_REALM_PATH1: string = `LoadableRealm1.path`;

const STACK_NAME1: string = 'TestStack1';
const STACK_NAME2: string = 'TestStack2';
const STACK_NAME3: string = 'TestStack3';

const PROPERTIES1: Dict<any> = {
    'prop1': 'int',
    'prop2': 'string',
};
const PROPERTIES2: Dict<any> = {
    'prop3': 'int',
    'prop4': 'date',
};
const PROPERTIES3: Dict<any> = {
    'prop3': 'int',
    'prop4': 'date',
};

describe('RealmStackManager', () => {
    beforeAll(() => {
        if (fs.existsSync(TEST_DIRECTORY)) fs.rmSync(TEST_DIRECTORY, { recursive: true });

        fs.mkdirSync(TEST_DIRECTORY);
    });

    it('Should load all stacks in same realm', async () => {
        await createRealmStack({
            metaRealmPath: META_REALM_PATH1,
            loadableRealmPath: LOADABLE_REALM_PATH1,
            stackName: STACK_NAME1,
            snapshotProperties: PROPERTIES1,
        });
        await createRealmStack({
            metaRealmPath: META_REALM_PATH1,
            loadableRealmPath: LOADABLE_REALM_PATH1,
            stackName: STACK_NAME2,
            snapshotProperties: PROPERTIES2,
        });
        await createRealmStack({
            metaRealmPath: META_REALM_PATH1,
            loadableRealmPath: LOADABLE_REALM_PATH1,
            stackName: STACK_NAME3,
            snapshotProperties: PROPERTIES3,
        });

        await realmStackManager.loadStacks(META_REALM_PATH1, LOADABLE_REALM_PATH1);
    });

    it('Should push onto Stack1', async () => {
        const stack: RealmStack = realmStackManager.getStack(STACK_NAME1);
        
        await stack.push({timestamp: new Date(Date.parse("6/6/2022"))}, { 'prop1': 6, 'prop2': 'Hello4' });
        await stack.push({timestamp: new Date(Date.parse("6/7/2022"))}, { 'prop1': 4, 'prop2': 'Hello4' });
        await stack.push({timestamp: new Date(Date.parse("6/9/2022"))}, { 'prop1': 5, 'prop2': 'World4' });

        await stack.push({timestamp: new Date(Date.parse("7/7/2022"))}, { 'prop1': 2, 'prop2': 'Hello3' });
        await stack.push({timestamp: new Date(Date.parse("7/9/2022"))}, { 'prop1': 3, 'prop2': 'World3' });

        await stack.push({timestamp: new Date(Date.parse("8/7/2022"))}, { 'prop1': 1, 'prop2': 'Hello2' });
        await stack.push({timestamp: new Date(Date.parse("8/9/2022"))}, { 'prop1': 1, 'prop2': 'World2' });

        await stack.push({timestamp: new Date(Date.parse("9/7/2022"))}, { 'prop1': 0, 'prop2': 'Hello' });
        await stack.push({timestamp: new Date(Date.parse("9/9/2022"))}, { 'prop1': 0, 'prop2': 'World' });
    });

    it('Should push onto Stack2', async () => {
        const stack: RealmStack = realmStackManager.getStack(STACK_NAME2);

        await stack.push({timestamp: new Date(Date.parse("6/6/2022"))}, { 'prop3': 6, 'prop4': new Date(Date.parse('9/10/2022')) });
        await stack.push({timestamp: new Date(Date.parse("6/7/2022"))}, { 'prop3': 4, 'prop4': new Date(Date.parse('9/10/2022')) });
        await stack.push({timestamp: new Date(Date.parse("6/9/2022"))}, { 'prop3': 5, 'prop4': new Date(Date.parse('9/10/2022')) });

        await stack.push({timestamp: new Date(Date.parse("7/7/2022"))}, { 'prop3': 2, 'prop4': new Date(Date.parse('9/10/2022')) });
        await stack.push({timestamp: new Date(Date.parse("7/9/2022"))}, { 'prop3': 3, 'prop4': new Date(Date.parse('9/10/2022')) });
        
        await stack.push({timestamp: new Date(Date.parse("8/7/2022"))}, { 'prop3': 1, 'prop4': new Date(Date.parse('9/10/2022')) });
        await stack.push({timestamp: new Date(Date.parse("8/9/2022"))}, { 'prop3': 1, 'prop4': new Date(Date.parse('9/10/2022')) });
        
        await stack.push({timestamp: new Date(Date.parse("9/7/2022"))}, { 'prop3': 0, 'prop4': new Date(Date.parse('9/10/2022')) });
        await stack.push({timestamp: new Date(Date.parse("9/9/2022"))}, { 'prop3': 0, 'prop4': new Date(Date.parse('9/10/2022')) });
    });

    it('Should get and search lists of Stacks 1-2', async () => {
        // Stack1
        const stack1: RealmStack = realmStackManager.getStack(STACK_NAME1);

        expect((await stack1.getClosestDate(new Date(Date.parse("9/8/2021"))))).toEqual(8);
        expect((await stack1.getClosestDate(new Date(Date.parse("5/8/2022"))))).toEqual(8);
        expect((await stack1.getClosestDate(new Date(Date.parse("6/7/2022"))))).toEqual(7);
        expect((await stack1.getClosestDate(new Date(Date.parse("6/18/2022"))))).toEqual(6);

        expect((await stack1.getClosestDate(new Date(Date.parse("9/7/2022"))))).toEqual(1);
        expect((await stack1.getClosestDate(new Date(Date.parse("9/8/2022"))))).toEqual(1);
        expect((await stack1.getClosestDate(new Date(Date.parse("9/9/2022"))))).toEqual(0);
        expect((await stack1.getClosestDate(new Date(Date.parse("9/9/2022"))))).toEqual(0);
        expect((await stack1.getClosestDate(new Date(Date.parse("9/10/2022"))))).toEqual(0);

        // Stack2
        const stack2: RealmStack = realmStackManager.getStack(STACK_NAME2);



        expect((await stack2.getClosestDate(new Date(Date.parse("5/8/2022"))))).toEqual(8);
        expect((await stack2.getClosestDate(new Date(Date.parse("6/7/2022"))))).toEqual(7);
        expect((await stack2.getClosestDate(new Date(Date.parse("6/18/2022"))))).toEqual(6);

        expect((await stack2.getClosestDate(new Date(Date.parse("9/7/2022"))))).toEqual(1);
        expect((await stack2.getClosestDate(new Date(Date.parse("9/8/2022"))))).toEqual(1);
        expect((await stack2.getClosestDate(new Date(Date.parse("9/9/2022"))))).toEqual(0);
        expect((await stack2.getClosestDate(new Date(Date.parse("9/9/2022"))))).toEqual(0);
        expect((await stack2.getClosestDate(new Date(Date.parse("9/10/2022"))))).toEqual(0);
    });

    it('Should get and search empty list of Stack 3', async () => {
        // Stack3
        const stack3: RealmStack = realmStackManager.getStack(STACK_NAME3);

        expect((await stack3.getClosestDate(new Date(Date.parse("9/8/2021"))))).toEqual(-1);
        expect((await stack3.getClosestDate(new Date(Date.parse("5/8/2022"))))).toEqual(-1);
        expect((await stack3.getClosestDate(new Date(Date.parse("6/7/2022"))))).toEqual(-1);
        expect((await stack3.getClosestDate(new Date(Date.parse("6/18/2022"))))).toEqual(-1);

        expect((await stack3.getClosestDate(new Date(Date.parse("9/7/2022"))))).toEqual(-1);
        expect((await stack3.getClosestDate(new Date(Date.parse("9/8/2022"))))).toEqual(-1);
        expect((await stack3.getClosestDate(new Date(Date.parse("9/9/2022"))))).toEqual(-1);
        expect((await stack3.getClosestDate(new Date(Date.parse("9/9/2022"))))).toEqual(-1);
        expect((await stack3.getClosestDate(new Date(Date.parse("9/10/2022"))))).toEqual(-1);
    });

    afterAll(async () => {
        await MetaRealm.MetaRealmManager.closeAll();
        await MetaRealm.LoadableRealmManager.closeAll();

        if (fs.existsSync(TEST_DIRECTORY)) fs.rmSync(TEST_DIRECTORY, { recursive: true });
    });
});
