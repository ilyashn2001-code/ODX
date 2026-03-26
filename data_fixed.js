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
