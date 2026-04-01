export const NODE_ENV_VALUES = ['development', 'test', 'staging', 'production'] as const;

export type NodeEnv = (typeof NODE_ENV_VALUES)[number];
