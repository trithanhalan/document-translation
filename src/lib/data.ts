import type { GlossaryTerm, Document } from "./types";

export const sampleGlossary: GlossaryTerm[] = [
  { term: "Non-destructive testing", translation: "Zerstörungsfreie Prüfung", source_term: "Non-destructive testing" },
  { term: "NDT", translation: "ZfP", source_term: "NDT" },
  { term: "ultrasonic", translation: "Ultraschall", source_term: "ultrasonic" },
  { term: "radiographic", translation: "radiographisch", source_term: "radiographic" },
];

export const sampleDocument: Document = {
  title: "Introduction to NDT",
  segments: [
    {
      id: 1,
      sourceText:
        "Non-destructive testing (NDT) is a wide group of analysis techniques used in science and technology industry to evaluate the properties of a material, component or system without causing damage.",
      translation: "",
    },
    {
      id: 2,
      sourceText:
        "The terms non-destructive examination (NDE), non-destructive inspection (NDI), and non-destructive evaluation (NDE) are also commonly used to describe this technology.",
      translation: "",
    },
    {
      id: 3,
      sourceText:
        "Because NDT does not permanently alter the article being inspected, it is a highly valuable technique that can save both money and time in product evaluation, troubleshooting, and research.",
      translation: "",
    },
    {
      id: 4,
      sourceText:
        "Common NDT methods include ultrasonic, magnetic-particle, liquid penetrant, radiographic, and eddy-current testing.",
      translation: "",
    },
  ],
};
