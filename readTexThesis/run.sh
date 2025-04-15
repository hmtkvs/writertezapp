#!/bin/bash
conda deactivate 2>/dev/null || true && conda deactivate 2>/dev/null || true && source "$(conda info --base)/etc/profile.d/conda.sh" && conda activate thesis && ./process_overleaf.sh