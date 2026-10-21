# Step 5: Check Results, Save Checkpoints, and Troubleshoot

Check both the Slurm status and the files created by your Python script. Slurm output tells you what the script printed; checkpoints and other result files are saved separately by your code.

## Check where results were saved

The Slurm output file is `slurm-<job-id>.out` by default, or the path given by `#SBATCH --output`. Your model, plots, metrics, and checkpoints are saved wherever your Python script tells them to be saved.

If the Slurm job script changes directory with `cd`, relative output paths in Python are relative to that directory. Use a dedicated directory for results and create it before writing files. Keep important results in project storage or another appropriate persistent location. AIRL's [storage guidance](../../Resources.md#data-storage-and-transfer) emphasize that scratch storage is temporary, may be cleaned, and is not backed up; do not use it as the only copy of valuable results.

## Add checkpoints to training code

A checkpoint is a saved snapshot of training state. It can let you resume training after a job ends, is cancelled, or reaches its time limit. Save periodically (for example, at the end of each epoch or every fixed number of steps), rather than after every training batch.

### PyTorch example

Create a folder for checkpoints before training. For example, in the Slurm job script:

```bash
mkdir -p checkpoints
```

Then save the model, optimizer, and epoch from your Python training loop:

```python
from pathlib import Path
import torch

checkpoint_dir = Path("checkpoints")
checkpoint_dir.mkdir(parents=True, exist_ok=True)

for epoch in range(start_epoch, num_epochs):
    train_one_epoch(model, optimizer, train_loader)

    checkpoint = {
        "epoch": epoch + 1,
        "model_state_dict": model.state_dict(),
        "optimizer_state_dict": optimizer.state_dict(),
    }
    torch.save(checkpoint, checkpoint_dir / "latest.pt")
```

This example assumes `model`, `optimizer`, `train_loader`, `start_epoch`, and `num_epochs` are already defined by your script. Use a distinct filename per epoch if you need to keep history; otherwise, saving to `latest.pt` replaces the previous checkpoint and uses less storage.

To resume, create the model and optimizer first, then load the saved state before continuing the loop:

```python
checkpoint = torch.load("checkpoints/latest.pt", map_location="cpu")
model.load_state_dict(checkpoint["model_state_dict"])
optimizer.load_state_dict(checkpoint["optimizer_state_dict"])
start_epoch = checkpoint["epoch"]
```

Check the PyTorch version's documentation for safe checkpoint loading options and device mapping, especially when loading files from an untrusted source. Checkpoint formats and APIs differ between Python libraries; use the corresponding save/load functions if you do not use PyTorch.

### Plan checkpoint storage

- Save checkpoints under the project directory or approved persistent project storage if you need them after the job ends.
- AIRL scratch storage is temporary and files may be cleaned; use it only for intermediate checkpoints that can be recreated or copied promptly.
- Keep only the latest and/or best-performing checkpoints that you need. AIRL's [model checkpoint policy](../../Resources.md#model-checkpoint-policy) asks users to remove obsolete checkpoints and compress archived models where practical.
- Make sure there is enough storage space before running long experiments.

## Troubleshoot common outcomes

- **Pending (`PD`)**: Slurm is waiting for resources. Check again later with `squeue --me`. If it remains pending and you need help, share the job ID and status with AIRL support.
- **Failed**: Read the job output from the beginning and look for the first Python traceback or shell error. Check file paths, package installation, and environment activation.
- **Timed out (`TIMEOUT`)**: The requested time limit was reached. Review your runtime and checkpoints, then ask AIRL support what limit applies before requesting more time.
- **Job completed but no result appears**: Check the output path in your script, the directory set by `cd`, and the paths used by your Python code.
- **`python` or a package cannot be found**: Confirm that the Slurm script activates the correct environment. See [Step 2: Set up a Python environment](./2%20-%20Set%20Up%20Python.md).
- **GPU is not detected**: Verify that the job requests a GPU using the syntax in the AIRL starter script and that the installed Python package matches AIRL's GPU software setup. Contact AIRL support if unsure.

After fixing the cause, submit again with `sbatch`. Each submission has a new job ID.

## Ask for help

Contact [AIRL support](../Getting%20Help.md) and include the job ID, the `sacct` status if available, the submission command, the relevant part of the job script, and the error message. Do not include passwords or other secrets.
