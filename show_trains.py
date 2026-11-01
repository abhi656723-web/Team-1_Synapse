import joblib


def show_train_names():
    try:
        # Load the saved encoders from your final production run
        encoders = joblib.load('final_label_encoders.pkl')

        # Extract the specific encoder used for the trains
        train_encoder = encoders['train_type']

        # The 'classes_' attribute holds the original string names
        train_names = train_encoder.classes_

        print("\n" + "="*50)
        print(
            f" THE ML MODEL RECOGNIZES {len(train_names)} DIFFERENT TRAIN TYPES")
        print("="*50)

        # Print each train name with its corresponding encoded ML number
        for ml_number, name in enumerate(train_names):
            print(f" ML ID {ml_number}  ->  {name}")

        print("="*50 + "\n")

    except FileNotFoundError:
        print("Error: Could not find 'final_label_encoders.pkl'. Ensure you have run the final production preprocessing script.")


if __name__ == "__main__":
    show_train_names()
