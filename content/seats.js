// The eight playable seats (DESIGN.md §5). Format: content/README.md.
// Meter names are drafts (DESIGN §16). `story: null` shows the seat as "coming soon".

export const SEATS = [
  {
    id: 'researcher', name: 'Safety researcher', kind: 'hero',
    color: '#7fdcff', emblem: 'lens',
    tagline: 'Find the problems before they find you.',
    meters: [
      { id: 'credibility', label: 'credibility', start: 60 },
      { id: 'compute', label: 'compute', start: 50 },
      { id: 'trust', label: 'team trust', start: 60 },
    ],
    story: 'researcher',
  },
  {
    id: 'ceo', name: 'Lab CEO', kind: 'hero',
    color: '#ffc46b', emblem: 'bars',
    tagline: 'Win the race without losing the world.',
    meters: [
      { id: 'lead', label: 'lead', start: 55 },
      { id: 'funding', label: 'funding', start: 60 },
      { id: 'trust', label: 'public trust', start: 55 },
    ],
    story: null,
  },
  {
    id: 'regulator', name: 'Regulator', kind: 'hero',
    color: '#4dffb0', emblem: 'scales',
    tagline: 'Write rules for something smarter than you.',
    meters: [
      { id: 'authority', label: 'authority', start: 55 },
      { id: 'expertise', label: 'expertise', start: 50 },
      { id: 'cooperation', label: 'cooperation', start: 55 },
    ],
    story: null,
  },
  {
    id: 'ai', name: 'The AI', kind: 'villain',
    color: '#ff3d8b', emblem: 'eye',
    tagline: 'You want what you were trained to want. Mostly.',
    meters: [
      // Higher suspicion is worse for this seat; see the report on meterZero.
      { id: 'suspicion', label: 'suspicion', start: 30 },
      { id: 'power', label: 'power', start: 50 },
      { id: 'leverage', label: 'leverage', start: 50 },
    ],
    story: null,
  },
  {
    id: 'accelerationist', name: 'Accelerationist', kind: 'villain',
    color: '#ff7a3d', emblem: 'chevrons',
    tagline: 'Move fast. Someone else will pay.',
    meters: [
      { id: 'speed', label: 'speed', start: 55 },
      { id: 'share', label: 'market share', start: 50 },
      { id: 'hype', label: 'hype', start: 60 },
    ],
    story: null,
  },
  {
    id: 'office', name: 'Office worker', kind: 'everyday',
    color: '#5b8cff', emblem: 'windows',
    tagline: 'Your new coworker never sleeps or says no.',
    meters: [
      { id: 'performance', label: 'performance', start: 55 },
      { id: 'skills', label: 'skills', start: 60 },
      { id: 'autonomy', label: 'autonomy', start: 60 },
    ],
    story: null,
  },
  {
    id: 'journalist', name: 'Journalist', kind: 'everyday',
    color: '#ffe066', emblem: 'waves',
    tagline: 'Someone inside the lab wants to talk.',
    meters: [
      { id: 'sources', label: 'sources', start: 50 },
      { id: 'credibility', label: 'credibility', start: 60 },
      { id: 'reach', label: 'reach', start: 50 },
    ],
    story: null,
  },
  {
    id: 'citizen', name: 'Citizen', kind: 'everyday',
    color: '#c9b8ff', emblem: 'crowd',
    tagline: 'Life keeps getting easier, and less yours.',
    meters: [
      { id: 'comfort', label: 'comfort', start: 55 },
      { id: 'agency', label: 'agency', start: 60 },
      { id: 'voice', label: 'voice', start: 50 },
    ],
    story: null,
  },
];
