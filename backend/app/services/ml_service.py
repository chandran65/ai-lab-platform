import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor, export_text
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.cluster import KMeans
from sklearn.metrics import mean_squared_error, mean_absolute_error, accuracy_score, precision_recall_fscore_support, confusion_matrix, silhouette_score
from sklearn.preprocessing import StandardScaler
from app.utils.data_generator import generate_house_prices, generate_spam_data, generate_student_scores
import json

def train_tabular_model(challenge_id, algorithm, hyperparameters, preprocessing, selected_features):
    """
    Trains a Scikit-Learn model dynamically based on features, preprocessing settings,
    and hyperparameters, returning performance metrics and explainability parameters.
    """
    # 1. Load dataset
    if challenge_id == 'house_prices':
        df = generate_house_prices(n_samples=500)
        target_col = 'price'
        is_classification = False
    elif challenge_id == 'spam_filter':
        df = generate_spam_data(n_samples=250)
        target_col = 'label'
        is_classification = True
    elif challenge_id == 'student_scores':
        df = generate_student_scores(n_samples=400)
        target_col = 'final_score'
        is_classification = False
    else:
        raise ValueError(f"Unknown challenge: {challenge_id}")

    # 2. Preprocess & Split
    if challenge_id == 'spam_filter':
        from sklearn.feature_extraction.text import TfidfVectorizer
        X_raw = df['message']
        y = df[target_col].values
        
        # Simple TF-IDF Vectorization for NLP
        vectorizer = TfidfVectorizer(max_features=50)
        X = vectorizer.fit_transform(X_raw).toarray()
        feature_names = vectorizer.get_feature_names_out().tolist()
        
        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
    else:
        # Tabular preprocessing
        available_features = [c for c in df.columns if c != target_col]
        features = [f for f in selected_features if f in available_features]
        if not features:
            features = available_features # fallback
            
        X_raw = df[features].copy()
        y = df[target_col].copy()
        
        # Missing values imputation
        if preprocessing.get('impute_missing', True):
            for col in X_raw.columns:
                if X_raw[col].dtype == 'object' or X_raw[col].dtype.name == 'category':
                    mode_val = X_raw[col].mode()
                    X_raw[col] = X_raw[col].fillna(mode_val[0] if not mode_val.empty else 'Medium')
                else:
                    mean_val = X_raw[col].mean()
                    X_raw[col] = X_raw[col].fillna(mean_val if not np.isnan(mean_val) else 0)
        else:
            # Fallback to zero imputation to avoid server crashes
            X_raw = X_raw.fillna(0)
            
        # Categorical variable encoding
        if preprocessing.get('encode_categorical', True):
            X_raw = pd.get_dummies(X_raw, drop_first=True)
        else:
            for col in X_raw.select_dtypes(include=['object']).columns:
                X_raw[col] = X_raw[col].astype('category').cat.codes
                
        feature_names = X_raw.columns.tolist()
        X_arr = X_raw.values
        
        # Feature scaling
        if preprocessing.get('scale_features', False):
            scaler = StandardScaler()
            X_arr = scaler.fit_transform(X_arr)
            
        X_train, X_val, y_train, y_val = train_test_split(X_arr, y.values, test_size=0.2, random_state=42)

    # 3. Model Hyperparameters Setup
    max_depth = hyperparameters.get('max_depth', None)
    if max_depth == 0 or max_depth == "None" or max_depth == "none":
        max_depth = None
    elif max_depth is not None:
        max_depth = int(max_depth)
        
    n_estimators = int(hyperparameters.get('n_estimators', 100))
    n_clusters = int(hyperparameters.get('n_clusters', 3))
    
    # 4. Instantiate and Fit
    if algorithm == 'linear_regression':
        model = LinearRegression()
    elif algorithm == 'logistic_regression':
        model = LogisticRegression(max_iter=1000)
    elif algorithm == 'decision_tree':
        if is_classification:
            model = DecisionTreeClassifier(max_depth=max_depth, random_state=42)
        else:
            model = DecisionTreeRegressor(max_depth=max_depth, random_state=42)
    elif algorithm == 'random_forest':
        if is_classification:
            model = RandomForestClassifier(n_estimators=n_estimators, max_depth=max_depth, random_state=42)
        else:
            model = RandomForestRegressor(n_estimators=n_estimators, max_depth=max_depth, random_state=42)
    elif algorithm == 'kmeans':
        model = KMeans(n_clusters=n_clusters, random_state=42, n_init='auto')
    else:
        raise ValueError(f"Unknown algorithm: {algorithm}")
        
    model.fit(X_train, y_train)
    
    # 5. Evaluate Model
    metrics = {}
    conf_matrix = None
    
    if algorithm == 'kmeans':
        labels = model.labels_
        sil = float(silhouette_score(X_train, labels)) if len(np.unique(labels)) > 1 else 0.0
        metrics = {
            'silhouette_score': sil,
            'inertia': float(model.inertia_)
        }
    else:
        preds = model.predict(X_val)
        if is_classification:
            acc = float(accuracy_score(y_val, preds))
            prec, rec, f1, _ = precision_recall_fscore_support(y_val, preds, average='binary', zero_division=0)
            cm = confusion_matrix(y_val, preds)
            conf_matrix = cm.tolist()
            metrics = {
                'accuracy': acc,
                'precision': float(prec),
                'recall': float(rec),
                'f1_score': float(f1)
            }
        else:
            rmse = float(np.sqrt(mean_squared_error(y_val, preds)))
            mae = float(mean_absolute_error(y_val, preds))
            r2 = float(model.score(X_val, y_val))
            metrics = {
                'rmse': rmse,
                'mae': mae,
                'r2_score': r2
            }
            
    # 6. Extract Feature Importances / Coefficients
    importances = {}
    if algorithm in ['linear_regression', 'logistic_regression']:
        coef = model.coef_[0] if len(model.coef_.shape) > 1 else model.coef_
        for name, c_val in zip(feature_names, coef):
            importances[name] = float(c_val)
    elif algorithm in ['decision_tree', 'random_forest'] and hasattr(model, 'feature_importances_'):
        for name, imp_val in zip(feature_names, model.feature_importances_):
            importances[name] = float(imp_val)
            
    # 7. Decision Tree Visualizer (Rule rules)
    tree_rules = ""
    if algorithm == 'decision_tree':
        tree_rules = export_text(model, feature_names=feature_names, max_depth=3)
        
    return {
        'metrics': metrics,
        'confusion_matrix': conf_matrix,
        'feature_importances': importances,
        'tree_rules': tree_rules,
        'feature_names': feature_names
    }
