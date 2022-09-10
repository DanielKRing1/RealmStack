/**
 * 
 * @param searchValue 
 * @param list 
 * @param comparator Return > 1 to search to the right, < 1 to search to the left, and 0 if the current element is the desired element
 * @param startIndex 
 * @param stopIndex 
 * @returns 
 */
export function binarySearch<T>(searchValue: any, list: T[], comparator: (midValue: T, seachValue: any) => number, startIndex: number = 0, stopIndex: number = list.length - 1): number {
    const closestIndex: number = binarySearchClosest(searchValue, list, comparator, startIndex, stopIndex);

    // 1. Found, and need to confirm 'closest' is 'actual'
    const closest: T = list[closestIndex];
    return comparator(closest, searchValue) == 0 ? closestIndex : -1;
}

/**
 * 
 * @param searchValue 
 * @param list 
 * @param comparator Return > 1 to search to the right, < 1 to search to the left, and 0 if the current element is the desired element
 * @param startIndex 
 * @param stopIndex 
 * @returns 
 */
 export function binarySearchClosest<T>(searchValue: any, list: T[], comparator: (midValue: T, seachValue: any) => number, l: number = 0, r: number = list.length - 1): number {

    while(l <= r) {
        const midIndex = Math.floor((l + r) / 2);
        const midValue = list[midIndex];

        const searchDirection = comparator(midValue, searchValue);
        if(searchDirection === 0) return midIndex;
        else if(searchDirection < 0) r = midIndex - 1;
        else l = midIndex + 1;
    }

    return l;
}
