# Step 1: Get Your Script and Data Ready

This step puts the files your Python script needs on the cluster. A job running on AIRL cannot read files that exist only on your personal computer.

## 1. Log in to AIRL

Choose a connection method:

- [SSH in a terminal](../Accessing%20HPC%20Cluster/Login%20SSH.md)
- [The JupyterHub web portal](../Accessing%20HPC%20Cluster/Login%20Web%20Portal.md)
- [VS Code Remote SSH](../Accessing%20HPC%20Cluster/VSCode%20Remote%20SSH.md)

For a graphical interface, JupyterHub or VS Code may be more comfortable. The commands in this tutorial are entered in a terminal on the cluster, such as the terminal in VS Code or a terminal opened from the web portal.

## 2. Find or make a project folder

Your home directory is your personal area on the cluster. You can see your current location and its files with:

```bash
pwd
ls
```

To make a folder for a project and move into it, run:

```bash
mkdir -p ~/my-ml-project
cd ~/my-ml-project
```

Here, `my-ml-project` is just an example name; you can choose another. `~` is shorthand for your home directory.

## 3. Put your script and data on the cluster

Upload your files through the web portal or VS Code, or use another method described in [File Transfer](../File%20Transfer.md). Keep the Python script, any helper files, and the input data in known locations.

The starter example is provided in `~/workspace` on the cluster:

- `~/workspace/train.py` — example Python training script
- `~/workspace/train.sh` — Slurm script for submitting the example GPU job
- `~/workspace/train-burst.sh` — example opportunistic (burst) Slurm script

List the files with `ls ~/workspace`. If you use the starter example, follow the instructions for it in [Getting Started](../Getting%20Started.md).

## 4. Check that the files are where you expect

Use `ls` to confirm the file names and `pwd` to confirm your current folder. Linux file names are case-sensitive: `Train.py` and `train.py` are different names.

Note the path to your Python file and data. The AIRL starter script mounts your home directory at `/workspace` inside the container, so a file at `~/my-ml-project/train.py` is available to Python as `/workspace/my-ml-project/train.py`.

## 5. Do a small test first

If your script can use a small sample of the data or a small number of training steps, use that for the first run. It is easier to spot a missing file or package in a short test than after a long job.

Next: [Use the AIRL Python container](./2%20-%20Set%20Up%20Python.md).
