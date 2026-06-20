import time
import schedule
from extract import extract_data
from transform import transform_data
from load import load_data

def run_etl():
    print("Starting ETL process...")
    try:
        raw_data = extract_data()
        print("Extraction complete.")
        
        transformed_data = transform_data(raw_data)
        print("Transformation complete.")
        
        load_data(transformed_data)
        print("ETL process completed successfully.")
    except Exception as e:
        print(f"ETL process failed: {e}")

if __name__ == "__main__":
    # Run once immediately for testing
    run_etl()
    
    # Schedule to run daily at midnight
    schedule.every().day.at("00:00").do(run_etl)
    
    print("ETL Scheduler is running. Press Ctrl+C to exit.")
    while True:
        schedule.run_pending()
        time.sleep(60)
