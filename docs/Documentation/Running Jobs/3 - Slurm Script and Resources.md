# Step 3: Configure Your Slurm Script and Request Resources

A Slurm script tells the scheduler what to run and which resources to allocate. Start from AIRL's `~/workspace/train.sh` when possible: its GPU and container setup is specific to this cluster. The examples below explain common options, but resource names and limits must match AIRL's configuration and your account.

## 1. Inspect the AIRL starter script

Read the starter script before adapting it:

```bash
cat ~/workspace/train.sh
```

Look for lines beginning with `#SBATCH`, the Apptainer command that launches the container, and the final Python command. Copy it to your project before editing if you want to preserve the original:

```bash
cp ~/workspace/train.sh ~/my-ml-project/train-job.sh
```

Edit `train-job.sh` to run your own Python script inside the AIRL container. The starter script already launches the container and mounts your home directory at `/workspace`; keep that setup when adapting it. See [Step 2: Use the AIRL Python container](./2%20-%20Set%20Up%20Python.md).

## 2. Common job-script options

Slurm options are written as `#SBATCH` directives near the top of the script, after the `#!/bin/bash` line and before shell commands. Common options include:

| Directive | Purpose | Example |
| --- | --- | --- |
| `--job-name` | A short name shown in queue listings | `#SBATCH --job-name=training` |
| `--output` | File for standard output and error messages | `#SBATCH --output=training-%j.out` |
| `--error` | Separate file for error messages | `#SBATCH --error=training-%j.err` |
| `--time` | Maximum run time requested | `#SBATCH --time=01:00:00` |
| `--ntasks` | Number of processes/tasks | `#SBATCH --ntasks=1` |
| `--cpus-per-task` | CPU cores for each task | `#SBATCH --cpus-per-task=2` |
| `--mem` | System RAM requested | `#SBATCH --mem=4G` |
| `--partition` | Slurm partition/queue to use | Use a partition confirmed for AIRL |
| GPU request | Number/type of GPUs | Copy the syntax from the AIRL starter script |

These are standard Slurm options, not a complete list. Slurm reads the directives when the script is submitted; put them before commands such as `cd`, `source`, or `python`.

## 3. Choose resources for the job

- **CPU cores:** A single Python training process commonly starts with one task. Request additional CPUs with `--cpus-per-task` if your data loading or numerical libraries can use them. Avoid requesting more cores than the program can use.
- **Memory:** `--mem` requests system RAM, not GPU memory. Begin with a small test and ask AIRL support if you do not know what amount is appropriate.
- **GPU:** Use the GPU request syntax and any partition specified in `~/workspace/train.sh` or `train-burst.sh`. GPU request options vary by Slurm configuration; do not assume that a flag or partition from another cluster works here.
- **Run time:** `--time` is the maximum time for the job, not a promise that it will run for that long. Request enough time for the experiment, but avoid an unnecessarily large request.
- **Partition:** A partition determines which resources may run the job. Use the name in an AIRL starter script or check available partitions with `sinfo`. Ask AIRL support if the appropriate partition is unclear.

AIRL's published [compute-service limits](../../Resources.md) list account-category maximums for running jobs, GPUs, and job duration. These are ceilings, not recommended requests or a guarantee of immediate availability. Check current AIRL policy and your account's allocation before submitting. The interactive-session limits do not automatically define batch-job limits.

## 4. Run Python inside the container

The AIRL starter script already contains the Slurm settings and container launch command. Its Python command follows this pattern:

```bash
srun /usr/bin/apptainer exec --nv \
  --bind "$LABHOME":/workspace --pwd /workspace \
  /opt/ailab/images/ailab-base.sif \
  python /workspace/my-ml-project/train.py
```

The provided `train.sh` defines `LABHOME` and includes the Slurm directives and container setup required by AIRL. Copy it and change the Python script path to the file you want to run. Keep your script and data under your home directory so they are available in `/workspace`. Do not add environment activation or package installation commands. If you set an output path inside a subfolder (for example, `logs/`), create that folder before submitting; Slurm may need to open the output file before the script starts.

The `#SBATCH` lines are configuration for Slurm, not shell commands. The lines after them are run by the shell on the compute node.

## 5. Save and sanity-check the script

Before submission, confirm that:

1. Every referenced file and folder exists.
2. The script runs your Python file inside the AIRL container.
3. The Python command runs the intended program.
4. CPU, memory, GPU, partition, and time requests use AIRL-supported settings and fit your account.
5. Output and checkpoint paths point to storage with enough space.

Next: [Submit and monitor the job](./4%20-%20Submit%20and%20Monitor.md).
