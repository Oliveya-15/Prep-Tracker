// This file is ONLY used once, by seedContent.js, to populate the database
// the first time you run `npm run seed`. After that, all curriculum content
// (including anything you add for Month 2 onward) lives in MongoDB and is
// managed from inside the app itself — no more editing JS files.

export const dsaWeeks = {
  1: 'Foundations — Complexity, Arrays, Patterns, Math',
  2: 'Searching, Sorting, Hashing',
  3: 'Two Pointers, Sliding Window, Strings',
  4: 'Recursion + Consolidation',
}

export const dsaDays = [
  { n: 1, week: 1, title: 'Setup + Time & Space Complexity', concept: [
    'Big-O measures how work grows as input grows, not raw speed. O(1) < O(log n) < O(n) < O(n log n) < O(n²).',
    "For these companies: correctness first, being able to explain complexity second. You rarely need to hand-optimize past O(n log n).",
  ], tasks: [
    { type: 'custom', text: 'Create a GitHub repo named dsa-tracker with folders week1–week4 and a README stating your goal + start date.' },
    { type: 'link', text: 'Two Sum — attempt cold for 20 min before looking at anything, whatever you get, save it.', url: 'https://leetcode.com/problems/two-sum/', tag: 'Easy' },
  ]},
  { n: 2, week: 1, title: 'Arrays — Traverse & Modify In Place', concept: [
    'In-place edits use a slow pointer (write position) and fast pointer (read position) instead of building a new array.',
    'Off-by-one errors are the #1 wrong-answer cause on array problems — dry-run on a 3–4 element example by hand first.',
  ], tasks: [
    { type: 'link', text: 'Remove Duplicates from Sorted Array', url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/', tag: 'Easy' },
    { type: 'link', text: 'Remove Element', url: 'https://leetcode.com/problems/remove-element/', tag: 'Easy' },
  ]},
  { n: 3, week: 1, title: 'Arrays — More In-Place Practice', concept: [
    'Merging two sorted arrays is easiest working backwards from the largest elements when one array has trailing empty space — you never overwrite data you still need.',
  ], tasks: [
    { type: 'link', text: 'Merge Sorted Array', url: 'https://leetcode.com/problems/merge-sorted-array/', tag: 'Easy' },
    { type: 'link', text: 'Move Zeroes', url: 'https://leetcode.com/problems/move-zeroes/', tag: 'Easy' },
  ]},
  { n: 4, week: 1, title: 'Pattern Printing (No LeetCode Today)', concept: [
    'Nested loops: outer loop = which row, inner loop = what goes in that row. Draw the shape on paper, count stars/spaces per row, then code.',
    "This isn't on LeetCode but shows up directly in TCS/Accenture's first coding round — worth a dedicated day.",
  ], tasks: [
    { type: 'custom', text: 'Write & run a right-angle triangle of stars for N rows.' },
    { type: 'custom', text: 'Write & run a centered pyramid of stars for N rows.' },
    { type: 'custom', text: 'Write & run a number pattern (1 / 1 2 / 1 2 3 …) for N rows.' },
  ]},
  { n: 5, week: 1, title: 'Basic Math I', concept: [
    "Most 'math' interview problems are about reversing digits or checking a property by simulating it by hand — not clever formulas.",
  ], tasks: [
    { type: 'link', text: 'Palindrome Number', url: 'https://leetcode.com/problems/palindrome-number/', tag: 'Easy' },
    { type: 'link', text: 'Add Digits', url: 'https://leetcode.com/problems/add-digits/', tag: 'Easy' },
  ]},
  { n: 6, week: 1, title: 'Basic Math II', concept: [
    "GCD via Euclid's algorithm — gcd(a,b) = gcd(b, a % b) — is a 3-line function worth knowing cold, it comes up constantly.",
  ], tasks: [
    { type: 'link', text: 'Find Greatest Common Divisor of Array', url: 'https://leetcode.com/problems/find-greatest-common-divisor-of-array/', tag: 'Easy' },
    { type: 'link', text: 'Find All Numbers Disappeared in an Array', url: 'https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/', tag: 'Easy' },
  ]},
  { n: 7, week: 1, title: 'Week 1 Review + Mock', concept: [
    "Re-solving a problem days later, cold, with no notes, is the real test of whether you learned it or just followed along.",
  ], tasks: [
    { type: 'custom', text: 'Re-solve, from scratch with no notes, the two Week 1 problems that gave you the most trouble.' },
    { type: 'custom', text: 'Write 3 lines of reflection: what clicked this week, what still feels shaky.' },
  ]},
  { n: 8, week: 2, title: 'Binary Search', concept: [
    'Only works on sorted data. Core loop: while low ≤ high: mid = (low+high)/2, compare, discard the half that can\'t hold the answer.',
    "A large share of 'search' problems in easy service-company rounds are binary search in disguise.",
  ], tasks: [
    { type: 'link', text: 'Binary Search', url: 'https://leetcode.com/problems/binary-search/', tag: 'Easy' },
    { type: 'link', text: 'Search Insert Position', url: 'https://leetcode.com/problems/search-insert-position/', tag: 'Easy' },
  ]},
  { n: 9, week: 2, title: 'Binary Search Practice', concept: [], tasks: [
    { type: 'link', text: 'Peak Index in a Mountain Array', url: 'https://leetcode.com/problems/peak-index-in-a-mountain-array/', tag: 'Easy' },
  ]},
  { n: 10, week: 2, title: 'Sorting From Scratch (No LeetCode Today)', concept: [
    "You won't be asked to hand-code merge sort here, but you should explain bubble/selection/insertion and know they're O(n²).",
    "In real problems just use your language's built-in sort() — explaining when that's fine is part of the interview.",
  ], tasks: [
    { type: 'custom', text: 'Implement bubble sort yourself, no references.' },
    { type: 'custom', text: 'Implement selection sort yourself, no references.' },
  ]},
  { n: 11, week: 2, title: 'Hashing I', concept: [
    "Reach for a hashmap whenever a problem needs 'have I seen this before' or 'how many times does this appear' — turns nested loops into one pass.",
  ], tasks: [
    { type: 'link', text: 'Contains Duplicate', url: 'https://leetcode.com/problems/contains-duplicate/', tag: 'Easy' },
    { type: 'custom', text: "Revisit Two Sum (Day 1) — solve it properly with a hashmap this time if it didn't fully click." },
  ]},
  { n: 12, week: 2, title: 'Hashing II', concept: [], tasks: [
    { type: 'link', text: 'Valid Anagram', url: 'https://leetcode.com/problems/valid-anagram/', tag: 'Easy' },
    { type: 'link', text: 'Intersection of Two Arrays', url: 'https://leetcode.com/problems/intersection-of-two-arrays/', tag: 'Easy' },
  ]},
  { n: 13, week: 2, title: 'Hashing + Arrays Mixed', concept: [], tasks: [
    { type: 'link', text: 'Majority Element', url: 'https://leetcode.com/problems/majority-element/', tag: 'Easy' },
    { type: 'link', text: 'First Unique Character in a String', url: 'https://leetcode.com/problems/first-unique-character-in-a-string/', tag: 'Easy' },
  ]},
  { n: 14, week: 2, title: 'Week 2 Review + Timed Mock', concept: [
    'Give yourself 20 minutes per problem today, like a real test — most service-company platforms give partial marks per passed test case anyway.',
  ], tasks: [
    { type: 'custom', text: 'Pick any 2 Week 2 problems, solve them timed (20 min each), push, and write a one-line reflection.' },
  ]},
  { n: 15, week: 3, title: 'Two Pointers', concept: [
    'Two pointers (one from each end, or fast/slow) replace an O(n²) double loop with a single O(n) pass — constant on sorted arrays and strings.',
  ], tasks: [
    { type: 'link', text: 'Valid Palindrome', url: 'https://leetcode.com/problems/valid-palindrome/', tag: 'Easy' },
    { type: 'link', text: 'Reverse String', url: 'https://leetcode.com/problems/reverse-string/', tag: 'Easy' },
  ]},
  { n: 16, week: 3, title: 'Two Pointers Practice', concept: [], tasks: [
    { type: 'link', text: 'Two Sum II - Input Array Is Sorted', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', tag: 'Easy' },
  ]},
  { n: 17, week: 3, title: 'Strings I', concept: [], tasks: [
    { type: 'link', text: 'Longest Common Prefix', url: 'https://leetcode.com/problems/longest-common-prefix/', tag: 'Easy' },
    { type: 'link', text: 'Length of Last Word', url: 'https://leetcode.com/problems/length-of-last-word/', tag: 'Easy' },
  ]},
  { n: 18, week: 3, title: 'Strings + Stack Logic', concept: [
    "A 'stack' is just push/pop from one end — simulate it with a plain array. Valid Parentheses is the classic stack question, asked everywhere.",
  ], tasks: [
    { type: 'link', text: 'Valid Parentheses', url: 'https://leetcode.com/problems/valid-parentheses/', tag: 'Easy' },
  ]},
  { n: 19, week: 3, title: 'Sliding Window — Intro', concept: [
    'A sliding window keeps a running range [left, right] and moves it forward instead of restarting — turns many O(n²) subarray problems into O(n).',
  ], tasks: [
    { type: 'link', text: 'Maximum Average Subarray I', url: 'https://leetcode.com/problems/maximum-average-subarray-i/', tag: 'Easy' },
  ]},
  { n: 20, week: 3, title: 'Stretch Day — Medium Problem', concept: [
    "This one is Medium on purpose. Give it the full 25–30 minute struggle before any hint — it's fine if you don't fully solve it today.",
  ], tasks: [
    { type: 'link', text: 'Longest Substring Without Repeating Characters', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', tag: 'Medium' },
  ]},
  { n: 21, week: 3, title: 'Week 3 Review + Mock', concept: [], tasks: [
    { type: 'custom', text: "Redo Day 20's problem cold if you didn't fully solve it. Push, then write a one-line reflection." },
  ]},
  { n: 22, week: 4, title: 'Recursion — Basics', concept: [
    'Every recursive function needs a base case (when to stop) and a recursive case (a smaller version of itself). Draw the call stack for n=4 on paper before coding.',
  ], tasks: [
    { type: 'link', text: 'Fibonacci Number', url: 'https://leetcode.com/problems/fibonacci-number/', tag: 'Easy' },
  ]},
  { n: 23, week: 4, title: 'Recursion Practice', concept: [], tasks: [
    { type: 'link', text: 'Climbing Stairs', url: 'https://leetcode.com/problems/climbing-stairs/', tag: 'Easy' },
  ]},
  { n: 24, week: 4, title: 'Recursion Drills (No LeetCode Today)', concept: [], tasks: [
    { type: 'custom', text: 'Print 1 to N using recursion only — no loop allowed.' },
    { type: 'custom', text: 'Sum of digits of a number using recursion.' },
  ]},
  { n: 25, week: 4, title: 'Recursion Stretch', concept: [], tasks: [
    { type: 'link', text: 'Pow(x, n)', url: 'https://leetcode.com/problems/powx-n/', tag: 'Medium' },
  ]},
  { n: 26, week: 4, title: 'Mixed Review I', concept: [], tasks: [
    { type: 'custom', text: 'Redo one Week 1 problem and one Week 2 problem, cold, no notes.' },
  ]},
  { n: 27, week: 4, title: 'Mixed Review II', concept: [], tasks: [
    { type: 'custom', text: 'Redo one Week 3 problem and one Week 4 problem, cold, no notes.' },
  ]},
  { n: 28, week: 4, title: 'Month 1 Wrap-Up', concept: [
    "You've now built the actual habit — that was the hard part. Month 2 adds linked lists, trees, and stacks/queues as real structures, same steady pace.",
  ], tasks: [
    { type: 'custom', text: 'Attempt the HackerRank "Problem Solving (Basic)" certification (free, real certificate).' },
    { type: 'custom', text: 'Push a final commit and write a short summary of Month 1.' },
  ]},
]

export const aptitudeWeeks = {
  1: 'Core Arithmetic Foundations',
  2: 'Ratios, Averages, Time-Based Problems',
  3: 'Logical Reasoning + P&C, Probability',
  4: 'Verbal, Data Interpretation, Mensuration + Mocks',
}

export const aptitudeDays = [
  { n: 1, week: 1, title: 'Number System — LCM, HCF, Divisibility', concept: [
    'HCF (biggest common factor) × LCM (smallest common multiple) of two numbers = product of the two numbers — a huge time-saver.',
    'Learn divisibility rules for 2,3,4,5,6,8,9,11 cold — half of "number system" questions are just applying these fast.',
  ], tasks: [
    { type: 'link', text: 'Solve 15 questions on Numbers / HCF & LCM', url: 'https://www.indiabix.com/aptitude/problems-on-hcf-and-lcm/', tag: 'Topic' },
  ]},
  { n: 2, week: 1, title: 'Percentages — Fundamentals', concept: [
    'x% of a number = (x/100) × number. To find "what % is A of B" → (A/B) × 100.',
    'Converting fractions to % from memory (1/4=25%, 1/3≈33.3%, 1/8=12.5%, 1/6≈16.7%) makes mental math much faster in a timed test.',
  ], tasks: [
    { type: 'link', text: 'Solve 15 basic percentage questions', url: 'https://www.indiabix.com/aptitude/percentage/', tag: 'Topic' },
  ]},
  { n: 3, week: 1, title: 'Percentages — Successive Change', concept: [
    'Successive % changes of x% and y% combine to: x + y + (xy/100) — this single formula covers most "increase then decrease" traps.',
  ], tasks: [
    { type: 'link', text: 'Solve 10 more percentage questions, focus on successive-change and income/expenditure problems', url: 'https://www.indiabix.com/aptitude/percentage/', tag: 'Topic' },
  ]},
  { n: 4, week: 1, title: 'Profit & Loss — Basics', concept: [
    'Profit % = (Profit / Cost Price) × 100 — always on Cost Price unless the question says otherwise.',
    'SP = CP × (100 + Profit%)/100. This one formula, rearranged, solves most basic profit/loss questions.',
  ], tasks: [
    { type: 'link', text: 'Solve 15 profit & loss questions', url: 'https://www.indiabix.com/aptitude/profit-and-loss/', tag: 'Topic' },
  ]},
  { n: 5, week: 1, title: 'Profit & Loss — Discounts & Marked Price', concept: [
    'Marked Price is the "before discount" price, not the cost price — mixing these two up is the #1 mistake here.',
    'Successive discounts of x% and y% combine the same way as successive % changes (Day 3 formula).',
  ], tasks: [
    { type: 'link', text: 'Solve 10 more profit & loss questions, focus on discount and marked-price problems', url: 'https://www.indiabix.com/aptitude/profit-and-loss/', tag: 'Topic' },
  ]},
  { n: 6, week: 1, title: 'Simple & Compound Interest', concept: [
    'SI = (P × R × T)/100. CI = P × (1 + R/100)^T − P. For 2 years, CI − SI = P × (R/100)² — a fast shortcut worth memorizing.',
  ], tasks: [
    { type: 'link', text: 'Solve 10 Simple Interest questions', url: 'https://www.indiabix.com/aptitude/simple-interest/', tag: 'Topic' },
    { type: 'link', text: 'Solve 10 Compound Interest questions', url: 'https://www.indiabix.com/aptitude/compound-interest/', tag: 'Topic' },
  ]},
  { n: 7, week: 1, title: 'Week 1 Review + Timed Mixed Set', concept: [
    'Give yourself 20 minutes for 15 mixed questions from this week — no notes, no formulas in front of you. That\'s the real test.',
  ], tasks: [
    { type: 'custom', text: 'Timed mixed set: 15 questions, 20 minutes, covering Number System / Percentages / Profit & Loss / SI-CI.' },
    { type: 'custom', text: 'Note down which topic slowed you down most — that\'s what to revisit before Week 2.' },
  ]},
  { n: 8, week: 2, title: 'Ratio & Proportion', concept: [
    'A ratio a:b stays the same if you multiply or divide both sides by the same number — most questions are just "scale this ratio to match a real total."',
  ], tasks: [
    { type: 'link', text: 'Solve 15 ratio & proportion questions', url: 'https://www.indiabix.com/aptitude/ratio-and-proportion/', tag: 'Topic' },
  ]},
  { n: 9, week: 2, title: 'Averages', concept: [
    'Average = Sum / Count. When one value in a group is replaced, the change in total = change in average × count — faster than recomputing the whole sum.',
  ], tasks: [
    { type: 'link', text: 'Solve 15 average questions', url: 'https://www.indiabix.com/aptitude/average/', tag: 'Topic' },
  ]},
  { n: 10, week: 2, title: 'Time & Work', concept: [
    "If A does a job in x days, A's 1-day work = 1/x. Add individual 1-day rates to combine workers — this is the entire topic.",
  ], tasks: [
    { type: 'link', text: 'Solve 15 time & work questions', url: 'https://www.indiabix.com/aptitude/time-and-work/', tag: 'Topic' },
  ]},
  { n: 11, week: 2, title: 'Time, Speed & Distance — Basics', concept: [
    'Speed = Distance/Time. Convert km/hr to m/s by ×(5/18), and m/s to km/hr by ×(18/5) — memorize both directions.',
  ], tasks: [
    { type: 'link', text: 'Solve 15 time & distance questions', url: 'https://www.indiabix.com/aptitude/time-and-distance/', tag: 'Topic' },
  ]},
  { n: 12, week: 2, title: 'Trains & Boats', concept: [
    'Same-direction relative speed = difference of speeds. Opposite-direction relative speed = sum of speeds — draw a quick arrow diagram if unsure.',
  ], tasks: [
    { type: 'link', text: 'Solve 10 "Problems on Trains" questions', url: 'https://www.indiabix.com/aptitude/problems-on-trains/', tag: 'Topic' },
    { type: 'link', text: 'Solve 10 "Boats and Streams" questions', url: 'https://www.indiabix.com/aptitude/boats-and-streams/', tag: 'Topic' },
  ]},
  { n: 13, week: 2, title: 'Problems on Ages', concept: [
    'Always assign a variable to the present age of the person the question asks about, then translate "x years ago / after" directly into that variable — write the equation before solving.',
  ], tasks: [
    { type: 'link', text: 'Solve 15 problems-on-ages questions', url: 'https://www.indiabix.com/aptitude/problems-on-ages/', tag: 'Topic' },
  ]},
  { n: 14, week: 2, title: 'Week 2 Review + Timed Mixed Set', concept: [], tasks: [
    { type: 'custom', text: 'Timed mixed set: 15 questions, 20 minutes, covering Ratios / Averages / Time & Work / Time-Speed-Distance / Ages.' },
    { type: 'custom', text: 'Redo, cold, the 3 questions from this week you got wrong or skipped.' },
  ]},
  { n: 15, week: 3, title: 'Number & Letter Series', concept: [
    'Check these patterns in order: constant difference, constant ratio, difference-of-differences, alternating pattern, squares/cubes. Most series fit one of these five.',
  ], tasks: [
    { type: 'link', text: 'Solve 15 number series questions', url: 'https://www.indiabix.com/logical-reasoning/number-series/', tag: 'Topic' },
    { type: 'link', text: 'Solve 10 letter/symbol series questions', url: 'https://www.indiabix.com/logical-reasoning/letter-and-symbol-series/', tag: 'Topic' },
  ]},
  { n: 16, week: 3, title: 'Coding–Decoding', concept: [
    'Write the alphabet with position numbers (A=1…Z=26) on paper first — almost every coding-decoding question is a shift, reversal, or position-swap on this.',
  ], tasks: [
    { type: 'link', text: 'Read the concept + solve 10 coding-decoding questions', url: 'https://www.geeksforgeeks.org/coding-decoding/', tag: 'Topic' },
  ]},
  { n: 17, week: 3, title: 'Blood Relations', concept: [
    'Draw a family tree as you read — use +/− for gender and arrows for generation. Never try to hold it in your head, even for "easy" ones.',
  ], tasks: [
    { type: 'link', text: 'Solve 15 blood relation questions', url: 'https://www.indiabix.com/verbal-reasoning/blood-relation-test/', tag: 'Topic' },
  ]},
  { n: 18, week: 3, title: 'Direction Sense', concept: [
    'Sketch a simple compass (N/S/E/W) and mark each move as you read the question — direction questions are pure diagram problems, not mental math.',
  ], tasks: [
    { type: 'link', text: 'Solve 15 direction sense questions', url: 'https://www.indiabix.com/verbal-reasoning/direction-sense-test/', tag: 'Topic' },
  ]},
  { n: 19, week: 3, title: 'Permutation & Combination — Basics', concept: [
    'Permutation = order matters (arrangements). Combination = order doesn\'t matter (selections). Ask "does swapping two items create a new case?" — if yes, it\'s a permutation.',
  ], tasks: [
    { type: 'link', text: 'Solve 12 permutation & combination questions', url: 'https://www.indiabix.com/aptitude/permutation-and-combination/', tag: 'Topic' },
  ]},
  { n: 20, week: 3, title: 'Probability — Basics', concept: [
    'Probability = (favorable outcomes) / (total outcomes). Always write out the total sample space first, even for "obvious" cases — that\'s where most mistakes happen.',
  ], tasks: [
    { type: 'link', text: 'Solve 12 probability questions', url: 'https://www.indiabix.com/aptitude/probability/', tag: 'Topic' },
  ]},
  { n: 21, week: 3, title: 'Week 3 Review + Timed Mixed Set', concept: [], tasks: [
    { type: 'custom', text: 'Timed mixed set: 15 questions, 20 minutes, covering Series / Coding-Decoding / Blood Relations / Direction Sense / P&C / Probability.' },
  ]},
  { n: 22, week: 4, title: 'Verbal — Synonyms & Antonyms', concept: [
    'Don\'t memorize word lists in isolation — learn each new word in a short sentence, it sticks far better than a bare definition.',
  ], tasks: [
    { type: 'link', text: 'Solve 15 synonym questions', url: 'https://www.indiabix.com/verbal-ability/synonyms/', tag: 'Topic' },
    { type: 'link', text: 'Solve 15 antonym questions', url: 'https://www.indiabix.com/verbal-ability/antonyms/', tag: 'Topic' },
  ]},
  { n: 23, week: 4, title: 'Verbal — Error Spotting & Sentence Order', concept: [
    'For error spotting, read the sentence for subject-verb agreement and tense consistency first — those two catch most planted errors.',
  ], tasks: [
    { type: 'link', text: 'Solve 10 spotting-errors questions', url: 'https://www.indiabix.com/verbal-ability/spotting-errors/', tag: 'Topic' },
    { type: 'link', text: 'Solve 10 sentence-ordering (para jumble) questions', url: 'https://www.indiabix.com/verbal-ability/ordering-of-sentences/', tag: 'Topic' },
  ]},
  { n: 24, week: 4, title: 'Data Interpretation — Tables & Bar Charts', concept: [
    'Read the question before the table/chart — it tells you exactly which 2-3 numbers you actually need, instead of studying the whole dataset upfront.',
  ], tasks: [
    { type: 'link', text: 'Solve 1-2 tabulation data sets', url: 'https://www.indiabix.com/data-interpretation/tabulation/', tag: 'Topic' },
    { type: 'link', text: 'Solve 1-2 bar chart data sets', url: 'https://www.indiabix.com/data-interpretation/bar-charts/', tag: 'Topic' },
  ]},
  { n: 25, week: 4, title: 'Data Interpretation — Pie & Line Charts', concept: [
    'For pie charts, convert the percentage slice to actual value using (slice% × total)/100 — write this formula at the top of your rough sheet before starting.',
  ], tasks: [
    { type: 'link', text: 'Solve 1-2 pie chart data sets', url: 'https://www.indiabix.com/data-interpretation/pie-charts/', tag: 'Topic' },
    { type: 'link', text: 'Solve 1-2 line chart data sets', url: 'https://www.indiabix.com/data-interpretation/line-charts/', tag: 'Topic' },
  ]},
  { n: 26, week: 4, title: 'Mensuration Basics', concept: [
    'Keep a single reference sheet of area/perimeter/volume formulas for square, rectangle, triangle, circle, cube, cylinder — this topic is 90% formula recall, not reasoning.',
  ], tasks: [
    { type: 'link', text: 'Solve 10 area questions', url: 'https://www.indiabix.com/aptitude/area/', tag: 'Topic' },
    { type: 'link', text: 'Solve 10 volume & surface area questions', url: 'https://www.indiabix.com/aptitude/volume-and-surface-area/', tag: 'Topic' },
  ]},
  { n: 27, week: 4, title: 'Full Mixed Mock', concept: [
    'Simulate the real thing: one sitting, one timer, mixed topics, no going back to "easier" questions first.',
  ], tasks: [
    { type: 'custom', text: 'Timed full mock: 25-30 mixed questions (Quant + Reasoning + Verbal), 30-35 minutes, no notes.' },
  ]},
  { n: 28, week: 4, title: 'Month 1 Aptitude Wrap-Up', concept: [
    'You now have a working formula sheet and a felt sense of your weak topics — Month 2 goes deeper on whichever 2-3 topics slowed you down most this month.',
  ], tasks: [
    { type: 'custom', text: 'Go through your Week 1-4 notes and copy every formula you wrote into one single "cheat sheet" note for quick pre-test revision.' },
    { type: 'custom', text: 'Write down your 3 weakest topics from this month, in order, to prioritize first in Month 2.' },
  ]},
]
