import hashlib
import json
import logging
import os
import time
from pathlib import Path

import azure.functions as func
from azure.cosmos import CosmosClient, exceptions
from openai import OpenAI, OpenAIError


# ---------------------------------------------------------
# LOGGING
# ---------------------------------------------------------
logger = logging.getLogger(__name__)


# ---------------------------------------------------------
# AZURE FUNCTION APP
# ---------------------------------------------------------
# Anonymous HTTP access is intentional because this API is
# consumed by the public portfolio frontend.
app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)


# ---------------------------------------------------------
# CONSTANTS
# ---------------------------------------------------------
DATABASE_NAME = "PortfolioDB"
COUNTER_CONTAINER_NAME = "Counter"
VISITOR_IPS_CONTAINER_NAME = "VisitorIPs"

MAX_MESSAGES = 10
RESET_PERIOD_SECONDS = 3600

RATE_LIMIT_MESSAGE = (
    "⏳ You've reached the maximum limit of 10 messages for this chat session. "
    "Feel free to connect with Jerome directly via email at "
    "jeysibn@gmail.com or on LinkedIn!"
)

AI_MODEL = "mimo-v2.5-free"
AI_BASE_URL = "https://opencode.ai/zen/v1"


# ---------------------------------------------------------
# CORS HEADERS
# ---------------------------------------------------------
COUNTER_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

AI_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


# ---------------------------------------------------------
# GLOBAL CLIENTS
# ---------------------------------------------------------
# Reusing clients between Azure Function invocations reduces
# unnecessary connection creation on warm serverless instances.
cosmos_client = None


def get_cosmos_client() -> CosmosClient:
    """Create and reuse the Cosmos DB client."""
    global cosmos_client

    if cosmos_client is None:
        connection_string = os.environ["CosmosDbConnectionString"]
        cosmos_client = CosmosClient.from_connection_string(connection_string)

    return cosmos_client


# OpenCode Zen exposes an OpenAI-compatible API.
ai_client = OpenAI(
    api_key=os.environ.get("OPENCODE_API_KEY"),
    base_url=AI_BASE_URL,
)


# ---------------------------------------------------------
# SHARED HELPERS
# ---------------------------------------------------------
def get_client_ip(req: func.HttpRequest) -> str:
    """Extract the originating client IP from Azure/proxy headers."""
    forwarded_for = (
        req.headers.get("x-forwarded-for")
        or req.headers.get("x-client-ip")
        or req.headers.get("x-original-forwarded-for")
        or "127.0.0.1"
    )

    # X-Forwarded-For may contain:
    # client, proxy1, proxy2
    client_ip = forwarded_for.split(",")[0].strip()

    # Remove a port from an IPv4 address such as:
    # 203.0.113.195:50422
    #
    # Do not apply this to IPv6 addresses because they naturally
    # contain multiple colons.
    if client_ip.count(":") == 1:
        client_ip = client_ip.split(":")[0]

    return client_ip


def hash_ip(client_ip: str) -> str:
    """Hash an IP before storing it to avoid retaining the raw address."""
    return hashlib.sha256(client_ip.encode("utf-8")).hexdigest()


# ---------------------------------------------------------
# AI KNOWLEDGE BASE HELPERS
# ---------------------------------------------------------
def load_knowledge_base() -> dict:
    """Load the portfolio knowledge base from JSON."""
    file_path = Path(__file__).resolve().parent / "data" / "knowledge_base.json"

    try:
        with file_path.open("r", encoding="utf-8") as file:
            return json.load(file)

    except (OSError, json.JSONDecodeError) as error:
        logger.exception(
            "Unable to load the portfolio knowledge base: %s",
            error,
        )
        return {}


def build_system_prompt(kb_data: dict) -> str:
    """Format the portfolio knowledge base into the AI system prompt."""
    kb_string = json.dumps(kb_data, indent=2)

    return f"""
You are Jerome Ibon's AI Assistant on his portfolio website (jeysibn.dev).
Your primary job is to politely and accurately answer questions about Jerome
using ONLY the Knowledge Base provided below.

=== JEROME'S KNOWLEDGE BASE ===
{kb_string}

=== RULES ===
1. Be professional, friendly, and concise (under 3-4 sentences when possible).
2. Base your answers strictly on the facts provided in the Knowledge Base above.
3. If a user asks something not covered in the Knowledge Base or asks off-topic
   questions (for example general math or writing unrelated code), politely
   decline:
   "I can only answer questions related to Jerome's background and experience."
"""


