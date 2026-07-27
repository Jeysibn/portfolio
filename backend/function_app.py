import azure.functions as func
from azure.cosmos import CosmosClient, exceptions
import os
import json
import logging
import hashlib

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

# Global client initialization for connection pooling (Serverless Best Practice)
client = None

def get_cosmos_client():
    global client
    if not client:
        connection_string = os.environ["CosmosDbConnectionString"]
        client = CosmosClient.from_connection_string(connection_string)
    return client

# Added OPTIONS to handle the browser's preflight check
@app.route(route="GetVisitorCount", methods=["GET", "POST", "OPTIONS"])
def GetVisitorCount(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processing a request.')

    # Bulletproof CORS headers
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    }

    # Intercept the browser's automatic OPTIONS request and approve it
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=200, headers=headers)

    try:
        # Connect to Cosmos DB
        db_client = get_cosmos_client()
        database = db_client.get_database_client("PortfolioDB")
        counter_container = database.get_container_client("Counter")
        ips_container = database.get_container_client("VisitorIPs") 
        
        document_id = "1"

        # 1. Get the client IP robustly
        raw_ip = req.headers.get("x-client-ip") or req.headers.get("x-forwarded-for", "127.0.0.1")
        client_ip = raw_ip.split(',')[0].strip()
        
        if client_ip.count(":") == 1:
            client_ip = client_ip.split(":")[0]

        # 2. Hash the IP for privacy (GDPR compliance)
        ip_hash = hashlib.sha256(client_ip.encode('utf-8')).hexdigest()

        # 3. Check if this IP hash exists in the VisitorIPs container
        has_visited = True
        try:
            ips_container.read_item(item=ip_hash, partition_key=ip_hash)
        except exceptions.CosmosResourceNotFoundError:
            has_visited = False

        # 4. Read the current counter document
        try:
            item = counter_container.read_item(item=document_id, partition_key=document_id)
        except exceptions.CosmosResourceNotFoundError:
            item = {"id": document_id, "count": 0}
            item = counter_container.create_item(body=item)

        # 5. Increment ONLY if it's a new visitor
        if not has_visited:
            item['count'] += 1
            updated_item = counter_container.replace_item(item=document_id, body=item)
            
            # Log the IP hash in the tracking container
            ips_container.create_item(body={"id": ip_hash})
        else:
            updated_item = item 

        # 6. Return the secure count
        return func.HttpResponse(
            body=json.dumps({"count": updated_item['count']}),
            mimetype="application/json",
            status_code=200,
            headers=headers
        )
            
    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return func.HttpResponse(
            body="Error connecting to the database.",
            status_code=500,
            headers=headers
        )