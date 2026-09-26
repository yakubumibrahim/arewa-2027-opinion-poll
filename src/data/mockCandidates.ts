import type { Candidate, StateInfo, Zone } from "@/types";

export const LOGO_URL =
  "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/generated-images/eee9f294-e8c9-4e9e-932a-69a6634e5900/ymr-media-3d-gold-monogram-insignia-a6b06902-1790379035466.webp";

export const POLL_PRESIDENTIAL = "presidential";

export const BRAND = {
  name: "YMR MEDIA",
  division: "Arewa Public Opinion Desk",
  tagline: "Your Voice. Your Opinion. Your Choice.",
  disclaimer:
    "INDEPENDENT OPINION POLL DISCLAIMER: YMR Media is an independent media and polling organization. This platform is NOT affiliated with INEC (Independent National Electoral Commission) or any Nigerian government institution. Results reflect independent opinion polls only.",
  methodology:
    "Methodology: a self-selecting digital opinion poll. Responses are captured from verified device fingerprints, weighted only for display of relative preference, and are never presented as election projections or official tallies.",
  note: "Candidate slate is an illustrative simulation dataset for the Arewa 2027 opinion poll.",
};

export const PARTY_COLORS: Record<string, string> = {
  APC: "#2E9E5B",
  PDP: "#D64541",
  LP: "#E2762D",
  NNPP: "#2F6FED",
  NDC: "#4338CA",
  SDP: "#C9A227",
  APGA: "#0E7490",
  ADC: "#B45309",
  YPP: "#3F6212",
  AAC: "#BE123C",
  AD: "#64748B",
  PRP: "#8A6A2F",
  AA: "#0369A1",
  ADP: "#4D7C0F",
  Accord: "#475569",
  NRM: "#15803D",
  APM: "#A16207",
  APP: "#1E40AF",
  ZLP: "#C2410C",
  BP: "#7C3AED",
  DLA: "#0891B2",
  NDP: "#DB2777",
};

export const ZONES: Array<{ zone: Zone; blurb: string; states: string }> = [
  { zone: "North West", blurb: "Largest voting bloc of the northern corridor, anchored on Kano and Kaduna metro turnout.", states: "7 states" },
  { zone: "North East", blurb: "Security-sensitive zone where resettlement and reconstruction spending dominate debate.", states: "6 states" },
  { zone: "North Central", blurb: "Middle belt swing zone, decisive for coalitions and youth turnout.", states: "5 states" },
];

export const KOGI_NOTE =
  "Kogi State is governed by an off-cycle election calendar and is excluded from the 2027 Arewa governorship poll window.";

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

type PresSeed = [name: string, party: string, mate: string, manifesto: string];

/** Exactly the 18 presidential tickets published for the Arewa 2027 opinion poll (NNPP excluded). */
const PRESIDENTIAL_SEEDS: PresSeed[] = [
  ["Bola Ahmed Tinubu", "APC", "Kashim Shettima", "Continuity agenda on economic stabilisation, energy reform and national security"],
  ["Atiku Abubakar", "ADC", "Rotimi Amaechi", "Private sector led growth with constitutional restructuring and rail revival"],
  ["Peter Gregory Obi", "NDC", "Rabiu Musa Kwankwaso", "Cost cutting governance, production and fiscal discipline over consumption"],
  ["Sunday Chibuzo Okereke", "LP", "Hajja Bintu Konto", "Living wage review, mass jobs and grassroots industrial revival"],
  ["Sandy Ojang Onor", "PDP", "Umaru Babangida", "Inclusive federalism, rural infrastructure and youth employment"],
  ["Rufai Adekunle Omo-Aje", "AA", "Shehu Hussaini", "Agriculture mechanisation, storage corridors and food price stability"],
  ["Abbas-Bin Aliyu", "ADP", "Chinazam Ike", "Industrial parks and decentralised power generation for small towns"],
  ["Kabiru Yusuf", "APP", "Peace Egobia Ofordile", "Small business credit, primary healthcare and teacher training fund"],
  ["Omoyele Sowore", "AAC", "Haruna Garba Magashi", "Anti corruption enforcement and a referendum on restructuring"],
  ["Oluseyi Abiodun Makinde", "APM", "Musa Lawal Daura", "Subnational best practice scaled to federal service delivery"],
  ["Sunday Adenuga", "BP", "Usman Turaki Mustapha", "Digital economy reform with consumer protection and media freedom"],
  ["Moses Olusoji Adebisi", "DLA", "Nafisat Usaku Abubakar", "Labour rights, pension restructuring and cooperative financing"],
  ["Ada Elizabeth Frederick Okwori", "NDP", "Uchenna Anthony Chukwuemeka", "Women and youth enterprise fund with expanded education access"],
  ["Nkem Esther Okereke", "NRM", "Nasir Muhammed Sulaiman", "Green energy transition and mining sector regulation"],
  ["Donald Duke", "PRP", "Kabiru Rabiu", "Tourism led growth, hospitality investment and coastal development"],
  ["Adewole Ebenezer Adebayo", "SDP", "Usman Muhammed Bugaje", "Social welfare, education access and mass youth jobs"],
  ["Peter Ada Agada", "YPP", "Patience Ndidi Key", "Digital economy, diaspora capital and currency reform"],
  ["Daniel Daberechukwu Nwanyanwu", "ZLP", "Hassan Khalid", "Labour dignity, wage review and pension protection"],
];

