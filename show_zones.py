import joblib


def show_zones():
    try:
        encoders = joblib.load('final_label_encoders.pkl')
        zone_encoder = encoders['station_zone']

        print("\n" + "="*50)
        print(f" THE ML MODEL RECOGNIZES THESE STATION ZONES:")
        print("="*50)

        for ml_number, name in enumerate(zone_encoder.classes_):
            print(f" ML ID {ml_number}  ->  {name}")

        print("="*50 + "\n")

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    show_zones()
