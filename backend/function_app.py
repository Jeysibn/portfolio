import hashlib
import json
import logging
import os
import time
import uuid

import azure.functions as func
from azure.cosmos import CosmosClient, exceptions
from openai import OpenAI, OpenAIError

from assistant.response_sanitizer import sanitize_ai_response
from assistant.service import build_chat_messages


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
SERVICE_NAME = "portfolio-api"
SERVICE_VERSION = os.environ.get("APP_VERSION", "development")

MAX_MESSAGES = 10
RESET_PERIOD_SECONDS = 3600

RATE_LIMIT_MESSAGE = (
    "You've reached the maximum limit of 10 messages for this chat session. "
    "You can continue the conversation by contacting Jerome at "
    "jeysibn@gmail.com or through LinkedIn."
)

AI_MODEL = os.environ.get("AI_MODEL", "mimo-v2.5-free")
AI_BASE_URL = os.environ.get("AI_BASE_URL", "https://opencode.ai/zen/v1")
AI_TEMPERATURE = float(os.environ.get("AI_TEMPERATURE", "0.35"))
AI_MAX_TOKENS = int(os.environ.get("AI_MAX_TOKENS", "450"))


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
# Clients are created lazily. This is important for Azure Functions because
# module-level configuration errors can prevent the Python worker from indexing
# every route in the Function App.
cosmos_client = None
ai_client = None


def get_cosmos_client() -> CosmosClient:
    """Create and reuse the Cosmos DB client."""
    global cosmos_client

    if cosmos_client is None:
        connection_string = os.environ["CosmosDbConnectionString"]
        cosmos_client = CosmosClient.from_connection_string(connection_string)

    return cosmos_client


def get_ai_client() -> OpenAI:
    """Create and reuse the OpenCode Zen OpenAI-compatible client."""
    global ai_client

    if ai_client is None:
        api_key = os.environ.get("OPENCODE_API_KEY")

        if not api_key:
            raise RuntimeError("OPENCODE_API_KEY is not configured.")

        ai_client = OpenAI(
            api_key=api_key,
            base_url=AI_BASE_URL,
        )

    return ai_client


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

    client_ip = forwarded_for.split(",")[0].strip()

    if client_ip.count(":") == 1:
        client_ip = client_ip.split(":")[0]

    return client_ip


def hash_ip(client_ip: str) -> str:
    """Hash an IP before storing it to avoid retaining the raw address."""
    return hashlib.sha256(client_ip.encode("utf-8")).hexdigest()


def get_request_id(req: func.HttpRequest) -> str:
    """Reuse a caller correlation ID when present, otherwise create one."""
    return (
        req.headers.get("x-correlation-id")
        or req.headers.get("x-request-id")
        or str(uuid.uuid4())
    )


def log_event(event: str, request_id: str, **fields) -> None:
    """Emit structured operational metadata without request bodies or secrets."""
    payload = {
        "event": event,
        "request_id": request_id,
        **fields,
    }
    logger.info("portfolio_event=%s", json.dumps(payload, sort_keys=True))


# =========================================================
# ROUTE 0: HEALTH API
# =========================================================
@app.route(route="health", methods=["GET"])
def Health(req: func.HttpRequest) -> func.HttpResponse:
    """Return lightweight liveness information without calling dependencies."""
    request_id = get_request_id(req)
    log_event("health_check", request_id, status="healthy")

    return func.HttpResponse(
        body=json.dumps(
            {
                "status": "healthy",
                "service": SERVICE_NAME,
                "version": SERVICE_VERSION,
            }
        ),
        mimetype="application/json",
        status_code=200,
        headers={"X-Correlation-ID": request_id},
    )


