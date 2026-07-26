terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.90.0"
    }
  }

  # This tells Terraform to store the state file in the Azure Storage Account
  # you create via the CLI/Portal.
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