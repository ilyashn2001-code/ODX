window.APP_DATA = {
  "datasetsMeta": {
    "odhObjects": {
      "label": "Объекты ОДХ",
      "description": "Паспортные и территориальные атрибуты объекта",
      "attributes": [
        {
          "code": "objectId",
          "label": "Идентификатор",
          "type": "number"
        },
        {
          "code": "name",
          "label": "Наименование",
          "type": "text"
        },
        {
          "code": "district",
          "label": "Округ",
          "type": "text"
        },
        {
          "code": "area",
          "label": "Район",
          "type": "text"
        },
        {
          "code": "department",
          "label": "Ведомственный ОИВ",
          "type": "text"
        },
        {
          "code": "status",
          "label": "Статус",
          "type": "text"
        },
        {
          "code": "sourceType",
          "label": "Тип набора",
          "type": "text"
        }
      ]
    },
    "odhWorks": {
      "label": "Работы на ОДХ",
      "description": "Работы, планы и нарушение межремонтного срока по дорогам",
      "attributes": [
        {
          "code": "lastWorkYear",
          "label": "Последний год работ",
          "type": "number"
        },
        {
          "code": "repairAge",
          "label": "Давность ремонта",
          "type": "number"
        },
        {
          "code": "interrepairTerm",
          "label": "Межремонтный срок",
          "type": "number"
        },
        {
          "code": "plan2026Roads",
          "label": "Наличие плана на 2026",
          "type": "boolean"
        },
        {
          "code": "plan2027Roads",
          "label": "Наличие плана на 2027",
          "type": "boolean"
        },
        {
          "code": "roadInterrepairViolation",
          "label": "Нарушение межремонтного срока",
          "type": "boolean"
        }
      ]
    },
    "okbWorks": {
      "label": "Работы на ОКБ",
      "description": "Неблагоустроенные участки, покрытие и производные показатели",
      "attributes": [
        {
          "code": "coveragePercent",
          "label": "Процент покрытия",
          "type": "number"
        },
        {
          "code": "coveredArea",
          "label": "Покрытая площадь",
          "type": "number"
        },
        {
          "code": "uncoveredArea",
          "label": "Непокрытая площадь",
          "type": "number"
        },
        {
          "code": "recommendedVolume",
          "label": "Рекомендуемый объем работ",
          "type": "number"
        },
        {
          "code": "estimatedCost",
          "label": "Ориентировочная стоимость",
          "type": "number"
        },
        {
          "code": "noImprovementUntil25",
          "label": "Благо не проводилось до 2025",
          "type": "boolean"
        },
        {
          "code": "reason",
          "label": "Основание включения",
          "type": "text"
        }
      ]
    }
  },
  "weightableFields": [
    {
      "code": "coveragePercent",
      "label": "Процент покрытия"
    },
    {
      "code": "repairAge",
      "label": "Давность последнего ремонта"
    },
    {
      "code": "estimatedCost",
      "label": "Ориентировочная стоимость"
    },
    {
      "code": "recommendedVolume",
      "label": "Рекомендуемый объем работ"
    }
  ],
  "baseWeights": {
    "coveragePercent": 35,
    "repairAge": 25,
    "estimatedCost": 20,
    "recommendedVolume": 20
  },
  "objects": [
    {
      "objectId": 10001339,
      "oghId": 10001339,
      "objectType": "Объект дорожного хозяйства",
      "name": "Филипповский переулок",
      "status": "Действующий",
      "district": "ЦАО",
      "area": "Арбат",
      "department": "Префектура ЦАО",
      "sourceType": "Объекты ОДХ",
      "totalArea": 4380,
      "coveredArea": 520,
      "uncoveredArea": 3860,
      "coveragePercent": 11.87,
      "recommendedVolume": 3860,
      "estimatedCost": 12352000,
      "lastWorkYear": 2018,
      "repairAge": 8,
      "interrepairTerm": 5,
      "plan2026Roads": true,
      "plan2027Roads": false,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": false,
      "reason": "Пересечение с работами менее 15%; Истек межремонтный срок; Выявлены неблагоустроенные участки (QGIS)",
      "priorityScore": 0.99,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.595,
                55.747
              ],
              [
                37.599,
                55.7471
              ],
              [
                37.5986,
                55.7448
              ],
              [
                37.5947,
                55.745
              ],
              [
                37.595,
                55.747
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.5956,
                55.7467
              ],
              [
                37.5978,
                55.7468
              ],
              [
                37.5975,
                55.7455
              ],
              [
                37.5956,
                55.7456
              ],
              [
                37.5956,
                55.7467
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 723345017,
      "oghId": 723345017,
      "objectType": "Объект дорожного хозяйства",
      "name": "Проезд от улицы Краснобогатырской до Богатырского 4-го переулка",
      "status": "Действующий",
      "district": "ВАО",
      "area": "Богородское",
      "department": "Префектура ВАО",
      "sourceType": "Работы на ОДХ",
      "totalArea": 7825,
      "coveredArea": 910,
      "uncoveredArea": 6915,
      "coveragePercent": 11.63,
      "recommendedVolume": 6915,
      "estimatedCost": 22128000,
      "lastWorkYear": 2019,
      "repairAge": 7,
      "interrepairTerm": 5,
      "plan2026Roads": true,
      "plan2027Roads": true,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": false,
      "reason": "Низкий процент покрытия; Пересечение с работами менее 15%; Истек межремонтный срок",
      "priorityScore": 0.99,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.708,
                55.815
              ],
              [
                37.712,
                55.8151
              ],
              [
                37.7116,
                55.8128
              ],
              [
                37.7077,
                55.813
              ],
              [
                37.708,
                55.815
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.7086,
                55.8147
              ],
              [
                37.7108,
                55.8148
              ],
              [
                37.7105,
                55.8135
              ],
              [
                37.7086,
                55.8136
              ],
              [
                37.7086,
                55.8147
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 119166,
      "oghId": 119166,
      "objectType": "Объект дорожного хозяйства",
      "name": "Охотный Ряд улица",
      "status": "Действующий",
      "district": "ЦАО",
      "area": "Тверской",
      "department": "Префектура ЦАО",
      "sourceType": "Работы на ОДХ",
      "totalArea": 9640,
      "coveredArea": 3480,
      "uncoveredArea": 6160,
      "coveragePercent": 36.1,
      "recommendedVolume": 6160,
      "estimatedCost": 19712000,
      "lastWorkYear": 2020,
      "repairAge": 6,
      "interrepairTerm": 5,
      "plan2026Roads": true,
      "plan2027Roads": false,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": false,
      "reason": "Истек межремонтный срок; Выявлены неблагоустроенные участки (QGIS); Низкий процент покрытия",
      "priorityScore": 0.9449,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.617,
                55.756
              ],
              [
                37.621,
                55.7561
              ],
              [
                37.6206,
                55.7538
              ],
              [
                37.6167,
                55.754
              ],
              [
                37.617,
                55.756
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.6176,
                55.7557
              ],
              [
                37.6198,
                55.7558
              ],
              [
                37.6195,
                55.7545
              ],
              [
                37.6176,
                55.7546
              ],
              [
                37.6176,
                55.7557
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 119167,
      "oghId": 119167,
      "objectType": "Объект дорожного хозяйства",
      "name": "Революции площадь",
      "status": "Действующий",
      "district": "ЦАО",
      "area": "Тверской",
      "department": "Префектура ЦАО",
      "sourceType": "Работы на ОКБ",
      "totalArea": 6185,
      "coveredArea": 0,
      "uncoveredArea": 6185,
      "coveragePercent": 0.0,
      "recommendedVolume": 6185,
      "estimatedCost": 19792000,
      "lastWorkYear": null,
      "repairAge": null,
      "interrepairTerm": 5,
      "plan2026Roads": true,
      "plan2027Roads": false,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": true,
      "reason": "Не проводились работы; Выявлены неблагоустроенные участки (QGIS)",
      "priorityScore": 0.9211,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.626,
                55.756
              ],
              [
                37.63,
                55.7561
              ],
              [
                37.6296,
                55.7538
              ],
              [
                37.6257,
                55.754
              ],
              [
                37.626,
                55.756
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.6266,
                55.7557
              ],
              [
                37.6288,
                55.7558
              ],
              [
                37.6285,
                55.7545
              ],
              [
                37.6266,
                55.7546
              ],
              [
                37.6266,
                55.7557
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 10001176,
      "oghId": 10001176,
      "objectType": "Объект дорожного хозяйства",
      "name": "Территория прилегающая к Храму Христа Спасителя",
      "status": "Действующий",
      "district": "ЦАО",
      "area": "Хамовники",
      "department": "Префектура ЦАО",
      "sourceType": "Объекты ОДХ",
      "totalArea": 7020,
      "coveredArea": 1300,
      "uncoveredArea": 5720,
      "coveragePercent": 18.52,
      "recommendedVolume": 5720,
      "estimatedCost": 18304000,
      "lastWorkYear": 2017,
      "repairAge": 9,
      "interrepairTerm": 5,
      "plan2026Roads": true,
      "plan2027Roads": false,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": false,
      "reason": "Истек межремонтный срок; Выявлены неблагоустроенные участки (QGIS)",
      "priorityScore": 0.99,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.606,
                55.744
              ],
              [
                37.61,
                55.7441
              ],
              [
                37.6096,
                55.7418
              ],
              [
                37.6057,
                55.742
              ],
              [
                37.606,
                55.744
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.6066,
                55.7437
              ],
              [
                37.6088,
                55.7438
              ],
              [
                37.6085,
                55.7425
              ],
              [
                37.6066,
                55.7426
              ],
              [
                37.6066,
                55.7437
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 10000573,
      "oghId": 10000573,
      "objectType": "Объект дорожного хозяйства",
      "name": "Маяковского пер.",
      "status": "Действующий",
      "district": "ЦАО",
      "area": "Тверской",
      "department": "Префектура ЦАО",
      "sourceType": "Объекты ОДХ",
      "totalArea": 3550,
      "coveredArea": 200,
      "uncoveredArea": 3350,
      "coveragePercent": 5.63,
      "recommendedVolume": 3350,
      "estimatedCost": 10720000,
      "lastWorkYear": 2016,
      "repairAge": 10,
      "interrepairTerm": 5,
      "plan2026Roads": false,
      "plan2027Roads": false,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": true,
      "reason": "Пересечение с работами менее 15%; Не проводились полноценные работы",
      "priorityScore": 0.99,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.596,
                55.759
              ],
              [
                37.6,
                55.7591
              ],
              [
                37.5996,
                55.7568
              ],
              [
                37.5957,
                55.757
              ],
              [
                37.596,
                55.759
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.5966,
                55.7587
              ],
              [
                37.5988,
                55.7588
              ],
              [
                37.5985,
                55.7575
              ],
              [
                37.5966,
                55.7576
              ],
              [
                37.5966,
                55.7587
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 10002256,
      "oghId": 10002256,
      "objectType": "Объект дорожного хозяйства",
      "name": "Дубнинская улица",
      "status": "Действующий",
      "district": "САО",
      "area": "Восточное Дегунино",
      "department": "Префектура САО",
      "sourceType": "Работы на ОДХ",
      "totalArea": 11200,
      "coveredArea": 2500,
      "uncoveredArea": 8700,
      "coveragePercent": 22.32,
      "recommendedVolume": 8700,
      "estimatedCost": 27840000,
      "lastWorkYear": 2021,
      "repairAge": 5,
      "interrepairTerm": 5,
      "plan2026Roads": true,
      "plan2027Roads": true,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": false,
      "reason": "Низкий процент покрытия; Выявлены неблагоустроенные участки (QGIS)",
      "priorityScore": 0.9563,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.565,
                55.878
              ],
              [
                37.569,
                55.8781
              ],
              [
                37.5686,
                55.8758
              ],
              [
                37.5647,
                55.876
              ],
              [
                37.565,
                55.878
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.5656,
                55.8777
              ],
              [
                37.5678,
                55.8778
              ],
              [
                37.5675,
                55.8765
              ],
              [
                37.5656,
                55.8766
              ],
              [
                37.5656,
                55.8777
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 10003427,
      "oghId": 10003427,
      "objectType": "Объект дорожного хозяйства",
      "name": "Новочеркасский бульвар",
      "status": "Действующий",
      "district": "ЮВАО",
      "area": "Марьино",
      "department": "Префектура ЮВАО",
      "sourceType": "Работы на ОДХ",
      "totalArea": 8912.1,
      "coveredArea": 4125,
      "uncoveredArea": 4787.1,
      "coveragePercent": 46.29,
      "recommendedVolume": 4787.1,
      "estimatedCost": 15318720.0,
      "lastWorkYear": 2023,
      "repairAge": 3,
      "interrepairTerm": 3,
      "plan2026Roads": true,
      "plan2027Roads": true,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": false,
      "reason": "Недостаточное покрытие, требуется планирование",
      "priorityScore": 0.8406,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.748,
                55.653
              ],
              [
                37.752,
                55.6531
              ],
              [
                37.7516,
                55.6508
              ],
              [
                37.7477,
                55.651
              ],
              [
                37.748,
                55.653
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.7486,
                55.6527
              ],
              [
                37.7508,
                55.6528
              ],
              [
                37.7505,
                55.6515
              ],
              [
                37.7486,
                55.6516
              ],
              [
                37.7486,
                55.6527
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 200100,
      "oghId": 200100,
      "objectType": "Объект дорожного хозяйства",
      "name": "Антонова-Овсеенко улица",
      "status": "Действующий",
      "district": "ЦАО",
      "area": "Пресненский",
      "department": "Префектура ЦАО",
      "sourceType": "Объекты ОДХ",
      "totalArea": 5494.43,
      "coveredArea": 1600,
      "uncoveredArea": 3894.43,
      "coveragePercent": 29.12,
      "recommendedVolume": 3894.43,
      "estimatedCost": 12462176.0,
      "lastWorkYear": 2023,
      "repairAge": 3,
      "interrepairTerm": 5,
      "plan2026Roads": true,
      "plan2027Roads": false,
      "roadInterrepairViolation": false,
      "noImprovementUntil25": false,
      "reason": "Покрытие ниже порога",
      "priorityScore": 0.9049,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.536,
                55.757
              ],
              [
                37.54,
                55.7571
              ],
              [
                37.5396,
                55.7548
              ],
              [
                37.5357,
                55.755
              ],
              [
                37.536,
                55.757
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.5366,
                55.7567
              ],
              [
                37.5388,
                55.7568
              ],
              [
                37.5385,
                55.7555
              ],
              [
                37.5366,
                55.7556
              ],
              [
                37.5366,
                55.7567
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 200101,
      "oghId": 200101,
      "objectType": "Объект дорожного хозяйства",
      "name": "Территория без ремонта",
      "status": "Действующий",
      "district": "СВАО",
      "area": "Бибирево",
      "department": "Префектура СВАО",
      "sourceType": "Работы на ОКБ",
      "totalArea": 6150,
      "coveredArea": 0,
      "uncoveredArea": 6150,
      "coveragePercent": 0.0,
      "recommendedVolume": 6150,
      "estimatedCost": 19680000,
      "lastWorkYear": null,
      "repairAge": null,
      "interrepairTerm": 4,
      "plan2026Roads": false,
      "plan2027Roads": false,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": true,
      "reason": "Неблагоустроенная геометрия без проведенного ремонта",
      "priorityScore": 0.9213,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.604,
                55.889
              ],
              [
                37.608,
                55.8891
              ],
              [
                37.6076,
                55.8868
              ],
              [
                37.6037,
                55.887
              ],
              [
                37.604,
                55.889
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.6046,
                55.8887
              ],
              [
                37.6068,
                55.8888
              ],
              [
                37.6065,
                55.8875
              ],
              [
                37.6046,
                55.8876
              ],
              [
                37.6046,
                55.8887
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 200102,
      "oghId": 200102,
      "objectType": "Объект дорожного хозяйства",
      "name": "Подъезд к жилым корпусам",
      "status": "Действующий",
      "district": "ЗАО",
      "area": "Кунцево",
      "department": "Префектура ЗАО",
      "sourceType": "Работы на ОКБ",
      "totalArea": 4220.8,
      "coveredArea": 940,
      "uncoveredArea": 3280.8,
      "coveragePercent": 22.27,
      "recommendedVolume": 3280.8,
      "estimatedCost": 10498560.0,
      "lastWorkYear": 2022,
      "repairAge": 4,
      "interrepairTerm": 3,
      "plan2026Roads": false,
      "plan2027Roads": false,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": false,
      "reason": "Работы на дорогах не выполнялись, есть следы ОКБ",
      "priorityScore": 0.9567,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.395,
                55.728
              ],
              [
                37.399,
                55.7281
              ],
              [
                37.3986,
                55.7258
              ],
              [
                37.3947,
                55.726
              ],
              [
                37.395,
                55.728
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.3956,
                55.7277
              ],
              [
                37.3978,
                55.7278
              ],
              [
                37.3975,
                55.7265
              ],
              [
                37.3956,
                55.7266
              ],
              [
                37.3956,
                55.7277
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 200103,
      "oghId": 200103,
      "objectType": "Объект дорожного хозяйства",
      "name": "Проезд у школы",
      "status": "Действующий",
      "district": "САО",
      "area": "Головинский",
      "department": "Префектура САО",
      "sourceType": "Объекты ОДХ",
      "totalArea": 3775.3,
      "coveredArea": 1480,
      "uncoveredArea": 2295.3,
      "coveragePercent": 39.2,
      "recommendedVolume": 2295.3,
      "estimatedCost": 7344960.0,
      "lastWorkYear": 2021,
      "repairAge": 5,
      "interrepairTerm": 4,
      "plan2026Roads": true,
      "plan2027Roads": false,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": false,
      "reason": "Низкий процент покрытия",
      "priorityScore": 0.9271,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.494,
                55.848
              ],
              [
                37.498,
                55.8481
              ],
              [
                37.4976,
                55.8458
              ],
              [
                37.4937,
                55.846
              ],
              [
                37.494,
                55.848
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.4946,
                55.8477
              ],
              [
                37.4968,
                55.8478
              ],
              [
                37.4965,
                55.8465
              ],
              [
                37.4946,
                55.8466
              ],
              [
                37.4946,
                55.8477
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 200104,
      "oghId": 200104,
      "objectType": "Объект дорожного хозяйства",
      "name": "Внутриквартальный проезд",
      "status": "Действующий",
      "district": "ЮАО",
      "area": "Царицыно",
      "department": "Префектура ЮАО",
      "sourceType": "Работы на ОДХ",
      "totalArea": 5120,
      "coveredArea": 930,
      "uncoveredArea": 4190,
      "coveragePercent": 18.16,
      "recommendedVolume": 4190,
      "estimatedCost": 13408000,
      "lastWorkYear": 2017,
      "repairAge": 9,
      "interrepairTerm": 4,
      "plan2026Roads": false,
      "plan2027Roads": true,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": true,
      "reason": "Истек межремонтный срок, покрытие ниже допустимого",
      "priorityScore": 0.99,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.669,
                55.622
              ],
              [
                37.673,
                55.6221
              ],
              [
                37.6726,
                55.6198
              ],
              [
                37.6687,
                55.62
              ],
              [
                37.669,
                55.622
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.6696,
                55.6217
              ],
              [
                37.6718,
                55.6218
              ],
              [
                37.6715,
                55.6205
              ],
              [
                37.6696,
                55.6206
              ],
              [
                37.6696,
                55.6217
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 200105,
      "oghId": 200105,
      "objectType": "Объект дорожного хозяйства",
      "name": "Шмитовский проезд",
      "status": "Действующий",
      "district": "ЦАО",
      "area": "Пресненский",
      "department": "Префектура ЦАО",
      "sourceType": "Работы на ОДХ",
      "totalArea": 7340,
      "coveredArea": 1680,
      "uncoveredArea": 5660,
      "coveragePercent": 22.89,
      "recommendedVolume": 5660,
      "estimatedCost": 18112000,
      "lastWorkYear": 2019,
      "repairAge": 7,
      "interrepairTerm": 5,
      "plan2026Roads": true,
      "plan2027Roads": false,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": false,
      "reason": "Истек межремонтный срок; Пересечение менее 15%",
      "priorityScore": 0.99,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.541,
                55.756
              ],
              [
                37.545,
                55.7561
              ],
              [
                37.5446,
                55.7538
              ],
              [
                37.5407,
                55.754
              ],
              [
                37.541,
                55.756
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.5416,
                55.7557
              ],
              [
                37.5438,
                55.7558
              ],
              [
                37.5435,
                55.7545
              ],
              [
                37.5416,
                55.7546
              ],
              [
                37.5416,
                55.7557
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 200106,
      "oghId": 200106,
      "objectType": "Объект дорожного хозяйства",
      "name": "Садовая-Кудринская улица",
      "status": "Действующий",
      "district": "ЦАО",
      "area": "Пресненский",
      "department": "Префектура ЦАО",
      "sourceType": "Работы на ОДХ",
      "totalArea": 6840,
      "coveredArea": 2210,
      "uncoveredArea": 4630,
      "coveragePercent": 32.31,
      "recommendedVolume": 4630,
      "estimatedCost": 14816000,
      "lastWorkYear": 2020,
      "repairAge": 6,
      "interrepairTerm": 5,
      "plan2026Roads": true,
      "plan2027Roads": false,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": false,
      "reason": "Низкий процент покрытия",
      "priorityScore": 0.9653,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.585,
                55.764
              ],
              [
                37.589,
                55.7641
              ],
              [
                37.5886,
                55.7618
              ],
              [
                37.5847,
                55.762
              ],
              [
                37.585,
                55.764
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.5856,
                55.7637
              ],
              [
                37.5878,
                55.7638
              ],
              [
                37.5875,
                55.7625
              ],
              [
                37.5856,
                55.7626
              ],
              [
                37.5856,
                55.7637
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 200107,
      "oghId": 200107,
      "objectType": "Объект дорожного хозяйства",
      "name": "Проспект Мира дублер",
      "status": "Действующий",
      "district": "СВАО",
      "area": "Останкинский",
      "department": "Префектура СВАО",
      "sourceType": "Работы на ОДХ",
      "totalArea": 9440,
      "coveredArea": 2460,
      "uncoveredArea": 6980,
      "coveragePercent": 26.06,
      "recommendedVolume": 6980,
      "estimatedCost": 22336000,
      "lastWorkYear": 2018,
      "repairAge": 8,
      "interrepairTerm": 5,
      "plan2026Roads": true,
      "plan2027Roads": true,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": false,
      "reason": "Истек межремонтный срок; QGIS",
      "priorityScore": 0.99,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.636,
                55.821
              ],
              [
                37.64,
                55.8211
              ],
              [
                37.6396,
                55.8188
              ],
              [
                37.6357,
                55.819
              ],
              [
                37.636,
                55.821
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.6366,
                55.8207
              ],
              [
                37.6388,
                55.8208
              ],
              [
                37.6385,
                55.8195
              ],
              [
                37.6366,
                55.8196
              ],
              [
                37.6366,
                55.8207
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 200108,
      "oghId": 200108,
      "objectType": "Объект дорожного хозяйства",
      "name": "Ленинградский проспект дублер",
      "status": "Действующий",
      "district": "САО",
      "area": "Аэропорт",
      "department": "Префектура САО",
      "sourceType": "Работы на ОДХ",
      "totalArea": 12380,
      "coveredArea": 1808,
      "uncoveredArea": 10572,
      "coveragePercent": 14.6,
      "recommendedVolume": 10572,
      "estimatedCost": 33830400,
      "lastWorkYear": 2019,
      "repairAge": 7,
      "interrepairTerm": 6,
      "plan2026Roads": true,
      "plan2027Roads": true,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": false,
      "reason": "Пересечение с работами менее 15%; Истек межремонтный срок",
      "priorityScore": 0.99,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.545,
                55.799
              ],
              [
                37.549,
                55.7991
              ],
              [
                37.5486,
                55.7968
              ],
              [
                37.5447,
                55.797
              ],
              [
                37.545,
                55.799
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.5456,
                55.7987
              ],
              [
                37.5478,
                55.7988
              ],
              [
                37.5475,
                55.7975
              ],
              [
                37.5456,
                55.7976
              ],
              [
                37.5456,
                55.7987
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 200109,
      "oghId": 200109,
      "objectType": "Объект дорожного хозяйства",
      "name": "Волгоградский проспект боковой проезд",
      "status": "Действующий",
      "district": "ЮВАО",
      "area": "Текстильщики",
      "department": "Префектура ЮВАО",
      "sourceType": "Работы на ОДХ",
      "totalArea": 8520,
      "coveredArea": 1880,
      "uncoveredArea": 6640,
      "coveragePercent": 22.07,
      "recommendedVolume": 6640,
      "estimatedCost": 21248000,
      "lastWorkYear": 2020,
      "repairAge": 6,
      "interrepairTerm": 5,
      "plan2026Roads": true,
      "plan2027Roads": true,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": false,
      "reason": "Низкий процент покрытия",
      "priorityScore": 0.99,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.747,
                55.708
              ],
              [
                37.751,
                55.7081
              ],
              [
                37.7506,
                55.7058
              ],
              [
                37.7467,
                55.706
              ],
              [
                37.747,
                55.708
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.7476,
                55.7077
              ],
              [
                37.7498,
                55.7078
              ],
              [
                37.7495,
                55.7065
              ],
              [
                37.7476,
                55.7066
              ],
              [
                37.7476,
                55.7077
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 200110,
      "oghId": 200110,
      "objectType": "Объект дорожного хозяйства",
      "name": "Профсоюзная улица, местный проезд",
      "status": "Действующий",
      "district": "ЮЗАО",
      "area": "Черёмушки",
      "department": "Префектура ЮЗАО",
      "sourceType": "Объекты ОДХ",
      "totalArea": 4860,
      "coveredArea": 1120,
      "uncoveredArea": 3740,
      "coveragePercent": 23.05,
      "recommendedVolume": 3740,
      "estimatedCost": 11968000,
      "lastWorkYear": 2018,
      "repairAge": 8,
      "interrepairTerm": 5,
      "plan2026Roads": true,
      "plan2027Roads": false,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": false,
      "reason": "Истек межремонтный срок; QGIS",
      "priorityScore": 0.99,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.561,
                55.674
              ],
              [
                37.565,
                55.6741
              ],
              [
                37.5646,
                55.6718
              ],
              [
                37.5607,
                55.672
              ],
              [
                37.561,
                55.674
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.5616,
                55.6737
              ],
              [
                37.5638,
                55.6738
              ],
              [
                37.5635,
                55.6725
              ],
              [
                37.5616,
                55.6726
              ],
              [
                37.5616,
                55.6737
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 200111,
      "oghId": 200111,
      "objectType": "Объект дорожного хозяйства",
      "name": "Каширское шоссе, карман ОТ",
      "status": "Действующий",
      "district": "ЮАО",
      "area": "Нагатино-Садовники",
      "department": "Префектура ЮАО",
      "sourceType": "Работы на ОДХ",
      "totalArea": 5930,
      "coveredArea": 980,
      "uncoveredArea": 4950,
      "coveragePercent": 16.53,
      "recommendedVolume": 4950,
      "estimatedCost": 15840000,
      "lastWorkYear": 2021,
      "repairAge": 5,
      "interrepairTerm": 4,
      "plan2026Roads": true,
      "plan2027Roads": false,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": false,
      "reason": "Низкий процент покрытия; Пересечение менее 15%",
      "priorityScore": 0.99,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.646,
                55.666
              ],
              [
                37.65,
                55.6661
              ],
              [
                37.6496,
                55.6638
              ],
              [
                37.6457,
                55.664
              ],
              [
                37.646,
                55.666
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.6466,
                55.6657
              ],
              [
                37.6488,
                55.6658
              ],
              [
                37.6485,
                55.6645
              ],
              [
                37.6466,
                55.6646
              ],
              [
                37.6466,
                55.6657
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 200112,
      "oghId": 200112,
      "objectType": "Объект дорожного хозяйства",
      "name": "Севастопольский проспект дублер",
      "status": "Действующий",
      "district": "ЮЗАО",
      "area": "Котловка",
      "department": "Префектура ЮЗАО",
      "sourceType": "Работы на ОДХ",
      "totalArea": 7710,
      "coveredArea": 2030,
      "uncoveredArea": 5680,
      "coveragePercent": 26.33,
      "recommendedVolume": 5680,
      "estimatedCost": 18176000,
      "lastWorkYear": 2019,
      "repairAge": 7,
      "interrepairTerm": 5,
      "plan2026Roads": true,
      "plan2027Roads": true,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": false,
      "reason": "Истек межремонтный срок",
      "priorityScore": 0.99,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.594,
                55.686
              ],
              [
                37.598,
                55.6861
              ],
              [
                37.5976,
                55.6838
              ],
              [
                37.5937,
                55.684
              ],
              [
                37.594,
                55.686
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.5946,
                55.6857
              ],
              [
                37.5968,
                55.6858
              ],
              [
                37.5965,
                55.6845
              ],
              [
                37.5946,
                55.6846
              ],
              [
                37.5946,
                55.6857
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 200113,
      "oghId": 200113,
      "objectType": "Объект дорожного хозяйства",
      "name": "Алтуфьевское шоссе, боковой проезд",
      "status": "Действующий",
      "district": "СВАО",
      "area": "Отрадное",
      "department": "Префектура СВАО",
      "sourceType": "Работы на ОДХ",
      "totalArea": 8120,
      "coveredArea": 1520,
      "uncoveredArea": 6600,
      "coveragePercent": 18.72,
      "recommendedVolume": 6600,
      "estimatedCost": 21120000,
      "lastWorkYear": 2017,
      "repairAge": 9,
      "interrepairTerm": 5,
      "plan2026Roads": false,
      "plan2027Roads": true,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": false,
      "reason": "Истек межремонтный срок; Низкий процент покрытия",
      "priorityScore": 0.99,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.586,
                55.865
              ],
              [
                37.59,
                55.8651
              ],
              [
                37.5896,
                55.8628
              ],
              [
                37.5857,
                55.863
              ],
              [
                37.586,
                55.865
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.5866,
                55.8647
              ],
              [
                37.5888,
                55.8648
              ],
              [
                37.5885,
                55.8635
              ],
              [
                37.5866,
                55.8636
              ],
              [
                37.5866,
                55.8647
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 200114,
      "oghId": 200114,
      "objectType": "Объект дорожного хозяйства",
      "name": "Митинский проезд",
      "status": "Действующий",
      "district": "СЗАО",
      "area": "Митино",
      "department": "Префектура СЗАО",
      "sourceType": "Объекты ОДХ",
      "totalArea": 4540,
      "coveredArea": 680,
      "uncoveredArea": 3860,
      "coveragePercent": 14.98,
      "recommendedVolume": 3860,
      "estimatedCost": 12352000,
      "lastWorkYear": 2016,
      "repairAge": 10,
      "interrepairTerm": 5,
      "plan2026Roads": false,
      "plan2027Roads": false,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": true,
      "reason": "Не проводились полноценные работы",
      "priorityScore": 0.99,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.361,
                55.846
              ],
              [
                37.365,
                55.8461
              ],
              [
                37.3646,
                55.8438
              ],
              [
                37.3607,
                55.844
              ],
              [
                37.361,
                55.846
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.3616,
                55.8457
              ],
              [
                37.3638,
                55.8458
              ],
              [
                37.3635,
                55.8445
              ],
              [
                37.3616,
                55.8446
              ],
              [
                37.3616,
                55.8457
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 200115,
      "oghId": 200115,
      "objectType": "Объект дорожного хозяйства",
      "name": "Рязанский проспект дублер",
      "status": "Действующий",
      "district": "ЮВАО",
      "area": "Рязанский",
      "department": "Префектура ЮВАО",
      "sourceType": "Работы на ОДХ",
      "totalArea": 10240,
      "coveredArea": 2630,
      "uncoveredArea": 7610,
      "coveragePercent": 25.68,
      "recommendedVolume": 7610,
      "estimatedCost": 24352000,
      "lastWorkYear": 2022,
      "repairAge": 4,
      "interrepairTerm": 4,
      "plan2026Roads": true,
      "plan2027Roads": true,
      "roadInterrepairViolation": false,
      "noImprovementUntil25": false,
      "reason": "Низкий процент покрытия",
      "priorityScore": 0.9246,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.78,
                55.721
              ],
              [
                37.784,
                55.7211
              ],
              [
                37.7836,
                55.7188
              ],
              [
                37.7797,
                55.719
              ],
              [
                37.78,
                55.721
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.7806,
                55.7207
              ],
              [
                37.7828,
                55.7208
              ],
              [
                37.7825,
                55.7195
              ],
              [
                37.7806,
                55.7196
              ],
              [
                37.7806,
                55.7207
              ]
            ]
          ]
        }
      }
    },
    {
      "objectId": 200116,
      "oghId": 200116,
      "objectType": "Объект дорожного хозяйства",
      "name": "Свободный проспект, местный проезд",
      "status": "Действующий",
      "district": "ВАО",
      "area": "Ивановское",
      "department": "Префектура ВАО",
      "sourceType": "Работы на ОКБ",
      "totalArea": 4980,
      "coveredArea": 620,
      "uncoveredArea": 4360,
      "coveragePercent": 12.45,
      "recommendedVolume": 4360,
      "estimatedCost": 13952000,
      "lastWorkYear": null,
      "repairAge": null,
      "interrepairTerm": 4,
      "plan2026Roads": true,
      "plan2027Roads": false,
      "roadInterrepairViolation": true,
      "noImprovementUntil25": true,
      "reason": "Не проводились работы; Выявлены неблагоустроенные участки (QGIS)",
      "priorityScore": 0.8861,
      "priorityLevel": "high",
      "geometry": {
        "odh": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.824,
                55.758
              ],
              [
                37.828,
                55.7581
              ],
              [
                37.8276,
                55.7558
              ],
              [
                37.8237,
                55.756
              ],
              [
                37.824,
                55.758
              ]
            ]
          ]
        },
        "qgis": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.8246,
                55.7577
              ],
              [
                37.8268,
                55.7578
              ],
              [
                37.8265,
                55.7565
              ],
              [
                37.8246,
                55.7566
              ],
              [
                37.8246,
                55.7577
              ]
            ]
          ]
        }
      }
    }
  ]
};


