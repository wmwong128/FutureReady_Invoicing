# Docker-oriented Python Server

## Directory Overview

### Important for TimesFM Model Development & Training

- `data/sales_data_sample` : Dataset downloaded from Kaggle.com (use as the reference sales data)
- `times_checpoint/torch_model.ckpt` : Exported trained TimesFM model checkpoints
- `timesfm_export/timesfm_config` : Exported trained TimesFM model configurations
- `timesfm_export/timesfm_model` : Exported trained TimesFM model weights
- `trainin` : Process of how the dataset from `sales_data_sample` is preprocessed and the TimesFM model is trained
- `testing` : Process of how the exported model (`timesfm_config`, `timesfm_model` and `torch_model.ckpt`) is tested
