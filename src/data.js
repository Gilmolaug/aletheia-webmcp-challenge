export const sources = [
  {
    id: "uf-health",
    shortName: "UF Health",
    name: "Panama Canal Centennial: Health",
    institution: "University of Florida Libraries",
    kind: "Museum exhibition",
    url: "https://exhibits.uflib.ufl.edu/canal100/health.html",
    coverage: "3 / 3",
    summary:
      "Explains how health programs, disease control, injuries, and unequal living conditions shaped canal construction.",
  },
  {
    id: "uf-voices",
    shortName: "UF Voices",
    name: "Panama Canal Centennial: Voices",
    institution: "University of Florida Libraries",
    kind: "Museum exhibition",
    url: "https://exhibits.uflib.ufl.edu/canal100/voices.html",
    coverage: "3 / 3",
    summary:
      "Documents the international workforce and the gold-and-silver-roll system of labor segregation.",
  },
  {
    id: "state-history",
    shortName: "State History",
    name: "Building the Panama Canal, 1903–1914",
    institution: "U.S. Department of State",
    kind: "Retired official overview",
    url: "https://history.state.gov/milestones/1899-1913/panama-canal",
    coverage: "2 / 2",
    summary:
      "Places the canal in the context of U.S. economic power, foreign policy, and relations with Panama.",
  },
];

export const evidence = [
  {
    id: "health-success",
    sourceId: "uf-health",
    topic: ["health", "disease", "construction"],
    paraphrase:
      "The U.S. construction effort succeeded partly because mosquito control and medical knowledge sharply reduced yellow fever and malaria among workers.",
    locator: "Health overview and mosquito-control sections",
    trust: "Institutional exhibition",
  },
  {
    id: "labor-conditions",
    sourceId: "uf-health",
    topic: ["labor", "inequality", "health", "housing"],
    paraphrase:
      "Silver-roll laborers faced more vulnerable working and living conditions, including unscreened and crowded quarters and physically demanding work.",
    locator: "Working conditions section",
    trust: "Institutional exhibition",
  },
  {
    id: "international-workforce",
    sourceId: "uf-voices",
    topic: ["labor", "caribbean", "workforce"],
    paraphrase:
      "Thousands of skilled and unskilled workers built the canal; much of the unskilled workforce came from the Caribbean, especially Barbados.",
    locator: "Construction workforce section",
    trust: "Institutional exhibition",
  },
  {
    id: "segregated-rolls",
    sourceId: "uf-voices",
    topic: ["labor", "inequality", "segregation", "gold roll", "silver roll"],
    paraphrase:
      "During canal construction, the gold-and-silver-roll division developed into a system of segregation used to control a diverse workforce.",
    locator: "Gold and silver roll records section",
    trust: "Institutional exhibition",
  },
  {
    id: "economic-power",
    sourceId: "state-history",
    topic: ["power", "empire", "trade", "foreign policy"],
    paraphrase:
      "The completed canal symbolized U.S. technological and economic power, while U.S. control later strained relations with Panama.",
    locator: "Concluding paragraph",
    trust: "Retired official overview",
  },
];

export const initialWorkspace = {
  claim:
    "The Panama Canal changed more than trade: its construction joined engineering to public health, unequal labor systems, and expanding U.S. power.",
  suggestion:
    "The evidence supports a stronger account of labor, health, and political power—not only a story of faster shipping.",
  rationale:
    "The selected sources converge on three connected systems: disease control, segregated labor, and U.S. economic and diplomatic power.",
  note: "Keep the labor story visible, and distinguish evidence from interpretation.",
  reviewStatus: "Needs human review",
  selectedSourceId: "uf-health",
  focusedEvidenceIds: ["health-success", "segregated-rolls", "economic-power"],
  sourceRequest: null,
};

export const seedActivity = [
  {
    id: "seed-1",
    actor: "Agent",
    time: "10:14",
    tool: "search_evidence",
    summary: "Found evidence about labor, health, and power across three sources.",
  },
  {
    id: "seed-2",
    actor: "Agent",
    time: "10:15",
    tool: "focus_evidence",
    summary: "Focused three excerpts for human review.",
  },
];

export const sourceById = new Map(sources.map((source) => [source.id, source]));
export const evidenceById = new Map(evidence.map((item) => [item.id, item]));
