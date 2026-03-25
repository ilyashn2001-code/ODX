#!/usr/bin/env python3
"""
Подготовка тяжелой CSV-выгрузки ОГХ для фронтового прототипа.

Что делает скрипт:
1. Читает исходный CSV потоково.
2. Сохраняет полный список колонок.
3. Делит колонки на 3 логических набора:
   - Объекты ОДХ
   - Работы на ОДХ
   - Работы на ОКБ
4. Пытается собрать "облегченный" фронтовый JSON для GitHub Pages.
5. Формирует отчет о качестве парсинга.

Важно:
- исходный CSV частично "ломается" из-за запятой как разделителя дробной части;
- скрипт использует эвристику;
- для прототипа этого достаточно;
- для production лучше перевыгрузить исходник в TSV / XLSX / корректный CSV.
"""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path
from typing import Dict, List, Tuple, Any

# ==== НАСТРОЙКИ ====
SOURCE_CSV = Path("ОГХ_выгрузка 260126 (2).csv")
OUTPUT_DIR = Path("prepared_output")
MAX_FRONTEND_ROWS = 300
ENCODING = "utf-8-sig"

# ==== СЛУЖЕБНЫЕ РЕГУЛЯРКИ ====
INTEGER_RE = re.compile(r"^\s*-?\d+\s*$")
BOOL_RE = re.compile(r"^(true|false)$", re.I)


def classify_header(header: str) -> str:
    h = header.lower()

    if (
        "геометр" in h
        or "статус" in h
        or "наименование" in h
        or "адрес" in h
        or "ведомственный оив" in h
        or "балансодержатель" in h
        or "заказчик" in h
        or (("район" in h or "округ" in h) and "код" not in h)
        or "тип огх" in h
        or "дата " in h
    ):
        return "text"

    if "площад" in h or "процент" in h:
        return "decimal"

    if "благо не проводилось" in h or "нарушение" in h or "наличие плана" in h:
        return "bool"

    if any(k in h for k in ["количе", "год", "срок", "код", "ид ", "идентификатор", "id", "инн", "ключ"]) or h.startswith("ид "):
        return "int"

    return "text"


def split_headers_to_datasets(headers: List[str]) -> Dict[str, List[str]]:
    odh, works_odh, works_okb = [], [], []

    for h in headers:
        hl = h.lower()

        if any(k in hl for k in [
            "геометрия огх", "ид огх", "тип огх", "наименование", "дата начала", "дата окончания",
            "балансодержатель", "заказчик", "статус", "id версии", "адрес",
            "округ", "район", "ведомственный оив", "код категории", "категории одх",
            "площадь огх", "площадь", "ключ для справочника", "идентификатор"
        ]):
            odh.append(h)

        if any(k in hl for k in [
            "дорог", "последний год работ", "нарушение межремонтного срока", "наличие плана на 2026",
            "наличие плана на 2027", "площадь дороги", "количество дороги"
        ]):
            works_odh.append(h)

        if any(k in hl for k in [
            "окб", "все)", "все,", "благо не проводилось", "срок + год",
            "последний год проведения", "межремонтный срок"
        ]):
            works_okb.append(h)

    return {
        "Объекты ОДХ": list(dict.fromkeys(odh)),
        "Работы на ОДХ": list(dict.fromkeys(works_odh)),
        "Работы на ОКБ": list(dict.fromkeys(works_okb)),
    }


