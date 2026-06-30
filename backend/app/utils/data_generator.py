import pandas as pd
import numpy as np
import random

# Set random seeds for reproducibility
np.random.seed(42)
random.seed(42)

def generate_house_prices(n_samples=500, is_test=False):
    """
    Generates synthetic house price dataset.
    Features:
    - sqft: 800 to 4500
    - bedrooms: 1 to 5
    - bathrooms: 1 to 4
    - neighborhood_quality: 1 to 10
    - year_built: 1950 to 2024
    - garage_spaces: 0 to 3
    """
    sqft = np.random.randint(800, 4501, n_samples)
    bedrooms = np.random.randint(1, 6, n_samples)
    bathrooms = np.random.randint(1, 5, n_samples)
    neighborhood_quality = np.random.randint(1, 11, n_samples)
    year_built = np.random.randint(1950, 2025, n_samples)
    garage_spaces = np.random.randint(0, 4, n_samples)
    
    # Introduce some missing values for Moderate/Advanced preprocessing challenges
    # (only in training, or test as well)
    sqft_with_nan = sqft.astype(float)
    if not is_test:
        nan_indices = np.random.choice(n_samples, size=int(n_samples * 0.05), replace=False)
        sqft_with_nan[nan_indices] = np.nan

    # Target formula
    base_price = 50000
    noise = np.random.normal(0, 15000, n_samples)
    price = (
        base_price + 
        sqft * 145 + 
        bedrooms * 12000 + 
        bathrooms * 18000 + 
        neighborhood_quality * 22000 + 
        (year_built - 1950) * 850 + 
        garage_spaces * 7500 + 
        noise
    )
    price = np.clip(price, 80000, 1200000)

    df = pd.DataFrame({
        'sqft': sqft_with_nan,
        'bedrooms': bedrooms,
        'bathrooms': bathrooms,
        'neighborhood_quality': neighborhood_quality,
        'year_built': year_built,
        'garage_spaces': garage_spaces
    })
    
    if not is_test:
        df['price'] = price.round(0)
    
    return df

def generate_spam_data(n_samples=200, is_test=False):
    """
    Generates synthetic SMS spam dataset.
    """
    spam_phrases = [
        "WINNER! Claim your FREE prize cash now! Call 09061701461.",
        "URGENT! Your mobile number has been awarded £2000 bonus. Click here.",
        "Get double data free today only. Subscribe by sending offer to 8007.",
        "Congratulations! You won a $1000 Walmart gift card. Get it now.",
        "Guaranteed cash prize of $5000! Text CLAIM to 89555.",
        "Free tones, weekly rewards, reply YES to join. T&C apply.",
        "Earn $500 daily working from home. No experience needed.",
        "Hot singles in your area. Chat free now!",
        "Final notice: Your account is suspended. Verify details at security-bank.com.",
        "Private! Your credit score is pre-approved for $10000 credit limit."
    ]
    
    ham_phrases = [
        "Hey, are you coming to study group tonight?",
        "Can you pick up some bread on your way home?",
        "Our project meeting is scheduled for 3 PM tomorrow.",
        "Did you do the biology homework yet?",
        "I will be a bit late, don't wait up for dinner.",
        "Happy birthday! Hope you have an awesome day.",
        "Thanks for the help yesterday, I really appreciate it.",
        "Are we still on for lunch at the cafeteria?",
        "The professor said the exam will cover chapters 4 to 6.",
        "Just finished my work, heading home now."
    ]
    
    data = []
    labels = []
    
    for _ in range(n_samples):
        # 30% spam, 70% ham
        is_spam = random.random() < 0.3
        if is_spam:
            phrase = random.choice(spam_phrases)
            # Add some slight variation
            if random.random() < 0.5:
                phrase += f" Code: {random.randint(1000, 9999)}"
            data.append(phrase)
            labels.append(1)
        else:
            phrase = random.choice(ham_phrases)
            if random.random() < 0.5:
                phrase = phrase.replace("tonight", "tomorrow").replace("bread", "milk")
            data.append(phrase)
            labels.append(0)
            
    df = pd.DataFrame({'message': data})
    if not is_test:
        df['label'] = labels
    return df

def generate_student_scores(n_samples=400, is_test=False):
    """
    Generates student performance scores.
    Features:
    - study_hours: 1.0 to 25.0 hours/week
    - attendance: 50 to 100 %
    - parental_support: 'Low', 'Medium', 'High'
    - school_activities: 'yes', 'no'
    - prev_grade: 40 to 100
    """
    study_hours = np.random.uniform(1.0, 25.0, n_samples)
    attendance = np.random.uniform(50.0, 100.0, n_samples)
    parental_support = np.random.choice(['Low', 'Medium', 'High'], n_samples, p=[0.25, 0.5, 0.25])
    school_activities = np.random.choice(['yes', 'no'], n_samples)
    prev_grade = np.random.uniform(40.0, 100.0, n_samples)
    
    # Target formula
    support_weights = {'Low': 0, 'Medium': 3, 'High': 7}
    activities_weights = {'yes': 2, 'no': 0}
    
    score = (
        prev_grade * 0.45 +
        study_hours * 1.25 +
        (attendance - 50) * 0.35 +
        np.vectorize(support_weights.get)(parental_support) +
        np.vectorize(activities_weights.get)(school_activities) +
        np.random.normal(0, 4, n_samples)
    )
    score = np.clip(score, 0, 100)
    
    # Introduce some missing parental support values
    parental_support_with_nan = parental_support.astype(object)
    if not is_test:
        nan_indices = np.random.choice(n_samples, size=int(n_samples * 0.08), replace=False)
        parental_support_with_nan[nan_indices] = np.nan
        
    df = pd.DataFrame({
        'study_hours': study_hours.round(1),
        'attendance': attendance.round(1),
        'parental_support': parental_support_with_nan,
        'school_activities': school_activities,
        'prev_grade': prev_grade.round(1)
    })
    
    if not is_test:
        df['final_score'] = score.round(1)
        
    return df
