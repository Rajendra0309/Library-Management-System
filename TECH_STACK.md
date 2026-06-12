# Tech Stack Reference
## Library Management System — LMS

---

## APPROVED LIBRARIES ONLY

Use only libraries listed here. Do not install anything else without team lead approval.

---

## BACKEND (server/)

```
Package                 Version       Purpose
───────────────────────────────────────────────────────
express                 latest        Web framework
mongoose                latest        MongoDB ODM
jsonwebtoken            latest        JWT auth
bcryptjs                latest        Password hashing
dotenv                  latest        Environment variables
cors                    latest        Cross-origin requests
multer                  latest        File upload handling
aws-sdk                 latest        AWS S3 integration
nodemailer              latest        Email notifications
node-cron               latest        Scheduled jobs (fine calc)
express-validator       latest        Input validation
morgan                  latest        HTTP request logging
helmet                  latest        Security headers
```

## FRONTEND (client/)

```
Package                 Version       Purpose
───────────────────────────────────────────────────────
react                   18+           UI framework
react-dom               18+           DOM rendering
react-router-dom        v6            Client-side routing
axios                   latest        HTTP requests
@mui/material           latest        UI components
@mui/icons-material     latest        Icons
recharts                latest        Charts for dashboard
react-barcode           latest        Barcode display
```

## AI SERVICE (ai-service/)

```
Package                 Version       Purpose
───────────────────────────────────────────────────────
flask                   latest        REST API framework
flask-cors              latest        CORS for Flask
scikit-learn            latest        ML recommendation model
pandas                  latest        Data processing
pymongo                 latest        MongoDB connection
numpy                   latest        Numerical operations
```

## ETL PIPELINE (etl-pipeline/)

```
Package                 Version       Purpose
───────────────────────────────────────────────────────
pymongo                 latest        MongoDB read/write
pandas                  latest        Data transformation
schedule                latest        Daily ETL scheduling
python-dotenv           latest        Environment variables
```

## DEVOPS

```
Tool                    Purpose
───────────────────────────────────────────────
Docker                  Containerization
Docker Compose          Local multi-service setup
Nginx                   Reverse proxy on EC2
PM2                     Node.js process manager
GitHub Actions          CI/CD pipeline
```

## AWS SERVICES (Free Tier)

```
Service                 Purpose
───────────────────────────────────────────────
EC2 t2.micro            Backend + AI service hosting
S3                      Frontend static + file storage
Lambda                  Daily fine calculation trigger
CloudWatch              Monitoring + alerts
IAM                     Access management
MongoDB Atlas M0        Free database cluster
```

---

## DO NOT USE

```
- TypeScript (project uses JavaScript only)
- Redux (use Context API)
- GraphQL (use REST APIs)
- Firebase (use MongoDB Atlas)
- Vercel / Netlify (use AWS only)
- Any paid API or service
- React Query (use axios with useState/useEffect)
```
