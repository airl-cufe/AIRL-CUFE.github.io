# Running Jobs

To train Machine Learning (ML) models on AIRL's HPC cluster, you need to request resources for your script using a scheduler software called Slurm. Slurm allocates the resources that satisfy your request and those of everyone else using the system. This temporary allocation of resources is called a job. Slurm schedules your job on a compute node, so you can disconnect after submitting it. As with all software, Slurm uses a specific syntax for requesting resources. Use this quick guide to run a Python-based machine-learning script on AIRL's HPC cluster.

## Simple tutorial

### 1. Prepare your files

Log in to the cluster and make sure your Python script and data are available there. For a first test, the HPC cluster provides `~/workspace/train.py` and `~/workspace/train.sh`. See [Prepare your files](./Running%20Jobs/1%20-%20Prepare%20Your%20Files.md) if you need help uploading files.

### 2. Use the Python container and Slurm job script

Users run Python jobs in AIRL's container, which already includes common libraries. You cannot create a Python environment or install Python libraries on the HPC cluster. Use the supplied Slurm script, which starts your program inside the container:

```bash
sbatch ~/workspace/train.sh
```

For details on the available libraries and running your own script in the container, see [Use the AIRL Python container](./Running%20Jobs/2%20-%20Set%20Up%20Python.md) and [Configure the Slurm script and resources](./Running%20Jobs/3%20-%20Slurm%20Script%20and%20Resources.md).

### 3. Submit and monitor

Submit your script with `sbatch`. Slurm prints a job ID when the submission is accepted:

```text
Submitted batch job 12345
```

Check whether the job is waiting or running:

```bash
squeue --me
```

The output file is set by `#SBATCH --output` in the job script. The AIRL starter script writes `train-<job-id>.log` to your home directory, which is available in the container at `/workspace`. For a script using Slurm's default output location, watch the default file instead:

```bash
tail -f slurm-12345.out
```

For the starter script, use `tail -f ~/train-12345.log`. Replace the example number with your job ID. Press `Ctrl+C` to stop watching; this does not stop the job. See [Submit and monitor](./Running%20Jobs/4%20-%20Submit%20and%20Monitor.md) for details.

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
2. [Use the AIRL Python container](./Running%20Jobs/2%20-%20Set%20Up%20Python.md)
3. [Configure your Slurm script and request resources](./Running%20Jobs/3%20-%20Slurm%20Script%20and%20Resources.md)
4. [Submit and monitor the job](./Running%20Jobs/4%20-%20Submit%20and%20Monitor.md)
5. [Check results, save checkpoints, and troubleshoot](./Running%20Jobs/5%20-%20Results%20and%20Checkpoints.md)

Resource limits and Slurm settings can differ between users; use AIRL's starter script and published [resource information](../Resources.md), or ask [AIRL support](./Getting%20Help.md), for settings for your account.