(() => {
  const APP = window.APP_DATA || {};
  const $ = (id) => document.getElementById(id);

  const TOOL_OPTIONS = [
    {
      code: 'predictive',
      title: 'Инструмент предиктивного анализа',
      description: 'Рабочий сценарий для отбора ОДХ, настройки наборов сравнения, фильтрации и формирования итогового реестра неблагоустроенных объектов.'
    },
    {
      code: 'coverage',
      title: 'Инструмент оценки покрытия территорий',
      description: 'Резервный сценарий для будущего расчёта покрытия и анализа благоустроенности по территориальным зонам.'
    },
    {
      code: 'compare',
      title: 'Инструмент сценарного сопоставления наборов',
      description: 'Резервный сценарий для будущего сопоставления и сравнения нескольких тематических наборов данных.'
    }
  ];

  const DATASETS = {
    ogh: {
      code: 'ogh',
      title: 'Набор ОДХ',
      description: 'Основной анализируемый набор дорожных объектов.',
      short: 'ОДХ'
    },
    sok: {
      code: 'sok',
      title: 'Набор благоустройства (СОК)',
      description: 'Сравниваемый набор работ и благоустройства из СОК.',
      short: 'СОК'
    },
    krr: {
      code: 'krr',
      title: 'Набор благоустройства (КРР)',
      description: 'Сравниваемый набор работ и благоустройства из КРР.',
      short: 'КРР'
    }
  };

  const DATASET_ORDER = ['ogh', 'sok', 'krr'];

  const baseWeights = APP.baseWeights || {
    coveragePercent: 35,
    repairAge: 25,
    estimatedCost: 20,
    recommendedVolume: 20
  };

  const weightLabels = {
    coveragePercent: 'Процент покрытия',
    repairAge: 'Давность ремонта',
    estimatedCost: 'Ориентировочная стоимость',
    recommendedVolume: 'Рекомендуемый объём'
  };

  function uniqueValues(key) {
    return [...new Set((APP.objects || []).map((item) => item[key]).filter(Boolean))].sort();
  }

  const FILTER_FIELDS = {
    ogh: [
      { code: 'kind', label: 'Вид', type: 'enum', options: ['ОДХ', 'ОКБ'] },
      { code: 'passportEndDate', label: 'Дата окончания паспорта', type: 'date' },
      { code: 'name', label: 'Наименование', type: 'text' },
      { code: 'district', label: 'Округ', type: 'enum', options: uniqueValues('district') },
      { code: 'area', label: 'Район', type: 'enum', options: uniqueValues('area') },
      { code: 'department', label: 'ОИВ', type: 'enum', options: uniqueValues('department') },
      { code: 'lastWorkYear', label: 'Последний год работ', type: 'number' }
    ],
    sok: [
      { code: 'compareObjectType', label: 'Тип объекта', type: 'enum', options: ['ОДХ', 'ОКБ'] },
      { code: 'workYear', label: 'Год проведения работ', type: 'number' },
      { code: 'workType', label: 'Вид работ', type: 'enum', options: ['Асфальт 1', 'Асфальт 2', 'Асфальт 3', 'Озеленение', 'Бортовой камень'] },
      { code: 'district', label: 'Округ', type: 'enum', options: uniqueValues('district') },
      { code: 'area', label: 'Район', type: 'enum', options: uniqueValues('area') }
    ],
    krr: [
      { code: 'compareObjectType', label: 'Тип объекта', type: 'enum', options: ['ОДХ', 'ОКБ'] },
      { code: 'workYear', label: 'Год проведения работ', type: 'number' },
      { code: 'workType', label: 'Вид работ', type: 'enum', options: ['Асфальт 1', 'Асфальт 2', 'Асфальт 3', 'Озеленение', 'Бортовой камень'] },
      { code: 'district', label: 'Округ', type: 'enum', options: uniqueValues('district') },
      { code: 'area', label: 'Район', type: 'enum', options: uniqueValues('area') }
    ]
  };

  const steps = ['Инструмент', 'Наборы', 'Фильтры', 'Приоритизация', 'Результат'];

  const state = {
    tool: 'predictive',
    mainDataset: 'ogh',
    compareDatasets: ['sok', 'krr'],
    filters: {},
    useCustomWeights: false,
    weights: { ...baseWeights },
    customPriorityRules: [],
    results: [],
    resultMeta: null,
    currentStep: 1,
    map: null,
    mapLayer: null
  };

  const mainRecords = buildMainRecords(APP.objects || []);
  const compareRecords = {
    sok: buildCompareRecords(mainRecords, 'sok'),
    krr: buildCompareRecords(mainRecords, 'krr')
  };

  function buildMainRecords(objects) {
    return objects.map((item, index) => {
      const month = String((index % 9) + 1).padStart(2, '0');
      const day = String(((index * 3) % 27) + 1).padStart(2, '0');
      const year = 2024 + (index % 3);
      return {
        ...item,
        kind: 'ОДХ',
        passportEndDate: `${year}-${month}-${day}`,
        searchText: `${item.name} ${item.district} ${item.area}`.toLowerCase()
      };
    });
  }

  function buildCompareRecords(objects, datasetCode) {
    return objects.flatMap((item, index) => {
      const setup = datasetCode === 'sok'
        ? { base: 2016, span: 10 }
        : { base: 2019, span: 7 };
      const records = [];
      const types = ['Асфальт 1', 'Асфальт 2', 'Асфальт 3', 'Озеленение', 'Бортовой камень'];
      const firstType = index % 2 === 0 ? 'ОДХ' : 'ОКБ';
      const secondType = firstType === 'ОДХ' ? 'ОКБ' : 'ОДХ';
      records.push({
        compareId: `${datasetCode}-${item.objectId}-a`,
        linkObjectId: item.objectId,
        datasetCode,
        datasetLabel: DATASETS[datasetCode].title,
        district: item.district,
        area: item.area,
        name: `${DATASETS[datasetCode].short} · ${item.name}`,
        compareObjectType: firstType,
        workYear: setup.base + (index % setup.span),
        workType: types[index % types.length],
        geometry: item.geometry,
        sourceName: item.name
      });
      records.push({
        compareId: `${datasetCode}-${item.objectId}-b`,
        linkObjectId: item.objectId,
        datasetCode,
        datasetLabel: DATASETS[datasetCode].title,
        district: item.district,
        area: item.area,
        name: `${DATASETS[datasetCode].short} · ${item.name} · доп`,
        compareObjectType: secondType,
        workYear: setup.base + ((index + 3) % setup.span),
        workType: types[(index + 2) % types.length],
        geometry: item.geometry,
        sourceName: item.name
      });
      return records;
    });
  }

  function cryptoId() {
    return Math.random().toString(36).slice(2, 10);
  }

  function defaultOperator(type) {
    if (type === 'number' || type === 'date') return 'gte';
    if (type === 'enum') return 'eq';
    return 'contains';
  }

  function operatorsFor(type) {
    if (type === 'number' || type === 'date') {
      return [['eq', 'Равно'], ['gte', 'Больше или равно'], ['lte', 'Меньше или равно'], ['between', 'Между']];
    }
    if (type === 'enum') {
      return [['eq', 'Равно'], ['in', 'В списке']];
    }
    return [['contains', 'Содержит'], ['eq', 'Равно']];
  }

  function getFieldMeta(datasetCode, fieldCode) {
    return (FILTER_FIELDS[datasetCode] || []).find((field) => field.code === fieldCode);
  }

  function createRow(datasetCode, join = 'AND') {
    const field = FILTER_FIELDS[datasetCode]?.[0];
    return {
      id: cryptoId(),
      join,
      field: field?.code || 'name',
      operator: defaultOperator(field?.type || 'text'),
      value1: '',
      value2: ''
    };
  }

  function createFilterGroup(datasetCode) {
    return {
      id: cryptoId(),
      datasetCode,
      enabled: true,
      allData: false,
      rows: [createRow(datasetCode)]
    };
  }

  function resetFilters() {
    state.filters = {
      ogh: createFilterGroup('ogh'),
      sok: createFilterGroup('sok'),
      krr: createFilterGroup('krr')
    };
  }

  function createPriorityRule(datasetCode = 'ogh') {
    const field = FILTER_FIELDS[datasetCode][0];
    return {
      id: cryptoId(),
      datasetCode,
      field: field.code,
      operator: defaultOperator(field.type),
      value1: '',
      value2: '',
      coefficient: 10
    };
  }

  function init() {
    resetFilters();
    renderStepper();
    renderToolOptions();
    renderDatasetPickers();
    renderBaseWeights();
    renderWeightsPanel();
    renderFilters();
    renderScenarioSummary();
    bindEvents();
    updateToolHeader();
  }

  function bindEvents() {
    $('toolSelect').addEventListener('change', (e) => {
      state.tool = e.target.value;
      updateToolHeader();
      renderScenarioSummary();
    });

    $('goToDatasetsBtn').addEventListener('click', () => {
      $('datasetsSection').classList.remove('hidden');
      state.currentStep = 2;
      renderStepper();
      window.scrollTo({ top: $('datasetsSection').offsetTop - 20, behavior: 'smooth' });
    });

    $('goToFiltersBtn').addEventListener('click', () => {
      if (!state.mainDataset) return alert('Выберите анализируемый набор.');
      if (!state.compareDatasets.length) return alert('Выберите хотя бы один набор для сравнения.');
      $('filtersSection').classList.remove('hidden');
      state.currentStep = 3;
      renderStepper();
      renderFilters();
      renderScenarioSummary();
      window.scrollTo({ top: $('filtersSection').offsetTop - 20, behavior: 'smooth' });
    });

    $('fillScenarioBtn').addEventListener('click', applyTestScenario);

    $('weightsToggle').addEventListener('change', (e) => {
      state.useCustomWeights = e.target.checked;
      $('weightsPanel').classList.toggle('hidden', !state.useCustomWeights);
      state.currentStep = state.useCustomWeights ? 4 : 3;
      renderStepper();
      renderWeightsPanel();
      renderScenarioSummary();
    });

    $('runAnalysisBtn').addEventListener('click', runAnalysis);
    $('resetBtn').addEventListener('click', resetAll);
    $('exportBtn').addEventListener('click', exportExcel);
  }

  function renderStepper() {
    $('stepper').innerHTML = steps.map((title, index) => {
      const stepNumber = index + 1;
      const cls = stepNumber < state.currentStep ? 'is-done' : stepNumber === state.currentStep ? 'is-active' : '';
      return `<div class="step ${cls}"><span class="step-index">Шаг ${stepNumber}</span><span class="step-title">${title}</span></div>`;
    }).join('');
  }

  function renderToolOptions() {
    $('toolSelect').innerHTML = TOOL_OPTIONS.map((tool) => `<option value="${tool.code}" ${tool.code === state.tool ? 'selected' : ''}>${tool.title}</option>`).join('');
    const active = TOOL_OPTIONS.find((tool) => tool.code === state.tool);
    $('toolDescription').textContent = active?.description || '';
  }

  function updateToolHeader() {
    const active = TOOL_OPTIONS.find((tool) => tool.code === state.tool);
    $('activeToolBadge').textContent = active?.title || 'Не выбран';
    $('toolDescription').textContent = active?.description || '';
  }

  function availableCompareDatasets() {
    return DATASET_ORDER.filter((code) => code !== state.mainDataset);
  }

  function renderDatasetPickers() {
    $('mainDatasetPicker').innerHTML = DATASET_ORDER.map((code) => renderDatasetOption(DATASETS[code], true, state.mainDataset === code)).join('');
    $('compareDatasetPicker').innerHTML = availableCompareDatasets().map((code) => renderDatasetOption(DATASETS[code], false, state.compareDatasets.includes(code))).join('');

    $('mainDatasetPicker').querySelectorAll('input[name="mainDataset"]').forEach((input) => {
      input.addEventListener('change', (e) => {
        state.mainDataset = e.target.value;
        state.compareDatasets = availableCompareDatasets();
        renderDatasetPickers();
        renderFilters();
        renderWeightsPanel();
        renderScenarioSummary();
      });
    });

    $('compareDatasetPicker').querySelectorAll('input[name="compareDataset"]').forEach((input) => {
      input.addEventListener('change', (e) => {
        if (e.target.checked) {
          if (!state.compareDatasets.includes(e.target.value)) state.compareDatasets.push(e.target.value);
        } else {
          state.compareDatasets = state.compareDatasets.filter((code) => code !== e.target.value);
        }
        renderFilters();
        renderWeightsPanel();
        renderScenarioSummary();
      });
    });
  }

  function renderDatasetOption(dataset, radio, checked) {
    return `
      <label class="dataset-option">
        <input type="${radio ? 'radio' : 'checkbox'}" name="${radio ? 'mainDataset' : 'compareDataset'}" value="${dataset.code}" ${checked ? 'checked' : ''}>
        <div>
          <div class="dataset-option-title">${dataset.title}</div>
          <div class="dataset-option-description">${dataset.description}</div>
        </div>
      </label>
    `;
  }

  function renderBaseWeights() {
    $('baseWeightsChips').innerHTML = Object.entries(baseWeights).map(([key, value]) => `<span class="chip">${weightLabels[key]} — ${value}%</span>`).join('');
  }

  function activeFilterDatasets() {
    return [state.mainDataset, ...state.compareDatasets].filter(Boolean);
  }

  function renderFilters() {
    const blocks = activeFilterDatasets().map((datasetCode) => renderFilterBlock(datasetCode)).join('');
    $('filtersBlocks').innerHTML = blocks;
    bindFilterEvents();
  }

  function renderFilterBlock(datasetCode) {
    const dataset = DATASETS[datasetCode];
    const group = state.filters[datasetCode];
    const role = datasetCode === state.mainDataset ? 'Основной набор' : 'Набор сравнения';
    return `
      <section class="filter-block" data-dataset-block="${datasetCode}">
        <div class="filter-block-head">
          <div>
            <div class="filter-block-title-line">
              <span class="role-pill ${datasetCode === state.mainDataset ? 'main' : 'compare'}">${role}</span>
              <h3>${dataset.title}</h3>
            </div>
            <p>${dataset.description}</p>
          </div>
        </div>
        <div class="group-box highlighted" data-group-id="${group.id}" data-dataset-code="${datasetCode}">
          <div class="group-head single-group-head">
            <div>
              <div class="group-title">Группа условий для набора</div>
              <div class="group-logic-note">Внутри одной группы можно смешивать связи <strong>И</strong> и <strong>ИЛИ</strong> между строками.</div>
            </div>
            <label class="take-all-toggle">
              <input type="checkbox" data-all-data-toggle="${datasetCode}" ${group.allData ? 'checked' : ''}>
              <span>Взять в анализ все данные без фильтрации</span>
            </label>
          </div>
          <div class="rows ${group.allData ? 'disabled-area' : ''}">
            ${group.rows.map((row, index) => renderRow(datasetCode, row, index)).join('')}
          </div>
          <div class="group-footer ${group.allData ? 'disabled-area' : ''}">
            <div class="group-logic-note">Группу удалить нельзя — редактируется только её содержимое.</div>
            <button class="btn btn-secondary btn-small" data-add-row="${datasetCode}" ${group.allData ? 'disabled' : ''}>Добавить условие</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderRow(datasetCode, row, index) {
    const fields = FILTER_FIELDS[datasetCode] || [];
    const meta = getFieldMeta(datasetCode, row.field) || fields[0];
    const operators = operatorsFor(meta.type);
    const isBetween = row.operator === 'between';
    const placeholder = meta.type === 'text' ? 'Введите значение' : meta.type === 'number' ? 'Например, 2025' : '';
    return `
      <div class="row-filter ${isBetween ? '' : 'single-value'}" data-row-id="${row.id}">
        ${index === 0 ? `<div class="logic-anchor">Старт</div>` : `
          <label class="field logic-field">
            <span class="field-label">Связь</span>
            <select data-row-join="${row.id}" data-dataset-code="${datasetCode}">
              <option value="AND" ${row.join === 'AND' ? 'selected' : ''}>И</option>
              <option value="OR" ${row.join === 'OR' ? 'selected' : ''}>ИЛИ</option>
            </select>
          </label>
        `}
        <label class="field">
          <span class="field-label">Атрибут</span>
          <select data-row-field="${row.id}" data-dataset-code="${datasetCode}">
            ${fields.map((field) => `<option value="${field.code}" ${field.code === row.field ? 'selected' : ''}>${field.label}</option>`).join('')}
          </select>
        </label>
        <label class="field">
          <span class="field-label">Оператор</span>
          <select data-row-operator="${row.id}" data-dataset-code="${datasetCode}">
            ${operators.map(([code, label]) => `<option value="${code}" ${code === row.operator ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </label>
        ${isBetween ? `
          <label class="field">
            <span class="field-label">Значение</span>
            <div class="range-box">
              ${renderValueControl(datasetCode, row, meta, 'value1', placeholder)}
              ${renderValueControl(datasetCode, row, meta, 'value2', placeholder)}
            </div>
          </label>
        ` : `
          <label class="field">
            <span class="field-label">Значение</span>
            ${renderValueControl(datasetCode, row, meta, 'value1', placeholder)}
          </label>
        `}
        <button class="btn btn-secondary btn-small btn-danger" data-remove-row="${row.id}" data-dataset-code="${datasetCode}" ${state.filters[datasetCode].rows.length === 1 ? 'disabled' : ''}>Удалить</button>
      </div>
    `;
  }

  function renderValueControl(datasetCode, row, meta, valueKey, placeholder) {
    const value = row[valueKey] || '';
    if (meta.type === 'enum' && row.operator !== 'in') {
      return `
        <select data-row-value="${row.id}" data-value-key="${valueKey}" data-dataset-code="${datasetCode}">
          <option value="">Выберите</option>
          ${meta.options.map((option) => `<option value="${option}" ${option === value ? 'selected' : ''}>${option}</option>`).join('')}
        </select>
      `;
    }
    if (meta.type === 'date') {
      return `<input type="date" value="${value}" data-row-value="${row.id}" data-value-key="${valueKey}" data-dataset-code="${datasetCode}">`;
    }
    if (meta.type === 'number') {
      return `<input type="number" value="${value}" placeholder="${placeholder}" data-row-value="${row.id}" data-value-key="${valueKey}" data-dataset-code="${datasetCode}">`;
    }
    const fieldPlaceholder = row.operator === 'in' ? 'Через запятую' : placeholder;
    return `<input type="text" value="${value}" placeholder="${fieldPlaceholder}" data-row-value="${row.id}" data-value-key="${valueKey}" data-dataset-code="${datasetCode}">`;
  }

  function bindFilterEvents() {
    document.querySelectorAll('[data-all-data-toggle]').forEach((input) => {
      input.addEventListener('change', () => {
        state.filters[input.dataset.allDataToggle].allData = input.checked;
        renderFilters();
        renderScenarioSummary();
      });
    });

    document.querySelectorAll('[data-add-row]').forEach((button) => {
      button.addEventListener('click', () => {
        const datasetCode = button.dataset.addRow;
        state.filters[datasetCode].rows.push(createRow(datasetCode, 'AND'));
        renderFilters();
        renderScenarioSummary();
      });
    });

    document.querySelectorAll('[data-remove-row]').forEach((button) => {
      button.addEventListener('click', () => {
        const datasetCode = button.dataset.datasetCode;
        const rowId = button.dataset.removeRow;
        const rows = state.filters[datasetCode].rows.filter((row) => row.id !== rowId);
        state.filters[datasetCode].rows = rows.length ? rows : [createRow(datasetCode)];
        renderFilters();
        renderScenarioSummary();
      });
    });

    document.querySelectorAll('[data-row-join]').forEach((select) => {
      select.addEventListener('change', () => {
        const datasetCode = select.dataset.datasetCode;
        const row = state.filters[datasetCode].rows.find((item) => item.id === select.dataset.rowJoin);
        row.join = select.value;
        renderScenarioSummary();
      });
    });

    document.querySelectorAll('[data-row-field]').forEach((select) => {
      select.addEventListener('change', () => {
        const datasetCode = select.dataset.datasetCode;
        const row = state.filters[datasetCode].rows.find((item) => item.id === select.dataset.rowField);
        const meta = getFieldMeta(datasetCode, select.value);
        row.field = select.value;
        row.operator = defaultOperator(meta.type);
        row.value1 = '';
        row.value2 = '';
        renderFilters();
        renderScenarioSummary();
      });
    });

    document.querySelectorAll('[data-row-operator]').forEach((select) => {
      select.addEventListener('change', () => {
        const datasetCode = select.dataset.datasetCode;
        const row = state.filters[datasetCode].rows.find((item) => item.id === select.dataset.rowOperator);
        row.operator = select.value;
        row.value1 = '';
        row.value2 = '';
        renderFilters();
        renderScenarioSummary();
      });
    });

    document.querySelectorAll('[data-row-value]').forEach((input) => {
      const event = input.tagName === 'SELECT' ? 'change' : 'input';
      input.addEventListener(event, () => {
        const datasetCode = input.dataset.datasetCode;
        const row = state.filters[datasetCode].rows.find((item) => item.id === input.dataset.rowValue);
        row[input.dataset.valueKey] = input.value;
        renderScenarioSummary();
      });
    });
  }

  function renderWeightsPanel() {
    const visibleDatasets = activeFilterDatasets();
    if (!state.customPriorityRules.length) {
      state.customPriorityRules = [createPriorityRule(state.mainDataset)];
    }

    $('weightsPanel').innerHTML = `
      <div class="weights-stack">
        ${Object.entries(state.weights).map(([key, value]) => `
          <div class="weight-row">
            <div>
              <div class="dataset-option-title">${weightLabels[key]}</div>
              <div class="dataset-option-description">Влияет на базовый порядок объектов в реестре.</div>
            </div>
            <input type="number" min="0" max="100" step="1" value="${value}" data-weight-key="${key}">
          </div>
        `).join('')}
      </div>
      <div class="priority-rules-box">
        <div class="card-head small-head">
          <div>
            <h3>Кастомные правила приоритизации</h3>
            <p>Можно добавить свой коэффициент по конкретному набору, атрибуту и условию.</p>
          </div>
          <button class="btn btn-secondary btn-small" id="addPriorityRuleBtn">Добавить правило</button>
        </div>
        <div class="stack compact-stack">
          ${state.customPriorityRules.map((rule, index) => renderPriorityRule(rule, index, visibleDatasets)).join('')}
        </div>
      </div>
    `;

    $('weightsPanel').querySelectorAll('[data-weight-key]').forEach((input) => {
      input.addEventListener('input', (e) => {
        state.weights[e.target.dataset.weightKey] = Number(e.target.value || 0);
        renderScenarioSummary();
      });
    });

    $('addPriorityRuleBtn')?.addEventListener('click', () => {
      state.customPriorityRules.push(createPriorityRule(state.mainDataset));
      renderWeightsPanel();
      renderScenarioSummary();
    });

    bindPriorityRuleEvents(visibleDatasets);
  }

  function renderPriorityRule(rule, index, visibleDatasets) {
    const allowedDatasets = visibleDatasets.includes(rule.datasetCode) ? visibleDatasets : [state.mainDataset, ...visibleDatasets.filter((code) => code !== state.mainDataset)];
    const fieldMeta = getFieldMeta(rule.datasetCode, rule.field) || FILTER_FIELDS[rule.datasetCode][0];
    const operatorOptions = operatorsFor(fieldMeta.type);
    const isBetween = rule.operator === 'between';
    return `
      <div class="priority-rule" data-priority-rule="${rule.id}">
        <div class="priority-rule-title">Правило ${index + 1}</div>
        <div class="priority-grid ${isBetween ? 'between' : ''}">
          <label class="field">
            <span class="field-label">Набор</span>
            <select data-priority-dataset="${rule.id}">
              ${allowedDatasets.map((code) => `<option value="${code}" ${code === rule.datasetCode ? 'selected' : ''}>${DATASETS[code].title}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span class="field-label">Атрибут</span>
            <select data-priority-field="${rule.id}">
              ${FILTER_FIELDS[rule.datasetCode].map((field) => `<option value="${field.code}" ${field.code === rule.field ? 'selected' : ''}>${field.label}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span class="field-label">Оператор</span>
            <select data-priority-operator="${rule.id}">
              ${operatorOptions.map(([code, label]) => `<option value="${code}" ${code === rule.operator ? 'selected' : ''}>${label}</option>`).join('')}
            </select>
          </label>
          ${isBetween ? `
            <label class="field">
              <span class="field-label">От</span>
              ${renderPriorityValue(rule, fieldMeta, 'value1')}
            </label>
            <label class="field">
              <span class="field-label">До</span>
              ${renderPriorityValue(rule, fieldMeta, 'value2')}
            </label>
          ` : `
            <label class="field">
              <span class="field-label">Значение</span>
              ${renderPriorityValue(rule, fieldMeta, 'value1')}
            </label>
          `}
          <label class="field coef-field">
            <span class="field-label">Коэффициент</span>
            <input type="number" min="0" max="100" step="1" value="${rule.coefficient}" data-priority-coef="${rule.id}">
          </label>
          <button class="btn btn-secondary btn-small btn-danger rule-remove" data-priority-remove="${rule.id}" ${state.customPriorityRules.length === 1 ? 'disabled' : ''}>Удалить</button>
        </div>
      </div>
    `;
  }

  function renderPriorityValue(rule, meta, key) {
    const value = rule[key] || '';
    if (meta.type === 'enum' && rule.operator !== 'in') {
      return `<select data-priority-value="${rule.id}" data-value-key="${key}"><option value="">Выберите</option>${meta.options.map((option) => `<option value="${option}" ${option === value ? 'selected' : ''}>${option}</option>`).join('')}</select>`;
    }
    if (meta.type === 'date') return `<input type="date" value="${value}" data-priority-value="${rule.id}" data-value-key="${key}">`;
    if (meta.type === 'number') return `<input type="number" value="${value}" data-priority-value="${rule.id}" data-value-key="${key}">`;
    return `<input type="text" value="${value}" placeholder="${rule.operator === 'in' ? 'Через запятую' : 'Введите значение'}" data-priority-value="${rule.id}" data-value-key="${key}">`;
  }

  function bindPriorityRuleEvents(visibleDatasets) {
    document.querySelectorAll('[data-priority-dataset]').forEach((select) => {
      select.addEventListener('change', () => {
        const rule = state.customPriorityRules.find((item) => item.id === select.dataset.priorityDataset);
        rule.datasetCode = select.value;
        const field = FILTER_FIELDS[rule.datasetCode][0];
        rule.field = field.code;
        rule.operator = defaultOperator(field.type);
        rule.value1 = '';
        rule.value2 = '';
        renderWeightsPanel();
      });
    });

    document.querySelectorAll('[data-priority-field]').forEach((select) => {
      select.addEventListener('change', () => {
        const rule = state.customPriorityRules.find((item) => item.id === select.dataset.priorityField);
        const meta = getFieldMeta(rule.datasetCode, select.value);
        rule.field = select.value;
        rule.operator = defaultOperator(meta.type);
        rule.value1 = '';
        rule.value2 = '';
        renderWeightsPanel();
      });
    });

    document.querySelectorAll('[data-priority-operator]').forEach((select) => {
      select.addEventListener('change', () => {
        const rule = state.customPriorityRules.find((item) => item.id === select.dataset.priorityOperator);
        rule.operator = select.value;
        rule.value1 = '';
        rule.value2 = '';
        renderWeightsPanel();
      });
    });

    document.querySelectorAll('[data-priority-value]').forEach((input) => {
      const event = input.tagName === 'SELECT' ? 'change' : 'input';
      input.addEventListener(event, () => {
        const rule = state.customPriorityRules.find((item) => item.id === input.dataset.priorityValue);
        rule[input.dataset.valueKey] = input.value;
        renderScenarioSummary();
      });
    });

    document.querySelectorAll('[data-priority-coef]').forEach((input) => {
      input.addEventListener('input', () => {
        const rule = state.customPriorityRules.find((item) => item.id === input.dataset.priorityCoef);
        rule.coefficient = Number(input.value || 0);
        renderScenarioSummary();
      });
    });

    document.querySelectorAll('[data-priority-remove]').forEach((button) => {
      button.addEventListener('click', () => {
        state.customPriorityRules = state.customPriorityRules.filter((item) => item.id !== button.dataset.priorityRemove);
        if (!state.customPriorityRules.length) state.customPriorityRules = [createPriorityRule(state.mainDataset)];
        renderWeightsPanel();
        renderScenarioSummary();
      });
    });
  }

  function renderScenarioSummary() {
    const tool = TOOL_OPTIONS.find((item) => item.code === state.tool);
    const datasetText = [DATASETS[state.mainDataset]?.title, ...state.compareDatasets.map((code) => DATASETS[code].title)].filter(Boolean).join(' · ');
    const filterCount = activeFilterDatasets().reduce((sum, code) => {
      const group = state.filters[code];
      if (!group || group.allData) return sum;
      return sum + group.rows.filter(hasValue).length;
    }, 0);
    const weightsLabel = state.useCustomWeights ? `Ручная настройка + ${state.customPriorityRules.length} кастомных правил` : 'Базовые коэффициенты';

    const summaryNode = $('scenarioSummary');
    if (!summaryNode) return;
    summaryNode.innerHTML = `
      <div class="summary-box">
        <div class="summary-box-title">Инструмент</div>
        <strong>${tool?.title || '—'}</strong>
        <div class="dataset-option-description">${tool?.description || ''}</div>
      </div>
      <div class="summary-box">
        <div class="summary-box-title">Наборы</div>
        <strong>${datasetText || 'Наборы не выбраны'}</strong>
        <div class="dataset-option-description">Основной набор: ${DATASETS[state.mainDataset]?.short || '—'}</div>
      </div>
      <div class="summary-box">
        <div class="summary-box-title">Конфигурация</div>
        <strong>${filterCount} активных условий</strong>
        <div class="dataset-option-description">Приоритизация: ${weightsLabel}</div>
      </div>
    `;
  }

  function hasValue(row) {
    return Boolean(row.value1) || Boolean(row.value2);
  }

  function applyTestScenario() {
    state.mainDataset = 'ogh';
    state.compareDatasets = ['sok', 'krr'];
    renderDatasetPickers();

    state.filters.ogh = {
      ...createFilterGroup('ogh'),
      rows: [
        { id: cryptoId(), join: 'AND', field: 'kind', operator: 'eq', value1: 'ОДХ', value2: '' },
        { id: cryptoId(), join: 'AND', field: 'passportEndDate', operator: 'gte', value1: '2025-08-31', value2: '' }
      ]
    };

    state.filters.sok = {
      ...createFilterGroup('sok'),
      rows: [
        { id: cryptoId(), join: 'AND', field: 'compareObjectType', operator: 'eq', value1: 'ОДХ', value2: '' },
        { id: cryptoId(), join: 'AND', field: 'workYear', operator: 'between', value1: '2016', value2: '2025' },
        { id: cryptoId(), join: 'AND', field: 'workType', operator: 'in', value1: 'Асфальт 1, Асфальт 2, Асфальт 3', value2: '' },
        { id: cryptoId(), join: 'OR', field: 'compareObjectType', operator: 'eq', value1: 'ОКБ', value2: '' },
        { id: cryptoId(), join: 'AND', field: 'workYear', operator: 'between', value1: '2024', value2: '2025' },
        { id: cryptoId(), join: 'AND', field: 'workType', operator: 'in', value1: 'Асфальт 1, Асфальт 2, Асфальт 3', value2: '' }
      ]
    };

    state.filters.krr = {
      ...createFilterGroup('krr'),
      rows: [
        { id: cryptoId(), join: 'AND', field: 'compareObjectType', operator: 'eq', value1: 'ОКБ', value2: '' },
        { id: cryptoId(), join: 'AND', field: 'workYear', operator: 'between', value1: '2019', value2: '2023' },
        { id: cryptoId(), join: 'AND', field: 'workType', operator: 'in', value1: 'Асфальт 1, Асфальт 2, Асфальт 3', value2: '' }
      ]
    };

    renderFilters();
    renderScenarioSummary();
    alert('Тестовый сценарий заполнен. Структура уже соответствует новой логике по наборам и строкам условий.');
  }

  function evaluateDataset(records, datasetCode) {
    const group = state.filters[datasetCode];
    if (!group || group.allData) return records.slice();
    const activeRows = group.rows.filter(hasValue);
    if (!activeRows.length) return records.slice();
    return records.filter((record) => evaluateRows(record, activeRows, datasetCode));
  }

  function evaluateRows(record, rows, datasetCode) {
    if (!rows.length) return true;
    let result = evaluateRow(record, rows[0], datasetCode);
    for (let i = 1; i < rows.length; i += 1) {
      const rowResult = evaluateRow(record, rows[i], datasetCode);
      result = rows[i].join === 'OR' ? (result || rowResult) : (result && rowResult);
    }
    return result;
  }

  function evaluateRow(record, row, datasetCode) {
    const meta = getFieldMeta(datasetCode, row.field);
    const recordValue = record[row.field];
    const operator = row.operator;
    const value1 = row.value1;
    const value2 = row.value2;

    if (operator === 'contains') return String(recordValue || '').toLowerCase().includes(String(value1 || '').toLowerCase());
    if (operator === 'eq') return normalize(recordValue, meta?.type) === normalize(value1, meta?.type);
    if (operator === 'gte') return comparable(recordValue, meta?.type) >= comparable(value1, meta?.type);
    if (operator === 'lte') return comparable(recordValue, meta?.type) <= comparable(value1, meta?.type);
    if (operator === 'between') {
      const current = comparable(recordValue, meta?.type);
      return current >= comparable(value1, meta?.type) && current <= comparable(value2, meta?.type);
    }
    if (operator === 'in') {
      const options = String(value1 || '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
      return options.includes(String(recordValue || '').trim().toLowerCase());
    }
    return true;
  }

  function normalize(value, type) {
    if (type === 'number') return Number(value);
    if (type === 'date') return String(value || '');
    return String(value || '').trim().toLowerCase();
  }

  function comparable(value, type) {
    if (type === 'number') return Number(value || 0);
    if (type === 'date') return Number(String(value || '').replaceAll('-', ''));
    return Number(value || 0);
  }

  async function runAnalysis() {
    if (state.tool !== 'predictive') return alert('Сейчас рабочая логика реализована только для инструмента предиктивного анализа.');
    if (state.mainDataset !== 'ogh') return alert('В демо-версии расчёт результата пока поддержан только для случая, когда анализируемый набор — ОГХ.');

    state.currentStep = 5;
    renderStepper();
    $('loadingSection').classList.remove('hidden');
    $('resultsSection').classList.add('hidden');

    await showLoading('Подготовка основного набора...', 20);
    const filteredMain = evaluateDataset(mainRecords, 'ogh');

    await showLoading('Подготовка наборов сравнения...', 48);
    const filteredCompare = {};
    state.compareDatasets.forEach((code) => {
      filteredCompare[code] = evaluateDataset(compareRecords[code] || [], code);
    });

    await showLoading('Передача выборок в сервис пересечений...', 76);
    const results = buildResults(filteredMain, filteredCompare);

    await showLoading('Формирование карты и итогового реестра...', 100);
    state.results = results;
    state.resultMeta = {
      mainCount: filteredMain.length,
      compareCounts: Object.fromEntries(state.compareDatasets.map((code) => [code, filteredCompare[code]?.length || 0]))
    };

    $('loadingSection').classList.add('hidden');
    $('resultsSection').classList.remove('hidden');

    renderResults();
    window.scrollTo({ top: $('resultsSection').offsetTop - 20, behavior: 'smooth' });
  }

  function showLoading(text, percent) {
    $('loadingText').textContent = text;
    $('loadingPercent').textContent = `${percent}%`;
    $('loadingFill').style.width = `${percent}%`;
    return new Promise((resolve) => setTimeout(resolve, 260));
  }

  function buildResults(filteredMain, filteredCompare) {
    const compareByObjectId = new Map();
    state.compareDatasets.forEach((code) => {
      (filteredCompare[code] || []).forEach((record) => {
        if (!compareByObjectId.has(record.linkObjectId)) compareByObjectId.set(record.linkObjectId, []);
        compareByObjectId.get(record.linkObjectId).push(record);
      });
    });

    const enriched = filteredMain.map((item) => {
      const matches = compareByObjectId.get(item.objectId) || [];
      const matchedDatasets = [...new Set(matches.map((m) => m.datasetCode))];
      const reasonParts = [item.reason || ''];
      reasonParts.unshift(matchedDatasets.length ? `Найдено пересечений: ${matchedDatasets.map((code) => DATASETS[code].short).join(', ')}` : 'Пересечения в выбранных наборах не найдены');

      const score = calculatePriority(item, matches);
      const priorityLevel = score >= 0.72 ? 'high' : score >= 0.45 ? 'medium' : 'low';

      return {
        ...item,
        matchesCount: matches.length,
        matchedDatasets,
        priorityScore: score,
        priorityLevel,
        resultReason: reasonParts.filter(Boolean).join('; ')
      };
    }).filter((item) => item.uncoveredArea > 0);

    return enriched.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  function calculatePriority(item, compareMatches) {
    const weights = state.useCustomWeights ? state.weights : baseWeights;
    const normalized = {
      coveragePercent: 1 - clamp(item.coveragePercent / 100, 0, 1),
      repairAge: clamp(item.repairAge / 10, 0, 1),
      estimatedCost: clamp(item.estimatedCost / 40000000, 0, 1),
      recommendedVolume: clamp(item.recommendedVolume / 15000, 0, 1)
    };
    const totalWeight = Object.values(weights).reduce((sum, value) => sum + Number(value || 0), 0) || 1;
    const weighted = Object.entries(weights).reduce((sum, [key, value]) => sum + normalized[key] * Number(value || 0), 0);
    let score = weighted / totalWeight;

    if (state.useCustomWeights) {
      const bonus = state.customPriorityRules.reduce((sum, rule) => {
        if (!hasValue(rule)) return sum;
        const sourceRecords = rule.datasetCode === 'ogh' ? [item] : compareMatches.filter((match) => match.datasetCode === rule.datasetCode);
        const matched = sourceRecords.some((record) => evaluateRow(record, rule, rule.datasetCode));
        return matched ? sum + (Number(rule.coefficient || 0) / 100) : sum;
      }, 0);
      score += bonus;
    }

    return Number(clamp(score, 0, 1).toFixed(2));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function renderResults() {
    renderSummaryCards();
    renderTable();
    renderMap();
  }

  function renderSummaryCards() {
    const total = state.results.length;
    const totalCost = state.results.reduce((sum, item) => sum + Number(item.estimatedCost || 0), 0);
    const totalVolume = state.results.reduce((sum, item) => sum + Number(item.recommendedVolume || 0), 0);
    const compared = Object.values(state.resultMeta?.compareCounts || {}).reduce((sum, value) => sum + value, 0);

    $('resultSummaryCards').innerHTML = `
      <div class="summary-card">
        <div class="summary-card-title">Объекты в результате</div>
        <span class="summary-card-value">${total}</span>
        <div class="summary-card-sub">Итоговый реестр по анализируемому набору ОГХ</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-title">Записей сравнения</div>
        <span class="summary-card-value">${compared}</span>
        <div class="summary-card-sub">После применения фильтров к выбранным наборам</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-title">Рекомендуемый объём</div>
        <span class="summary-card-value">${formatNumber(totalVolume)}</span>
        <div class="summary-card-sub">Суммарный расчёт по выбранным объектам</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-title">Ориентировочная стоимость</div>
        <span class="summary-card-value">${formatCurrency(totalCost)}</span>
        <div class="summary-card-sub">Сводная оценка по итоговому реестру</div>
      </div>
    `;
  }

  function renderTable() {
    $('resultsBody').innerHTML = state.results.map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.name}</td>
        <td>${item.objectId}</td>
        <td>${item.district}</td>
        <td>${item.area}</td>
        <td>${item.resultReason}</td>
        <td>${formatDecimal(item.coveragePercent)}</td>
        <td>${formatNumber(item.coveredArea)}</td>
        <td>${formatNumber(item.uncoveredArea)}</td>
        <td>${formatNumber(item.recommendedVolume)}</td>
        <td>${formatCurrency(item.estimatedCost)}</td>
        <td>${item.lastWorkYear ?? '—'}</td>
        <td>${item.repairAge ?? '—'}</td>
        <td><span class="priority-pill ${item.priorityLevel}">${priorityLabel(item.priorityLevel)}</span></td>
        <td><button class="table-link" data-map-object="${item.objectId}">На карте</button></td>
      </tr>
    `).join('');

    $('resultsBody').querySelectorAll('[data-map-object]').forEach((button) => {
      button.addEventListener('click', () => {
        const objectId = Number(button.dataset.mapObject);
        const item = state.results.find((record) => record.objectId === objectId);
        highlightOnMap(item);
      });
    });
  }

  function renderMap() {
    if (!state.map) {
      state.map = L.map('map');
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(state.map);
    }

    if (state.mapLayer) state.map.removeLayer(state.mapLayer);

    const features = state.results.map((item) => toFeature(item));
    state.mapLayer = L.geoJSON(features, {
      style: (feature) => ({
        color: feature.properties.priorityLevel === 'high' ? '#15803d' : feature.properties.priorityLevel === 'medium' ? '#c97711' : '#d23b3b',
        weight: 2,
        fillOpacity: .18
      }),
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<strong>${feature.properties.name}</strong><br>${feature.properties.area}, ${feature.properties.district}<br>Приоритет: ${priorityLabel(feature.properties.priorityLevel)}`);
      }
    }).addTo(state.map);

    if (features.length) state.map.fitBounds(state.mapLayer.getBounds(), { padding: [20, 20] });
    else state.map.setView([55.751244, 37.618423], 10);

    setTimeout(() => state.map.invalidateSize(), 50);
  }

  function toFeature(item) {
    const geometry = item.geometry?.odh || item.geometry?.qgis || item.geometry;
    return {
      type: 'Feature',
      geometry,
      properties: {
        objectId: item.objectId,
        name: item.name,
        area: item.area,
        district: item.district,
        priorityLevel: item.priorityLevel
      }
    };
  }

  function highlightOnMap(item) {
    if (!item || !state.mapLayer) return;
    const targetLayer = state.mapLayer.getLayers().find((layer) => layer.feature?.properties?.objectId === item.objectId);
    if (!targetLayer) return;
    state.map.fitBounds(targetLayer.getBounds(), { padding: [30, 30] });
    targetLayer.openPopup();
  }

  function priorityLabel(value) {
    if (value === 'high') return 'Высокий';
    if (value === 'medium') return 'Средний';
    return 'Низкий';
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Number(value || 0));
  }

  function formatDecimal(value) {
    return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Number(value || 0));
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(Number(value || 0));
  }

  function exportExcel() {
    const rows = state.results.map((item, index) => ({
      '№': index + 1,
      'Объект': item.name,
      'ID ОГХ': item.objectId,
      'Округ': item.district,
      'Район': item.area,
      'Основание включения': item.resultReason,
      'Покрытие, %': item.coveragePercent,
      'Покрытая площадь': item.coveredArea,
      'Непокрытая площадь': item.uncoveredArea,
      'Рекомендуемый объём': item.recommendedVolume,
      'Стоимость': item.estimatedCost,
      'Последний год работ': item.lastWorkYear,
      'Давность ремонта': item.repairAge,
      'Приоритет': priorityLabel(item.priorityLevel)
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Реестр ОГХ');
    XLSX.writeFile(workbook, 'itogovy_reestr_ogh.xlsx');
  }

  function resetAll() {
    state.tool = 'predictive';
    state.mainDataset = 'ogh';
    state.compareDatasets = ['sok', 'krr'];
    state.useCustomWeights = false;
    state.weights = { ...baseWeights };
    state.customPriorityRules = [createPriorityRule('ogh')];
    state.results = [];
    state.resultMeta = null;
    state.currentStep = 1;
    $('datasetsSection').classList.add('hidden');
    $('filtersSection').classList.add('hidden');
    $('loadingSection').classList.add('hidden');
    $('resultsSection').classList.add('hidden');
    $('weightsToggle').checked = false;
    $('weightsPanel').classList.add('hidden');
    resetFilters();
    renderToolOptions();
    renderDatasetPickers();
    renderBaseWeights();
    renderWeightsPanel();
    renderFilters();
    renderScenarioSummary();
    renderStepper();
    updateToolHeader();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  init();
})();
