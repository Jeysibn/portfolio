import function_app


def test_build_system_prompt_contains_knowledge_base_content():
    knowledge_base = {
        "name": "Jerome",
        "role": "Cloud and DevOps Engineer",
    }

    prompt = function_app.build_system_prompt(knowledge_base)

    assert "Jerome" in prompt
    assert "Cloud and DevOps Engineer" in prompt
    assert "using ONLY the Knowledge Base" in prompt


def test_load_knowledge_base_returns_dictionary():
    knowledge_base = function_app.load_knowledge_base()

    assert isinstance(knowledge_base, dict)
    assert knowledge_base
