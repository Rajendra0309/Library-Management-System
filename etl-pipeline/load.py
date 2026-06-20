import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        raise ValueError("DATABASE_URL not found in environment variables")
    if '?' in db_url:
        db_url = db_url.split('?')[0]
    return psycopg2.connect(db_url)

def load_data(report_data):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Generate a simple cuid-like string or just use UUID
        import uuid
        report_id = str(uuid.uuid4())

        query = """
            INSERT INTO "Report" (
                id, "totalBooks", "totalMembers", "activeBorrows", 
                "overdueBorrows", "totalFines", "genreStats", "borrowingTrends",
                date, "createdAt", "updatedAt"
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW(), NOW()
            )
        """
        
        values = (
            report_id,
            report_data['totalBooks'],
            report_data['totalMembers'],
            report_data['activeBorrows'],
            report_data['overdueBorrows'],
            report_data['totalFines'],
            report_data['genreStats'],
            report_data['borrowingTrends']
        )
        
        cursor.execute(query, values)
        conn.commit()
        print("Data loaded successfully into Report table.")
    except Exception as e:
        conn.rollback()
        print(f"Error loading data: {e}")
    finally:
        cursor.close()
        conn.close()
