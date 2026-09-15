"""Small, deterministic retrieval over the approved portfolio projection."""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

ASSISTANT_DIR = Path(__file__).resolve().parent
KNOWLEDGE_PATH = ASSISTANT_DIR.parent / "data" / "approved_knowledge.json"
TOKEN_PATTERN = re.compile(r"[a-z0-9][a-z0-9+.#/-]*", re.IGNORECASE)

PROJECT_ALIASES = {
    "cloud-portfolio": ("cloud-backed portfolio", "cloud portfolio", "portfolio project"),
    "homelab-gitops": ("homelab gitops", "gitops homelab", "homelab", "k3s homelab"),
    "monikey": ("monikey", "moni key"),
    "noc-report": ("noc report builder", "noc report", "noc project", "report builder"),
}

PROJECT_SIGNALS = {
    "cloud-portfolio": (
        "azure functions", "cosmos", "github pages", "oidc", "application insights", "visitor counter",
        "serverless", "cloud-backed", "cloud portfolio",
    ),
    "homelab-gitops": (
        "kubernetes", "k3s", "argo cd", "argocd", "calico", "proxmox", "longhorn", "gitops", "homelab",
    ),
    "monikey": (
        "monikey", "postgresql-backed", "skip locked", "bigint", "personal finance", "fastify", "ledger",
    ),
    "noc-report": (
        "noc report", "rabbitmq", "reportsnapshot", "reportdocument", "minio", "evidence provenance",
        "claude code", "report composition", "frozen evidence",
    ),
}

SOURCE_FIELDS = {"id", "label", "url"}


@dataclass(frozen=True)
class SourceRef:
    id: str
    label: str
    url: str

    def as_dict(self) -> dict[str, str]:
        return {"id": self.id, "label": self.label, "url": self.url}


@dataclass(frozen=True)
class RetrievalResult:
    context: dict[str, Any]
    sources: list[SourceRef]
    knowledge_version: str
    retrieved_sections: list[str]
    retrieval_miss: bool


