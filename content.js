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
  trailer: '',      // YouTube link to the show trailer (opens when the TV is clicked)
  trailerVideo: '', // intro video that loops inside the TV, e.g. 'media/intro.mp4' (MP4, muted, no audio needed)
  startupitch: 'https://startupitch.in', // Community page "Join" button
  contactEmail: '', // shown on the site for guest pitches, e.g. 'hello@yourdomain.in'
};

// Enter the Mafia: the pitch form sends people here to pay after they fill it in.
export const payment = {
  razorpayLink: '', // your Razorpay payment page / payment link, e.g. 'https://rzp.io/l/thefoundermafia'
  amount: '',       // shown in the note above the button, e.g. '₹4,999'. Leave empty to show "a one-time fee".
};

// Footer line on every page.
export const company = 'AV Venture House Pvt. Ltd.';

// Is the guest pitch form open? Set to false to show "Applications closed".
export const applicationsOpen = true;

// "The road to Season 01" timeline on the home page.
export const season = {
  name: 'Season 01',
  steps: [
    { when: 'To be announced', what: 'Guest pitches open' },
    { when: 'To be announced', what: 'Shortlist announced' },
    { when: 'To be announced', what: 'Pre-calls with every shortlisted founder' },
    { when: 'To be announced', what: 'Recording week at the table' },
    { when: 'To be announced', what: 'Season 01 premieres' },
  ],
};

// "Who you sit with matters". The first entry is the host.
// `photo` is a path to a portrait, e.g. 'media/host.jpg' (a tall photo, roughly 3:4, works best).
// Empty names show as a reserved seat.
export const table = [
  { name: 'Phanindra Aarav', role: 'Founder & Host', photo: 'media/phanindra-aarav.jpg', note: 'Runs the table and asks the questions founders usually only hear off-mic.' },
  { name: '', role: 'Founder & CEO', photo: '', note: 'A founder and CEO who has built and scaled a company in India.' },
  { name: '', role: 'Investor seat', photo: '', note: 'Someone who has written the cheques our guests talk about.' },
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
  { q: 'Is there a fee to join the Mafia?', a: 'Yes. Joining the Mafia carries a participation fee, paid securely through Razorpay right after you send your pitch.' },
];

// Shown in the footer as "Last update".
export const lastUpdate = '5 Nov 2026';

// About Us page: the team. Add one entry per person.
// `photo` is optional, e.g. 'media/team-ravi.jpg'. Without one, the card shows their initials.
export const team = [
  { name: 'Phanindra Aarav', role: 'Founder & Host', bio: 'Runs the table and every conversation on it.', photo: 'media/phanindra-aarav.jpg' },
  { name: 'Co-founder', role: 'Founder', bio: 'Joining the table soon.', photo: '' }, // ← second founder: name, role, bio, photo
  { name: 'Jashwanth Chowhan', role: 'Creative Lead', bio: 'Shapes how the show looks, sounds and lands online.', photo: 'media/jashwanth-chowhan.jpg' },
  { name: 'Arjun Sabavath', role: 'Core team', bio: '', photo: 'media/arjun-sabavath.jpg' },
];
