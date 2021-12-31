export const genDefaultStackRealmPath = (stackName: string): string => `${stackName}-stack.path`;

const REALM_STACK_MANAGER_NAME: string = 'REALM_STACK_MANAGER';
export const DEFAULT_REALM_STACK_MANAGER_REALM_PATH: string = genDefaultStackRealmPath(REALM_STACK_MANAGER_NAME);