def parse_row_heuristic(raw_row: List[str], headers: List[str], kinds: List[str]) -> Tuple[Dict[str, str], Dict[str, Any]]:
    """
    Важный момент:
    исходник ломается в основном на дробных числах и геометрии.
    Поэтому:
    - левую часть парсим до геометрии;
    - середину с геометрией собираем как сырую строку;
    - правую часть не пытаемся идеально восстановить, а бережно кладем в raw_tail.
    """
    geom_start_idx = None
    for idx, h in enumerate(headers):
        if h.lower() == "геометрия огх":
            geom_start_idx = idx
            break

    if geom_start_idx is None:
        geom_start_idx = len(headers)

    out: Dict[str, str] = {}
    parse_info = {
        "raw_len": len(raw_row),
        "geom_start_idx": geom_start_idx,
        "status": "ok",
        "notes": [],
    }

    i = 0
    for j in range(geom_start_idx):
        if i >= len(raw_row):
            out[headers[j]] = ""
            parse_info["status"] = "warning"
            parse_info["notes"].append("Не хватило токенов до геометрии.")
            continue

        kind = kinds[j]
        token = raw_row[i]
        consume = 1

        # для чисел с дробной частью "5494,43"
        if (
            kind == "decimal"
            and i + 1 < len(raw_row)
            and INTEGER_RE.match(raw_row[i] or "")
            and INTEGER_RE.match(raw_row[i + 1] or "")
            and len(raw_row[i + 1]) <= 8
        ):
            token = f"{raw_row[i]},{raw_row[i + 1]}"
            consume = 2

        out[headers[j]] = token
        i += consume

    # Все, что осталось, временно складываем в raw_middle
    # Это включает тяжелую геометрию и часть хвоста.
    raw_middle = ",".join(raw_row[i:])
    out["__raw_middle__"] = raw_middle

    # Попытка вытащить геометрию по ключевым словам.
    geo_ogh = ""
    geo_qgis = ""

    geo_matches = list(re.finditer(r"(MULTIPOLYGON|POLYGON)\s*\(\(", raw_middle))
    if len(geo_matches) >= 2:
        first = geo_matches[0].start()
        second = geo_matches[1].start()
        geo_ogh = raw_middle[first:second].rstrip(",")
        geo_qgis = raw_middle[second:]
    elif len(geo_matches) == 1:
        geo_ogh = raw_middle[geo_matches[0].start():]
    else:
        parse_info["notes"].append("Геометрия не распознана эвристикой.")

    out["Геометрия ОГХ (raw)"] = geo_ogh
    out["Геометрия QGIS (raw)"] = geo_qgis

    return out, parse_info


def safe_float(value: Any) -> float | None:
    if value is None:
        return None
    s = str(value).strip().replace(" ", "").replace("\xa0", "")
    if not s:
        return None
    s = s.replace(",", ".")
    try:
        return float(s)
    except Exception:
        return None


def safe_int(value: Any) -> int | None:
    f = safe_float(value)
    if f is None:
        return None
    try:
        return int(f)
    except Exception:
        return None


def strip_html_status(value: str) -> str:
    if not value:
        return ""
    clean = re.sub(r"<[^>]+>", "", str(value))
    return clean.strip()


def build_frontend_record(parsed: Dict[str, str]) -> Dict[str, Any]:
    name = parsed.get("Наименование", "")
    object_id = safe_int(parsed.get("ИД ОГХ")) or safe_int(parsed.get("Идентификатор"))
    district = parsed.get("Округ", "")
    area = parsed.get("Район", "")
    department = parsed.get("Ведомственный ОИВ", "")
    status = strip_html_status(parsed.get("Статус", ""))

    total_area = safe_float(parsed.get("Площадь"))
    covered_area = safe_float(parsed.get("Площадь дороги (за все годы), Площадь")) or 0.0
    uncovered_area = None
    if total_area is not None:
        uncovered_area = max(total_area - covered_area, 0.0)

    last_work_year = (
        safe_int(parsed.get("Последний год работ"))
        or safe_int(parsed.get("Последний год проведения до 2025 года вкл (ОКБ и ОДХ)"))
        or safe_int(parsed.get("Последний год работ процент больше 15 до 25 года вкл (ВСЕ)"))
    )

    repair_age = None
    if last_work_year:
        repair_age = 2026 - last_work_year

    coverage_percent = None
    if total_area and covered_area is not None and total_area > 0:
        coverage_percent = round((covered_area / total_area) * 100, 2)

    recommended_volume = uncovered_area if uncovered_area is not None else None
    estimated_cost = round((recommended_volume or 0) * 3200, 2) if recommended_volume is not None else None

    reason = "Недостаточное покрытие"
    no_improvement = parsed.get("Благо не проводилось до 2025 года вкл (ОКБ и ОДХ)", "").lower() == "true"
    if no_improvement:
        reason = "Работы не проводились"
    elif coverage_percent is not None and coverage_percent < 50:
        reason = "Низкий процент покрытия"
    elif repair_age is not None and repair_age >= 5:
        reason = "Давний последний ремонт"

    source_type = "Объекты ОДХ"

    if parsed.get("Количество по годам ОКБ, количество", ""):
        source_type = "Работы на ОКБ"
    elif parsed.get("Количество дороги (за все годы), Количество", ""):
        source_type = "Работы на ОДХ"

    return {
        "objectId": object_id,
        "name": name,
        "district": district,
        "area": area,
        "department": department,
        "status": status,
        "totalArea": total_area,
        "coveredArea": covered_area,
        "uncoveredArea": uncovered_area,
        "coveragePercent": coverage_percent,
        "recommendedVolume": recommended_volume,
        "estimatedCost": estimated_cost,
        "lastWorkYear": last_work_year,
        "repairAge": repair_age,
        "reason": reason,
        "sourceType": source_type,
        "rawGeometryOgh": parsed.get("Геометрия ОГХ (raw)", ""),
        "rawGeometryQgis": parsed.get("Геометрия QGIS (raw)", ""),
    }


