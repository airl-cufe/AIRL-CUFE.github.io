# AIRL Wiki

This wiki page summarizes the Cairo University Faculty of Engineering (CUFE) Artificial Intelligence Research Lab (AIRL) website and the supporting documentation in this repository.

## Overview

AIRL is a research and education-focused lab that provides high-performance computing resources for AI, machine learning, data science, and related engineering work. The lab supports faculty members, researchers, graduate students, and student projects by supplying access to GPU-based compute infrastructure, mentoring, and collaboration opportunities.

AIRL was established in July 2026 by Prof. Ahmed Morsy with support from the Ezz Steel group. The mission focuses on four areas:

- Providing free computational access to the CUFE community
- Supporting industrial and academic collaborations
- Enabling PI-led research with specialized HPC needs
- Training students and early-career researchers in AI and computing

## Lab Leadership and Contact

The lab is led by a multidisciplinary team of faculty and systems specialists:

| Name | Role | Email |
| ---- | ---- | ----- |
| Prof. Ahmed Morsy | Chairman | amorsy@eng1.cu.edu.eg |
| Assis. Prof. Moataz Elsisy | Vice-Chairman | moetaz_elsisy@eng.cu.edu.eg |
| Assis. Prof. Dina Tantawy | Vice-Chairman | dina.tantawy@eng.cu.edu.eg |
| Assoc. Prof. Ahmed Hamdy | System and HPC Lead | ahamdy@eng.cu.edu.eg |
| Assis. Prof. Ayman AboElHassan | System and HPC Specialist | ayman.abo.elmaaty@eng.cu.edu.eg |
| Mohamed Sayed | Site Reliability Engineer |  |
| Karim Othman | Site Reliability Engineer |  |

General inquiries can be sent to AIRL2026@hotmail.com.

## Location

AIRL is located at:

Cairo University, Faculty of Engineering  
Artificial Intelligence Research Lab  
Building 3000, 1st Floor  
Gizah, Egypt

## Infrastructure and Services

The lab operates a shared high-performance computing cluster built from:

- 10 workstations with Intel i9 CPUs and NVIDIA RTX 5090 GPUs
- 3 servers with AMD ThreadRipper CPUs and NVIDIA RTX 5000 GPUs
- 512 GB RAM on the server nodes
- A centralized Slurm workload manager
- Shared NFS filesystem for per-user storage
- Secure two-hop SSH access
- JupyterHub-style web portal access
- Large shared storage for datasets and project outputs

The system is designed to support research computing, model training, experimentation, and collaborative scientific work in a shared environment.

## Documentation

The main user documentation covers onboarding, cluster access, system usage, and HPC best practices.

### Getting started

New users can request access through the lab administration using one of two application types:

1. Research application
2. Graduation project application

Applicants provide details such as faculty email, department, supervisor, research description, and dataset information. After submission, a faculty supervisor or PI must confirm the project by email.

### Access and login

Users can connect to the platform through:

- SSH terminal access
- The web portal for Jupyter notebook workflows
- Shared HPC cluster login and compute nodes

The documentation explains how users should work with Linux, the home/project/scratch storage model, the Slurm scheduler, and general job submission practices.

### Storage model

AIRL provides a multi-tier storage layout:

| Storage Area | Purpose | Backup | Auto Cleanup |
| ------------ | ------- | ------ | ------------ |
| Home | Source code, scripts, configuration files | Yes | No |
| Project | Research datasets and trained models | No | No |
| Scratch | Temporary job data, checkpoints, intermediate outputs | No | Yes |

Users receive a home-directory allocation on account creation, with project storage allocated per approved project and scratch space assigned for active jobs.

## Governance and Regulations

AIRL's governance documents define the rules for access, resource usage, quotas, data handling, and acceptable use of the lab resources. Key topics include:

- User categories and eligibility
- Account creation and expiration
- Remote access and Slurm job submission policy
- GPU and compute limits
- Storage quotas and large dataset handling
- Data classification and restrictions on sensitive content

The public regulations also clarify operational expectations around shared resources and responsible use of the cluster.

## Resources and Capacity

The site documents a priority-based resource model that varies by user type and project status. Examples include:

- Faculty/PI access with higher scheduling priority and larger quotas
- Researcher and graduate student access with medium and medium-low priority
- Undergraduate project access with lower priority limits

Default job and GPU limits are applied, with interactive sessions allowed for small experiments, debugging, and development. Large training jobs are expected to use Slurm batch submissions.

## Collaborations

AIRL partners with industry and academia to support real-world AI and engineering challenges. The collaboration page highlights Ezz Steel as a founding partner and the broader goal of connecting research infrastructure with practical industrial problems.

## Related Source Documents

The repository contains the original source markdown documents used to build the public website:

- [About AIRL](./About%20AIRL.md)
- [Documentation](./Documentation.md)
- [Resources](./Resources.md)
- [Regulations](./Regulations.md)
- [Collaborations](./Collaborations.md)
- [Address](./Address.md)

These files are the authoritative source material for the AIRL website content.

## Notes

The public website intentionally excludes sensitive administrative material, such as the account-creation instructions in the internal admin docs. Those files remain in the repository for authorized operational use only.
