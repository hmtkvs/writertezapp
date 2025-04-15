#!/bin/bash

DOWNLOADS_DIR="/Users/frtna/Downloads"
PROJECT_DIR="$(pwd)"
DATA_DIR="$PROJECT_DIR/data"
ARCHIVE_DIR="$PROJECT_DIR/archive"
ZIP_PATTERN="Industrial PhD Hamit*.zip"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CURRENT_ARCHIVE_DIR="$ARCHIVE_DIR/data_$TIMESTAMP"

mkdir -p "$ARCHIVE_DIR"
mkdir -p "$CURRENT_ARCHIVE_DIR"

# Clean up old output directories in root
for output_dir in "$PROJECT_DIR"/output_*; do
    if [ -d "$output_dir" ]; then
        dir_name=$(basename "$output_dir")
        echo "Moving output directory from root to archive: $dir_name"
        mv "$output_dir" "$ARCHIVE_DIR/$dir_name"
    fi
done

if [ -d "$DATA_DIR" ]; then
    echo "Moving current data to archive..."
    mv "$DATA_DIR" "$CURRENT_ARCHIVE_DIR"
    echo "Current data moved to: $CURRENT_ARCHIVE_DIR"
fi

newest_zip=$(find "$DOWNLOADS_DIR" -name "$ZIP_PATTERN" -type f -exec stat -f "%m %N" {} \; | sort -n | tail -1 | cut -f2- -d" ")

if [ -z "$newest_zip" ]; then
    echo "No matching zip files found in Downloads folder (looking for: $ZIP_PATTERN)"
    exit 1
fi

echo "Found zip file: $newest_zip"

DATA_DIR="$CURRENT_ARCHIVE_DIR/data"
mkdir -p "$DATA_DIR"

zip_basename=$(basename "$newest_zip")
project_zip="$CURRENT_ARCHIVE_DIR/$zip_basename"
cp "$newest_zip" "$project_zip"
echo "Copied zip file to: $project_zip"

echo "Extracting zip file to data directory..."
unzip -q "$project_zip" -d "$DATA_DIR"

rm "$project_zip"
echo "Removed temporary zip file"

if conda env list | grep -q "^thesis "; then
    echo "Activating conda environment 'thesis'..."
    source "$(conda info --base)/etc/profile.d/conda.sh"
    conda activate thesis
else
    echo "WARNING: conda environment 'thesis' not found. Using system Python."
fi

echo "Running read_tex_files.py..."
OUTPUT_DIR=$(python "$PROJECT_DIR/read_tex_files.py" "$DATA_DIR" "$CURRENT_ARCHIVE_DIR" | grep "All files are organized in:" | cut -d ":" -f 2 | xargs)

if [ -z "$OUTPUT_DIR" ]; then
    echo "Could not capture output directory from read_tex_files.py output. Looking for most recent output directory..."
    OUTPUT_DIR=$(find "$CURRENT_ARCHIVE_DIR" -type d -name "output_*" -exec basename {} \; | sort -r | head -1)
    if [ -n "$OUTPUT_DIR" ]; then
        OUTPUT_DIR="$CURRENT_ARCHIVE_DIR/$OUTPUT_DIR"
    fi
fi

if [ -n "$OUTPUT_DIR" ] && [ -d "$OUTPUT_DIR" ]; then
    echo "Found output directory: $OUTPUT_DIR"

    echo "Running qdrant_create_update.py with output directory: $OUTPUT_DIR"
    python "$PROJECT_DIR/qdrant_create_update.py" << EOF
$OUTPUT_DIR
EOF
    
    echo "Vector store updated successfully!"
else
    echo "ERROR: Could not determine output directory. Vector store update skipped."
fi

# Clean up symbolic links in the root directory
if [ -L "$PROJECT_DIR/latest_data" ]; then
    rm "$PROJECT_DIR/latest_data"
fi
ln -s "$CURRENT_ARCHIVE_DIR" "$PROJECT_DIR/latest_data"
echo "Created symbolic link to latest data: latest_data -> $CURRENT_ARCHIVE_DIR"

# Create symbolic link to the latest output directory
OUTPUT_DIR_NAME=$(basename "$OUTPUT_DIR")
if [ -L "$PROJECT_DIR/latest_output" ]; then
    rm "$PROJECT_DIR/latest_output"
fi
ln -s "$OUTPUT_DIR" "$PROJECT_DIR/latest_output"
echo "Created symbolic link to latest output: latest_output -> $OUTPUT_DIR"

echo "Process completed successfully!" 