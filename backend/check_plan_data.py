import sqlalchemy
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:postgres@localhost/life_tracker"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("--- Plan Integrity Check ---")
    plan_id = 1
    plan = conn.execute(text(f"SELECT * FROM workout_plans WHERE id = {plan_id}")).fetchone()
    print(f"Plan: {plan}")
    
    exercises = conn.execute(text(f"SELECT * FROM exercises WHERE plan_id = {plan_id}")).fetchall()
    print(f"Exercises ({len(exercises)}):")
    for ex in exercises:
        print(ex)

    sessions = conn.execute(text(f"SELECT * FROM workout_sessions WHERE plan_id = {plan_id}")).fetchall()
    print(f"\nSessions ({len(sessions)}):")
    for sess in sessions:
        print(sess)
