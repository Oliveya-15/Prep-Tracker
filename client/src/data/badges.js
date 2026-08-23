// Every unlockable badge. streak = consecutive completed days required.
// Kept as one shared list (not per-tracker) so DSA and Aptitude both feed
// into the same kind of milestone, shown separately on each tracker page
// and combined on the achievements shelf on the Dashboard.
export const BADGES = [
  { id: 'first-step', streak: 1, label: 'First Step', message: "Day 1 done. That's the hardest one to start — you already beat it.", emoji: '🌱' },
  { id: 'streak-3', streak: 3, label: '3-Day Streak', message: 'Three days in a row. The habit is starting to form.', emoji: '🔥' },
  { id: 'streak-7', streak: 7, label: 'Week Warrior', message: 'A full week, no gaps. This is exactly how consistency gets built.', emoji: '⚡' },
  { id: 'streak-14', streak: 14, label: 'Two Weeks Strong', message: 'Fourteen days straight. Most people quit long before this point.', emoji: '💪' },
  { id: 'streak-21', streak: 21, label: 'Habit Locked In', message: "Twenty-one days — this isn't willpower anymore, it's just what you do now.", emoji: '🏆' },
  { id: 'streak-28', streak: 28, label: 'Full Month', message: '28 days, zero excuses. Month 1 is genuinely done.', emoji: '👑' },
]

export function getBadgeById(id) {
  return BADGES.find((b) => b.id === id) || null
}

// Given a current streak and the list of already-unlocked badge ids,
// return badges whose threshold has just been crossed for the first time.
export function newlyEarnedBadges(streak, alreadyUnlocked) {
  return BADGES.filter((b) => streak >= b.streak && !alreadyUnlocked.includes(b.id))
}