# =========================================================
# ROUTE 1: VISITOR COUNTER API
# =========================================================
@app.route(
    route="GetVisitorCount",
    methods=["GET", "POST", "OPTIONS"],
)
def GetVisitorCount(req: func.HttpRequest) -> func.HttpResponse:
    """Return the portfolio visitor count and record unique visitors."""
    request_id = get_request_id(req)
    log_event("visitor_counter_request", request_id, method=req.method)

    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=200, headers=COUNTER_HEADERS)

    try:
        db_client = get_cosmos_client()
        database = db_client.get_database_client(DATABASE_NAME)
        counter_container = database.get_container_client(COUNTER_CONTAINER_NAME)
        ips_container = database.get_container_client(VISITOR_IPS_CONTAINER_NAME)
        document_id = "1"

        client_ip = get_client_ip(req)
        ip_hash = hash_ip(client_ip)
        has_visited = True

        try:
            ips_container.read_item(item=ip_hash, partition_key=ip_hash)
        except exceptions.CosmosResourceNotFoundError:
            has_visited = False

        try:
            item = counter_container.read_item(
                item=document_id,
                partition_key=document_id,
            )
        except exceptions.CosmosResourceNotFoundError:
            item = counter_container.create_item(
                body={"id": document_id, "count": 0}
            )

        if not has_visited:
            item["count"] += 1
            updated_item = counter_container.replace_item(
                item=document_id,
                body=item,
            )
            ips_container.create_item(body={"id": ip_hash})
        else:
            updated_item = item

        log_event(
            "visitor_counter_success",
            request_id,
            unique_visitor=not has_visited,
        )

        return func.HttpResponse(
            body=json.dumps({"count": updated_item["count"]}),
            mimetype="application/json",
            status_code=200,
            headers={**COUNTER_HEADERS, "X-Correlation-ID": request_id},
        )

    except (exceptions.CosmosHttpResponseError, KeyError, ValueError):
        logger.exception("Visitor counter request failed. request_id=%s", request_id)
        return func.HttpResponse(
            body="Error connecting to the database.",
            status_code=500,
            headers={**COUNTER_HEADERS, "X-Correlation-ID": request_id},
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
    request_id = get_request_id(req)
    log_event("ai_chat_request", request_id, method=req.method)

    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=200, headers=AI_HEADERS)

    try:
        client_ip = get_client_ip(req)
        ip_hash = hash_ip(client_ip)
        rate_limit_id = f"chat_limit_{ip_hash}"

        db_client = get_cosmos_client()
        database = db_client.get_database_client(DATABASE_NAME)
        ips_container = database.get_container_client(VISITOR_IPS_CONTAINER_NAME)
        current_time = int(time.time())

        try:
            rate_doc = ips_container.read_item(
                item=rate_limit_id,
                partition_key=rate_limit_id,
            )
            last_updated = rate_doc.get("last_updated", 0)
            window_expired = current_time - last_updated > RESET_PERIOD_SECONDS

            if window_expired:
                rate_doc["count"] = 1
                rate_doc["last_updated"] = current_time
                ips_container.replace_item(item=rate_limit_id, body=rate_doc)
            else:
                current_count = rate_doc.get("count", 0)
                if current_count >= MAX_MESSAGES:
                    log_event("ai_chat_rate_limited", request_id)
                    return func.HttpResponse(
                        body=json.dumps({"reply": RATE_LIMIT_MESSAGE}),
                        mimetype="application/json",
                        status_code=200,
                        headers={**AI_HEADERS, "X-Correlation-ID": request_id},
                    )

                rate_doc["count"] = current_count + 1
                ips_container.replace_item(item=rate_limit_id, body=rate_doc)

        except exceptions.CosmosResourceNotFoundError:
            ips_container.create_item(
                body={
                    "id": rate_limit_id,
                    "count": 1,
                    "last_updated": current_time,
                }
            )

        try:
            req_body = req.get_json()
        except ValueError:
            return func.HttpResponse(
                body=json.dumps({"error": "Request body must contain valid JSON."}),
                mimetype="application/json",
                status_code=400,
                headers={**AI_HEADERS, "X-Correlation-ID": request_id},
            )

        user_message = req_body.get("message", "").strip()
        chat_history = req_body.get("history", [])

        if not user_message:
            return func.HttpResponse(
                body=json.dumps({"error": "Message body cannot be empty."}),
                mimetype="application/json",
                status_code=400,
                headers={**AI_HEADERS, "X-Correlation-ID": request_id},
            )

        if not isinstance(chat_history, list):
            chat_history = []

        messages = build_chat_messages(user_message, chat_history)

        client = get_ai_client()
        response = client.chat.completions.create(
            model=AI_MODEL,
            messages=messages,
            temperature=AI_TEMPERATURE,
            max_tokens=AI_MAX_TOKENS,
        )
        response_content = response.choices[0].message.content

        if not response_content:
            logger.error("AI provider returned an empty response. request_id=%s", request_id)
            return func.HttpResponse(
                body=json.dumps({"error": "The AI assistant did not return a response."}),
                mimetype="application/json",
                status_code=502,
                headers={**AI_HEADERS, "X-Correlation-ID": request_id},
            )

        sanitized_response = sanitize_ai_response(response_content)

        if not sanitized_response:
            logger.error("AI response was empty after sanitization. request_id=%s", request_id)
            return func.HttpResponse(
                body=json.dumps({"error": "The AI assistant did not return a usable response."}),
                mimetype="application/json",
                status_code=502,
                headers={**AI_HEADERS, "X-Correlation-ID": request_id},
            )

        log_event("ai_chat_success", request_id)
        return func.HttpResponse(
            body=json.dumps({"reply": sanitized_response}),
            mimetype="application/json",
            status_code=200,
            headers={**AI_HEADERS, "X-Correlation-ID": request_id},
        )

    except RuntimeError:
        logger.exception("AI service configuration is missing or invalid. request_id=%s", request_id)
        return func.HttpResponse(
            body=json.dumps({"error": "The AI assistant is temporarily unavailable."}),
            mimetype="application/json",
            status_code=503,
            headers={**AI_HEADERS, "X-Correlation-ID": request_id},
        )

    except exceptions.CosmosHttpResponseError:
        logger.exception("Cosmos DB error while processing AI request. request_id=%s", request_id)
        return func.HttpResponse(
            body=json.dumps({"error": "The AI assistant is temporarily unavailable."}),
            mimetype="application/json",
            status_code=503,
            headers={**AI_HEADERS, "X-Correlation-ID": request_id},
        )

    except OpenAIError:
        logger.exception("AI provider request failed. request_id=%s", request_id)
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
            headers={**AI_HEADERS, "X-Correlation-ID": request_id},
        )

    except (KeyError, TypeError, AttributeError, ValueError):
        logger.exception("Invalid data encountered while processing AI request. request_id=%s", request_id)
        return func.HttpResponse(
            body=json.dumps({"error": "Unable to process the request."}),
            mimetype="application/json",
            status_code=500,
            headers={**AI_HEADERS, "X-Correlation-ID": request_id},
        )
