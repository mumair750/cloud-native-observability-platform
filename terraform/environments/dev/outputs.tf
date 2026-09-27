output "namespaces" {
  description = "List of managed namespaces"
  value       = [for ns in kubernetes_namespace.this : ns.metadata[0].name]
}

output "cluster_name" {
  description = "Cluster name"
  value       = var.cluster_name
}

output "environment" {
  description = "Environment"
  value       = var.environment
}
