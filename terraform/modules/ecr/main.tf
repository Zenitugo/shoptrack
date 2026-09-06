############################ ECR Repository Template #########################

resource "aws_ecr_repository" "backend_repository" {
    name = "${var.project_name}-backend"
    image_tag_mutability = "MUTABLE"
    force_delete = true
    
    image_scanning_configuration {
        scan_on_push = true
    }
}