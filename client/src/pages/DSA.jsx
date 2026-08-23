import TrackerPage from '../components/TrackerPage.jsx'

const methodBox = (
  <div className="card border-l-[3px] border-l-accent mb-6">
    <h2 className="font-mono text-xs uppercase tracking-wide text-accent mb-2.5">How to use this — every single day</h2>
    <ol className="list-decimal pl-4 space-y-1 text-[13.5px] leading-relaxed">
      <li>Read today's concept notes, then try the problem cold for 20–25 minutes before looking at anything else.</li>
      <li>Stuck after that? Look at a hint, not the full solution. Still stuck → watch/read one solution, close it, then retype it yourself from memory.</li>
      <li>Push whatever you wrote today — solved or not — to your GitHub repo. That checkbox matters most.</li>
    </ol>
  </div>
)

const referenceSections = [
  {
    title: 'If you go blank in the interview — the 5-step reset',
    body: (
      <ol className="list-decimal pl-4 space-y-1">
        <li>Restate the problem in your own words, out loud. Catches misunderstandings and buys you thinking time.</li>
        <li>Work a small example by hand on paper before touching the keyboard.</li>
        <li>Say the brute-force approach out loud, even if it's O(n²) — a working brute force beats a blank stare.</li>
        <li>Only then ask "can I optimize this," and only if time allows.</li>
        <li>Code from your paper dry-run, not from thin air.</li>
      </ol>
    ),
  },
  {
    title: "What's not in this sheet on purpose",
    body: "No graphs, no tries, no segment trees, no hard DP. TCS/Capgemini/Cognizant/Accenture coding rounds run on arrays, strings, basic math, hashing, two pointers, sliding window, and basic recursion — that's the whole sheet. Add Month 2 with the \"+ Add day\" button once this one is done, same pace.",
  },
]

export default function DSA() {
  return (
    <TrackerPage
      trackerType="dsa"
      title="DSA — Build Log"
      subtitle="Scoped for TCS / Capgemini / Cognizant / Accenture coding rounds — not FAANG-hard. One day at a time."
      showPushTask={true}
      pushLabel="Push today's code (even one file) to your GitHub repo."
      graphLabel='Push graph — fills in as you check "pushed to GitHub" each day'
      methodBox={methodBox}
      referenceSections={referenceSections}
    />
  )
}
