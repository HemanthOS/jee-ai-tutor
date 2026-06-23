export interface Question {
  id: number;
  topic: string;
  difficulty: string;
  question: string;
  correctAnswer: string;
}

export const questions: Question[] = [
  // OHMS LAW (Easy)
  {
    id: 1,
    topic: "Ohms Law",
    difficulty: "Easy",
    question: "A resistor of 10Ω is connected across a 20V battery. Find the current.",
    correctAnswer: "2A",
  },
  {
    id: 2,
    topic: "Ohms Law",
    difficulty: "Easy",
    question: "Find the current through a 20Ω resistor when a 10V potential difference is applied across it.",
    correctAnswer: "0.5A",
  },
  {
    id: 3,
    topic: "Ohms Law",
    difficulty: "Medium",
    question: "A current of 3A flows through a resistor when connected to a 12V battery. Find the resistance.",
    correctAnswer: "4Ω",
  },

  // SERIES CIRCUITS
  {
    id: 4,
    topic: "Series Circuits",
    difficulty: "Easy",
    question: "Two 10Ω resistors are connected in series across a 20V battery. Find the current.",
    correctAnswer: "1A",
  },
  {
    id: 5,
    topic: "Series Circuits",
    difficulty: "Medium",
    question: "A 5Ω and a 10Ω resistor are in series with a 30V battery. Find the voltage across the 5Ω resistor.",
    correctAnswer: "10V",
  },
  {
    id: 6,
    topic: "Series Circuits",
    difficulty: "Hard",
    question: "Three resistors of 2Ω, 3Ω, and 5Ω are in series with a 20V battery. Find the voltage drop across the 3Ω resistor.",
    correctAnswer: "6V",
  },

  // PARALLEL CIRCUITS
  {
    id: 7,
    topic: "Parallel Circuits",
    difficulty: "Easy",
    question: "Two 10Ω resistors are connected in parallel across a 20V battery. Find the total current.",
    correctAnswer: "4A",
  },
  {
    id: 8,
    topic: "Parallel Circuits",
    difficulty: "Medium",
    question: "Three resistors of 3Ω, 6Ω, and 9Ω are in parallel. Find the equivalent resistance.",
    correctAnswer: "1.64Ω",
  },
  {
    id: 9,
    topic: "Parallel Circuits",
    difficulty: "Hard",
    question: "Two resistors of 4Ω and 12Ω are in parallel across a 24V battery. Find the current through the 4Ω resistor.",
    correctAnswer: "6A",
  },

  // POWER
  {
    id: 10,
    topic: "Power",
    difficulty: "Easy",
    question: "A 12V battery delivers 2A current. What is the power delivered by the battery?",
    correctAnswer: "24W",
  },
  {
    id: 11,
    topic: "Power",
    difficulty: "Medium",
    question: "A heater draws 5A from a 220V supply. Find the power consumed.",
    correctAnswer: "1100W",
  },
  {
    id: 12,
    topic: "Power",
    difficulty: "Hard",
    question: "A resistor dissipates 48W when connected to a 12V battery. Find the resistance.",
    correctAnswer: "3Ω",
  },

  // CURRENT
  {
    id: 13,
    topic: "Current",
    difficulty: "Easy",
    question: "A charge of 60C flows through a wire in 30 seconds. Find the current.",
    correctAnswer: "2A",
  },
  {
    id: 14,
    topic: "Current",
    difficulty: "Medium",
    question: "A wire carries a current of 4A. How much charge flows in 2 minutes?",
    correctAnswer: "480C",
  },
  {
    id: 15,
    topic: "Current",
    difficulty: "Hard",
    question: "A wire has a resistance of 5Ω. If a current of 3A flows through it for 2 minutes, find the heat produced.",
    correctAnswer: "5400J",
  },
];