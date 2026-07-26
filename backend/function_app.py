import azure.functions as func
from azure.cosmos import CosmosClient, exceptions
import os
import json
import logging

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

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
        connection_string = os.environ["CosmosDbConnectionString"]
        client = CosmosClient.from_connection_string(connection_string)
        database = client.get_database_client("PortfolioDB")
        container = database.get_container_client("Counter")
        document_id = "1"
        
        try:
            # Read, increment, and replace
            item = container.read_item(item=document_id, partition_key=document_id)
            item['count'] += 1
            updated_item = container.replace_item(item=document_id, body=item)
            
            return func.HttpResponse(
                body=json.dumps({"count": updated_item['count']}),
                mimetype="application/json",
                status_code=200,
                headers=headers
            )

        except exceptions.CosmosResourceNotFoundError:
            # Create the first document if it doesn't exist
            new_item = {"id": document_id, "count": 1}
            container.create_item(body=new_item)
            return func.HttpResponse(
                body=json.dumps({"count": 1}),
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