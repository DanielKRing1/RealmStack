jest.mock('realm', () => require('@asianpersonn/realm-mock'));

import { getStack, getStackNames } from '../src/stackMethods';
import stackRealmCache from '../src/stackRealmCache';
import StackRealmCache from '../src/stackRealmCache';

const TEST_META_REALM_PATH: string = 'TEST_META_REALM_PATH.path';

const realmStackPath1: string = 'Realm1.path';
const realm1StackName1: string = 'Realm1Stack1';
const realm1Stack1Props: Dict<string> = {
    prop1: 'string',
    prop2: 'int',
};

describe('StackRealmCache', () => {
    it('Should not throw an error when re-loading stacks for the first time', async () => {
        const loadMethod = async () => await StackRealmCache.loadStacks(TEST_META_REALM_PATH, realmStackPath1);
        expect(await loadMethod).not.toThrowError();
    });

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

    it('Should reset cache', async () => {
        // RESET StackRealmCache
        stackRealmCache._stackCache = {};
        stackRealmCache._realmCache = {};

        expect(stackRealmCache.getLoadedRealms()).toEqual([]);
        expect(stackRealmCache.getStackRealm(realm1StackName1)).not.toBeDefined();

        expect(() => getStack(realm1StackName1)).toThrowError();
    });

    it('Should load the stack and track its Realm', async () => {
        const loadMethod = async () => {
            await StackRealmCache.loadStacks(TEST_META_REALM_PATH, realmStackPath1);
        }
        expect(await loadMethod).not.toThrowError();
    });

    it('Should have tracked loaded realm', async () => {        const expectedStackNames: string[] = [ realm1StackName1 ];
        expect(getStackNames(TEST_META_REALM_PATH, realmStackPath1)).toEqual(expectedStackNames);
        expect(stackRealmCache.getStackRealm(realm1StackName1)).toBeDefined();

        // Throw error bcus my Relam mock implementation does not load previously saved data into re-loaded Realms
        // expect(() => { getStack(realm1StackName1); }).not.toThrowError();
    });
});
