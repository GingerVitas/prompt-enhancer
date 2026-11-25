import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

const isBusy = atom({ plugin: 'prompt-enhancer', key: 'isBusy' } as const, false)

const INSTRUCTIONS = `Rewrite the draft prompt below into a stronger prompt for a coding agent. Keep the person's intent and voice; do not do the task.
The rewrite must contain, under short headings:
1. Task: the request, stated precisely.
2. Skills: any installed skills that fit the task, by exact name (e.g. /name). Omit the heading if none fit.
3. Project context: relevant details about the current project (path, repo, stack, conventions from CLAUDE.md, recent work). Only facts you actually have; never invent.
4. Decisions to ask me first: the key choices the agent should confirm with me before starting.
5. Done looks like: what the finished result should be and how it will be verified.
Reply with the rewritten prompt text only: no preamble, no code fence around it.`

export const register: Register = on => {
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    const { Box, Button } = $.ui.resolve(e)
    const busy = await read($, isBusy)
    return (
      <Box>
        <Button key="enhance" label={busy ? 'Enhancing…' : 'Enhance'} hotkey="e" variant="primary" onPress={() => enhance($)} />
      </Box>
    )
  })
}

async function enhance($: EngineInterface) {
  const { text: draft } = await $.prompt.read()
  if (!draft.trim()) return $.ui.toast('Type a draft first, then Enhance.')
  if (await read($, isBusy)) return
  await update($, isBusy, () => true)
  try {
    const ask = `${INSTRUCTIONS}\n\n<draft>\n${draft}\n</draft>`
    // fork reuses this session's own context: skill listing with descriptions, CLAUDE.md, git status, conversation
    let r = await $.model.fork({ prompt: ask, effort: 'low' })
    if (!r.isAnswered && r.reason === 'nothing-to-fork') {
      r = await $.model.complete({ model: await $.session.model(), prompt: `${await projectFacts($)}\n\n${ask}` })
    }
    if (!r.isAnswered) return $.ui.toast(`Enhance failed: ${r.reason}`)
    // don't clobber what the person typed while we waited
    if ((await $.prompt.read()).text !== draft) return $.ui.toast('Draft changed while enhancing; left it as is.')
    await $.prompt.fill({ text: r.text.trim(), mode: 'replace' })
  } finally {
    await update($, isBusy, () => false)
  }
}


// Used before the session's first turn, when there is no context to fork yet.
async function projectFacts($: EngineInterface): Promise<string> {
  const root: string = await $.session.root()
  const repo = await $.session.repo().catch(() => null)
  const usage = await $.session.usage({ breakdown: 'summary' }).catch(() => null)
  const skills: string[] = usage?.context.breakdown?.skills?.skillFrontmatter.map((s: { name: string }) => s.name) ?? []
  const claudeMd = (await $.fs.read(`${root}/CLAUDE.md`).catch(() => '')).slice(0, 8000)
  return [
    `<project root="${root}"${repo?.remote ? ` remote="${repo.remote}"` : ''}>`,
    claudeMd && `<claude-md>\n${claudeMd}\n</claude-md>`,
    `</project>`,
    `<installed-skills>${skills.join(', ') || 'unknown'}</installed-skills>`,
  ].filter(Boolean).join('\n')
}
