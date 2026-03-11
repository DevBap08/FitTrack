import sqlalchemy
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:postgres@localhost/life_tracker"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("--- Database Reset (Selective) ---")
    
    print("Deleting all workout sessions (and linked logs)...")
    conn.execute(text("DELETE FROM set_logs"))
    conn.execute(text("DELETE FROM workout_sessions"))
    
    print("Deleting all food logs...")
    conn.execute(text("DELETE FROM food_logs"))
    
    print("Deleting all tasks...")
    conn.execute(text("DELETE FROM tasks"))
    
    conn.commit()
    
    print("\n--- Summary ---")
    plans = conn.execute(text("SELECT count(*) FROM workout_plans")).scalar()
    exercises = conn.execute(text("SELECT count(*) FROM exercises")).scalar()
    sessions = conn.execute(text("SELECT count(*) FROM workout_sessions")).scalar()
    
    print(f"Workout Plans remaining: {plans}")
    print(f"Exercises remaining: {exercises}")
    print(f"Sessions remaining: {sessions}")
    print("\nReset complete! Your user account and routines are preserved.")
