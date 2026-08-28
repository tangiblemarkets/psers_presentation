"""
export.py — after editing the Excel workbook, run:

    python3 tools/export.py

Writes CFG.rows in js/data.js from the Excel file.
The deck then computes every slide from CFG.rows.
"""

import os
import sys
import time

sys.path.insert(0, os.path.dirname(__file__))

from psers_data_pipeline import load_included_rows, build_clean_records
import export_cfg_rows


def main():
    t0 = time.time()
    print("Reading source-data/*.xlsx ...")
    included = load_included_rows()
    print(f"  {len(included)} Include rows loaded.")
    records = build_clean_records(included)
    result = export_cfg_rows.run(records)
    print(f"  - {result['slide']}: {result['output']}")
    print(f"\nDone in {time.time() - t0:.1f}s.")


if __name__ == "__main__":
    main()
