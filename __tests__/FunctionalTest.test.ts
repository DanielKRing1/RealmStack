jest.mock('realm', () => require('@asianpersonn/realm-mock'));

import DictUtils from '@asianpersonn/dict-utils';
import RealmStack from '../src';

const TEST_META_REALM_PATH: string = 'TEST_META_REALM_PATH.path';

const stackRealmPath1: string = 'stack-realm1.path';
const stackName1: string = 'MyStack1';
const stackProperties1: Dict<any> = {
    name: 'string',
    age: 'int',
    note: 'string',
};

const stackRealmPath2: string = 'stack-realm2.path';
const stackName2: string = 'MyStack2';
const stackProperties2: Dict<any> = {
    birthday: 'date',
    address: 'string',
    hobbies: 'string[]',
};

const stackRealmPath3: string = 'stack-realm3.path';
const stackName3: string = 'MyStack3';
const stackProperties3: Dict<any> = {
    name: 'string',
    breed: 'string',
    weight: 'float',
};

const snapshot1: Dict<string> = DictUtils.mutateDict<string>(stackProperties1, (key: string, value: any) => 'dummy value 1');
const snapshot2: Dict<string> = DictUtils.mutateDict<string>(stackProperties2, (key: string, value: any) => 'dummy value 2');
const snapshot3: Dict<string> = DictUtils.mutateDict<string>(stackProperties3, (key: string, value: any) => 'dummy value 3');
let searchDate1: Date[] = [];
let searchDate2: Date[] = [];
let searchDate3: Date[] = [];

