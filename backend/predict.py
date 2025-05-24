import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.impute import SimpleImputer

def load_player_data(position):
    position_formatted = position.replace('_', ' ').title()
    df = pd.read_csv(f"data/{position}/{position_formatted}_player_scores.csv")
    weights_df = pd.read_csv(f"data/{position}/{position_formatted}_attributes_weights.csv")
    weights_dict = dict(zip(weights_df['Attribute'], weights_df['Weight']))
    return df, weights_dict

def preprocess_data(df, weights_dict):
    player_names = df['Player']
    positions = df['Position']
    df_clean = df.loc[:, ~df.columns.str.contains('^Unnamed')]
    X = df_clean.select_dtypes(include='number')
    weighted_X = X.copy()
    for col in X.columns:
        if col in weights_dict:
            normalized_weight = weights_dict[col] / max(weights_dict.values())
            weighted_X[col] = X[col] * normalized_weight
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(weighted_X)
    imputer = SimpleImputer(strategy='mean')
    X_scaled_imputed = imputer.fit_transform(X_scaled)
    return df_clean, player_names, positions, X_scaled_imputed

def get_similar_players(player_name, player_names, positions, X_scaled_imputed, top_n=5):
    if player_name not in player_names.values:
        return []
    player_idx = player_names[player_names == player_name].index[0]
    sim_scores = cosine_similarity(X_scaled_imputed[player_idx].reshape(1, -1), X_scaled_imputed).flatten()
    similar_indices = np.argsort(sim_scores)[::-1][1:top_n+1]
    return pd.DataFrame({
        'Player': player_names.iloc[similar_indices].values,
        'Position': positions.iloc[similar_indices].values,
        'Similarity': sim_scores[similar_indices]
    })

def get_player_fingerprint(player_name, df_clean, weights_dict, top_n=10):
    if player_name not in df_clean['Player'].values:
        return pd.DataFrame()
    numeric_cols = df_clean.select_dtypes(include='number').columns
    player_data = df_clean[df_clean['Player'] == player_name][numeric_cols]
    z_scores = (player_data - df_clean[numeric_cols].mean()) / df_clean[numeric_cols].std()
    weighted_z_scores = z_scores.copy()
    for col in z_scores.columns:
        if col in weights_dict:
            normalized_weight = weights_dict[col] / max(weights_dict.values())
            weighted_z_scores[col] = z_scores[col] * normalized_weight
    weighted_z_scores = weighted_z_scores.abs().T
    weighted_z_scores.columns = ['Weighted Z-Score']
    return weighted_z_scores.sort_values('Weighted Z-Score', ascending=False).head(top_n)

def compare_player_attributes(target_player, similar_players_df, df_clean, weights_dict, top_n_attributes=10):
    if target_player not in df_clean['Player'].values:
        return {}
    target_fingerprint = get_player_fingerprint(target_player, df_clean, weights_dict, top_n=top_n_attributes)
    top_attributes = target_fingerprint.index.tolist()
    target_data = df_clean[df_clean['Player'] == target_player][top_attributes]
    comparisons = {}
    for _, row in similar_players_df.iterrows():
        similar_player = row['Player']
        similar_data = df_clean[df_clean['Player'] == similar_player][top_attributes]
        player_comparisons = {}
        for attr in top_attributes:
            target_value = target_data[attr].values[0]
            similar_value = similar_data[attr].values[0]
            min_val = df_clean[attr].min()
            max_val = df_clean[attr].max()
            target_score = ((target_value - min_val) / (max_val - min_val)) * 100
            similar_score = ((similar_value - min_val) / (max_val - min_val)) * 100
            diff = similar_score - target_score
            player_comparisons[attr] = {
                'target_score': round(target_score, 1),
                'similar_score': round(similar_score, 1),
                'difference': round(diff, 1)
            }
        comparisons[similar_player] = player_comparisons
    return comparisons

def analyze_player(position, player_name):
    df, weights_dict = load_player_data(position)
    df_clean, player_names, positions, X_scaled_imputed = preprocess_data(df, weights_dict)
    similar_players = get_similar_players(player_name, player_names, positions, X_scaled_imputed)
    similar_players_data = similar_players.to_dict(orient='records') if isinstance(similar_players, pd.DataFrame) else []
    fingerprint = get_player_fingerprint(player_name, df_clean, weights_dict)
    comparisons = compare_player_attributes(player_name, similar_players, df_clean, weights_dict)
    return {
        'similar_players': similar_players_data,
        'fingerprint': fingerprint.reset_index().rename(columns={'index': 'Attribute'}).to_dict(orient='records'),
        'comparisons': comparisons
    }
