
import { Question } from './types';

export const QUESTIONS: Question[] = [
  {
    id: 1,
    category: "Constitutional Law",
    text: "Which of the following is an exclusive power of the federal government in a federalist system?",
    options: [
      { id: 'a', text: "Establishing local governments" },
      { id: 'b', text: "Conducting elections" },
      { id: 'c', text: "Negotiating international treaties" },
      { id: 'd', text: "Regulating intrastate commerce" }
    ],
    correctOptionId: 'c',
    context: "Focus on the distribution of power between central and regional authorities."
  },
  {
    id: 2,
    category: "Administrative Logic",
    text: "A public servant discovers a loophole in a regulation that would allow their department to save money but bypasses a secondary environmental review. What is the institutional priority?",
    options: [
      { id: 'a', text: "Fiscal efficiency to protect taxpayer funds" },
      { id: 'b', text: "Strict adherence to established review procedures" },
      { id: 'c', text: "Directing the savings to other underfunded social programs" },
      { id: 'd', text: "Modifying the internal regulation to close the loophole without reporting it" }
    ],
    correctOptionId: 'b',
    context: "Examine the tension between efficiency and due process."
  },
  {
    id: 3,
    category: "Civil Liberties",
    text: "Under the principle of 'Separation of Church and State,' a municipal council is asked to fund a historical renovation of a cathedral that serves as a tourist landmark. The request is denied. What is the likely reasoning?",
    options: [
      { id: 'a', text: "Public funds cannot benefit religious institutions regardless of historical value." },
      { id: 'b', text: "The council lacks jurisdiction over historical landmarks." },
      { id: 'c', text: "The Establishment Clause prevents the appearance of state endorsement of religion." },
      { id: 'd', text: "Historical preservation is the responsibility of private donors, not the government." }
    ],
    correctOptionId: 'c',
    context: "Consider the nuances of the Establishment Clause versus free exercise."
  }
];
