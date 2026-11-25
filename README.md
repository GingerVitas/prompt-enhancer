# Prompt Enhancer

A Claude Code mod that turns a rough draft prompt into a stronger one before you send it.

**Prompt Enhancer** adds an **Enhance** button above the prompt box. Type a rough draft, press Enhance, and the draft is rewritten in place. Nothing is sent: you review the rewrite, edit it if you like, and press Enter as usual.

The rewrite keeps your intent and organizes it under short headings:

- **Task**: the request, stated precisely.
- **Skills**: any of your installed skills that fit the task, by name.
- **Project context**: relevant facts about the current project (path, repo, conventions from CLAUDE.md, recent work). It only uses facts it has and never invents them.
- **Decisions to ask me first**: the key choices Claude should confirm with you before starting.
- **Done looks like**: what the finished result should be and how it will be checked.

Once the session has had its first turn, the rewrite runs against the session's own context, so it sees your skills with their descriptions, CLAUDE.md, git status and the conversation so far. On the very first prompt of a session it falls back to the project path, the repo, CLAUDE.md and your skill names.

If you edit the draft while a rewrite is running, your edit is kept and the rewrite is dropped.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install prompt-enhancer --marketplace GingerVitas/prompt-enhancer
```

Answer `y` to add the marketplace, then pick a scope (user scope loads it in every session).

From a shell:

```bash
claude plugin install prompt-enhancer --marketplace GingerVitas/prompt-enhancer
```

In the Claude Code desktop app, where `/plugin` does not run: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `GingerVitas/prompt-enhancer`, then **Add plugin**.

## Use

Click **Enhance**, or use its hotkey: press `Ctrl+X` then `Tab` to move focus to the button row above the prompt, then `E`. A mod's hotkey cannot fire while you are typing in the prompt box itself.

Each rewrite is one model call and counts toward the session's cost.

## License

MIT, see [LICENSE](LICENSE).
