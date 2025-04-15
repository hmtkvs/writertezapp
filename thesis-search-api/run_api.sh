# #!/bin/bash

# # Print current conda environment
# echo "Current conda environment: $CONDA_DEFAULT_ENV"

# # Find conda executable
# CONDA_EXE=$(which conda)
# echo "Conda executable: $CONDA_EXE"

# # Get Python path from conda environment
# if [ "$CONDA_DEFAULT_ENV" = "thesis" ]; then
#     PYTHON_PATH=$(conda run -n thesis which python)
#     echo "Using Python from conda thesis environment: $PYTHON_PATH"
# else
#     echo "Warning: Not in thesis conda environment. Activating..."
#     source $(conda info --base)/etc/profile.d/conda.sh
#     conda activate thesis
#     PYTHON_PATH=$(which python)
#     echo "Using Python: $PYTHON_PATH"
# fi

PYTHON_PATH=$(which python)
# # Run the FastAPI application with uvicorn
# echo "Starting Thesis Search API server..."
# cd "$(dirname "$0")"  # Change to script directory
$PYTHON_PATH -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload 