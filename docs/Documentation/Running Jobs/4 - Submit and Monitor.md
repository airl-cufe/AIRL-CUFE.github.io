# Step 4: Submit and Monitor the Job

Submit the Slurm script from a terminal on the cluster. You can close the terminal or disconnect after submission; Slurm continues to manage the job.

## 1. Submit the script

Move to the folder containing your script and submit it:

```bash
cd ~/my-ml-project
sbatch train-job.sh
```

For the AIRL starter example, submit:

```bash
sbatch ~/workspace/train.sh
```

When Slurm accepts a job, it prints a message such as:

```text
Submitted batch job 12345
```

Save the job ID (`12345` in this example). If Slurm prints an error instead, the job was not submitted; read the message and fix the script or path before trying again.

## 2. Check whether it is pending or running

Show your pending and running jobs:

```bash
squeue --me
```

Find your job ID in the output. Common states include:

- `PD` — pending, waiting for requested resources.
- `R` — running on a compute node.

Pending does not necessarily mean there is a problem. The scheduler starts the job when matching resources are available.

## 3. Read the live output

By default, Slurm creates `slurm-<job-id>.out` in the directory where you ran `sbatch`, unless the script sets another path with `#SBATCH --output`.

To follow new output for job `12345`, run:

```bash
tail -f slurm-12345.out
```

Replace the example number with your job ID. Press `Ctrl+C` to stop watching; it does not stop the job. If the file is not in that directory, check the output path in the job script.

## 4. Check the final status

After the job disappears from `squeue --me`, query its recorded status:

```bash
sacct -j 12345 --format=JobID,State,Elapsed,ExitCode
```

Replace `12345` with your job ID. `COMPLETED` means Slurm reports success. If the state is `FAILED`, `CANCELLED`, or `TIMEOUT`, inspect the output file and see [Step 5: Results and checkpoints](./5%20-%20Results%20and%20Checkpoints.md).

## 5. Cancel only if necessary

To stop a pending or running job:

```bash
scancel 12345
```

Use your job ID. Cancelling stops future work, but it does not remove output or checkpoint files already saved.

Next: [Check results, save checkpoints, and troubleshoot](./5%20-%20Results%20and%20Checkpoints.md).
