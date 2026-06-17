export type MessagePart =
  | { type: 'text'; content: string }
  | { type: 'emote'; id: string; name: string };

const EMOTE_TOKEN_REGEX = /\[emote:(\d+):([^\]]+)\]/g;

export function parseMessageContent(raw: string): MessagePart[] {
  const parts: MessagePart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  EMOTE_TOKEN_REGEX.lastIndex = 0;
  while ((match = EMOTE_TOKEN_REGEX.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: raw.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'emote', id: match[1], name: match[2] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < raw.length) {
    parts.push({ type: 'text', content: raw.slice(lastIndex) });
  }
  return parts;
}

export function emoteUrl(id: string): string {
  return `https://files.kick.com/emotes/${id}/fullsize`;
}

// Dev self-test — runs once at module load in development only
if (import.meta.env.DEV) {
  const run = () => {
    type Case = { input: string; expected: MessagePart[] };
    const cases: Case[] = [
      {
        input: '[emote:1:PogChamp] hello [emote:2:Kappa]',
        expected: [
          { type: 'emote', id: '1', name: 'PogChamp' },
          { type: 'text', content: ' hello ' },
          { type: 'emote', id: '2', name: 'Kappa' },
        ],
      },
      {
        // back-to-back with no text between
        input: '[emote:10:A][emote:11:B]',
        expected: [
          { type: 'emote', id: '10', name: 'A' },
          { type: 'emote', id: '11', name: 'B' },
        ],
      },
      {
        // token at very start and end
        input: '[emote:5:Start]mid[emote:6:End]',
        expected: [
          { type: 'emote', id: '5', name: 'Start' },
          { type: 'text', content: 'mid' },
          { type: 'emote', id: '6', name: 'End' },
        ],
      },
      {
        // plain text, no tokens
        input: 'just text',
        expected: [{ type: 'text', content: 'just text' }],
      },
      {
        // empty string
        input: '',
        expected: [],
      },
    ];

    let passed = 0;
    for (const { input, expected } of cases) {
      const result = parseMessageContent(input);
      const ok = JSON.stringify(result) === JSON.stringify(expected);
      if (!ok) {
        console.error('[parseMessageContent] FAIL', { input, expected, result });
      } else {
        passed++;
      }
    }
    if (passed === cases.length) {
      console.log(`[parseMessageContent] all ${passed} self-tests passed`);
    }
  };
  run();
}
