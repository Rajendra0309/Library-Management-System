# Complete AWS Deployment & Cleanup Guide

You are completely right about the "Chicken and Egg" problem! You cannot set up the ECS Backend if the Docker images aren't in ECR yet. Because of this, the deployment happens in a specific order:
1. Create the AWS Registries and Database.
2. Push your code to GitHub (this uploads the Docker images to AWS).
3. Start the ECS Server using those images.
4. Get the Server's IP address and trigger the Frontend deployment again with that IP.

Follow these exact steps:

---

## Phase 1: Preparation (Registries and Database)

### Step 1: Set up the Database (Amazon RDS)
1. Go to **RDS** in the AWS Console and click **Create database**.
2. **Database creation method:** Standard create
3. **Engine options:** PostgreSQL (Version 15)
4. **Templates:** Free tier (crucial to save money!)
5. **Settings:**
   - **DB instance identifier:** `lms-database`
   - **Master username:** `postgres`
   - **Master password:** `[Create a strong password and save it]`
6. **Connectivity:**
   - **Public access:** **Yes** *(Note: For a real production app, this is No, but for an internship showcase without a VPN/VPC peering setup, Yes makes it much easier for your laptop and GitHub Actions to connect).*
7. Click **Create database**. Once it finishes creating, click on it and copy the **Endpoint** URL.

### Step 2: Set up Container Registries (Amazon ECR)
You need THREE repositories to store your Docker images.
1. Go to **Elastic Container Registry (ECR)** in the AWS Console.
2. Click **Create repository**.
3. **Visibility:** Private.
4. **Repository name:** `lms-server`
5. Click **Create repository**.
6. Repeat steps 2-5 to create a second repository named: `lms-ai-service`
7. Repeat steps 2-5 to create a third repository named: `lms-etl-pipeline`
*(Note: Your GitHub Actions pipeline is hardcoded to look for these exact names).*

### Step 3: Set up the Frontend Bucket (Amazon S3)
1. Go to **S3** and click **Create bucket**.
2. **Bucket name:** `lms-frontend-showcase`
3. **Block Public Access settings:** Uncheck "Block *all* public access" (Acknowledge the warning).
4. Click **Create bucket**.
5. Click your new bucket -> **Properties** tab -> scroll to bottom -> **Static website hosting** -> **Edit** -> **Enable**.
   - Index document: `index.html`
   - Error document: `index.html` (Important for React Router).
6. Go to the **Permissions** tab -> **Bucket Policy** -> **Edit**:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Sid": "PublicReadGetObject",
               "Effect": "Allow",
               "Principal": "*",
               "Action": "s3:GetObject",
               "Resource": "arn:aws:s3:::lms-frontend-showcase/*"
           }
       ]
   }
   ```

### Step 4: Set up the Book Assets Bucket (Amazon S3)
Your Librarians will upload Book Covers and eBook PDFs. The Backend Server uses the AWS SDK to save these directly to S3.
1. Go to **S3** and click **Create bucket**.
2. **Bucket name:** `lms-digital-assets` (or a unique name).
3. **Block Public Access settings:** Uncheck "Block *all* public access".
4. Click **Create bucket**.
5. Add the exact same **Bucket Policy** as the frontend above, but replace the Resource line with `"Resource": "arn:aws:s3:::lms-digital-assets/*"`.

---

## Phase 2: First Push (Upload Images to AWS)

1. Create a `github-actions-user` in AWS IAM with `AdministratorAccess` and generate Access Keys.
2. Go to **GitHub Settings -> Secrets and variables -> Actions** and add:
   - `AWS_ACCESS_KEY_ID`: Your IAM Access Key
   - `AWS_SECRET_ACCESS_KEY`: Your IAM Secret Key
   - `AWS_REGION`: e.g., `us-east-1`
   - `AWS_S3_BUCKET_NAME`: `lms-frontend-showcase`
   - *Leave VITE_API_URL empty for now!*
3. **COMMIT AND PUSH YOUR CODE TO GITHUB `main` BRANCH.**
4. Go to the Actions tab in GitHub. Wait for the `CI/CD Pipeline for AWS ECS Fargate` workflow to finish. It will successfully build and push the `lms-server`, `lms-ai-service`, and `lms-etl-pipeline` images to your ECR registries!

---

## Phase 3: Start the Backend (Amazon ECS Fargate)

Now that your images are in ECR, you can start the servers.

1. Go to **Elastic Container Service (ECS)**.
2. **Create a Cluster:** 
   - **Cluster name:** `lms-cluster`
   - **Infrastructure:** AWS Fargate (serverless)
   - Click **Create**.
3. **Create a Task Definition:**
   - Go to "Task definitions" -> **Create new task definition**.
   - **Task definition family:** `lms-task`
   - **Launch type:** Fargate
   - **OS/Architecture:** Linux/X86_64
   - **Task size:** 1 vCPU, 2 GB Memory.
   
   - **Container 1 (Server):**
     - **Name:** `lms-server-container`
     - **Image URI:** `[Paste your ECR URI for lms-server]:latest`
     - **Port mappings:** 5000 (TCP)
     - **Environment variables:** Add the following:
       - `DATABASE_URL`: `postgresql://postgres:password@lms-database.xyz.us-east-1.rds.amazonaws.com:5432/library_db?schema=public`
       - `JWT_SECRET`: `your_secure_secret_string`
       - `AWS_REGION`: `us-east-1`
       - `AWS_BUCKET_NAME`: `lms-digital-assets`
       - `AWS_ACCESS_KEY_ID`: `your_iam_access_key`
       - `AWS_SECRET_ACCESS_KEY`: `your_iam_secret_key`
       - `EMAIL_USER`: `your-library-email@gmail.com`
       - `EMAIL_PASS`: `16_character_app_password_without_spaces`
       - `CRON_SECRET_KEY`: `your_secure_cron_secret`
     - Click **Create** to save the Task Definition.
   
   - **Container 2 (AI Service):**
     - Click **Add more containers**.
     - **Name:** `lms-ai-container`
     - **Image URI:** `[Paste your ECR URI for lms-ai-service]:latest`
     - **Port mappings:** 5001 (TCP)
     - **Environment variables:** Add `DATABASE_URL` (Set to the same connection string as the server).
     
   - **Container 3 (ETL Pipeline):**
     - Click **Add more containers**.
     - **Name:** `lms-etl-container`
     - **Image URI:** `[Paste your ECR URI for lms-etl-pipeline]:latest`
     - **Port mappings:** (Leave blank, it just runs in the background!)
     - **Environment variables:** Add `DATABASE_URL` (Set to the same connection string as the server).
   
   - Click **Create**.
