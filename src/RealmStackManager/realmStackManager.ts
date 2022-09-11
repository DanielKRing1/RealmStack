import { Dict } from '@asianpersonn/dict-utils/dist/types';
import MetaRealm from '@asianpersonn/metarealm';
import { getBaseNameFromSchemaName } from '../constants/naming';

import { createRealmStack, loadRealmStack } from "../RealmStack/realmStack";
import { RealmStack, RSCreateParams } from "../RealmStack/types";
import { gen_NO_STACK_ERROR } from './errors';
import { RealmStackManager } from './types';

const createStackManager = (): RealmStackManager => {
    const realmStackMap: Dict<RealmStack> = {};
    
    const getStack = (stackName: string): RealmStack | never => {
        if(!hasRealmStack(stackName)) throw gen_NO_STACK_ERROR(stackName);
        
        return realmStackMap[stackName];
    }
    
    const createStack = async ({ metaRealmPath, loadableRealmPath, stackName, snapshotProperties }: RSCreateParams) => {
        // 1. Create new RealmStack if not exists
        if(!hasRealmStack(stackName)) {
            const realmStack: RealmStack = await createRealmStack({
                metaRealmPath,
                loadableRealmPath,
                stackName,
                snapshotProperties,
            });
            realmStackMap[stackName] = realmStack;
        }

        return realmStackMap[stackName];
    }
    const rmStack = async (stackName: string) => {
        // 1. Try to delete RealmStack schemas
        if(hasRealmStack(stackName)) {
            const realmStack: RealmStack = realmStackMap[stackName];
            await realmStack.deleteStack();
        }

        // 2. Remove RealmGraph from map if present
        delete realmStackMap[stackName];
    }

    const hasRealmStack = (stackName: string): boolean => !!realmStackMap[stackName];

    const loadStacks = async (metaRealmPath: string, loadableRealmPath: string) => {
      // 1. Get all Loadable graph names
      const stackNames: string[] = getLoadableStackNames(metaRealmPath, loadableRealmPath);

      for(let stackName of stackNames) {
          // 2. Setup RealmGraph, It will read its properties from its LoadableRealm schemas
          const realmStack: RealmStack = await loadRealmStack({
              metaRealmPath,
              loadableRealmPath,
              stackName,
              shouldReloadRealm: false,
          });

          // 3. Add to realmStackMap
          realmStackMap[stackName] = realmStack;
      }

      // 4. Reload realms after loading all RealmStacks
      await MetaRealm.LoadableRealmManager.reloadRealm({ metaRealmPath, loadableRealmPath });

      return stackNames.length;
    }

    const getLoadableStackNames = (metaRealmPath: string, loadableRealmPath: string): string[] => {
        const stackNames: Set<string> = new Set<string>();

        // 1. Get all schema names
        const allSchemaNames: string[] = MetaRealm.getSchemaNames(metaRealmPath, loadableRealmPath);

        // 2. Remove schema name suffix and add to set
        // (A single Graph creates more than 1 schema; when stripped of their suffixes, they will have identical names)
        allSchemaNames.forEach((schemaName) => {
            // 2.1. Remove suffix
            const stackName: string = getBaseNameFromSchemaName(schemaName);

            // 2.2. Add to set
            stackNames.add(stackName);
        });

        return Array.from(stackNames);
    }

    const getAllLoadedStackNames = () => Object.keys(realmStackMap);
    const getAllLoadedStacks = () => Object.values(realmStackMap);

    return {
        getStack,
        createStack,
        rmStack,
        loadStacks,

        getLoadableStackNames,
        getAllLoadedStackNames,
        getAllLoadedStacks,
    }
}

export default createStackManager();
