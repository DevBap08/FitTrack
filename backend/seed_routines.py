import requests
import json

base_url = "https://fittrack-api-yffr.onrender.com"
username = "Rafael23"
password = "Rafael0821@"

# 1. Login
resp = requests.post(f"{base_url}/token", data={"username": username, "password": password})
if resp.status_code != 200:
    print("Login failed:", resp.text)
    exit(1)

token = resp.json()["access_token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
print(f"Successfully logged in as {username}")

# 2. Plans data transcribed from user's image
plans = [
    {
        "name": "Dr. Swole - UPPER 1",
        "exercises": [
            {"name": "Bench press", "target_sets": 4, "target_reps": 8, "muscle_group": "Chest", "order_index": 0},
            {"name": "Barbell row", "target_sets": 3, "target_reps": 10, "muscle_group": "Back", "order_index": 1},
            {"name": "Incline dumbbell fly", "target_sets": 3, "target_reps": 15, "muscle_group": "Chest", "order_index": 2},
            {"name": "Dumbbell pullover", "target_sets": 3, "target_reps": 15, "muscle_group": "Back", "order_index": 3},
            {"name": "Dumbbell skullcrusher", "target_sets": 3, "target_reps": 15, "muscle_group": "Arms", "order_index": 4},
            {"name": "Dumbbell upright row", "target_sets": 3, "target_reps": 10, "muscle_group": "Shoulders", "order_index": 5},
            {"name": "Dumbbell lateral raise", "target_sets": 3, "target_reps": 12, "muscle_group": "Shoulders", "order_index": 6}
        ]
    },
    {
        "name": "Dr. Swole - LOWER 1",
        "exercises": [
            {"name": "Squat", "target_sets": 5, "target_reps": 8, "muscle_group": "Legs", "order_index": 0},
            {"name": "RDL", "target_sets": 2, "target_reps": 10, "muscle_group": "Legs", "order_index": 1},
            {"name": "Bulgarian split squat", "target_sets": 3, "target_reps": 12, "muscle_group": "Legs", "order_index": 2},
            {"name": "Barbell curl", "target_sets": 3, "target_reps": 12, "muscle_group": "Arms", "order_index": 3},
            {"name": "Single arm preacher curl", "target_sets": 2, "target_reps": 10, "muscle_group": "Arms", "order_index": 4},
            {"name": "Single leg calf raise", "target_sets": 4, "target_reps": 15, "muscle_group": "Legs", "order_index": 5}
        ]
    },
    {
        "name": "Dr. Swole - UPPER 2",
        "exercises": [
            {"name": "Barbell overhead press", "target_sets": 3, "target_reps": 8, "muscle_group": "Shoulders", "order_index": 0},
            {"name": "Close-grip bench press", "target_sets": 4, "target_reps": 10, "muscle_group": "Arms", "order_index": 1},
            {"name": "Weighted chin-ups", "target_sets": 3, "target_reps": 10, "muscle_group": "Back", "order_index": 2},
            {"name": "Dumbbell seal row", "target_sets": 3, "target_reps": 12, "muscle_group": "Back", "order_index": 3},
            {"name": "Dumbbell skullcrusher", "target_sets": 3, "target_reps": 10, "muscle_group": "Arms", "order_index": 4},
            {"name": "Barbell upright row", "target_sets": 3, "target_reps": 12, "muscle_group": "Shoulders", "order_index": 5},
            {"name": "Dumbbell lateral raise", "target_sets": 3, "target_reps": 15, "muscle_group": "Shoulders", "order_index": 6}
        ]
    },
    {
        "name": "Dr. Swole - LOWER 2",
        "exercises": [
            {"name": "Deadlift", "target_sets": 3, "target_reps": 8, "muscle_group": "Legs", "order_index": 0},
            {"name": "Squat", "target_sets": 4, "target_reps": 10, "muscle_group": "Legs", "order_index": 1},
            {"name": "Good morning", "target_sets": 2, "target_reps": 15, "muscle_group": "Legs", "order_index": 2},
            {"name": "Lying bicep curl", "target_sets": 3, "target_reps": 10, "muscle_group": "Arms", "order_index": 3},
            {"name": "Hammer curl", "target_sets": 2, "target_reps": 15, "muscle_group": "Arms", "order_index": 4},
            {"name": "Single leg calf raise", "target_sets": 4, "target_reps": 12, "muscle_group": "Legs", "order_index": 5}
        ]
    }
]

for plan in plans:
    resp = requests.post(f"{base_url}/workout-plans", headers=headers, json=plan)
    if resp.status_code == 200:
        print(f"Created: {plan['name']}")
    else:
        print(f"Failed to create {plan['name']}: {resp.text}")
