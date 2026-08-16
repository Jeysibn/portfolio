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

variable "opencode_api_key" {
  type        = string
  description = "OpenCode Zen API key injected into the Azure Function App."
  sensitive   = true

  validation {
    condition     = length(trimspace(var.opencode_api_key)) > 0
    error_message = "The OpenCode API key must not be empty."
  }
}
