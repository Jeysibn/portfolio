resource "azurerm_resource_group" "rg" {
  name     = "rg-${var.project_prefix}-portfolio"
  location = var.location
}

# Storage Account for the Azure Function
resource "azurerm_storage_account" "function_sa" {
  name                            = "st${var.project_prefix}func"
  resource_group_name             = azurerm_resource_group.rg.name
  location                        = azurerm_resource_group.rg.location
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  allow_nested_items_to_be_public = false
}

# Cosmos DB Account (Free Tier Enabled)
resource "azurerm_cosmosdb_account" "db" {
  name                = "cosmos-${var.project_prefix}-portfolio"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  # Protects your student credits
  free_tier_enabled = true

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = azurerm_resource_group.rg.location
    failover_priority = 0
  }
}

# SQL Database inside Cosmos DB
resource "azurerm_cosmosdb_sql_database" "sqldb" {
  name                = "PortfolioDB"
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.db.name
}

# The application only point-reads and creates/replaces documents. Keep the
# Cosmos native role narrower than the built-in Data Contributor role.
resource "azurerm_cosmosdb_sql_role_definition" "function_runtime" {
  role_definition_id  = uuidv5("dns", "${azurerm_cosmosdb_account.db.id}|portfolio-runtime-data")
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.db.name
  name                = "Portfolio Runtime Data Access"
  assignable_scopes   = ["${azurerm_cosmosdb_account.db.id}/dbs/${azurerm_cosmosdb_sql_database.sqldb.name}"]

  permissions {
    data_actions = [
      "Microsoft.DocumentDB/databaseAccounts/readMetadata",
      "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/items/read",
      "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/items/create",
      "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/items/replace",
    ]
  }
}

# Container for the Visitor Counter
resource "azurerm_cosmosdb_sql_container" "counter_container" {
  name                  = "Counter"
  resource_group_name   = azurerm_resource_group.rg.name
  account_name          = azurerm_cosmosdb_account.db.name
  database_name         = azurerm_cosmosdb_sql_database.sqldb.name
  partition_key_paths   = ["/id"]
  partition_key_version = 1
}

# Consumption Plan for Serverless Function
resource "azurerm_service_plan" "asp" {
  name                = "asp-${var.project_prefix}-portfolio"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Linux"
  sku_name            = "Y1"
}

# Centralized telemetry store for Application Insights.
# The 0.1 GB/day cap keeps this personal portfolio below roughly 3.1 GB/month
# even if an unexpected logging spike occurs.
resource "azurerm_log_analytics_workspace" "portfolio" {
  name                = "law-${var.project_prefix}-portfolio"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  daily_quota_gb      = 0.1
}

resource "azurerm_application_insights" "portfolio" {
  name                = "appi-${var.project_prefix}-portfolio"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  workspace_id        = azurerm_log_analytics_workspace.portfolio.id
  application_type    = "web"
}

# Python Azure Function App
resource "azurerm_linux_function_app" "function" {
  name                       = "func-${var.project_prefix}-portfolio"
  location                   = azurerm_resource_group.rg.location
  resource_group_name        = azurerm_resource_group.rg.name
  service_plan_id            = azurerm_service_plan.asp.id
  storage_account_name       = azurerm_storage_account.function_sa.name
  storage_account_access_key = azurerm_storage_account.function_sa.primary_access_key

  identity {
    type = "SystemAssigned"
  }

  site_config {
    application_stack {
      python_version = "3.11"
    }
    cors {
      allowed_origins = [var.production_frontend_origin]
    }
  }

  app_settings = {
    # Keep the connection-string path available for an immediate rollback while
    # managed-identity data-plane access is verified in production.
    "CosmosDbConnectionString"              = azurerm_cosmosdb_account.db.primary_sql_connection_string
    "CosmosDbEndpoint"                      = azurerm_cosmosdb_account.db.endpoint
    "COSMOS_DB_AUTH_MODE"                   = var.cosmos_db_auth_mode
    "AzureWebJobsFeatureFlags"              = "EnableWorkerIndexing"
    "OPENCODE_API_KEY"                      = var.opencode_api_key
    "VISITOR_HASH_SECRET"                   = var.visitor_hash_secret
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.portfolio.connection_string
    # Mirrors the platform-level CORS origin above so the Function code's own
    # Access-Control-Allow-Origin header (see backend/function_app.py) can never
    # drift into a wider policy (e.g. "*") than what the platform allows.
    "ALLOWED_ORIGIN"  = var.production_frontend_origin
    "APP_VERSION"     = var.app_version
    "APP_ENVIRONMENT" = "production"
  }

  lifecycle {
    # The backend deployment action writes this dynamic package URL. Preserve it
    # during infrastructure-only Terraform applies so the app cannot fall back
    # to an older package after a restart.
    ignore_changes = [
      app_settings["WEBSITE_RUN_FROM_PACKAGE"],
      app_settings["APP_REVISION"],
    ]
  }
}

# Cosmos DB native data-plane RBAC. Scope access to this application's database;
# the role grants item/container data operations, not Azure control-plane rights.
# Runtime cutover remains an explicit variable.
resource "azurerm_cosmosdb_sql_role_assignment" "function_runtime" {
  name                = uuidv5("dns", "${azurerm_linux_function_app.function.id}|portfolio-runtime-data")
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.db.name
  role_definition_id  = azurerm_cosmosdb_sql_role_definition.function_runtime.id
  principal_id        = azurerm_linux_function_app.function.identity[0].principal_id
  scope               = "${azurerm_cosmosdb_account.db.id}/dbs/${azurerm_cosmosdb_sql_database.sqldb.name}"
}

resource "azurerm_cosmosdb_sql_container" "visitor_ips" {
  name                  = "VisitorIPs"
  resource_group_name   = azurerm_resource_group.rg.name
  account_name          = azurerm_cosmosdb_account.db.name
  database_name         = azurerm_cosmosdb_sql_database.sqldb.name
  partition_key_paths   = ["/id"]
  partition_key_version = 1

  # The DevOps flex: Automatically delete records after 24 hours (86400 seconds)
  default_ttl = 86400
}