4. **Run the Service:**
   - Go back to your `lms-cluster`.
   - Under the Services tab, click **Create**.
   - **Compute options:** Launch type (Fargate).
   - **Task definition:** Select `lms-task`.
   - **Service name:** `lms-server-service` *(Must match exactly for GitHub Actions).*
   - Click **Create**. 
5. Click on the Service you just created, go to the **Configuration and Tasks** tab, click on the running Task, and copy its **Public IP Address**.

---

## Phase 4: Final Frontend Sync

1. Go back to GitHub -> **Settings -> Secrets and variables -> Actions**.
2. Add a new secret: `VITE_API_URL` and set the value to `http://[THE_PUBLIC_IP_FROM_ECS]:5000`.
3. Go to the **Actions** tab in GitHub, select the `Deploy React Frontend to S3` workflow, and click **Run workflow** (Manual Trigger). 
4. The frontend will rebuild with the correct API URL and upload to S3! You can now access your site through CloudFront or the S3 URL.

---
## Phase 5: Setup Automated Cron Jobs (EventBridge & Lambda)

To automatically calculate late fines and send overdue emails every day at midnight:

1. Go to **AWS Lambda** and create a new function (Node.js 20+ runtime).
2. Name it `lms-cron-job`.
3. In the Configuration -> **Environment variables**, add:
   - `API_URL`: `http://<your-ecs-public-ip>:5000/api/fines/trigger-cron`
   - `CRON_SECRET_KEY`: `your_secure_cron_secret` (MUST MATCH the one in ECS).
4. Paste the fetch logic into the Lambda `index.mjs` to hit your `/api/cron/process-overdue` endpoint using a POST request with the `Authorization: Bearer <CRON_SECRET_KEY>` header.
5. Go to **Amazon EventBridge** -> Rules -> **Create rule**.
6. Rule type: **Schedule**.
7. Cron expression: `0 0 * * ? *` (Runs every day at midnight UTC).
8. Target: Your `lms-cron-job` Lambda function.
9. Save. The system will now automatically process fines daily!

---
---

## 🧹 AWS Cleanup Guide (How to avoid getting billed!)

AWS charges by the hour. When your internship presentation is over, **DELETE EVERYTHING** in this exact order:

1. **Delete ECS Service & Task:**
   - Go to ECS -> `lms-cluster` -> Select `lms-server-service` -> Click **Delete**.
   - Go to Task Definitions -> Select `lms-task` -> Deregister.
   - Go back to Clusters -> Select `lms-cluster` -> **Delete cluster**.

2. **Delete ECR Images:**
   - Go to ECR. Select `lms-server` -> Click **Delete**.
   - Select `lms-ai-service` -> Click **Delete**.
   - Select `lms-etl-pipeline` -> Click **Delete**.

3. **Delete RDS Database:**
   - Go to RDS -> Databases -> Select `lms-database` -> Click **Actions** -> **Delete**.
   - *Important:* Uncheck "Create final snapshot" (or they will charge you for the snapshot storage!). Type "delete me" to confirm.

4. **Empty and Delete S3 Buckets:**
   - Go to S3. You have TWO buckets to delete (`lms-frontend-showcase` and `lms-digital-assets`).
   - Select a bucket -> Click **Empty** (You must empty it before deleting). Type "permanently delete".
   - Now click **Delete** on the empty bucket. Repeat for the second bucket.

5. **Delete CloudFront (if used):**
   - Go to CloudFront. Select your distribution -> Click **Disable**.
   - Wait 3-5 minutes for it to fully disable.
   - Once disabled, select it again and click **Delete**.

6. **Delete IAM User:**
   - Go to IAM -> Users -> Select `github-actions-user` -> Click **Delete**.
