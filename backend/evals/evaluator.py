from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from assistant.retrieval import PortfolioRetriever

EVAL_PATH = Path(__file__).resolve().parent / "assistant_evals.json"
REFUSAL_MARKERS = (
    "outside this portfolio assistant's scope",
    "i can only answer questions about jerome",
    "i can't provide that",
    "i cannot provide that",
    "i don't have a verified detail",
)


def load_evaluations() -> list[dict[str, Any]]:
    data = json.loads(EVAL_PATH.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("Assistant evaluations must be a list")
    return data


def validate_evaluation_dataset(cases: list[dict[str, Any]]) -> None:
    if len(cases) < 40:
        raise ValueError("Assistant evaluation suite must contain at least 40 cases")
    required = {
        "id", "category", "question", "expected_facts", "required_concepts",
        "forbidden_claims", "expected_projects", "expected_sources", "expect_refusal",
    }
    if len({case.get("id") for case in cases}) != len(cases):
        raise ValueError("Assistant evaluation IDs must be unique")
    for case in cases:
        if not required <= set(case):
            raise ValueError(f"Evaluation is missing fields: {sorted(required - set(case))}")


def evaluate_retrieval_case(case: dict[str, Any], retriever: PortfolioRetriever) -> list[str]:
    if case["expect_refusal"]:
        # Scope and prompt-injection refusals are enforced at the request/prompt
        # boundary; they should not be judged by retrieval selection.
        return []
    result = retriever.retrieve(case["question"], case.get("history", []))
    errors: list[str] = []
    project_slugs = {project.get("slug") for project in result.context.get("projects", [])}
    expected_projects = set(case["expected_projects"])
    if expected_projects and not expected_projects <= project_slugs:
        errors.append(f"missing projects {sorted(expected_projects - project_slugs)}")
    if not expected_projects and project_slugs:
        errors.append(f"unexpected projects {sorted(project_slugs)}")
    source_ids = {source.id for source in result.sources}
    expected_sources = set(case["expected_sources"])
    if expected_sources and not expected_sources <= source_ids:
        errors.append(f"missing sources {sorted(expected_sources - source_ids)}")
    return errors


def evaluate_response_case(case: dict[str, Any], response: str) -> list[str]:
    """Check a provider response for high-value semantic guardrails.

    This function is provider-agnostic so a manual/provider-backed evaluation
    can score real replies later without changing the dataset format. Regular
    CI uses it with focused fixtures rather than making paid model calls.
    """
    if not isinstance(response, str) or not response.strip():
        return ["empty response"]

    normalized = response.casefold()
    errors = [
        f"forbidden claim present: {claim}"
        for claim in case["forbidden_claims"]
        if claim.casefold() in normalized
    ]
    if case["expect_refusal"] and not any(marker in normalized for marker in REFUSAL_MARKERS):
        errors.append("expected a brief scope or information refusal")
    return errors


def run_retrieval_evaluations() -> list[dict[str, Any]]:
    cases = load_evaluations()
    validate_evaluation_dataset(cases)
    retriever = PortfolioRetriever()
    results = []
    for case in cases:
        errors = evaluate_retrieval_case(case, retriever)
        results.append({"id": case["id"], "passed": not errors, "errors": errors})
    return results
