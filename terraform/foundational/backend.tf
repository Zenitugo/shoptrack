terraform {
    backend "s3" { 
        bucket = "ugochi-project1-buck2"
        key     = "shoptrack/terraform.tfstate"
        dynamodb_table = "ugochi-shoptrack-lock"
        region = "eu-north-1"
        encrypt = true
        use_lockfile = false
    }
}