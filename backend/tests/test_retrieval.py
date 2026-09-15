from copy import deepcopy

from assistant.retrieval import PortfolioRetriever, get_relevant_context, load_knowledge_base


def test_exact_project_match_retrieves_only_monikey_for_worker_question():
    result = get_relevant_context("What message broker does MoniKey use?")

    assert [project["slug"] for project in result.context["projects"]] == ["monikey"]
    assert result.sources[0].id == "project-monikey"
    assert "PostgreSQL-backed durable jobs" in result.context["projects"][0]["architecture"]["worker"]


def test_multi_project_query_retrieves_both_boundaries():
    result = get_relevant_context("Compare MoniKey and NOC Report Builder.")

    assert {project["slug"] for project in result.context["projects"]} == {"monikey", "noc-report"}
    assert {source.id for source in result.sources} == {"project-monikey", "project-noc-report"}


def test_follow_up_uses_recent_history_to_resolve_project_pronoun():
    result = get_relevant_context(
        "What database does it use?",
        [
            {"role": "user", "content": "Tell me about MoniKey."},
            {"role": "assistant", "content": "MoniKey is a personal finance application."},
        ],
    )

    assert [project["slug"] for project in result.context["projects"]] == ["monikey"]


def test_unknown_factual_question_uses_safe_core_fallback_and_marks_miss():
    result = get_relevant_context("What is Jerome's preferred office temperature?")

    assert result.retrieval_miss is True
    assert "profile" in result.context
    assert "project_index" in result.context
    assert all("source" not in project for project in result.context["project_index"])


def test_retriever_can_use_a_fixture_without_production_metadata():
    result = PortfolioRetriever({"name": "Jerome", "role": "Cloud Engineer"}).retrieve("Hello")

    assert result.context["name"] == "Jerome"
    assert result.knowledge_version == "fixture"


def test_invalid_source_metadata_is_not_exposed_to_the_public_provenance_list():
    facts = deepcopy(load_knowledge_base())
    facts["projects"][0]["source"]["url"] = ""

    result = PortfolioRetriever(facts).retrieve("Tell me about the Cloud-Backed Portfolio.")

    assert result.context["projects"][0]["slug"] == "cloud-portfolio"
    assert all(source.url for source in result.sources)
