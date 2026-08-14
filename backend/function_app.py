import azure.functions as func
from azure.cosmos import CosmosClient, exceptions
from openai import OpenAI
import os
import json
import logging
import hashlib
import time

# 1. Initialize Azure Function App (Anonymous auth)
app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

# ---------------------------------------------------------
# GLOBAL CLIENTS (Serverless Best Practice for Connection Pooling)
# ---------------------------------------------------------
cosmos_client = None

def get_cosmos_client():
    global cosmos_client
    if not cosmos_client:
        connection_string = os.environ["CosmosDbConnectionString"]
        cosmos_client = CosmosClient.from_connection_string(connection_string)
    return cosmos_client

# OpenCode Zen AI Client (DeepSeek V4 Flash)
ai_client = OpenAI(
    api_key=os.environ.get("OPENCODE_API_KEY"),
    base_url="https://opencode.ai/zen/v1"
)

# ---------------------------------------------------------
# HELPER FUNCTIONS FOR AI CHAT ASSISTANT
# ---------------------------------------------------------
def load_knowledge_base() -> dict:
    """Loads knowledge base JSON file dynamically."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, "data", "knowledge_base.json")
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logging.error(f"Error loading knowledge base: {e}")
        return {}

def build_system_prompt(kb_data: dict) -> str:
    """Formats the JSON knowledge base into the AI System Prompt."""
    kb_string = json.dumps(kb_data, indent=2)
    
    return f"""
You are Jerome Ibon's AI Assistant on his portfolio website (jeysibn.dev).
Your primary job is to politely and accurately answer questions about Jerome using ONLY the Knowledge Base provided below.

=== JEROME'S KNOWLEDGE BASE ===
{kb_string}

