import os

# Tests provide non-secret placeholders for runtime-only configuration so
# importing the module never depends on a developer machine or GitHub secret.
os.environ.setdefault("OPENCODE_API_KEY", "test-api-key")
os.environ.setdefault("VISITOR_HASH_SECRET", "test-visitor-hmac-secret")
os.environ.setdefault(
    "CosmosDbConnectionString",
    "AccountEndpoint=https://localhost:8081/;AccountKey=test-key;",
)
