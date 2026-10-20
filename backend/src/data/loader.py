import os
import numpy as np
import pandas as pd
from typing import Tuple, Optional


def reduce_mem_usage(df: pd.DataFrame, verbose: bool = False) -> pd.DataFrame:
    """
    Downcasts numeric columns to reduce memory footprint by up to 60-70%.
    Standard practice on the IEEE-CIS Fraud Detection competition dataset.
    """
    start_mem = df.memory_usage().sum() / 1024**2
    for col in df.columns:
        col_type = df[col].dtype

        if col_type != object and not pd.api.types.is_datetime64_any_dtype(df[col]):
            c_min = df[col].min()
            c_max = df[col].max()
            if str(col_type)[:3] == 'int':
                if c_min > np.iinfo(np.int8).min and c_max < np.iinfo(np.int8).max:
                    df[col] = df[col].astype(np.int8)
                elif c_min > np.iinfo(np.int16).min and c_max < np.iinfo(np.int16).max:
                    df[col] = df[col].astype(np.int16)
                elif c_min > np.iinfo(np.int32).min and c_max < np.iinfo(np.int32).max:
                    df[col] = df[col].astype(np.int32)
                elif c_min > np.iinfo(np.int64).min and c_max < np.iinfo(np.int64).max:
                    df[col] = df[col].astype(np.int64)
            else:
                if c_min > np.finfo(np.float32).min and c_max < np.finfo(np.float32).max:
                    df[col] = df[col].astype(np.float32)
                else:
                    df[col] = df[col].astype(np.float64)

    end_mem = df.memory_usage().sum() / 1024**2
    if verbose:
        print(f"Memory reduced: {start_mem:.2f} MB -> {end_mem:.2f} MB ({(start_mem - end_mem) / start_mem * 100:.1f}% reduction)")
    return df


def load_dataset(
    data_dir: str = "data",
    sample_size: Optional[int] = None,
    test_ratio: float = 0.2
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Loads transaction and identity data. If real IEEE-CIS CSVs exist in data_dir,
    loads them. Otherwise, automatically generates a high-fidelity synthetic
    benchmark dataset adhering to the IEEE-CIS schema.
    
    Returns (train_df, test_df) split chronologically on TransactionDT.
    """
    tx_path = os.path.join(data_dir, "train_transaction.csv")
    id_path = os.path.join(data_dir, "train_identity.csv")

    if os.path.exists(tx_path):
        print(f"Loading real IEEE-CIS dataset from {tx_path}...")
        df_tx = pd.read_csv(tx_path, nrows=sample_size)
        if os.path.exists(id_path):
            df_id = pd.read_csv(id_path)
            df = df_tx.merge(df_id, on="TransactionID", how="left")
        else:
            df = df_tx
        df = reduce_mem_usage(df)
    else:
        from src.data.generator import generate_benchmark_data
        print("IEEE-CIS raw files not found. Generating realistic benchmark dataset...")
        n_samples = sample_size if sample_size is not None else 60000
        df = generate_benchmark_data(n_samples=n_samples)

    # Chronological temporal split on TransactionDT (avoids future lookahead leakage)
    df = df.sort_values("TransactionDT").reset_index(drop=True)
    split_idx = int(len(df) * (1 - test_ratio))
    train_df = df.iloc[:split_idx].copy()
    test_df = df.iloc[split_idx:].copy()

    return train_df, test_df
