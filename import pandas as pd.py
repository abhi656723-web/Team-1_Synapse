import pandas as pd
from datetime import datetime, timedelta

# 1. Load master dataset
input_file = 'kerala_express_12625_master_dataset.csv'
df = pd.read_csv(input_file)

# 2. Filter strictly for journeys from Dec 1, 2025 to Dec 31, 2025
dec_df = df[df['journey_start_date'].between(
    '2025-12-01', '2025-12-31')].copy()

# 3. Compute Actual Time of Arrival (ATA) from Scheduled Time (STA) + Delay


def compute_actual_arrival(row):
    sched = row['scheduled_arrival_time']
    if pd.isna(sched) or sched == '—':
        return '—'
    try:
        delay = int(row['target_arrival_delay_(min)'])
        dt = datetime.strptime(sched, '%H:%M')
        actual_dt = dt + timedelta(minutes=delay)
        return actual_dt.strftime('%H:%M')
    except Exception:
        return '—'


dec_df['actual_arrival_time'] = dec_df.apply(compute_actual_arrival, axis=1)

# 4. Select relevant columns
columns_to_keep = [
    'journey_start_date',
    'station_event_date',
    'station_code',
    'station_name',
    'scheduled_arrival_time',
    'actual_arrival_time',
    'target_arrival_delay_(min)'
]

result_df = dec_df[columns_to_keep].rename(columns={
    'target_arrival_delay_(min)': 'arrival_delay_min'
})

# 5. Export to CSV
output_file = 'december_2025_station_delays.csv'
result_df.to_csv(output_file, index=False)
print(f"Exported {len(result_df)} rows to {output_file}")
