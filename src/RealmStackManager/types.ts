import { RealmStack, RSCreateParams } from "../RealmStack/types";

export type RealmStackManager = {
    getStack: (stackName: string) => RealmStack | never;
    createStack: (params: RSCreateParams) => Promise<RealmStack>;
    rmStack: (stackName: string) => void;
    loadStacks: (metaRealmPAth: string, loadableRealmPath: string) => Promise<number>;
    closeAllStacks: () => Promise<void>;

    getLoadableStackNames: (metaRealmPath: string, loadableRealmPath: string) => string[];
    getAllLoadedStackNames: () => string[];
    getAllLoadedStacks: () => RealmStack[];
};
