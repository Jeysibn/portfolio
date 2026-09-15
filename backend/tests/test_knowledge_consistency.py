import json
from pathlib import Path

from tools.build_knowledge import build_approved_knowledge, read_json, validate_canonical_content


ROOT = Path(__file__).resolve().parents[2]
CANONICAL = ROOT / "content" / "portfolio.json"
APPROVED = ROOT / "backend" / "data" / "approved_knowledge.json"


def test_canonical_and_generated_assistant_knowledge_are_in_sync():
    canonical = read_json(CANONICAL)
    approved = read_json(APPROVED)
    validate_canonical_content(canonical)
    expected = build_approved_knowledge(canonical)

    assert approved == expected
    assert {project["slug"] for project in canonical["projects"]} == {
        "cloud-portfolio",
        "homelab-gitops",
        "monikey",
        "noc-report",
    }


def test_every_visible_project_has_approved_identity_and_provenance():
    canonical = read_json(CANONICAL)
    approved = read_json(APPROVED)
    approved_by_slug = {project["slug"]: project for project in approved["projects"]}

    for project in canonical["projects"]:
        record = approved_by_slug[project["slug"]]
        assert record["name"] == project["title"]
        assert record["repository"] == project["repositoryUrl"]
        assert record["status"] == project["status"]
        assert record["source"]["id"] == f"project-{project['slug']}"
        assert record["source"]["url"] == project["repositoryUrl"]


def test_in_progress_certification_is_not_in_earned_projection():
    approved = json.loads(APPROVED.read_text(encoding="utf-8"))
    in_progress_names = {item["name"] for item in approved["certifications_in_progress"]}
    assert not in_progress_names & set(approved["certifications"])
