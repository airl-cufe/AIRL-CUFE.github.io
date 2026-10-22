# Step 2: Use the AIRL Python Container

AIRL runs Python jobs inside a managed container with Python and commonly used libraries already installed. Users cannot create Python environments or install packages on the HPC cluster directly. The Slurm starter script launches your job inside this container, so you do not need to create or activate an environment.

## 1. Check the available Python and libraries

In a terminal inside your AIRL container session, check the Python version and import the libraries your script needs. The standard image includes PyTorch, pandas, matplotlib, scikit-learn, and tqdm, among other dependencies.

```bash
python --version
python -c "import torch, pandas, matplotlib, sklearn, tqdm; print('Required libraries are available')"
```

Python package names used in imports can differ from their installation names; for example, scikit-learn is imported as `sklearn`. If a required library is missing or you need a different version, contact AIRL support to discuss the container image. Do not try to create a virtual environment or install packages yourself.

## 2. Keep your code and data in your project area

Put your Python script, helper files, and data in your home or project area so they are available to the job. The AIRL starter script mounts your home directory in the container at `/workspace`. For example, a script at `~/my-ml-project/train.py` can be run from inside the container as:

```bash
python /workspace/my-ml-project/train.py
```

Use paths under `/workspace` for files the script reads or writes. Files stored only inside the container outside the mounted project area may not persist after the session or job.

## 3. Run your script through Slurm

The AIRL starter Slurm script launches Python with Apptainer inside the managed image and mounts your home directory at `/workspace`. Copy the starter script if you need to adjust its job settings or the Python script it runs; do not add virtual-environment activation or package-install commands. See [Configure your Slurm script and request resources](./3%20-%20Slurm%20Script%20and%20Resources.md).
