window.APP_DATA = {
  datasetsMeta: [
    { id: "odh", name: "Объекты ОДХ" },
    { id: "works_odh", name: "Работы на ОДХ" },
    { id: "works_okb", name: "Работы на ОКБ" }
  ],

  weightableFields: [
    { key: "coveragePercent", label: "Процент покрытия" },
    { key: "repairAge", label: "Давность ремонта" },
    { key: "estimatedCost", label: "Стоимость" },
    { key: "recommendedVolume", label: "Объем работ" }
  ],

  baseWeights: {
    coveragePercent: 35,
    repairAge: 25,
    estimatedCost: 20,
    recommendedVolume: 20
  },

  objects: [
    {
      objectId: 10001339,
      name: "Филипповский переулок",
      district: "ЦАО",
      area: "Арбат",
      department: "Префектура ЦАО",
      status: "Действующий",
      totalArea: 4380,
      coveredArea: 520,
      uncoveredArea: 3860,
      coveragePercent: 11.9,
      lastWorkYear: 2018,
      repairAge: 8,
      interrepairTerm: 5,
      plan2026Roads: true,
      plan2027Roads: false,
      roadInterrepairViolation: true,
      noImprovementUntil25: false,
      recommendedVolume: 3860,
      estimatedCost: 12352000,
      reason: "Пересечение <15%; Истек срок",
      sourceType: "Объекты ОДХ",
      priorityScore: 0.88,
      priorityLevel: "high",
      geometry: {
        odh: { type: "Polygon", coordinates: [[[37.595,55.747],[37.597,55.747],[37.597,55.746],[37.595,55.746]]] },
        qgis: null
      }
    }
  ]
};
