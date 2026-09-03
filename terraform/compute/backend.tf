terraform {
    backend "s3" { 
        bucket = "ugochi-shoptrack-buck"
        key     = "shoptrack/compute.tfstate"
        dynamodb_table = "ugochi-shoptrack-lock"
        region = "eu-central-1"
        encrypt = true
        use_lockfile = false
    }
}