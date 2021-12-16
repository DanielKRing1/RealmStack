import { binarySearch, binarySearchClosest } from "../src/utils/binarySearch";


describe('Binary Search method', () => {
    const list: number[] = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ];
    const searchValue1: number = 4;
    const searchValue2: number = 4.5;
    const comparator = (midValue: number, searchValue: number): number => searchValue - midValue;

    it('Should correctly find items in an array', () => {
        const foundIndex1: number = binarySearch(searchValue1, list, comparator);
        console.log(foundIndex1);

        const foundIndex2: number = binarySearch(searchValue2, list, comparator);
        console.log(foundIndex2);

        const closestIndex1: number = binarySearchClosest(searchValue1, list, comparator);
        console.log(closestIndex1);
        
        const closestIndex2: number = binarySearchClosest(searchValue2, list, comparator);
        console.log(closestIndex2);
    });
});