export interface Question {
  id: number;
  question: string;
  correctAnswer: string;
}

export const questions: Question[] = [
  {
    id: 1,
    question: "A resistor of 10Ω is connected across a 20V battery. Find the current.",
    correctAnswer: "2A",
  },
  {
    id: 2,
    question: "Two 10Ω resistors are connected in series across a 20V battery. Find the current.",
    correctAnswer: "1A",
  },
  {
    id: 3,
    question: "Two 10Ω resistors are connected in parallel across a 20V battery. Find the total current.",
    correctAnswer: "4A",
  },
  {
    id: 4,
    question: "A 5Ω and a 10Ω resistor are in series with a 30V battery. Find the voltage across the 5Ω resistor.",
    correctAnswer: "10V",
  },
  {
    id: 5,
    question: "A wire has a resistance of 5Ω. If a current of 3A flows through it for 2 minutes, find the heat produced.",
    correctAnswer: "5400J",
  },
  {
    id: 6,
    question: "Three resistors of 3Ω, 6Ω, and 9Ω are in parallel. Find the equivalent resistance.",
    correctAnswer: "1.64Ω",
  },
  {
    id: 7,
    question: "A 12V battery delivers 2A current. What is the power delivered by the battery?",
    correctAnswer: "24W",
  },
  {
    id: 8,
    question: "Find the current through a 20Ω resistor when a 10V potential difference is applied across it.",
    correctAnswer: "0.5A",
  },
];