describe('RealmStack', () => {
    it('Should be able to create a stack', async () => {
        await RealmStack.createStack({
            metaRealmPath: TEST_META_REALM_PATH,
            stackRealmPath: stackRealmPath1,
            stackName: stackName1,
            snapshotProperties: stackProperties1,
        });

        await RealmStack.createStack({
            metaRealmPath: TEST_META_REALM_PATH,
            stackRealmPath: stackRealmPath2,
            stackName: stackName2,
            snapshotProperties: stackProperties2,
        });

        await RealmStack.createStack({
            metaRealmPath: TEST_META_REALM_PATH,
            stackRealmPath: stackRealmPath3,
            stackName: stackName3,
            snapshotProperties: stackProperties3,
        });
    });

    it('Should be able to modify its stacks', async () => {
        // Push 3 sets of 3 snapshots onto stacks

        // 1. Push set 1
        searchDate1.push(new Date());
        RealmStack.pushOntoStack({ stackName: stackName1 }, snapshot1, snapshot2, snapshot3);
        searchDate2.push(new Date());
        RealmStack.pushOntoStack({ stackName: stackName2 }, snapshot1, snapshot2, snapshot3);
        searchDate3.push(new Date());
        RealmStack.pushOntoStack({ stackName: stackName3 }, snapshot1, snapshot2, snapshot3);

        await new Promise<void>((resolve, reject) => {
           setTimeout(() => resolve(), 200) ;
        });

        // 2. Push set 2
        searchDate1.push(new Date());
        RealmStack.pushOntoStack({ stackName: stackName1 }, snapshot1, snapshot2, snapshot3);
        searchDate2.push(new Date());
        RealmStack.pushOntoStack({ stackName: stackName2 }, snapshot1, snapshot2, snapshot3);
        searchDate3.push(new Date());
        RealmStack.pushOntoStack({ stackName: stackName3 }, snapshot1, snapshot2, snapshot3);

        await new Promise<void>((resolve, reject) => {
            setTimeout(() => resolve(), 200) ;
        });
 
        // 3. Push set 3
        searchDate1.push(new Date());
        RealmStack.pushOntoStack({ stackName: stackName1 }, snapshot1, snapshot2, snapshot3);
        searchDate2.push(new Date());
        RealmStack.pushOntoStack({ stackName: stackName2 }, snapshot1, snapshot2, snapshot3);
        searchDate3.push(new Date());
        RealmStack.pushOntoStack({ stackName: stackName3 }, snapshot1, snapshot2, snapshot3);
    });

    it('Should be able to read its stacks', async () => {
        expect(RealmStack.getStackNames(TEST_META_REALM_PATH)).toEqual([ stackName1, stackName2, stackName3 ]);

        expect(RealmStack.getStackProperties(TEST_META_REALM_PATH, stackName1)).toEqual({ ...stackProperties1, timestamp: 'date' });
        expect(RealmStack.getStackProperties(TEST_META_REALM_PATH, stackName2)).toEqual({ ...stackProperties2, timestamp: 'date' });
        expect(RealmStack.getStackProperties(TEST_META_REALM_PATH, stackName3)).toEqual({ ...stackProperties3, timestamp: 'date' });

        const expectedList1: Dict<string | Date>[] = [
            { ...snapshot1, timestamp: searchDate1[2] },
            { ...snapshot2, timestamp: searchDate1[2] },
            { ...snapshot3, timestamp: searchDate1[2] },
            { ...snapshot1, timestamp: searchDate1[1] },
            { ...snapshot2, timestamp: searchDate1[1] },
            { ...snapshot3, timestamp: searchDate1[1] },
            { ...snapshot1, timestamp: searchDate1[0] },
            { ...snapshot2, timestamp: searchDate1[0] },
            { ...snapshot3, timestamp: searchDate1[0] },
        ];
        const expectedList2: Dict<string | Date>[] = [
            { ...snapshot1, timestamp: searchDate2[2] },
            { ...snapshot2, timestamp: searchDate2[2] },
            { ...snapshot3, timestamp: searchDate2[2] },
            { ...snapshot1, timestamp: searchDate2[1] },
            { ...snapshot2, timestamp: searchDate2[1] },
            { ...snapshot3, timestamp: searchDate2[1] },
            { ...snapshot1, timestamp: searchDate2[0] },
            { ...snapshot2, timestamp: searchDate2[0] },
            { ...snapshot3, timestamp: searchDate2[0] },
        ];
        const expectedList3: Dict<string | Date>[] = [
            { ...snapshot1, timestamp: searchDate3[2] },
            { ...snapshot2, timestamp: searchDate3[2] },
            { ...snapshot3, timestamp: searchDate3[2] },
            { ...snapshot1, timestamp: searchDate3[1] },
            { ...snapshot2, timestamp: searchDate3[1] },
            { ...snapshot3, timestamp: searchDate3[1] },
            { ...snapshot1, timestamp: searchDate3[0] },
            { ...snapshot2, timestamp: searchDate3[0] },
            { ...snapshot3, timestamp: searchDate3[0] },
        ];
        expect(RealmStack.getStack(stackName1).list).toEqual(expectedList1);
        expect(RealmStack.getStack(stackName2).list).toEqual(expectedList2);
        expect(RealmStack.getStack(stackName3).list).toEqual(expectedList3);
    });

    it('Should be able to search its stacks', async () => {
        expect(RealmStack.getClosestDate(stackName1, searchDate1[0])).toBe(8);
        expect(RealmStack.getClosestDate(stackName2, searchDate2[0])).toBe(8);
        expect(RealmStack.getClosestDate(stackName2, searchDate2[0])).toBe(8);

        expect(RealmStack.getClosestDate(stackName1, searchDate1[1])).toBe(5);
        expect(RealmStack.getClosestDate(stackName2, searchDate2[1])).toBe(5);
        expect(RealmStack.getClosestDate(stackName3, searchDate2[1])).toBe(5);

        expect(RealmStack.getClosestDate(stackName1, searchDate1[2])).toBe(2);
        expect(RealmStack.getClosestDate(stackName2, searchDate2[2])).toBe(2);
        expect(RealmStack.getClosestDate(stackName3, searchDate3[2])).toBe(2);
    });

    it('Should be expose its open stack realms', async () => {
        // console.log(RealmStack.realmCache);
    });
});
