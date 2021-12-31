import StackRealmCache, { CreateStackParams } from '../stackRealmCache';

export const createStack = (args: CreateStackParams): Promise<Realm> => {
    return StackRealmCache.createStack(args);
}
