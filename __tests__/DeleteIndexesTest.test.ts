import fs from 'fs';

import MetaRealm from '@asianpersonn/metarealm';
import RealmStackManager from '../src';

import { createRealmStack } from '../src/RealmStack/realmStack';
import { RealmStack } from '../src/RealmStack/types';
import realmStackManager from '../src/RealmStackManager/realmStackManager';
import { Dict } from '@asianpersonn/dict-utils/dist/types';

const TEST_NAME: string = 'DeleteIndexesTest';
const TEST_DIRECTORY: string = `__tests__/${TEST_NAME}`;
const META_REALM_PATH1: string = `${TEST_DIRECTORY}/MetaRealm1.path`;
const LOADABLE_REALM_PATH1: string = `LoadableRealm1.path`;

const STACK_NAME1: string = 'TestStack1';

const PROPERTIES1: Dict<any> = {
    'prop1': 'int',
    'prop2': 'string',
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

        await realmStackManager.loadStacks(META_REALM_PATH1, LOADABLE_REALM_PATH1);
    });

    it('Should throw an error for a non-existant RealmStack name', async () => {
        const NONEXISTANT_STACK_NAME: string = 'DUMMY_STACK_NAME';
        expect(() => realmStackManager.getStack(NONEXISTANT_STACK_NAME)).toThrowError();
    });

    it('Should push onto Stack1', async () => {
        const stack: RealmStack = realmStackManager.getStack(STACK_NAME1);

        // Index 0
        await stack.push({ timestamp: new Date(Date.parse('9/1/2022')) }, { 'prop1': 0, 'prop2': '0' });
        // Index 1
        await stack.push({ timestamp: new Date(Date.parse('9/2/2022')) }, { 'prop1': 1, 'prop2': '1' });

        // Index 2
        await stack.push({ timestamp: new Date(Date.parse('9/3/2022')) }, { 'prop1': 2, 'prop2': '2' });
        // Index 3
        await stack.push({ timestamp: new Date(Date.parse('9/4/2022')) }, { 'prop1': 3, 'prop2': '3' });

        // Index 4
        await stack.push({ timestamp: new Date(Date.parse('9/5/2022')) }, { 'prop1': 4, 'prop2': '4' });
        // Index 5
        await stack.push({ timestamp: new Date(Date.parse('9/6/2022')) }, { 'prop1': 5, 'prop2': '5' });
    });

    it('Should delete indexes 1 and 3 of the Stack list', async () => {
        const stack1: RealmStack = realmStackManager.getStack(STACK_NAME1);

        const actual = await stack1.getListJSON();
        await stack1.deleteIndexes([1, 3, 4]);
        const expected = await stack1.getListJSON();
        expect(expected.sort()).toEqual([ actual[0], actual[2], actual[5] ].sort());
    });

    it('Should delete index 1 and ignore index 3 of the Stack list', async () => {
        const stack1: RealmStack = realmStackManager.getStack(STACK_NAME1);

        const actual = await stack1.getListJSON();
        await stack1.deleteIndexes([1, 3]);
        const expected = await stack1.getListJSON();
        expect(expected.sort()).toEqual([ actual[0], actual[2] ].sort());
    });

    it('Should accept a single number and delete index 0 of the Stack list', async () => {
        const stack1: RealmStack = realmStackManager.getStack(STACK_NAME1);

        const actual = await stack1.getListJSON();
        await stack1.deleteIndexes(0);
        const expected = await stack1.getListJSON();
        expect(expected.sort()).toEqual([ actual[1] ].sort());
    });

    afterAll(async () => {
await RealmStackManager.closeAllStacks()

        if (fs.existsSync(TEST_DIRECTORY)) fs.rmSync(TEST_DIRECTORY, { recursive: true });
    });
});