=== RULES ===
1. Be professional, friendly, and concise (under 3-4 sentences when possible).
2. Base your answers strictly on the facts provided in the Knowledge Base above.
3. If a user asks something not covered in the Knowledge Base or asks off-topic questions (e.g. general math, writing random code), politely decline: "I can only answer questions related to Jerome's background and experience."
"""


# ---------------------------------------------------------
# ROUTE 1: VISITOR COUNTER API
# ---------------------------------------------------------
@app.route(route="GetVisitorCount", methods=["GET", "POST", "OPTIONS"])
def GetVisitorCount(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processing visitor count request.')

    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    }

    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=200, headers=headers)

    try:
        db_client = get_cosmos_client()
        database = db_client.get_database_client("PortfolioDB")
        counter_container = database.get_container_client("Counter")
        ips_container = database.get_container_client("VisitorIPs") 
        
        document_id = "1"

        # Get client IP
        raw_ip = req.headers.get("x-client-ip") or req.headers.get("x-forwarded-for", "127.0.0.1")
        client_ip = raw_ip.split(',')[0].strip()
        
        if client_ip.count(":") == 1:
            client_ip = client_ip.split(":")[0]

        # Hash IP for privacy
        ip_hash = hashlib.sha256(client_ip.encode('utf-8')).hexdigest()

        # Check existing visits
        has_visited = True
        try:
            ips_container.read_item(item=ip_hash, partition_key=ip_hash)
        except exceptions.CosmosResourceNotFoundError:
            has_visited = False

        # Read counter
        try:
            item = counter_container.read_item(item=document_id, partition_key=document_id)
        except exceptions.CosmosResourceNotFoundError:
            item = {"id": document_id, "count": 0}
            item = counter_container.create_item(body=item)

        # Increment if unique
        if not has_visited:
            item['count'] += 1
            updated_item = counter_container.replace_item(item=document_id, body=item)
            ips_container.create_item(body={"id": ip_hash})
        else:
            updated_item = item 

        return func.HttpResponse(
            body=json.dumps({"count": updated_item['count']}),
            mimetype="application/json",
            status_code=200,
            headers=headers
        )
            
    except Exception as e:
        logging.error(f"Error in Visitor Counter: {str(e)}")
        return func.HttpResponse(
            body="Error connecting to the database.",
            status_code=500,
            headers=headers
        )


# ---------------------------------------------------------
# ROUTE 2: AI CHAT ASSISTANT API (With Robust IP Parsing & Rolling Window)
# ---------------------------------------------------------
@app.route(route="AiChatAssistant", methods=["POST", "OPTIONS"])
def AiChatAssistant(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processing AI chat request.')

    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    }

    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=200, headers=headers)

    try:
        # 1. Robust IP Extraction (Handles Azure App Service & Proxy Headers)
        forwarded_for = (
            req.headers.get("x-forwarded-for") or 
            req.headers.get("x-client-ip") or 
            req.headers.get("x-original-forwarded-for") or 
            "127.0.0.1"
        )
        
        # Take the first IP in the X-Forwarded-For chain (the true client IP)
        client_ip = forwarded_for.split(',')[0].strip()
        
        # Strip port number if present (e.g. 203.0.113.195:50422 -> 203.0.113.195)
        if ":" in client_ip and client_ip.count(":") == 1:
            client_ip = client_ip.split(":")[0]
            
        ip_hash = hashlib.sha256(client_ip.encode('utf-8')).hexdigest()
        rate_limit_id = f"chat_limit_{ip_hash}"

        logging.info(f"Chat request received. Hashed IP ID: {rate_limit_id}")

        # 2. Rate Limiting with 1-Hour (3600s) Rolling Window Reset
        db_client = get_cosmos_client()
        database = db_client.get_database_client("PortfolioDB")
        ips_container = database.get_container_client("VisitorIPs")

        MAX_MESSAGES = 10
        RESET_PERIOD_SECONDS = 3600  # 1 hour window (change to 86400 for 24 hours)
        current_time = int(time.time())

        RATE_LIMIT_MESSAGE = "⏳ You've reached the maximum limit of 10 messages for this chat session. Feel free to connect with Jerome directly via email at jeysibn@gmail.com or on LinkedIn!"

        try:
            rate_doc = ips_container.read_item(item=rate_limit_id, partition_key=rate_limit_id)
            last_updated = rate_doc.get("last_updated", 0)

            # If 1 hour has passed since the first message, RESET the counter
            if (current_time - last_updated) > RESET_PERIOD_SECONDS:
                rate_doc["count"] = 1
                rate_doc["last_updated"] = current_time
                ips_container.replace_item(item=rate_limit_id, body=rate_doc)
            else:
                # Still within the 1-hour window -> Check limit
                if rate_doc.get("count", 0) >= MAX_MESSAGES:
                    return func.HttpResponse(
                        body=json.dumps({"reply": RATE_LIMIT_MESSAGE}),
                        mimetype="application/json",
                        status_code=200,
                        headers=headers
                    )
                rate_doc["count"] += 1
                ips_container.replace_item(item=rate_limit_id, body=rate_doc)

        except exceptions.CosmosResourceNotFoundError:
            # First message from this unique IP -> Create new doc with timestamp
            ips_container.create_item(body={
                "id": rate_limit_id, 
                "count": 1,
                "last_updated": current_time
            })

        # 3. Process Request
        req_body = req.get_json()
        user_message = req_body.get("message", "").strip()
        chat_history = req_body.get("history", [])

        if not user_message:
            return func.HttpResponse(
                body=json.dumps({"error": "Message body cannot be empty."}),
                mimetype="application/json",
                status_code=400,
                headers=headers
            )

        kb_data = load_knowledge_base()
        system_prompt = build_system_prompt(kb_data)

        messages = [{"role": "system", "content": system_prompt}]

        for msg in chat_history:
            if msg.get("role") in ["user", "assistant"] and msg.get("content"):
                messages.append({"role": msg["role"], "content": msg["content"]})

        messages.append({"role": "user", "content": user_message})

        # 4. Call OpenCode Zen API (Fixed model name)
        response = ai_client.chat.completions.create(
            model="mimo-v2.5-free", 
            messages=messages,
            temperature=0.7,
            max_tokens=350
        )

        bot_reply = response.choices[0].message.content.strip()

        return func.HttpResponse(
            body=json.dumps({"reply": bot_reply}),
            mimetype="application/json",
            status_code=200,
            headers=headers
        )

    except Exception as e:
        logging.error(f"AI Chat Assistant Error: {str(e)}")
        # Send the exact Python error back to the browser for debugging!
        return func.HttpResponse(
            body=json.dumps({"error": f"Backend Error: {str(e)}"}),
            mimetype="application/json",
            status_code=500,
            headers=headers
        )