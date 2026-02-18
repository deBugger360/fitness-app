export * from './types';
export * from './recommendations';
export * from './reality';
export * from './analytics';
export * from './plan-logic';
export const SHARED_CONSTANT = "shared_v1";

export function sharedFunction() {
    return "Hello from shared package";
}
