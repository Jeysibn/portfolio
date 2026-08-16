resource "azurerm_resource_group" "rg" {
  name     = "rg-${var.project_prefix}-portfolio"
  location = var.location
}

# Storage Account for the Azure Function
resource "azurerm_storage_account" "function_sa" {
  name                     = "st${var.project_prefix}func"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# Cosmos DB Account (Free Tier Enabled)
resource "azurerm_cosmosdb_account" "db" {
  name                = "cosmos-${var.project_prefix}-portfolio"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  # Protects your student credits
  enable_free_tier = true

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

# Container for the Visitor Counter
resource "azurerm_cosmosdb_sql_container" "counter_container" {
  name                  = "Counter"
  resource_group_name   = azurerm_resource_group.rg.name
  account_name          = azurerm_cosmosdb_account.db.name
  database_name         = azurerm_cosmosdb_sql_database.sqldb.name
  partition_key_path    = "/id"
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

  site_config {
    application_stack {
      python_version = "3.11"
    }
    cors {
      allowed_origins = ["https://jeysibn.github.io"]
    }
  }

  app_settings = {
    "CosmosDbConnectionString"              = azurerm_cosmosdb_account.db.primary_sql_connection_string
    "AzureWebJobsFeatureFlags"              = "EnableWorkerIndexing"
    "OPENCODE_API_KEY"                      = var.opencode_api_key
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.portfolio.connection_string
  }
}

resource "azurerm_cosmosdb_sql_container" "visitor_ips" {
  name                  = "VisitorIPs"
  resource_group_name   = azurerm_resource_group.rg.name
  account_name          = azurerm_cosmosdb_account.db.name
  database_name         = azurerm_cosmosdb_sql_database.sqldb.name
  partition_key_path    = "/id"
  partition_key_version = 1

  # The DevOps flex: Automatically delete records after 24 hours (86400 seconds)
  default_ttl = 86400
}