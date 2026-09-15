from __future__ import annotations

import json

from .evaluator import run_retrieval_evaluations


def main() -> int:
    results = run_retrieval_evaluations()
    print(json.dumps(results, indent=2))
    return 0 if all(result["passed"] for result in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
