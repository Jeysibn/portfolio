variable "location" {
  type        = string
  description = "The Azure region to deploy resources."
  default     = "koreacentral"
}

variable "project_prefix" {
  type        = string
  description = "Prefix for resource names."
  default     = "jeysibn"
}

variable "production_frontend_origin" {
  type        = string
  description = "The single production frontend origin allowed to call the Function App APIs. Used for both platform-level CORS and the app-level Access-Control-Allow-Origin header, so the two never drift out of sync."
  default     = "https://jeysibn.github.io"
}

variable "app_version" {
  type        = string
  description = "Value surfaced by GET /api/health as the deployed application version."
  default     = "1.0.0"
}

variable "opencode_api_key" {
  type        = string
  description = "OpenCode Zen API key injected into the Azure Function App."
  sensitive   = true

  validation {
    condition     = length(trimspace(var.opencode_api_key)) > 0
    error_message = "The OpenCode API key must not be empty."
  }
}

variable "visitor_hash_secret" {
  type        = string
  description = "Secret used for HMAC-SHA256 visitor pseudonyms. Store only in the deployment secret manager."
  sensitive   = true

  validation {
    condition     = length(trimspace(var.visitor_hash_secret)) >= 32
    error_message = "The visitor HMAC secret must be at least 32 characters."
  }
}
