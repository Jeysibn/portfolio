output "function_app_name" {
  value = azurerm_linux_function_app.function.name
}

output "function_app_default_hostname" {
  value = azurerm_linux_function_app.function.default_hostname
}

output "application_insights_name" {
  value = azurerm_application_insights.portfolio.name
}

output "log_analytics_workspace_name" {
  value = azurerm_log_analytics_workspace.portfolio.name
}

output "health_endpoint" {
  value = "https://${azurerm_linux_function_app.function.default_hostname}/api/health"
}