def main() -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)

    parse_report = {
        "source_file": str(SOURCE_CSV),
        "rows_seen": 0,
        "frontend_rows_written": 0,
        "warnings": 0,
        "header_count": 0,
        "datasets_meta": {},
    }

    with SOURCE_CSV.open("r", encoding=ENCODING, newline="", errors="replace") as f:
        reader = csv.reader(f)
        headers = next(reader)
        kinds = [classify_header(h) for h in headers]

        parse_report["header_count"] = len(headers)
        split_meta = split_headers_to_datasets(headers)
        parse_report["datasets_meta"] = {
            dataset: {
                "columns_count": len(cols),
                "columns": cols,
            }
            for dataset, cols in split_meta.items()
        }

        (OUTPUT_DIR / "all_headers.json").write_text(
            json.dumps(headers, ensure_ascii=False, indent=2),
            encoding="utf-8"
        )
        (OUTPUT_DIR / "datasets_meta.json").write_text(
            json.dumps(parse_report["datasets_meta"], ensure_ascii=False, indent=2),
            encoding="utf-8"
        )

        frontend_rows: List[Dict[str, Any]] = []
        warnings_examples: List[Dict[str, Any]] = []

        for row_idx, raw_row in enumerate(reader, start=1):
            parse_report["rows_seen"] += 1

            parsed, info = parse_row_heuristic(raw_row, headers, kinds)
            if info["status"] != "ok":
                parse_report["warnings"] += 1
                if len(warnings_examples) < 20:
                    warnings_examples.append({
                        "row_idx": row_idx,
                        "notes": info["notes"],
                        "raw_len": info["raw_len"],
                    })

            if len(frontend_rows) < MAX_FRONTEND_ROWS:
                frontend_rows.append(build_frontend_record(parsed))

        parse_report["frontend_rows_written"] = len(frontend_rows)

        (OUTPUT_DIR / "frontend_sample.json").write_text(
            json.dumps(frontend_rows, ensure_ascii=False, indent=2),
            encoding="utf-8"
        )
        (OUTPUT_DIR / "warnings_examples.json").write_text(
            json.dumps(warnings_examples, ensure_ascii=False, indent=2),
            encoding="utf-8"
        )
        (OUTPUT_DIR / "parse_report.json").write_text(
            json.dumps(parse_report, ensure_ascii=False, indent=2),
            encoding="utf-8"
        )

        # JS-обертка для прямого подключения в фронт
        js_payload = "window.PREPARED_FRONTEND_SAMPLE = " + json.dumps(frontend_rows, ensure_ascii=False, indent=2) + ";"
        (OUTPUT_DIR / "frontend_sample.js").write_text(js_payload, encoding="utf-8")

    print("Готово.")
    print(f"Результаты сохранены в: {OUTPUT_DIR.resolve()}")
    print(f"Строк обработано: {parse_report['rows_seen']}")
    print(f"Строк в frontend_sample.json: {parse_report['frontend_rows_written']}")
    print(f"Предупреждений: {parse_report['warnings']}")


if __name__ == "__main__":
    main()