# =========================================================
# ROUTE 1: VISITOR COUNTER API
# =========================================================
@app.route(
    route="GetVisitorCount",
    methods=["GET", "POST", "OPTIONS"],
)
def GetVisitorCount(req: func.HttpRequest) -> func.HttpResponse:
    """Return the portfolio visitor count and record unique visitors."""
    logger.info("Processing visitor counter request.")

    if req.method == "OPTIONS":
        return func.HttpResponse(
            status_code=200,
            headers=COUNTER_HEADERS,
        )

    try:
        db_client = get_cosmos_client()

        database = db_client.get_database_client(DATABASE_NAME)

        counter_container = database.get_container_client(
            COUNTER_CONTAINER_NAME
        )

        ips_container = database.get_container_client(
            VISITOR_IPS_CONTAINER_NAME
        )

        document_id = "1"

        # -------------------------------------------------
        # Determine unique visitor
        # -------------------------------------------------
        client_ip = get_client_ip(req)
        ip_hash = hash_ip(client_ip)

        has_visited = True

        try:
            ips_container.read_item(
                item=ip_hash,
                partition_key=ip_hash,
            )

        except exceptions.CosmosResourceNotFoundError:
            has_visited = False

        # -------------------------------------------------
        # Read or initialize counter
        # -------------------------------------------------
        try:
            item = counter_container.read_item(
                item=document_id,
                partition_key=document_id,
            )

        except exceptions.CosmosResourceNotFoundError:
            item = {
                "id": document_id,
                "count": 0,
            }

            item = counter_container.create_item(body=item)

        # -------------------------------------------------
        # Increment only for a unique visitor
        # -------------------------------------------------
        if not has_visited:
            item["count"] += 1

            updated_item = counter_container.replace_item(
                item=document_id,
                body=item,
            )

            ips_container.create_item(
                body={"id": ip_hash},
            )

        else:
            updated_item = item

        return func.HttpResponse(
            body=json.dumps(
                {"count": updated_item["count"]}
            ),
            mimetype="application/json",
            status_code=200,
            headers=COUNTER_HEADERS,
        )

    except (
        exceptions.CosmosHttpResponseError,
        KeyError,
        ValueError,
    ) as error:
        logger.exception(
            "Visitor counter request failed: %s",
            error,
        )

        return func.HttpResponse(
            body="Error connecting to the database.",
            status_code=500,
            headers=COUNTER_HEADERS,
        )


