import type { Creature } from "./types";

/**
 * 심해 도감 — 수심대별로 해금되는 생물.
 * 단일 잠수에서 도달한 최고 수심(depthM)이 zone의 minDepth를 넘기면 해당 구간 생물이 해금된다.
 */
export const CREATURES: Creature[] = [
  // -5m 햇살 구간 (0m+)
  { id: "clownfish", name: "흰동가리", sub: "Amphiprion", zone: -5, svgKey: "fish", blurb: "첫 잠수에서 만나는 친근한 동행. 시작이 반이다." },
  { id: "seaturtle", name: "바다거북", sub: "Chelonia", zone: -5, svgKey: "turtle", blurb: "느리지만 멀리 간다. 꾸준함의 상징." },
  { id: "jelly", name: "보름달물해파리", sub: "Aurelia", zone: -5, svgKey: "jelly", blurb: "빛을 받아 투명하게 빛나는 얕은 바다의 주민." },

  // -25m 산호 구간 (25m+)
  { id: "manta", name: "쥐가오리", sub: "Mobula", zone: -25, svgKey: "manta", blurb: "넓은 날개로 중층을 활공한다. 집중이 궤도에 오른 증거." },
  { id: "octopus", name: "문어", sub: "Octopoda", zone: -25, svgKey: "octopus", blurb: "여덟 갈래의 집중력. 멀티태스킹의 달인." },
  { id: "seahorse", name: "해마", sub: "Hippocampus", zone: -25, svgKey: "seahorse", blurb: "산호 사이에 꼬리를 감고 버틴다. 인내의 아이콘." },

  // -60m 심해 구간 (60m+)
  { id: "squid", name: "대왕오징어", sub: "Architeuthis", zone: -60, svgKey: "squid", blurb: "햇빛이 닿지 않는 곳의 거대한 사냥꾼. 깊은 몰입의 보상." },
  { id: "anglerfish", name: "아귀", sub: "Lophius", zone: -60, svgKey: "angler", blurb: "스스로 빛을 만들어 어둠을 헤친다. 자기주도의 화신." },

  // -100m 발광 심연 (100m+)
  { id: "whale", name: "향유고래", sub: "Physeter", zone: -100, svgKey: "whale", blurb: "심연까지 잠수하는 포유류의 왕. 극한 집중의 정점." },
  { id: "lantern", name: "발광 심연체", sub: "Bioluminon", zone: -100, svgKey: "lantern", blurb: "오직 가장 깊은 자만이 목격하는 빛의 군무." },
];

export const creatureById = (id: string) => CREATURES.find((c) => c.id === id);
