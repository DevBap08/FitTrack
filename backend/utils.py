def calculate_bmi(height_cm: float, weight_kg: float) -> float:
    if not height_cm or not weight_kg or height_cm <= 0:
        return 0.0
    height_m = height_cm / 100
    return round(weight_kg / (height_m * height_m), 2)

def calculate_tdee(
    weight_kg: float, 
    height_cm: float, 
    age: int, 
    gender: str, 
    activity_level: str
) -> float:
    """
    Calculates TDEE using Mifflin-St Jeor Equation.
    Activity Levels: Sedentary (1.2), Lightly Active (1.375), Moderately Active (1.55), Very Active (1.725), Extra Active (1.9)
    """
    if not all([weight_kg, height_cm, age, gender, activity_level]):
        return 0.0
    
    # BMR calculation
    if gender.lower() == 'male':
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    else:
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
    
    multipliers = {
        "sedentary": 1.2,
        "lightly active": 1.375,
        "moderately active": 1.55,
        "very active": 1.725,
        "extra active": 1.9
    }
    
    multiplier = multipliers.get(activity_level.lower(), 1.2)
    return round(bmr * multiplier, 0)

def calculate_calorie_target(tdee: float, goal: str) -> float:
    """
    Goal: Bulk (+500), Cut (-500), Recomp (0)
    """
    if goal.lower() == 'bulk':
        return tdee + 500
    elif goal.lower() == 'cut':
        return tdee - 500
    return tdee
