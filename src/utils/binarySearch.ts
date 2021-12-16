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

    // 1. Not found
    if(closestIndex == -1) return -1;

    // 2. Found, and need to confirm 'closest' is 'actual'
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
 export function binarySearchClosest<T>(searchValue: any, list: T[], comparator: (midValue: T, seachValue: any) => number, startIndex: number = 0, stopIndex: number = list.length - 1): number {
    // 1. Invalid input list
    if (list.length <= 0) return -1;
    
    // 2. Last element left to search
    if (startIndex === stopIndex) return startIndex;

    // 3. Pivot point
    const midIndex = Math.floor((startIndex + stopIndex) / 2);
    // 4. Search direction
    const comparisonResult: number = comparator(list[midIndex], searchValue);
    // Left
    if(comparisonResult < 0) {
        // Last 2 elements to search, choose left
        // (Bcus mid point of last 2 elements is always 1, so will favor right element and ignore left element)
        const newStop: number = stopIndex - startIndex === 1 ? startIndex : midIndex;
        return binarySearchClosest(searchValue, list, comparator, startIndex, newStop);
    }
    // Right
    else if(comparisonResult > 0) {
        // Last 2 elements to search, choose right
        const newStart: number = stopIndex - startIndex === 1 ? stopIndex : midIndex;
        return binarySearchClosest(searchValue, list, comparator, newStart, stopIndex);
    }
    // Found
    else return midIndex;
}
