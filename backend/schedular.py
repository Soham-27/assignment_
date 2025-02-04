from apscheduler.schedulers.background import BackgroundScheduler
from utils.warmup import warm_up_server

# Initialize APScheduler
scheduler = BackgroundScheduler()

# Add a cron job to warm up the server every 5 minutes
scheduler.add_job(warm_up_server, "interval", seconds=30)

def start_scheduler():
    """Start the scheduler if not already running."""
    if not scheduler.running:
        scheduler.start()
        print("Scheduler started")

def stop_scheduler():
    """Shutdown the scheduler."""
    scheduler.shutdown()
    print("Scheduler stopped")
