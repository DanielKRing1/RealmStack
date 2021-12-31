import { getStackNames } from '../src/stackMethods';
import stackRealmCache from '../src/stackRealmCache';
import StackRealmCache from '../src/stackRealmCache';

const DYNAMIC_REALM_PATH: string = 'DYNAMIC_REALM_PATH.path';

const realmStackPath1: string = 'Realm1.path';
const realm1StackName1: string = 'Realm1Stack1';
const realm1Stack1Props: Dict<string> = {
    prop1: 'string',
    prop2: 'int',
};
const realm1StackName2: string = 'Realm1Stack2';
const realm1Stack2Props: Dict<string> = {
    prop2: 'float',
    prop3: 'double',
};
const realm1StackName3: string = 'Realm1Stack3';
const realm1Stack3Props: Dict<string> = {
    prop4: 'bool',
    prop5: 'date',
};

const realmStackPath2: string = 'Realm2.path';
const realm2StackName1: string = 'Realm2Stack1';
const realm2Stack1Props: Dict<string> = {
    prop6: 'string[]',
    prop7: 'int[]',
};
const realm2StackName2: string = 'Realm2Stack2';
const realm2Stack2Props: Dict<string> = {
    prop8: 'float[]',
    prop9: 'double[]',
};

const realmStackPath3: string = 'Realm3.path';
const realm3StackName1: string = 'Realm3Stack1';
const realm3Stack1Props: Dict<string> = {
    prop10: 'date[]',
    prop11: 'bool[]',
};
const realm3StackName2: string = 'Realm3Stack2';
const realm3Stack2Props: Dict<string> = {
    prop12: 'string',
    prop13: 'float',
};

describe('StackRealmCache', () => {
    it('Should add 1 to many stacks to a single realm', () => {
        StackRealmCache.createStack({
            dynamicRealmPath: DYNAMIC_REALM_PATH,
            stackRealmPath: realmStackPath1,
            stackName: realm1StackName1,
            snapshotProperties: realm1Stack1Props,
        });
        StackRealmCache.createStack({
            dynamicRealmPath: DYNAMIC_REALM_PATH,
            stackRealmPath: realmStackPath1,
            stackName: realm1StackName2,
            snapshotProperties: realm1Stack2Props,
        });
        StackRealmCache.createStack({
            dynamicRealmPath: DYNAMIC_REALM_PATH,
            stackRealmPath: realmStackPath1,
            stackName: realm1StackName3,
            snapshotProperties: realm1Stack3Props,
        });

        const expectedStackNames: string[] = [ realm1StackName1, realm1StackName2, realm1StackName3 ];
        expect(getStackNames(realmStackPath1)).toEqual(expectedStackNames);

    expect(getStackNames(realmStackPath2)).toEqual([]);
    expect(getStackNames(realmStackPath3)).toEqual([]);
    });

    it('Should add stacks to 1 to many realms', () => {
        StackRealmCache.createStack({
            dynamicRealmPath: DYNAMIC_REALM_PATH,
            stackRealmPath: realmStackPath2,
            stackName: realm2StackName1,
            snapshotProperties: realm2Stack1Props,
        });
        StackRealmCache.createStack({
            dynamicRealmPath: DYNAMIC_REALM_PATH,
            stackRealmPath: realmStackPath2,
            stackName: realm2StackName2,
            snapshotProperties: realm2Stack2Props,
        });
        StackRealmCache.createStack({
            dynamicRealmPath: DYNAMIC_REALM_PATH,
            stackRealmPath: realmStackPath3,
            stackName: realm3StackName1,
            snapshotProperties: realm3Stack1Props,
        });
        StackRealmCache.createStack({
            dynamicRealmPath: DYNAMIC_REALM_PATH,
            stackRealmPath: realmStackPath3,
            stackName: realm3StackName2,
            snapshotProperties: realm3Stack2Props,
        });
        
        const expectedStackNames1: string[] = [ realm1StackName1, realm1StackName2, realm1StackName3 ];
        expect(getStackNames(realmStackPath1)).toEqual(expectedStackNames1);
        
        const expectedStackNames2: string[] = [ realm2StackName1, realm2StackName2 ];
        expect(getStackNames(realmStackPath2)).toEqual(expectedStackNames2);
        
        const expectedStackNames3: string[] = [ realm3StackName1, realm3StackName2 ];
        expect(getStackNames(realmStackPath3)).toEqual(expectedStackNames3);
    });

    it('Should still have access to all stack names, even after a manual reset', () => {
        // RESET StackRealmCache
        stackRealmCache._stackCache = {};
        stackRealmCache._realmCache = {};

        const expectedStackNames1: string[] = [ realm1StackName1, realm1StackName2, realm1StackName3 ];
        const expectedStackNames2: string[] = [ ...expectedStackNames1, realm2StackName1, realm2StackName2 ];
        const expectedStackNames3: string[] = [ ...expectedStackNames2, realm3StackName1, realm3StackName2 ];

        // 1. Should still have all stack names
        expect(getStackNames(realmStackPath1)).toEqual(expectedStackNames3);

    });

    it('Should expose all stack names', () => {
        const allStackNames: string[] = [
            'Realm1Stack1',
            'Realm1Stack2',
            'Realm1Stack3',
            'Realm2Stack1',
            'Realm2Stack2',
            'Realm3Stack1',
            'Realm3Stack2'
        ];
        expect(getStackNames()).toEqual(allStackNames);
    });
    
    it('Should expose all stack names', () => {
        const realm1StackNames: string[] = [
            'Realm1Stack1',
            'Realm1Stack2',
            'Realm1Stack3',
        ];
        const realm2StackNames: string[] = [
            'Realm2Stack1',
            'Realm2Stack2',
        ];
        const realm3StackNames: string[] = [
            'Realm3Stack1',
            'Realm3Stack2',
        ];
        expect(getStackNames(realmStackPath1)).toEqual(realm1StackNames);
        expect(getStackNames(realmStackPath2)).toEqual(realm2StackNames);
        expect(getStackNames(realmStackPath3)).toEqual(realm3StackNames);
    });

    it('Should load stack realm 1 and not stack realms 2 or 3', async () => {
        // REALM PATH 1
        await StackRealmCache.loadStacks(realmStackPath1);
        
        // Expectations
        const expectedStackNames: string[] = [ realm1StackName1, realm1StackName2, realm1StackName3 ];

        expect(StackRealmCache.getLoadedStackNames()).toEqual(expectedStackNames);
    });

    it('Should load stack realms 2 and 3, one at a time', async () => {
        // REALM PATH 2
        await StackRealmCache.loadStacks(realmStackPath2);

        console.log(StackRealmCache.getLoadedStackNames());

        const expectedStackNames1: string[] = [ realm1StackName1, realm1StackName2, realm1StackName3, realm2StackName1, realm2StackName2 ];
        expect(StackRealmCache.getLoadedStackNames()).toEqual(expectedStackNames1);

        // REALM PATH 3
        await StackRealmCache.loadStacks(realmStackPath3);

        console.log(StackRealmCache.getLoadedStackNames());

        const expectedStackNames2: string[] = [ ...expectedStackNames1, realm3StackName1, realm3StackName2 ];
        expect(getStackNames(realmStackPath1)).toEqual(expectedStackNames2);
    });
});