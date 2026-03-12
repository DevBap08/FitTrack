from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from typing import List, Optional
import models, schemas, auth, database
from database import engine, get_db

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Life Tracker API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",                    # Local development
        "https://project-eqm8o.vercel.app",         # Vercel production frontend
        "https://fittrack-api-yffr.onrender.com",   # Render backend self-reference
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"ERROR: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error. Please check backend logs."},
    )

# --- Authentication Endpoints ---

@app.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check for existing email
    db_user_email = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check for existing username
    db_user_name = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user_name:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_pwd = auth.get_password_hash(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- Task Endpoints ---

@app.post("/tasks", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    new_task = models.Task(**task.dict(), owner_id=current_user.id)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@app.get("/tasks", response_model=List[schemas.Task])
def get_user_tasks(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Task).filter(models.Task.owner_id == current_user.id).all()

@app.patch("/tasks/{task_id}", response_model=schemas.Task)
def update_task_status(task_id: int, completed: bool, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.owner_id == current_user.id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db_task.completed = completed
    db.commit()
    db.refresh(db_task)
    return db_task

# --- Workout Endpoints ---

@app.post("/workout-plans", response_model=schemas.WorkoutPlan)
def create_workout_plan(plan: schemas.WorkoutPlanCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_plan = models.WorkoutPlan(name=plan.name, owner_id=current_user.id)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    
    for ex_data in plan.exercises:
        db_exercise = models.Exercise(**ex_data.dict(), plan_id=db_plan.id)
        db.add(db_exercise)
    
    db.commit()
    db.refresh(db_plan)
    return db_plan

@app.get("/workout-plans", response_model=List[schemas.WorkoutPlan])
def get_workout_plans(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.WorkoutPlan).filter(models.WorkoutPlan.owner_id == current_user.id).all()

@app.delete("/workout-plans/{plan_id}")
def delete_workout_plan(plan_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_plan = db.query(models.WorkoutPlan).filter(models.WorkoutPlan.id == plan_id, models.WorkoutPlan.owner_id == current_user.id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    db.delete(db_plan)
    db.commit()
    return {"detail": "Plan deleted"}

@app.put("/workout-plans/{plan_id}", response_model=schemas.WorkoutPlan)
def update_workout_plan(plan_id: int, plan: schemas.WorkoutPlanCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_plan = db.query(models.WorkoutPlan).filter(models.WorkoutPlan.id == plan_id, models.WorkoutPlan.owner_id == current_user.id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    db_plan.name = plan.name
    
    # Delete old exercises and add new ones (standard way to handle update for simple relationships)
    db.query(models.Exercise).filter(models.Exercise.plan_id == plan_id).delete()
    
    for ex_data in plan.exercises:
        db_exercise = models.Exercise(**ex_data.dict(), plan_id=plan_id)
        db.add(db_exercise)
    
    db.commit()
    db.refresh(db_plan)
    return db_plan

@app.get("/profile", response_model=schemas.UserProfile)
def get_profile(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@app.put("/profile", response_model=schemas.UserProfile)
def update_profile(profile_data: schemas.UserProfileUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.UserProfile(user_id=current_user.id)
        db.add(profile)
    
    for key, value in profile_data.dict(exclude_unset=True).items():
        setattr(profile, key, value)
    
    # Simple TDEE calculation (Mifflin-St Jeor)
    if profile.weight_kg and profile.height_cm and profile.age:
        # BMR calculation
        if profile.gender == 'Male':
            bmr = (10 * profile.weight_kg) + (6.25 * profile.height_cm) - (5 * profile.age) + 5
        else:
            bmr = (10 * profile.weight_kg) + (6.25 * profile.height_cm) - (5 * profile.age) - 161
        
        # Activity Factor
        factors = {
            'Sedentary': 1.2,
            'Lightly Active': 1.375,
            'Moderately Active': 1.55,
            'Very Active': 1.725,
            'Extra Active': 1.9
        }
        factor = factors.get(profile.activity_level, 1.2)
        profile.tdee = bmr * factor
        
        # Set Calorie Target based on goal
        if profile.goal == 'Cut':
            profile.calorie_target = profile.tdee - 500
        elif profile.goal == 'Bulk':
            profile.calorie_target = profile.tdee + 300
        else:
            profile.calorie_target = profile.tdee
            
    db.commit()
    db.refresh(profile)
    return profile

# --- Food Log Endpoints ---
@app.post("/food-logs", response_model=schemas.FoodLog)
def create_food_log(food: schemas.FoodLogCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_food = models.FoodLog(**food.dict(), owner_id=current_user.id)
    db.add(db_food)
    db.commit()
    db.refresh(db_food)
    return db_food

@app.get("/food-logs", response_model=List[schemas.FoodLog])
def get_food_logs(date: Optional[str] = None, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.FoodLog).filter(models.FoodLog.owner_id == current_user.id)
    if date:
        # Expected format YYYY-MM-DD
        day_start = datetime.strptime(date, "%Y-%m-%d")
        query = query.filter(models.FoodLog.logged_at >= day_start)
    
    logs = query.all()
    # If a specific date was requested, ensure we only return that day's logs (simple filter for now)
    if date:
        logs = [log for log in logs if log.logged_at.strftime("%Y-%m-%d") == date]
    
    return logs

@app.delete("/food-logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_food_log(log_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    log = db.query(models.FoodLog).filter(models.FoodLog.id == log_id, models.FoodLog.owner_id == current_user.id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Food log not found")
    db.delete(log)
    db.commit()
    return None

@app.post("/workout-sessions", response_model=schemas.WorkoutSession)
def create_workout_session(session: schemas.WorkoutSessionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_session = models.WorkoutSession(
        owner_id=current_user.id,
        plan_id=session.plan_id,
        start_time=session.start_time,
        end_time=session.end_time,
        body_weight=session.body_weight,
        sleep_quality=session.sleep_quality,
        energy_level=session.energy_level,
        has_pain=session.has_pain,
        rating=session.rating,
        notes=session.notes
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    
    for log_data in session.logs:
        # PR Detection Logic: Compare actual weight/reps against history
        exercise = db.query(models.Exercise).filter(models.Exercise.id == log_data.exercise_id).first()
        is_pr = False
        # Simple PR check: better than target or first time? 
        # (Front-end sends is_pr, but we can verify here if needed)
        
        db_log = models.SetLog(
            **log_data.dict(exclude={'is_pr'}), 
            session_id=db_session.id,
            is_pr=log_data.is_pr
        )
        db.add(db_log)
    
    db.commit()
    db.refresh(db_session)
    return db_session

@app.get("/workout-sessions", response_model=List[schemas.WorkoutSession])
def get_workout_sessions(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.WorkoutSession).filter(models.WorkoutSession.owner_id == current_user.id).all()

@app.get("/exercises/{exercise_id}/history", response_model=List[schemas.SetLog])
def get_exercise_history(exercise_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Verify exercise exists and belongs to current user
    exercise = db.query(models.Exercise).join(models.WorkoutPlan).filter(
        models.Exercise.id == exercise_id,
        models.WorkoutPlan.owner_id == current_user.id
    ).first()
    
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
        
    return db.query(models.SetLog).filter(
        models.SetLog.exercise_id == exercise_id
    ).order_by(models.SetLog.timestamp.desc()).limit(10).all()

@app.get("/")
async def root():
    return {"message": "Welcome to Life Tracker API"}
