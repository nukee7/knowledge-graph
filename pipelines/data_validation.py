import json


def validate_dataset(path):

    print("Validating dataset...")

    with open(path) as f:

        data = json.load(f)

    if len(data) == 0:

        raise ValueError("Dataset is empty")

    required_fields = [
        "sentence",
        "entity1",
        "entity2",
        "relation"
    ]

    for sample in data:

        for field in required_fields:

            if field not in sample:

                raise ValueError(
                    f"Missing field: {field}"
                )

    print("Dataset validation passed")