
import { Question } from './types';

/**
 * 路径修正说明：
 * 由于 index.html 在根目录，且图片在 /public 子目录下，
 * 浏览器请求路径必须包含 /public/ 才能正确定位到文件。
 */

export const QUESTIONS: Question[] = [
  {
    id: 1,
    category: "Laïcité et Institutions",
    text: "Dans un collège public, une élève porte un voile religieux pendant les cours. Quelle est la règle applicable selon la loi de 2004 ?",
    text_en: "In a public middle school, a student wears a religious veil during classes. What is the applicable rule according to the 2004 law?",
    imageUrl: "/assets/images/scenarios/question1.jpg",
    options: [
      { id: 'a', text: "Elle peut le porter librement au nom de la liberté de culte.", text_en: "She can wear it freely in the name of freedom of worship." },
      { id: 'b', text: "Le port de signes ou tenues manifestant ostensiblement une appartenance religieuse est interdit.", text_en: "Wearing signs or dress by which students ostensibly manifest a religious affiliation is prohibited." },
      { id: 'c', text: "Elle peut le porter uniquement si le conseil d'administration du collège l'autorise.", text_en: "She can wear it only if the school's board of directors authorizes it." },
      { id: 'd', text: "Le voile est autorisé tant qu'il ne couvre pas le visage (Loi anti-burqa).", text_en: "The veil is authorized as long as it does not cover the face (Anti-burqa law)." }
    ],
    correctOptionId: 'b',
    context: "Loi n° 2004-228 du 15 mars 2004 encadrant le port de signes religieux dans les écoles, collèges et lycées publics."
  },
  {
    id: 2,
    category: "Liberté d'Expression",
    text: "Un citoyen publie sur les réseaux sociaux une critique virulente mais argumentée de la politique du gouvernement. La police peut-elle intervenir ?",
    text_en: "A citizen publishes a virulent but reasoned criticism of government policy on social media. Can the police intervene?",
    imageUrl: "/assets/images/scenarios/question2.jpg",
    options: [
      { id: 'a', text: "Oui, toute critique du gouvernement est considérée comme un outrage.", text_en: "Yes, any criticism of the government is considered an insult/outrage." },
      { id: 'b', text: "Non, la liberté d'expression protège la critique politique tant qu'il n'y a pas d'appel à la violence ou de haine.", text_en: "No, freedom of expression protects political criticism as long as there is no call for violence or hatred." },
      { id: 'c', text: "Oui, mais seulement si la publication dépasse les 10 000 partages.", text_en: "Yes, but only if the post exceeds 10,000 shares." },
      { id: 'd', text: "Non, car les réseaux sociaux sont des espaces privés hors du contrôle de la loi française.", text_en: "No, because social networks are private spaces outside the control of French law." }
    ],
    correctOptionId: 'b',
    context: "Déclaration des Droits de l'Homme et du Citoyen de 1789 et loi sur la liberté de la presse."
  },
  {
    id: 3,
    category: "Droits et Société",
    text: "Un couple se renseigne sur la PMA. Que signifie ce sigle ?",
    text_en: "A couple is inquiring about PMA. What does this acronym mean?",
    imageUrl: "/assets/images/scenarios/question3.jpg",
    options: [
      { id: 'a', text: "Procréation médicalement assistée", text_en: "Medically assisted procreation" },
      { id: 'b', text: "Protection médicale administrative", text_en: "Administrative medical protection" },
      { id: 'c', text: "Programme médical annuel", text_en: "Annual medical program" },
      { id: 'd', text: "Procédure médicale avancée", text_en: "Advanced medical procedure" }
    ],
    correctOptionId: 'a',
    context: "Loi de bioéthique du 2 août 2021 élargissant l'accès à la procréation médicalement assistée."
  }
];
