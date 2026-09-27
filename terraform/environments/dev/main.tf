# ============================================
# Kubernetes Namespaces
# ============================================
resource "kubernetes_namespace" "this" {
  for_each = toset(var.namespaces)

  metadata {
    name = each.value
    labels = {
      environment = var.environment
      managed-by  = "terraform"
      project     = "cloud-native-observability-platform"
    }
  }
}
