import sqlalchemy
from sqlalchemy import create_engine, text
import os

DATABASE_URL = "postgresql://postgres:postgres@localhost/life_tracker"

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("--- Workout Plans ---")
    plans = conn.execute(text("SELECT count(*) FROM workout_plans")).scalar()
    print(f"Total Plans: {plans}")
    
    rows = conn.execute(text("SELECT id, name, owner_id FROM workout_plans")).fetchall()
    for row in rows:
        print(row)

    print("\n--- Deep Audit ---")
    
    # Check sessions
    sessions_null_plan = conn.execute(text("SELECT count(*) FROM workout_sessions WHERE plan_id IS NULL")).scalar()
    print(f"Sessions with NULL plan_id: {sessions_null_plan}")
    
    sessions_null_owner = conn.execute(text("SELECT count(*) FROM workout_sessions WHERE owner_id IS NULL")).scalar()
    print(f"Sessions with NULL owner_id: {sessions_null_owner}")

    # Check logs
    logs_null_session = conn.execute(text("SELECT count(*) FROM set_logs WHERE session_id IS NULL")).scalar()
    print(f"Logs with NULL session_id: {logs_null_session}")
    
    logs_null_exercise = conn.execute(text("SELECT count(*) FROM set_logs WHERE exercise_id IS NULL")).scalar()
    print(f"Logs with NULL exercise_id: {logs_null_exercise}")

    # Check for invalid references
    orphaned_sessions = conn.execute(text("SELECT count(*) FROM workout_sessions WHERE plan_id NOT IN (SELECT id FROM workout_plans)")).scalar()
    print(f"Sessions pointing to non-existent plans: {orphaned_sessions}")

    if sessions_null_plan > 0 or orphaned_sessions > 0:
        print("\nACTION: Deleting invalid sessions...")
        conn.execute(text("DELETE FROM workout_sessions WHERE plan_id IS NULL OR plan_id NOT IN (SELECT id FROM workout_plans)"))
        conn.commit()
