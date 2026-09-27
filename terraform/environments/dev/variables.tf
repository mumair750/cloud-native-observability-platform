variable "cluster_name" {
  description = "Name of the kind cluster"
  type        = string
  default     = "observability-cluster"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "namespaces" {
  description = "List of namespaces to create"
  type        = list(string)
  default = [
    "apps",
    "monitoring",
    "logging",
    "tracing"
  ]
}
