data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}



###################  Create Custom IAM Policy for EC2 Permissions ###################
data "aws_iam_policy_document" "ec2_permissions" {
  # ECR: Pull Docker images on startup
  statement {
    sid    = "ECRImagePull"
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage"
    ]
    resources = ["*"] # GetAuthorizationToken requires "*"
  }

  ################### Frontend Bucket (Read Only) ###################
  statement {
    sid    = "FrontendBucketRead"
    effect = "Allow"

    actions = [
      "s3:ListBucket",
      "s3:GetObject"
    ]

    resources = [
      var.frontend_bucket_arn,
      "${var.frontend_bucket_arn}/*"
    ]
  }


# Secrets Manager: Read database password
  statement {
    sid    = "SecretsManagerRead"
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue",
      "kms:Decrypt"
    ]
    resources = [
      var.db_secret_arn,
      "*"
    ]
  }
}



