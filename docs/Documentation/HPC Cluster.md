# HPC Cluster

AIRL primarily operates and provides support and training for the HPC cluster, which is available to all researchers. The HPC cluster runs with a Slurm scheduler and has a web portal for interactive computing.

## Maintenance Schedule

The maintenance schedule for the HPC cluster is:

- Monthly maintenance on the 1st Monday of the month lasting about a day.
- Weekly restarts of login nodes Monday mornings starting at 9am for about 15 minutes. If Monday is a holiday this restart will occur on Tuesday.

## System Description

The HPC cluster hardware consists of:
- 10 workstations equipped with Intel i9 and NVIDIA RTX 5090 GPUs.
- 3 servers equipped with AMD ThreadRipper and NVIDIA RTX 5000 GPUs and 512 GB RAM.

The HPC cluster is managed using:
- A centralized Slurm workload manager for job scheduling.
- Shared NFS filesystem for isolated per-user file storage.
- Secure remote access through a two-hop SSH flow.
- A standard web-based portal for supporting Jupyter notebooks.
- A large shared file system for used datasets.

New, modern hardware is consistently being added to the HPC cluster. Additional compute and storage resources can be purchased by PIs.