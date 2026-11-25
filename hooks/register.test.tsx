import { expect, test } from 'claude-code/testing'
import type { ModelForkResult } from 'claude-code'

const BAND = {
  plugin: 'prompt-enhancer',
  surface: 'desktop',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isCollapsed: false,
    isWorking: false,
    maxRows: 3,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 3 },
    view: {},
  },
} as const

test('Enhance replaces the draft with the rewrite and sends nothing', async ($, on) => {
  let box = 'add dark mode'
  const submitted: string[] = []
  let asked = ''
  on('prompt.read', () => ({ value: { text: box, cursor: box.length } }))
  on('prompt.fill', (_, e) => {
    box = e.text
    return { isFilled: true, text: e.text, cursor: e.text.length }
  })
  on('prompt.submit', (_, e) => {
    submitted.push(e.text)
    return { drop: 'test' }
  })
  on('model.fork', (_, e) => {
    asked = e.prompt
    return { value: { isAnswered: true, text: '  Task: add dark mode\n' } as ModelForkResult }
  })

  const ui = await $.ui.mount(BAND)
  await ui.press({ key: 'enhance' })

  expect(asked).toContain('<draft>\nadd dark mode\n</draft>')
  expect(box).toBe('Task: add dark mode')
  expect(submitted).toEqual([])
  await ui.unmount()
})
