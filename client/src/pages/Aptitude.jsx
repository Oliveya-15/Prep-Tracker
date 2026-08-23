import TrackerPage from '../components/TrackerPage.jsx'

const methodBox = (
  <div className="card border-l-[3px] border-l-accent mb-6">
    <h2 className="font-mono text-xs uppercase tracking-wide text-accent mb-2.5">How to use this — every single day</h2>
    <ol className="list-decimal pl-4 space-y-1 text-[13.5px] leading-relaxed">
      <li>Read the concept note first — it's usually one formula or one trick, not a whole chapter.</li>
      <li>Do the practice set on paper with a timer, even roughly — aptitude rounds are speed tests as much as accuracy tests.</li>
      <li>Write the formula or the mistake you made in the notes box under that day — that's your personal cheat sheet building itself over the month.</li>
    </ol>
  </div>
)

const referenceSections = [
  {
    title: 'Why aptitude matters as much as coding here',
    body: 'TCS NQT, Capgemini, Cognizant, and Accenture all run a Quantitative + Logical Reasoning + Verbal screening round before or alongside the coding round — a lot of candidates get filtered out here, not in coding. Treat this page with the same seriousness as the DSA one.',
  },
  {
    title: 'If a question makes your mind go blank',
    body: (
      <ol className="list-decimal pl-4 space-y-1">
        <li>Re-read the question and underline the exact number it's asking for — half the panic is not knowing what you're solving for.</li>
        <li>Write down every number given, even before picking a formula.</li>
        <li>If a formula isn't coming, try plugging in small round numbers to see the relationship — it often reveals the formula.</li>
        <li>Skip and come back — in a timed set, a stuck question is costing you two easier ones.</li>
      </ol>
    ),
  },
]

export default function Aptitude() {
  return (
    <TrackerPage
      trackerType="aptitude"
      title="Aptitude — Build Log"
      subtitle="Quant, Logical Reasoning, Verbal, and Data Interpretation — scoped for TCS/Capgemini/Cognizant/Accenture screening rounds."
      showPushTask={false}
      pushLabel=""
      graphLabel="Progress graph — fills in as you complete each day's practice set"
      methodBox={methodBox}
      referenceSections={referenceSections}
    />
  )
}
