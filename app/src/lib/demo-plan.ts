import { PlannerResult } from "@/lib/types";

export const demoPlan: PlannerResult = {
  plan: {
    missionSummary:
      "Rapid cholera risk and displacement surge across the Bicol coastline after Typhoon Aurelia. Targeting 12,400 people with mixed coastal + upland mobility barriers.",
    opportunity:
      "Local cooperatives already run cold-chain motorbikes; wiring them into medical resupply unlocks same-day rehydration kits without new infrastructure.",
    signalStrength: 68,
    riskScore: 72,
    resilienceScore: 64,
    phases: [
      {
        phase: "Stabilize Lifelines",
        window: "0-24h",
        outcome: "Zero preventable dehydration deaths in first wave shelters.",
        actions: [
          {
            label: "Deploy water strike teams",
            owner: "WASH unit",
            detail: "Two bladders + chlorine drops staged within 4 hours of landfall.",
          },
          {
            label: "Flash triage pods",
            owner: "Medical",
            detail: "Nurses empowered with ORS/probiotic protocols under MD tele-supervision.",
          },
        ],
      },
      {
        phase: "Expand Access",
        window: "24-72h",
        outcome: "Redundant corridors reach inland barangays cut by landslides.",
        actions: [
          {
            label: "Motorbike cold-chain",
            owner: "Logistics",
            detail: "Co-ops deliver vaccines + power banks using QR-scanned seal bags.",
          },
          {
            label: "Mesh comms uplift",
            owner: "Comms",
            detail: "Community radio converted to digital mesh with sat uplink windows.",
          },
        ],
      },
      {
        phase: "Stabilize + Transition",
        window: "72h+",
        outcome:
          "Community brigades run hydration kiosks + microgrid lights for 3,600 households.",
        actions: [
          {
            label: "Microgrid rehab",
            owner: "Energy",
            detail: "Hybrid solar kits handed to 8 barangay halls with safety briefings.",
          },
          {
            label: "Protection feedback loops",
            owner: "Safeguarding",
            detail: "Voice notes hotline triages GBV risks nightly with rapid escorts.",
          },
        ],
      },
    ],
    supplyThreads: [
      {
        title: "Hydration Stack",
        summary: "ORS mega sachets + collapsible tanks cover 72h for 8k people.",
        items: [
          {
            name: "ORS sachets",
            quantity: "96k units",
            reason: "3 per person per day for first 72h spike.",
          },
          {
            name: "Collapsible tanks",
            quantity: "12 x 10kL",
            reason: "Distributed along evacuation string.",
          },
        ],
      },
      {
        title: "Comms Spine",
        summary: "Hybrid Starlink + LoRa mesh keeps barangay captains online.",
        items: [
          {
            name: "Starlink kits",
            quantity: "5 terminals",
            reason: "Shared windows for medical + civic backhaul.",
          },
          {
            name: "LoRa repeaters",
            quantity: "18 nodes",
            reason: "Bridge upland valleys lacking GSM.",
          },
        ],
      },
    ],
    intel: [
      {
        title: "Cholera uptick at coastal clinic",
        signal: "confirmed",
        detail: "12 severe dehydration cases logged with limited IV stock.",
        confidence: 82,
      },
      {
        title: "Landslide blocking route 03",
        signal: "emerging",
        detail: "Road watchers note intermittent passage; need river ferry fallback.",
        confidence: 61,
      },
      {
        title: "Fuel ration rumor",
        signal: "watch",
        detail: "Local AM chatter suggests diesel cap by prefect; unverified.",
        confidence: 38,
      },
    ],
  },
  audit: {
    coverage: 54,
    gaps: [
      {
        id: "water-48h",
        label: "48h potable water buffer",
        severity: "high",
        guidance: "Quantify purification + storage chain for 15L/person/day.",
        detected: false,
      },
      {
        id: "shelter-weatherized",
        label: "Weatherized shelter layouts",
        severity: "medium",
        guidance: "Add privacy corridors + lighting plan.",
        detected: true,
      },
    ],
    highlights: [
      "Medical task sharing unlocked via tele-supervision clause.",
      "Motorbike supply chain leverages existing cold storage.",
    ],
  },
};
