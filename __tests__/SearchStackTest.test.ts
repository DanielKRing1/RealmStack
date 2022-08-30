// jest.mock('realm', () => require('@asianpersonn/realm-mock'));

import { getStack, getStackNames, getClosestDate } from '../src/stackMethods';
import stackRealmCache from '../src/stackRealmCache';
import StackRealmCache from '../src/stackRealmCache';

const TEST_META_REALM_PATH: string = 'TEST_META_REALM_PATH.path';

const realmStackPath1: string = 'Realm1.path';
const realm1StackName1: string = 'Realm1Stack1';
const realm1Stack1Props: Dict<string> = {
    prop1: 'string',
    prop2: 'int',
};

describe('Binary Search method', () => {
    it('Should save 1 stack', async () => {
        await StackRealmCache.createStack({
            metaRealmPath: TEST_META_REALM_PATH,
            stackRealmPath: realmStackPath1,
            stackName: realm1StackName1,
            snapshotProperties: realm1Stack1Props,
        });

        const expectedStackNames: string[] = [ realm1StackName1 ];
        expect(getStackNames(TEST_META_REALM_PATH, realmStackPath1)).toEqual(expectedStackNames);
        expect(stackRealmCache.getStackRealm(realm1StackName1)).toBeDefined();

        expect(getStack(realm1StackName1)).toBeDefined();
    });

    // it('Should return -1 when searching an empty stack', async () => {
    //     const expectedDateIndex: number = -1;
    //     expect(getClosestDate(realm1StackName1, new Date())).toEqual(expectedDateIndex);
    // });
});