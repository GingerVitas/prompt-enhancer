declare module 'claude-code' {
  interface PluginState {
    'prompt-enhancer': { isBusy: IsBusy }
  }
}
export type IsBusy = boolean
