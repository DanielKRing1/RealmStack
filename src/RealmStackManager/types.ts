import { RealmStack, RSCreateParams } from "../RealmStack/types";

export type RealmStackManager = {
    getStack: (stackName: string) => RealmStack | undefined;
    createStack: (params: RSCreateParams) => Promise<RealmStack>;
    rmStack: (stackName: string) => void;
    loadStacks: (metaRealmPAth: string, loadableRealmPath: string) => Promise<number>;

    getLoadableStackNames: (metaRealmPath: string, loadableRealmPath: string) => string[];
    getAllLoadedStackNames: () => string[];
    getAllLoadedStacks: () => RealmStack[];
};
