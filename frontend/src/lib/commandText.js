// The server sends plain text like "Simon says: double-click BLUE".
// This file turns that text into themed pieces, e.g.
//   { commander: "Mummy says", verb: "double-grab", pad: { label: "CHAI", emoji: "☕" } }
// The backend never changes - only how the command LOOKS changes.

const COMMAND_RE = /^(Simon says: )?(click|double-click|hold) (RED|BLUE|GREEN|YELLOW)$/i;
const VERB_KEYS = { click: 'click', 'double-click': 'double', hold: 'hold' };

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Splits a server command into parts the UI can style. */
export function describeCommand(text, theme) {
  if (/DON'T click/i.test(text)) {
    return { commander: theme.commander, verb: "DON'T touch anything!", padKey: null, pad: null };
  }
  const m = text.match(COMMAND_RE);
  if (!m) return { raw: text }; // unknown format: just show the text as-is

  const hasCommander = Boolean(m[1]);
  const verb = theme.verbs[VERB_KEYS[m[2].toLowerCase()]];
  const padKey = m[3].toLowerCase();
  return {
    commander: hasCommander ? theme.commander : null,
    verb: hasCommander ? verb : capitalize(verb),
    padKey,
    pad: theme.pads[padKey],
  };
}

/** The whole command as one plain sentence (for screen readers and examples). */
export function commandSentence(text, theme) {
  const d = describeCommand(text, theme);
  if (d.raw) return d.raw;
  const target = d.pad ? ` ${d.pad.label}` : '';
  return `${d.commander ? `${d.commander}: ` : ''}${d.verb}${target}`;
}

/** Picks a random feedback message and fills in {commander}. */
export function pickMessage(theme, key) {
  const list = theme.messages[key] ?? theme.messages.ok;
  const msg = list[Math.floor(Math.random() * list.length)];
  return msg.replaceAll('{commander}', theme.commander);
}
