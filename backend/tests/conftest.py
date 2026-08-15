import os

# function_app creates its OpenAI-compatible client during module import.
# Tests provide a non-secret placeholder so importing the module never depends
# on a developer machine or GitHub secret.
os.environ.setdefault("OPENCODE_API_KEY", "test-api-key")
os.environ.setdefault(
    "CosmosDbConnectionString",
    "AccountEndpoint=https://localhost:8081/;AccountKey=test-key;",
)
