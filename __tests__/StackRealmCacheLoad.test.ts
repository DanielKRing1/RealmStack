jest.mock('realm', () => require('@asianpersonn/realm-mock'));

import StackRealmCache from '../src/stackRealmCache';

const TEST_META_REALM_PATH: string = 'TEST_META_REALM_PATH.path';

const realmStackPath1: string = 'Realm1.path';

describe('StackRealmCache', () => {
    it('Should add 1 to many stacks to a single realm', async () => {
        const loadMethod = async () => await StackRealmCache.loadStacks(TEST_META_REALM_PATH, realmStackPath1);
        expect(await loadMethod).not.toThrowError();
    });
});