def load_knowledge_base() -> dict[str, Any]:
    """Load the generated allow-listed projection shipped with the Function."""
    try:
        data = json.loads(KNOWLEDGE_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        logger.exception("Unable to load approved portfolio facts.")
        raise RuntimeError("Approved portfolio facts are unavailable.") from exc
    if not isinstance(data, dict) or not data.get("metadata"):
        raise RuntimeError("Approved portfolio facts are invalid.")
    return data


def _tokens(value: str) -> set[str]:
    tokens = (token.strip(".,!?;:()[]{}\"'") for token in TOKEN_PATTERN.findall(value))
    return {token.lower() for token in tokens if len(token) > 1}


def _source_from(value: Any) -> SourceRef | None:
    if not isinstance(value, dict) or not SOURCE_FIELDS <= set(value):
        return None
    if not all(isinstance(value[field], str) and value[field].strip() for field in SOURCE_FIELDS):
        return None
    return SourceRef(value["id"], value["label"], value["url"])


class PortfolioRetriever:
    """Select relevant approved sections without embeddings or external services."""

    def __init__(self, facts: dict[str, Any] | None = None):
        self.facts = facts if facts is not None else load_knowledge_base()
        self.projects = self.facts.get("projects", [])

    def retrieve(self, question: str, history: list[dict[str, Any]] | None = None) -> RetrievalResult:
        if not isinstance(self.facts.get("metadata"), dict):
            return RetrievalResult(
                context=self.facts,
                sources=[],
                knowledge_version="fixture",
                retrieved_sections=["fixture"],
                retrieval_miss=False,
            )

        history_text = " ".join(
            item.get("content", "")
            for item in (history or [])[-4:]
            if isinstance(item, dict) and item.get("role") in {"user", "assistant"}
        )
        query = f"{question} {history_text}".strip().lower()
        query_tokens = _tokens(query)
        explicit_projects = [
            slug
            for slug, aliases in PROJECT_ALIASES.items()
            if any(alias in query for alias in aliases)
        ]
        explicit_projects = list(dict.fromkeys(explicit_projects))

        comparison = any(word in query_tokens for word in {"compare", "comparison", "versus", "difference", "different"})
        recruiter = any(
            phrase in query
            for phrase in ("junior role", "good fit", "qualified", "consider jerome", "strongest", "recruiter")
        )
        profile_only = any(
            phrase in query
            for phrase in ("tell me about jerome", "what is jerome like", "what is jerome currently learning", "what certifications")
        ) and not explicit_projects

        signal_projects = [
            slug
            for slug, signals in PROJECT_SIGNALS.items()
            if any(signal in query for signal in signals)
        ]
        certification_question = any(
            term in query for term in ("certified", "certification", "studying", "earned", "passed")
        )
        if "terraform" in query and not signal_projects and not certification_question:
            signal_projects = ["cloud-portfolio", "homelab-gitops"]
        if any(term in query for term in ("ci/cd", "cicd", "continuous delivery")):
            signal_projects = ["cloud-portfolio", "homelab-gitops"]
        if "backend engineering" in query or "backend project" in query:
            signal_projects = ["monikey", "noc-report"]
        if "strongest devops" in query or "best demonstrates troubleshooting" in query:
            signal_projects = ["cloud-portfolio", "homelab-gitops"]
        if "portfolio" in query and any(term in query for term in ("deployed", "deployment", "cost-conscious")):
            signal_projects = ["cloud-portfolio"]
        if "infrastructure automation" in query:
            signal_projects = ["cloud-portfolio", "homelab-gitops"]
        if any(term in query for term in ("trendai", "professional experience")) and not explicit_projects:
            signal_projects = []

        ranked: list[tuple[int, dict[str, Any]]] = []
        for project in self.projects:
            if not isinstance(project, dict):
                continue
            searchable = json.dumps(project, ensure_ascii=False).lower()
            score = sum(1 for token in query_tokens if token in searchable)
            if project.get("slug") in explicit_projects:
                score += 100
            if project.get("slug") in signal_projects:
                score += 50
            if recruiter and project.get("slug") in {"cloud-portfolio", "homelab-gitops"}:
                score += 8
            if comparison and explicit_projects and project.get("slug") in explicit_projects:
                score += 20
            if score:
                ranked.append((score, project))
        ranked.sort(key=lambda item: item[0], reverse=True)

        if profile_only:
            selected_projects = []
        elif explicit_projects:
            selected_projects = [
                project for slug in explicit_projects for project in self.projects if project.get("slug") == slug
            ]
        elif signal_projects:
            selected_projects = [
                project for slug in signal_projects for project in self.projects if project.get("slug") == slug
            ]
        elif comparison and any(term in query for term in ("four", "all projects", "all four")):
            selected_projects = [project for project in self.projects]
        elif comparison:
            selected_projects = [project for _, project in ranked[:4]]
        else:
            selected_projects = []

        factual = bool(query_tokens & {
            "jerome", "project", "projects", "terraform", "kubernetes", "k3s", "experience", "certification",
            "certified", "technology", "technologies", "database", "architecture", "production", "contact",
            "learn", "learning", "skills", "role", "qualified", "fit", "backend", "worker", "report",
        }) or "technical support" in query or explicit_projects or recruiter or signal_projects or comparison
        if not factual:
            selected_projects = []

        context: dict[str, Any] = {"portfolio_rules": self.facts.get("response_guardrails", [])}
        sources: list[SourceRef] = []
        sections: list[str] = ["response_guardrails"]

        def add_section(name: str, value: Any, source_id: str | None = None) -> None:
            if value is not None:
                context[name] = value
                sections.append(name)
                if source_id:
                    source = next((item for item in self.facts.get("source_catalog", []) if item.get("id") == source_id), None)
                    source_ref = _source_from(source)
                    if source_ref and source_ref not in sources:
                        sources.append(source_ref)

        boundary_question = any(
            phrase in query
            for phrase in (
                "professionally", "professional", "production", "employment", "experience", "troubleshooting",
                "technical support",
            )
        )
        if factual and (recruiter or boundary_question or not selected_projects):
            add_section("profile", self.facts.get("profile"), "profile")
            add_section("career", self.facts.get("career"), "professional-experience")
            add_section("education", self.facts.get("education"), "education")
            add_section("certifications", self.facts.get("certifications"), "certifications")
            add_section("certifications_in_progress", self.facts.get("certifications_in_progress"), "certifications")
            add_section("skills", self.facts.get("skills"), "profile")
            add_section("professional_experience", self.facts.get("professional_experience"), "professional-experience")
            add_section("current_learning", self.facts.get("current_learning"), "profile")

        if selected_projects:
            project_values = []
            for project in selected_projects:
                project_values.append(project)
                source_ref = _source_from(project.get("source"))
                if source_ref and source_ref not in sources:
                    sources.append(source_ref)
            context["projects"] = project_values
            sections.append("projects")
        else:
            context["project_index"] = [
                {key: project[key] for key in ("slug", "name", "repository", "status", "summary", "technologies")}
                for project in self.projects
                if isinstance(project, dict)
            ]
            sections.append("project_index")

        if not selected_projects and factual:
            logger.info("Portfolio retrieval found no project-specific match.")

        return RetrievalResult(
            context=context,
            sources=sources,
            knowledge_version=self.facts["metadata"].get("knowledge_version", "unknown"),
            retrieved_sections=sections,
            retrieval_miss=not bool(selected_projects) and factual,
        )


def get_relevant_context(
    question: str,
    history: list[dict[str, Any]] | None = None,
    facts: dict[str, Any] | None = None,
) -> RetrievalResult:
    return PortfolioRetriever(facts).retrieve(question, history)
