# Running Jobs

Use this quick guide to run a Python-based machine-learning script on AIRL's HPC cluster. Slurm schedules your job on a compute node, so you can disconnect after submitting it.

## Simple tutorial

### 1. Prepare your files

Log in to the cluster and make sure your Python script and data are available there. For a first test, the HPC cluster provides `~/workspace/train.py` and `~/workspace/train.sh`. See [Prepare your files](./Running%20Jobs/1%20-%20Prepare%20Your%20Files.md) if you need help uploading files.

### 2. Prepare your Python environment and Slurm job script

Your Slurm job script should activate the Python environment with your required packages and request the resources your run needs. For the supplied example, use the provided script as-is:

```bash
sbatch ~/workspace/train.sh
```

For your own script, see [Set up Python](./Running%20Jobs/2%20-%20Set%20Up%20Python.md) and [Configure the Slurm script and resources](./Running%20Jobs/3%20-%20Slurm%20Script%20and%20Resources.md).

### 3. Submit and monitor

Submit your script with `sbatch`. Slurm prints a job ID when the submission is accepted:

```text
Submitted batch job 12345
```

Check whether the job is waiting or running:

```bash
squeue --me
```

To watch the output for job `12345` as it is written:

```bash
tail -f slurm-12345.out
```

Press `Ctrl+C` to stop watching; this does not stop the job. See [Submit and monitor](./Running%20Jobs/4%20-%20Submit%20and%20Monitor.md) for details.

### 4. Check the result or stop the job

After the job leaves the queue, check its final status:

```bash
sacct -j 12345 --format=JobID,State,Elapsed,ExitCode
```

If you need to stop a pending or running job, use:

```bash
scancel 12345
```

Review [Results and checkpoints](./Running%20Jobs/5%20-%20Results%20and%20Checkpoints.md) to find result files, save checkpoints, and troubleshoot errors.

## Detailed step-by-step tutorial

Follow these pages for more detail:

1. [Prepare your files](./Running%20Jobs/1%20-%20Prepare%20Your%20Files.md)
2. [Set up a Python environment](./Running%20Jobs/2%20-%20Set%20Up%20Python.md)
3. [Configure your Slurm script and request resources](./Running%20Jobs/3%20-%20Slurm%20Script%20and%20Resources.md)
4. [Submit and monitor the job](./Running%20Jobs/4%20-%20Submit%20and%20Monitor.md)
5. [Check results, save checkpoints, and troubleshoot](./Running%20Jobs/5%20-%20Results%20and%20Checkpoints.md)

For general scheduler concepts, see [MIT ORCD's Slurm job scheduler overview](https://orcd-docs.mit.edu/running-jobs/overview/). Resource limits and scheduler settings can differ between clusters; use AIRL's starter script and published [resource information](../Resources.md), or ask [AIRL support](./Getting%20Help.md), for settings for your account.
