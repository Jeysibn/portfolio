terraform {
  required_version = ">= 1.6.0, < 2.0.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.90.0"
    }
  }

  # Remote state is stored outside the application resource group so the
  # Terraform control state is independent from the resources it manages.
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "sttfstatejeysibn"
    container_name       = "tfstate"
    key                  = "portfolio.terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
}
