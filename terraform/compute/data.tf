
data "terraform_remote_state" "foundation" {
  backend = "s3"
  config = {
    bucket = "ugochi-shoptrack-buck"
    key    = "fitness-app/terraform.tfstate"
    region = "eu-central-1"
  }
}