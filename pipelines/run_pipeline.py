import subprocess
import sys


def run_step(step_name, command):

    print(f"\n===== Running: {step_name} =====")

    result = subprocess.run(
        command,
        shell=True
    )

    if result.returncode != 0:

        print(f"{step_name} failed")

        sys.exit(1)

    print(f"{step_name} completed")


def main():

    steps = [

        (
            "Data Preprocessing",
            "python src/preprocess.py"
        ),

        (
            "Model Training",
            "python src/train.py"
        ),

        (
            "Model Testing",
            "python src/test.py"
        ),

        (
            "Start API Server",
            "uvicorn api.server:app --host 0.0.0.0 --port 8000"
        )

    ]

    for step_name, command in steps:

        run_step(
            step_name,
            command
        )


if name == "main":

    main()