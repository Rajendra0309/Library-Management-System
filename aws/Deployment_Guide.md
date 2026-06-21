# AWS Deployment Guide (Enterprise Architecture)

This guide documents the "Building the House" phase. As a team, you will follow these instructions once to manually configure the AWS Cloud infrastructure. After this is complete, the GitHub Actions CI/CD pipeline will automatically handle all future updates!

---

## 1. AWS Database Setup (Amazon RDS)
We use a managed PostgreSQL database.

**Steps in AWS Console:**
1. Navigate to **RDS** -> **Databases** -> **Create Database**.
2. Select **PostgreSQL** (Free Tier).
3. Set DB instance identifier to `lms-db`.
4. Set Master username (`postgres`) and Master password.
5. Disable "Storage Autoscaling" to save costs.
6. Under "Connectivity", set **Public access** to "Yes" (so your local machine and Fargate can reach it).
7. Under "VPC security groups", ensure inbound rules allow Port `5432` from `0.0.0.0/0`.
8. Click **Create Database**.
9. *Wait 5 minutes.* Note down the **Endpoint URL**. This is your `DATABASE_URL`.

---

## 2. AWS Frontend Setup (S3 + CloudFront)
We will host the React app on a global CDN.

**Steps in AWS Console (S3):**
1. Navigate to **S3** -> **Create Bucket**.
2. Name it `lms-frontend-bucket`.
3. Uncheck **Block all public access**.
4. Enable **Static website hosting** (Index document: `index.html`, Error document: `index.html`).
5. Click **Create**.
6. Add this Bucket Policy (replace `your-bucket-name`):
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

**Steps in AWS Console (CloudFront):**
1. Navigate to **CloudFront** -> **Create Distribution**.
2. Origin Domain: Select your new S3 bucket.
3. Default Root Object: `index.html`.
4. Click **Create Distribution**.
5. *Note down the CloudFront Domain Name.* This is your live website URL!

---

## 3. AWS Backend Setup (ECS Fargate)
We will run the Docker containers in a serverless cluster.

**Steps in AWS Console:**
1. Navigate to **Elastic Container Registry (ECR)** -> **Create Repository**.
   - Create one named `lms-server`.
   - Create one named `lms-ai-service`.
2. Navigate to **ECS** -> **Clusters** -> **Create Cluster**. Name it `lms-cluster`.
3. Navigate to **Task Definitions** -> **Create New Task Definition**.
   - Select **AWS Fargate**.
   - Add two containers:
     - `server` (Port 5000) pointing to your ECR Image URL.
     - `ai-service` (Port 5001) pointing to your ECR Image URL.
4. Add all the Environment Variables below into the Task Definition.

---

## 4. GitHub Actions CI/CD Setup

To allow GitHub to automatically upload code to AWS, you must provide it with an IAM User key.

**Steps:**
1. In AWS, go to **IAM** -> **Users** -> **Create User** (Name: `github-actions-user`).
2. Attach policy: `AdministratorAccess` (For simplicity in this capstone, but restrict later).
3. Create an **Access Key**. Note down the ID and Secret.
4. Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.

Add the following Secrets:
- `AWS_ACCESS_KEY_ID`: Your IAM access key.
- `AWS_SECRET_ACCESS_KEY`: Your IAM secret key.
- `AWS_REGION`: e.g., `us-east-1`
- `DATABASE_URL`: Your RDS endpoint (e.g., `postgresql://postgres:password@lms-db.cxxxx.us-east-1.rds.amazonaws.com:5432/postgres`)
- `JWT_SECRET`: A long random string.

---

## 📧 5. Nodemailer Configuration (Bypassing AWS Port 25 Block)

AWS blocks Port 25, which breaks standard email servers. We will use a standard Gmail account on **Port 465**, which AWS fully allows. This allows you to send emails to **anyone** without being restricted by AWS SES.

**Steps:**
1. Go to your Google Account Settings -> **Security**.
2. Enable **2-Step Verification**.
3. Search for **App Passwords** and generate a new one (Name: "LMS App").
4. Copy the 16-character password.
5. In your Node.js `.env` or ECS Environment Variables, add:
   - `EMAIL_HOST`: `smtp.gmail.com`
   - `EMAIL_PORT`: `465`
   - `EMAIL_SECURE`: `true`
   - `EMAIL_USER`: `your-email@gmail.com`
   - `EMAIL_PASS`: `the-16-character-app-password`

*Your Node.js Mailer Utility is already set up to read these variables!*
