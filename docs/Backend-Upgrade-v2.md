# Architecture Upgrade: Resilient & Privacy-First Visitor Tracking

## Overview
This document outlines the architectural upgrade to the portfolio's visitor tracking system. The initial implementation relied on a naive "increment-on-load" mechanism, which artificially inflated metrics upon page refreshes. The system has been redesigned to track unique visitors at the infrastructure level using **Azure Functions**, **Cosmos DB**, and **Terraform**, while strictly adhering to privacy-by-design principles.

## Old vs. New Architecture

| Feature | Previous Implementation | Upgraded Architecture |
| :--- | :--- | :--- |
| **State Management** | None (Blind increment) | Database-driven state verification |
| **Tracking Mechanism** | Front-end page load | Back-end IP extraction via Azure Load Balancer headers |
| **Data Privacy** | N/A | Cryptographic hashing (SHA-256) of client IPs (GDPR compliant) |
| **Data Lifecycle** | N/A | Automated cleanup using Cosmos DB Time-To-Live (TTL) |
| **Infrastructure Setup**| Manual / Unmanaged | Fully managed via Terraform (Infrastructure as Code) |

## Key Technical Implementations

### 1. Robust IP Extraction & Hashing
To reliably identify unique users without storing personally identifiable information (PII), the Azure Function extracts the client IP from the `x-client-ip` or `x-forwarded-for` headers. 
* **Sanitization:** The logic actively strips mutated proxy chains (comma-separated lists) and ephemeral port numbers injected by Azure's networking stack.
* **Privacy:** The sanitized IP is immediately subjected to a one-way `SHA-256` hash. The raw IP is never stored, ensuring GDPR compliance.

### 2. Automated State Cleanup (Cosmos DB TTL)
Instead of infinitely growing the database with visitor hashes, the system leverages Cosmos DB's **Time-To-Live (TTL)** feature. 
* A dedicated `VisitorIPs` container was provisioned via Terraform with a `default_ttl` of **86400 seconds (24 hours)**.
* Once a hash is logged, Cosmos DB automatically deletes the document after 24 hours. This keeps storage costs near zero and allows returning users to legitimately increment the counter on subsequent days.

### 3. Serverless Optimization (Connection Pooling)
To prevent SNAT port exhaustion and reduce cold start latency, the Cosmos DB Python SDK client is instantiated outside the function's main execution handler. This ensures that the HTTP connection to the database is pooled and reused across subsequent serverless invocations.

## Infrastructure as Code (Terraform)
The infrastructure additions were completely codified to maintain repeatable deployments.

```hcl
# Provisioning the ephemeral tracking container
resource "azurerm_cosmosdb_sql_container" "visitor_ips" {
  name                  = "VisitorIPs"
  resource_group_name   = azurerm_resource_group.rg.name
  account_name          = azurerm_cosmosdb_account.db.name
  database_name         = azurerm_cosmosdb_sql_database.sqldb.name
  partition_key_path    = "/id"
  partition_key_version = 1
  
  # Automated cleanup mechanism
  default_ttl           = 86400 
}