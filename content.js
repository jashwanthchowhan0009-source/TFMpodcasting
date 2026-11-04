// ─────────────────────────────────────────────────────────────
//  Edit this file to update the site. No other file needs to change.
//  Anything marked "to be announced" is a placeholder — replace it with the real thing.
// ─────────────────────────────────────────────────────────────

export const links = {
  youtube: '',      // e.g. 'https://youtube.com/@thefoundermafia'
  spotify: '',      // e.g. 'https://open.spotify.com/show/...'
  instagram: '',    // e.g. 'https://instagram.com/thefoundermafia'
  linkedin: '',     // e.g. 'https://linkedin.com/company/thefoundermafia'
  whatsapp: '',     // community invite link
  trailer: '',      // YouTube link to the show trailer
  contactEmail: '', // shown on the site for guest pitches, e.g. 'hello@yourdomain.in'
};

// Is the guest pitch form open? Set to false to show "Applications closed".
export const applicationsOpen = true;

// "The road to Season 02" timeline on the home page.
export const season = {
  name: 'Season 02',
  steps: [
    { when: 'To be announced', what: 'Guest pitches open' },
    { when: 'To be announced', what: 'Shortlist announced' },
    { when: 'To be announced', what: 'Pre-calls with every shortlisted founder' },
    { when: 'To be announced', what: 'Recording week at the table' },
    { when: 'To be announced', what: 'Season 02 premieres' },
  ],
};

// "Who you sit with matters". The first entry is the host.
// Add mentors or recurring guests as more entries; empty names show as a reserved seat.
export const table = [
  { name: 'Aarav Phanindra', role: 'Host', note: 'Runs the table and asks the questions founders usually only hear off-mic.' },
  { name: '', role: 'Mentor seat', note: 'An operator who has built and scaled a company in India.' },
  { name: '', role: 'Investor seat', note: 'Someone who has written the cheques our guests talk about.' },
];

// Episode tracks. Each episode below names one of these keys.
export const tracks = {
  story: { suit: '♠', name: 'Story', sub: 'Brand & consumer', text: 'Founders building products, brands and stories for the Indian consumer.' },
  speed: { suit: '♥', name: 'Speed', sub: 'AI & technology', text: 'Builders using technology to decide faster and ship faster.' },
  spine: { suit: '♦', name: 'Spine', sub: 'Scale & operations', text: 'The unglamorous part: capital, hiring, operations and the systems that hold a company up.' },
};

// Newest first. Leave `url` empty to show "Coming soon".
export const episodes = [
  { number: 4, guest: 'To be announced', company: '—', title: 'Building a startup from a Tier-2 city', track: 'spine', url: '' },
  { number: 3, guest: 'To be announced', company: '—', title: 'When to kill a product you love', track: 'story', url: '' },
  { number: 2, guest: 'To be announced', company: '—', title: 'Hiring your first ten people', track: 'spine', url: '' },
  { number: 1, guest: 'To be announced', company: '—', title: 'The first cheque: how a seed round actually comes together', track: 'speed', url: '' },
];

// Community page.
export const meetups = [
  { when: 'Date to be announced', where: 'City to be announced', what: 'Live recording with an audience' },
  { when: 'Date to be announced', where: 'Online', what: 'Ask the guest: open Q&A after an episode drops' },
];

// Enter the Mafia page.
export const faqs = [
  { q: 'Who can pitch themselves as a guest?', a: 'Founders building in India at any stage, from pre-product to exit. What matters is a real story and lessons another founder can use.' },
  { q: 'Do I need a big brand or funding to be on the show?', a: 'No. Some of the most useful episodes come from bootstrapped founders and companies that did not work out.' },
  { q: 'Is the conversation scripted?', a: 'No. We do a short pre-call to find the moments worth an hour, but no questions are shared in advance.' },
  { q: 'Can I take something off the record after recording?', a: 'Yes. Nothing is off the record unless you say so, and you can say so after the recording too.' },
  { q: 'How long until I hear back?', a: 'We read every pitch. If we want to hear more, we reply with times for a pre-call.' },
  { q: 'Does it cost anything to be a guest?', a: 'No. There is no fee to appear on The Founder Mafia.' },
];

// Shown in the footer as "Last update".
export const lastUpdate = '5 Nov 2026';
