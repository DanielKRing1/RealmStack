import fs from 'fs';

import MetaRealm from '@asianpersonn/metarealm';
import { createRealmStack } from '../src/RealmStack/realmStack';
import { RealmStack } from '../src/RealmStack/types';
import realmStackManager from '../src/RealmStackManager/realmStackManager';
import { Dict } from '@asianpersonn/dict-utils/dist/types';

const TEST_NAME: string = 'PushTest';
const TEST_DIRECTORY: string = `__tests__/${TEST_NAME}`;
const META_REALM_PATH1: string = `${TEST_DIRECTORY}/MetaRealm1.path`;
const LOADABLE_REALM_PATH1: string = `LoadableRealm1.path`;

const STACK_NAME1: string = 'TestStack1';
const STACK_NAME2: string = 'TestStack2';

const PROPERTIES1: Dict<any> = {
    'prop1': 'int',
    'prop2': 'string',
};
const PROPERTIES2: Dict<any> = {
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

        await realmStackManager.loadStacks(META_REALM_PATH1, LOADABLE_REALM_PATH1);
    });

    it('Should throw an error for a non-existant RealmStack name', async () => {
        const NONEXISTANT_STACK_NAME: string = 'DUMMY_STACK_NAME';
        expect(() => realmStackManager.getStack(NONEXISTANT_STACK_NAME)).toThrowError();
    });

    it('Should push onto Stack1', async () => {
        const stack: RealmStack = realmStackManager.getStack(STACK_NAME1);

        await stack.push({ timestamp: new Date(Date.parse('9/1/2022')) }, { 'prop1': 0, 'prop2': 'Hello' });
        await stack.push({ timestamp: new Date(Date.parse('9/2/2022')) }, { 'prop1': 0, 'prop2': 'World' });

        await stack.push({ timestamp: new Date(Date.parse('9/3/2022')) }, { 'prop1': 1, 'prop2': 'Hello2' });
        await stack.push({ timestamp: new Date(Date.parse('9/4/2022')) }, { 'prop1': 1, 'prop2': 'World2' });

        await stack.push({ timestamp: new Date(Date.parse('9/5/2022')) }, { 'prop1': 2, 'prop2': 'Hello3' });
        await stack.push({ timestamp: new Date(Date.parse('9/6/2022')) }, { 'prop1': 3, 'prop2': 'World3' });

        await stack.push({ timestamp: new Date(Date.parse('9/7/2022')) }, { 'prop1': 4, 'prop2': 'Hello4' });
        await stack.push({ timestamp: new Date(Date.parse('9/8/2022')) }, { 'prop1': 5, 'prop2': 'World4' });
    });

    it('Should push onto Stack2', async () => {
        const stack: RealmStack = realmStackManager.getStack(STACK_NAME2);

        await stack.push({ timestamp: new Date(Date.parse('9/1/2022')) }, { 'prop3': 0, 'prop4': new Date(Date.parse('9/10/2022')) });
        await stack.push({ timestamp: new Date(Date.parse('9/2/2022')) }, { 'prop3': 0, 'prop4': new Date(Date.parse('9/10/2022')) });

        await stack.push({ timestamp: new Date(Date.parse('9/3/2022')) }, { 'prop3': 1, 'prop4': new Date(Date.parse('9/10/2022')) });
        await stack.push({ timestamp: new Date(Date.parse('9/4/2022')) }, { 'prop3': 1, 'prop4': new Date(Date.parse('9/10/2022')) });

        await stack.push({ timestamp: new Date(Date.parse('9/5/2022')) }, { 'prop3': 2, 'prop4': new Date(Date.parse('9/10/2022')) });
        await stack.push({ timestamp: new Date(Date.parse('9/6/2022')) }, { 'prop3': 3, 'prop4': new Date(Date.parse('9/10/2022')) });

        await stack.push({ timestamp: new Date(Date.parse('9/7/2022')) }, { 'prop3': 4, 'prop4': new Date(Date.parse('9/10/2022')) });
        await stack.push({ timestamp: new Date(Date.parse('9/8/2022')) }, { 'prop3': 5, 'prop4': new Date(Date.parse('9/10/2022')) });
    });

    it('Should get lists from Stacks 1-2', async () => {
        // Stack1
        const stack1: RealmStack = realmStackManager.getStack(STACK_NAME1);

        expect((await stack1.getAllSnapshots()).toJSON()).toMatchSnapshot();
        expect((await stack1.getListJSON())).toMatchSnapshot();

        // Stack2
        const stack2: RealmStack = realmStackManager.getStack(STACK_NAME2);

        expect((await stack2.getAllSnapshots()).toJSON()).toMatchSnapshot();
        expect((await stack2.getListJSON())).toMatchSnapshot();
    });

    afterAll(async () => {
        await MetaRealm.MetaRealmManager.closeAll();
        await MetaRealm.LoadableRealmManager.closeAll();

        if (fs.existsSync(TEST_DIRECTORY)) fs.rmSync(TEST_DIRECTORY, { recursive: true });
    });
});