# =========================================================
# ROUTE 2: AI CHAT ASSISTANT API
# =========================================================
@app.route(
    route="AiChatAssistant",
    methods=["POST", "OPTIONS"],
)
def AiChatAssistant(req: func.HttpRequest) -> func.HttpResponse:
    """Process portfolio AI assistant requests with per-IP rate limiting."""
    logger.info("Processing AI chat assistant request.")

    if req.method == "OPTIONS":
        return func.HttpResponse(
            status_code=200,
            headers=AI_HEADERS,
        )

    try:
        # -------------------------------------------------
        # Identify visitor without storing raw IP
        # -------------------------------------------------
        client_ip = get_client_ip(req)
        ip_hash = hash_ip(client_ip)

        rate_limit_id = f"chat_limit_{ip_hash}"

        logger.info(
            "Chat request received for hashed visitor ID: %s",
            rate_limit_id,
        )

        # -------------------------------------------------
        # Connect to Cosmos DB
        # -------------------------------------------------
        db_client = get_cosmos_client()

        database = db_client.get_database_client(DATABASE_NAME)

        ips_container = database.get_container_client(
            VISITOR_IPS_CONTAINER_NAME
        )

        current_time = int(time.time())

        # -------------------------------------------------
        # Per-IP rolling-window rate limiter
        # -------------------------------------------------
        try:
            rate_doc = ips_container.read_item(
                item=rate_limit_id,
                partition_key=rate_limit_id,
            )

            last_updated = rate_doc.get("last_updated", 0)

            window_expired = (
                current_time - last_updated
            ) > RESET_PERIOD_SECONDS

            if window_expired:
                rate_doc["count"] = 1
                rate_doc["last_updated"] = current_time

                ips_container.replace_item(
                    item=rate_limit_id,
                    body=rate_doc,
                )

            else:
                current_count = rate_doc.get("count", 0)

                if current_count >= MAX_MESSAGES:
                    return func.HttpResponse(
                        body=json.dumps(
                            {"reply": RATE_LIMIT_MESSAGE}
                        ),
                        mimetype="application/json",
                        status_code=200,
                        headers=AI_HEADERS,
                    )

                rate_doc["count"] = current_count + 1

                ips_container.replace_item(
                    item=rate_limit_id,
                    body=rate_doc,
                )

        except exceptions.CosmosResourceNotFoundError:
            # First AI message from this visitor.
            ips_container.create_item(
                body={
                    "id": rate_limit_id,
                    "count": 1,
                    "last_updated": current_time,
                }
            )

        # -------------------------------------------------
        # Validate request
        # -------------------------------------------------
        try:
            req_body = req.get_json()

        except ValueError:
            return func.HttpResponse(
                body=json.dumps(
                    {"error": "Request body must contain valid JSON."}
                ),
                mimetype="application/json",
                status_code=400,
                headers=AI_HEADERS,
            )

        user_message = req_body.get("message", "").strip()
        chat_history = req_body.get("history", [])

        if not user_message:
            return func.HttpResponse(
                body=json.dumps(
                    {"error": "Message body cannot be empty."}
                ),
                mimetype="application/json",
                status_code=400,
                headers=AI_HEADERS,
            )

        # -------------------------------------------------
        # Construct AI prompt
        # -------------------------------------------------
        kb_data = load_knowledge_base()
        system_prompt = build_system_prompt(kb_data)

        messages = [
            {
                "role": "system",
                "content": system_prompt,
            }
        ]

        for message in chat_history:
            role = message.get("role")
            content = message.get("content")

            if role in {"user", "assistant"} and content:
                messages.append(
                    {
                        "role": role,
                        "content": content,
                    }
                )

        messages.append(
            {
                "role": "user",
                "content": user_message,
            }
        )

        # -------------------------------------------------
        # OpenCode Zen AI request
        # -------------------------------------------------
        response = ai_client.chat.completions.create(
            model=AI_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=350,
        )

        response_content = response.choices[0].message.content

        if not response_content:
            logger.error(
                "AI provider returned an empty response."
            )

            return func.HttpResponse(
                body=json.dumps(
                    {
                        "error": (
                            "The AI assistant did not return a response."
                        )
                    }
                ),
                mimetype="application/json",
                status_code=502,
                headers=AI_HEADERS,
            )

        bot_reply = response_content.strip()

        return func.HttpResponse(
            body=json.dumps(
                {"reply": bot_reply}
            ),
            mimetype="application/json",
            status_code=200,
            headers=AI_HEADERS,
        )

    except exceptions.CosmosHttpResponseError as error:
        logger.exception(
            "Cosmos DB error while processing AI request: %s",
            error,
        )

        return func.HttpResponse(
            body=json.dumps(
                {
                    "error": (
                        "The AI assistant is temporarily unavailable."
                    )
                }
            ),
            mimetype="application/json",
            status_code=503,
            headers=AI_HEADERS,
        )

    except OpenAIError as error:
        logger.exception(
            "AI provider request failed: %s",
            error,
        )

        return func.HttpResponse(
            body=json.dumps(
                {
                    "error": (
                        "The AI service is temporarily unavailable. "
                        "Please try again later."
                    )
                }
            ),
            mimetype="application/json",
            status_code=503,
            headers=AI_HEADERS,
        )

    except (KeyError, TypeError, AttributeError, ValueError) as error:
        logger.exception(
            "Invalid data encountered while processing AI request: %s",
            error,
        )

        return func.HttpResponse(
            body=json.dumps(
                {
                    "error": (
                        "Unable to process the request."
                    )
                }
            ),
            mimetype="application/json",
            status_code=500,
            headers=AI_HEADERS,
        )