const STATE_SEEDS: Array<[string, Zone, string, number]> = [
  ["Kano", "North West", "Kano", 5.9],
  ["Kaduna", "North West", "Kaduna", 4.6],
  ["Katsina", "North West", "Katsina", 3.9],
  ["Kebbi", "North West", "Birnin Kebbi", 2.1],
  ["Sokoto", "North West", "Sokoto", 2.4],
  ["Zamfara", "North West", "Gusau", 1.9],
  ["Jigawa", "North West", "Dutse", 2.4],
  ["Borno", "North East", "Maiduguri", 2.6],
  ["Adamawa", "North East", "Yola", 2.3],
  ["Bauchi", "North East", "Bauchi", 3.1],
  ["Gombe", "North East", "Gombe", 1.6],
  ["Taraba", "North East", "Jalingo", 1.9],
  ["Yobe", "North East", "Damaturu", 1.5],
  ["Niger", "North Central", "Minna", 3.0],
  ["Plateau", "North Central", "Jos", 2.8],
  ["Benue", "North Central", "Makurdi", 2.8],
  ["Nasarawa", "North Central", "Lafia", 1.8],
  ["Kwara", "North Central", "Ilorin", 1.9],
];

type GovSeed = [name: string, party: string, incumbent?: 1];

/** Governor slates for the 18 Arewa states in the 2027 poll window (Kogi excluded). */
const GOVERNOR_SEEDS: Record<string, GovSeed[]> = {
  adamawa: [["Ahmed Galadima", "APC"], ["Christopher Nathaniel", "SDP"], ["Ishaku Elisha Cliff", "LP"], ["Maurice Vunobolki", "PDP"], ["Modibbo Hammantukur Ribadu", "ADC"], ["Wafarinyi Theman Dalatu", "YPP"]],
  bauchi: [["Mohammed Abdullahi Abubakar", "APC"], ["Ibrahim Muhammad Kashim", "NDC"], ["Umar Shehu Buba", "PRP"], ["Usman Supi", "PDP"], ["Yakubu Adamu", "APM"]],
  benue: [["Hyacinth Alia", "APC", 1], ["Herman Iorwase Hembe", "ADC"], ["Michael Aondoakaa", "PDP"], ["Ochigbo Mathew Sunday", "NDP"], ["Sebastine Hon", "SDP"]],
  borno: [["Babagana Buhari", "ADC"], ["Ibrahim Abba Gana", "PDP"], ["Mustapha Gubio", "APC"]],
  gombe: [["Isa Ali Ibrahim Pantami", "PDP"], ["Jamilu Isyaku Gwamna", "APC"]],
  jigawa: [["Umar Namadi", "APC", 1], ["Mustapha Sule Lamido", "PDP"]],
  kaduna: [["Aminu Abdulfatah", "PRP"], ["Danjuma Laah", "NDC"], ["Mohammed Ashiru Isa", "ADC"], ["Uba Sani", "APC", 1], ["Shehu Bawa", "PDP"]],
  kano: [["Abba Kabir Yusuf", "APC", 1], ["Aminu Abdussalam Gwarzo", "NDC"], ["Muhammad Bello Dalhatu", "PDP"]],
  katsina: [["Dikko Umar Radda", "APC", 1], ["Garba Yakubu Lado", "PDP"]],
  kebbi: [["Nasir Idris", "APC", 1], ["Abubakar Malami", "ADC"]],
  kwara: [["Salihu Danladi", "APC"], ["Sulaiman Bolakale Kawu", "PDP"], ["Zakari Mohammed", "ADC"]],
  nasarawa: [["Aliyu Wadada", "APC"], ["Emmanuel Ombugadu", "PDP"], ["Gaza Jonathan Gbefwi", "LP"], ["Nuhu Angbazo", "ADC"]],
  niger: [["Umaru Bago", "APC", 1], ["Mohammed Kpautagi", "ADC"]],
  plateau: [["Caleb Mutfwang", "APC", 1], ["John Sunday Sura", "ADC"], ["Kefas Ropshik", "PDP"], ["Margaret Inusa Yahaya", "SDP"]],
  sokoto: [["Ahmad Aliyu", "APC", 1], ["Manir Muhammad Daniya", "ADC"]],
  taraba: [["Agbu Kefas", "APC", 1], ["Emmanuel Bwacha", "PDP"], ["Shiddi Usman Danjuma", "APGA"], ["Aboki Stephen Bayonga", "DLA"]],
  yobe: [["Abdullahi Usman Maigida", "PDP"], ["Baba Wali", "APC"], ["Kassim Gana Geidam", "ADC"]],
  zamfara: [["Dauda Lawal", "APC", 1], ["Hamza Musa Mai Bulawus", "SDP"]],
};

export const STATE_LIST: StateInfo[] = STATE_SEEDS.map(([name, zone, capital, voters]) => ({
  id: slug(name),
  name,
  zone,
  capital,
  voters,
}));

const colorFor = (party: string) => PARTY_COLORS[party] || "#C5A059";

const PRESIDENTIAL: Candidate[] = PRESIDENTIAL_SEEDS.map(([name, party, mate, manifesto], index) => ({
  id: `pres-${index + 1}`,
  name,
  party,
  runningMate: mate,
  manifesto,
  ballot: POLL_PRESIDENTIAL,
  color: colorFor(party),
  incumbent: false,
  active: true,
}));

const GOVERNORS: Candidate[] = STATE_LIST.flatMap((state) => {
  const seeds = GOVERNOR_SEEDS[state.id] || [];
  return seeds.map(([name, party, incumbent], index) => ({
    id: `gov-${state.id}-${index + 1}`,
    name,
    party,
    runningMate: "Deputy slate pending verification",
    manifesto: incumbent
      ? `Incumbency record and continuity platform in ${state.name} State`
      : `Challenger platform for the ${state.name} State governorship`,
    ballot: state.id,
    color: colorFor(party),
    incumbent: Boolean(incumbent),
    active: true,
  }));
});

export const CANDIDATES: Candidate[] = [...PRESIDENTIAL, ...GOVERNORS];

export const DEMO_PASSCODE = "admin2027";