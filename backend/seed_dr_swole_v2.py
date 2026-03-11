import sqlalchemy
from sqlalchemy import create_engine, text
from datetime import datetime
import os

# Database connection URL - using the one from .env context
DATABASE_URL = "postgresql://postgres:postgres@localhost/life_tracker"
engine = create_engine(DATABASE_URL)

USER_ID = 1 # Assuming default user id is 1
VIDEO_URL = "https://www.youtube.com/watch?v=XvH9lQfOnf8"

WORKOUTS = [
    {
        "name": "Upper 1 (Dr. Swole Low Volume)",
        "exercises": [
            ("Bench Press", 4, 8, "Chest"),
            ("Barbell Row", 3, 10, "Back"),
            ("Incline Dumbbell Fly", 3, 15, "Chest"),
            ("Dumbbell Pullover", 3, 15, "Back/Chest"),
            ("Dumbbell Skullcrusher", 3, 15, "Triceps"),
            ("Dumbbell Upright Row", 3, 10, "Shoulders"),
            ("Dumbbell Lateral Raise", 3, 12, "Shoulders")
        ]
    },
    {
        "name": "Lower 1 (Dr. Swole Low Volume)",
        "exercises": [
            ("Squat", 5, 8, "Quads"),
            ("RDL", 2, 10, "Hamstrings"),
            ("Bulgarian Split Squat", 3, 12, "Quads/Glutes"),
            ("Barbell Curl", 3, 12, "Biceps"),
            ("Single Arm Preacher Curl", 2, 10, "Biceps"),
            ("Single Leg Calf Raise", 4, 15, "Calves")
        ]
    },
    {
        "name": "Upper 2 (Dr. Swole Low Volume)",
        "exercises": [
            ("Barbell Overhead Press", 3, 8, "Shoulders"),
            ("Close-Grip Bench Press", 4, 10, "Triceps/Chest"),
            ("Weighted Chin-ups", 3, 10, "Back"),
            ("Dumbbell Seal Row", 3, 12, "Back"),
            ("Dumbbell Skullcrusher", 3, 10, "Triceps"),
            ("Barbell Upright Row", 3, 12, "Shoulders"),
            ("Dumbbell Lateral Raise", 3, 15, "Shoulders")
        ]
    },
    {
        "name": "Lower 2 (Dr. Swole Low Volume)",
        "exercises": [
            ("Deadlift", 3, 8, "Back/Hamstrings"),
            ("Squat", 4, 10, "Quads"),
            ("Good Morning", 2, 15, "Hamstrings/Back"),
            ("Lying Bicep Curl", 3, 10, "Biceps"),
            ("Hammer Curl", 2, 15, "Biceps"),
            ("Single Leg Calf Raise", 4, 12, "Calves")
        ]
    }
]

def seed():
    try:
        with engine.connect() as conn:
            print(f"Seeding Dr. Swole's Program...")
            for workout in WORKOUTS:
                # Create Plan
                res = conn.execute(
                    text("INSERT INTO workout_plans (owner_id, name, created_at) VALUES (:u, :n, :t) RETURNING id"),
                    {"u": USER_ID, "n": workout["name"], "t": datetime.utcnow()}
                )
                plan_id = res.scalar()
                print(f"Created Plan: {workout['name']} (ID: {plan_id})")

                # Create Exercises
                for idx, (name, sets, reps, muscle) in enumerate(workout["exercises"]):
                    conn.execute(
                        text("INSERT INTO exercises (plan_id, name, target_sets, target_reps, target_weight, muscle_group, order_index, video_url) VALUES (:p, :n, :s, :r, :w, :m, :o, :v)"),
                        {
                            "p": plan_id,
                            "n": name,
                            "s": sets,
                            "r": reps,
                            "w": 0,
                            "m": muscle,
                            "o": idx,
                            "v": VIDEO_URL
                        }
                    )
                    print(f"  Added Exercise: {name}")
            
            conn.commit()
            print("\nSeeding complete!")
    except Exception as e:
        print(f"Error seeding: {e}")

if __name__ == "__main__":
    seed()
