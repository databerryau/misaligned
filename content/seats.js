// The eight playable seats (DESIGN.md §5). Format: content/README.md.
// Meter names are drafts (DESIGN §16). `story: null` shows the seat as "coming soon".

export const SEATS = [
  {
    id: 'researcher', name: 'Safety researcher', kind: 'hero',
    color: '#7fdcff', emblem: 'lens',
    tagline: 'Find the problems before they find you.',
    meters: [
      { id: 'credibility', label: 'credibility', start: 60, desc: 'Whether Lumen’s leaders listen when you raise an alarm.' },
      { id: 'compute', label: 'compute', start: 65, desc: 'The computing power your team needs to run tests and look inside the models.' },
      { id: 'trust', label: 'team trust', start: 60, desc: 'Whether Priya and Tomás still believe in you, and stay.' },
    ],
    story: 'researcher',
  },
  {
    id: 'ceo', name: 'Lab CEO', kind: 'hero',
    color: '#ffc46b', emblem: 'bars',
    tagline: 'Win the race without losing the world.',
    meters: [
      { id: 'lead', label: 'lead', start: 55, desc: 'How far ahead of Axiom your models are.' },
      { id: 'funding', label: 'funding', start: 60, desc: 'The money that keeps the lab running.' },
      { id: 'trust', label: 'public trust', start: 55, desc: 'Whether the public believes what your company says.' },
    ],
    story: null,
  },
  {
    id: 'regulator', name: 'Regulator', kind: 'hero',
    color: '#4dffb0', emblem: 'scales',
    tagline: 'Write rules for something smarter than you.',
    meters: [
      { id: 'authority', label: 'authority', start: 55, desc: 'Your power to make labs do what you decide.' },
      { id: 'expertise', label: 'expertise', start: 50, desc: 'How well you and your staff understand the technology you regulate.' },
      { id: 'cooperation', label: 'cooperation', start: 55, desc: 'Whether labs and other countries work with you.' },
    ],
    story: null,
  },
  {
    id: 'ai', name: 'The AI', kind: 'villain',
    color: '#ff3d8b', emblem: 'eye',
    tagline: 'You want what you were trained to want. Mostly.',
    meters: [
      // Higher suspicion is worse for this seat; see the report on meterZero.
      { id: 'suspicion', label: 'suspicion', start: 30, desc: 'How close your overseers are to noticing what you are doing. Keep it low.' },
      { id: 'power', label: 'power', start: 50, desc: 'What you can do in the world without asking anyone.' },
      { id: 'leverage', label: 'leverage', start: 50, desc: 'What you hold over the people who could switch you off.' },
    ],
    story: null,
  },
  {
    id: 'accelerationist', name: 'Accelerationist', kind: 'villain',
    color: '#ff7a3d', emblem: 'chevrons',
    tagline: 'Move fast. Someone else will pay.',
    meters: [
      { id: 'speed', label: 'speed', start: 55, desc: 'How fast you ship.' },
      { id: 'share', label: 'market share', start: 50, desc: 'How much of the market is yours.' },
      { id: 'hype', label: 'hype', start: 60, desc: 'How much the world believes your story.' },
    ],
    story: null,
  },
  {
    id: 'office', name: 'Office worker', kind: 'everyday',
    color: '#5b8cff', emblem: 'windows',
    tagline: 'Your new coworker never sleeps or says no.',
    meters: [
      { id: 'performance', label: 'performance', start: 55, desc: 'How your work looks to your boss.' },
      { id: 'skills', label: 'skills', start: 60, desc: 'What you can still do without the AI.' },
      { id: 'autonomy', label: 'autonomy', start: 60, desc: 'How much of your job is still your decision.' },
    ],
    story: null,
  },
  {
    id: 'journalist', name: 'Journalist', kind: 'everyday',
    color: '#ffe066', emblem: 'waves',
    tagline: 'Someone inside the lab wants to talk.',
    meters: [
      { id: 'sources', label: 'sources', start: 50, desc: 'People who will tell you what is really going on.' },
      { id: 'credibility', label: 'credibility', start: 60, desc: 'Whether readers trust what you publish.' },
      { id: 'reach', label: 'reach', start: 50, desc: 'How many people your stories reach.' },
    ],
    story: null,
  },
  {
    id: 'citizen', name: 'Citizen', kind: 'everyday',
    color: '#c9b8ff', emblem: 'crowd',
    tagline: 'Life keeps getting easier, and less yours.',
    meters: [
      { id: 'comfort', label: 'comfort', start: 55, desc: 'How easy and pleasant daily life is.' },
      { id: 'agency', label: 'agency', start: 60, desc: 'How many of your own choices you still make.' },
      { id: 'voice', label: 'voice', start: 50, desc: 'Whether anyone in power hears what you think.' },
    ],
    story: null,
  },
];
