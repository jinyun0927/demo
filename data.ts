
import { Question } from './types';

/**
 * PATH CONFIGURATION:
 * In AI Studio and standard web environments, paths are relative to index.html.
 * If the physical images are missing in the environment, the UI will now
 * automatically offer an AI-generated fallback.
 */

export const QUESTIONS: Question[] = [
  {
    "id": 1,
    "category": "Laïcité et Institutions",
    "text": "Dans un lycée public, un parent d’élève porte un signe religieux visible lors d’une réunion scolaire. Quelle est la règle applicable ?",
    "text_en": "In a public high school, a student's parent wears a visible religious symbol during a school meeting. What rule applies?",
    "options": [
      {
        "id": "a",
        "text": "Le port de signes religieux est toujours interdit dans les établissements publics.",
        "text_en": "Wearing religious symbols is always prohibited in public institutions."
      },
      {
        "id": "b",
        "text": "La neutralité religieuse s’impose uniquement aux agents du service public.",
        "text_en": "Religious neutrality applies only to public service employees."
      },
      {
        "id": "c",
        "text": "Le port est interdit uniquement pendant les cours.",
        "text_en": "Wearing religious symbols is prohibited only during classes."
      },
      {
        "id": "d",
        "text": "Le port dépend du règlement intérieur de l’établissement.",
        "text_en": "It depends on the internal regulations of the school."
      }
    ],
    "correctOptionId": "b",
    "context": "Principe de laïcité et obligation de neutralité des agents du service public."
  },
  {
    "id": 2,
    "category": "Liberté d’Expression",
    "text": "Lors d’une manifestation autorisée, un manifestant critique violemment le gouvernement sans appel à la haine ni à la violence. La police peut-elle intervenir ?",
    "text_en": "During an authorized protest, a demonstrator harshly criticizes the government without calling for violence or hatred. Can the police intervene?",
    "options": [
      {
        "id": "a",
        "text": "Oui, toute critique virulente trouble l’ordre public.",
        "text_en": "Yes, any harsh criticism disturbs public order."
      },
      {
        "id": "b",
        "text": "Non, la liberté d’expression protège ce type de discours.",
        "text_en": "No, freedom of expression protects this type of speech."
      },
      {
        "id": "c",
        "text": "Oui, si les propos sont offensants pour les institutions.",
        "text_en": "Yes, if the statements are offensive to institutions."
      },
      {
        "id": "d",
        "text": "Non, uniquement parce que la manifestation est autorisée.",
        "text_en": "No, only because the protest is authorized."
      }
    ],
    "correctOptionId": "b",
    "context": "Liberté d’expression et limites liées à l’ordre public."
  },
  {
    "id": 3,
    "category": "Droits et Société",
    "text": "Une femme célibataire souhaite recourir à la PMA en France. Quelle est la situation juridique actuelle ?",
    "text_en": "A single woman wishes to access medically assisted reproduction (PMA) in France. What is the current legal situation?",
    "options": [
      {
        "id": "a",
        "text": "La PMA est réservée aux couples hétérosexuels infertiles.",
        "text_en": "PMA is reserved for infertile heterosexual couples."
      },
      {
        "id": "b",
        "text": "La PMA est accessible à toutes les femmes, sous certaines conditions.",
        "text_en": "PMA is accessible to all women, under certain conditions."
      },
      {
        "id": "c",
        "text": "La PMA est interdite sans mariage.",
        "text_en": "PMA is prohibited without marriage."
      },
      {
        "id": "d",
        "text": "La PMA est autorisée uniquement à l’étranger.",
        "text_en": "PMA is authorized only abroad."
      }
    ],
    "correctOptionId": "b",
    "context": "Loi de bioéthique du 2 août 2021."
  }
]

;
