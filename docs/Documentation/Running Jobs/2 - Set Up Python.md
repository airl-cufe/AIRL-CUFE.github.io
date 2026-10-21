# Step 2: Set Up a Python Environment

A Python environment keeps the Python packages for your project together and separate from other projects. Create it on the HPC cluster and make sure your Slurm job activates the target environment before running your script.

## 1. Check Python on the cluster

In a terminal on the cluster, go to your project folder and check whether Python 3 is available:

```bash
cd ~/my-ml-project
python3 --version
```

If `python3` is unavailable, or the version is unsuitable for your project, ask AIRL support which Python installation to use.

## 2. Create a virtual environment

Create a virtual environment in your project folder:

```bash
python3 -m venv .venv
```

The `.venv` folder contains this project's environment. It can be recreated from a package list, so do not treat it as a backup of your code or model files.

If this command reports that `venv` or `ensurepip` is unavailable, contact AIRL support for the supported setup rather than installing another Python version on a compute node.

## 3. Activate it and install packages

Activate the environment:

```bash
source .venv/bin/activate
```

Your prompt may change to show `(.venv)`. If the project has a `requirements.txt` file, install its packages:

```bash
python -m pip install -r requirements.txt
```

If it does not, install only the packages your script needs. For example:

```bash
python -m pip install numpy scikit-learn
```

Package installation requires a package source reachable from the HPC cluster. If installation fails because network access is unavailable, ask AIRL support about approved package installation options. For GPU frameworks such as PyTorch, use a version compatible with AIRL's GPU drivers and CUDA setup; check with AIRL support before choosing or installing a CUDA-enabled build. You will find that the base Python already has multiple libraries installed and ready to use.

## 4. Verify the environment

With the environment activated, check that Python and the required packages can be found:

```bash
which python
python -c "import numpy; print(numpy.__version__)"
```

Replace `numpy` with a package your project uses. For a GPU framework, test that it can see a GPU only from an allocated GPU session or job, not from the login node.

You can leave the environment with:

```bash
deactivate
```

## 5. Activate the same environment in your Slurm job

The Slurm job runs in a separate shell, so activating the environment in your interactive terminal is not enough. Add activation to the Slurm .sh script before the Python command:

```bash
source /home/USERNAME/my-ml-project/.venv/bin/activate
python train.py
```

Replace `USERNAME` with your cluster username and use the actual path to your project and script. Alternatively, after the script changes directory to the project folder, activate it with:

```bash
source .venv/bin/activate
```

Keep the environment and project files on a filesystem available to compute nodes. Do not install packages at the start of every job; prepare the environment once and reuse it.

Next: [Configure your Slurm script and request resources](./3%20-%20Slurm%20Script%20and%20Resources.md).
