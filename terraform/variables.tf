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