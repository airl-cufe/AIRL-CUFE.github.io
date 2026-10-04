# Resources

AIRL provides access to HPC cluster for Cairo University's Faculty of Engineering (CUFE) members. The lab also provide PI group priority resources that are available for general opportunist use when they are not in use for priority work.

## About the HPC Cluster

The HPC cluster is open to all staff members and students on capus. Further information and support is available from AIRL2026@hotmail.com

### Features

AIRL consists of:
- 10 workstations equipped with Intel i9 and NVIDIA RTX 5090 GPUs.
- 3 servers equipped with AMD ThreadRipper and NVIDIA RTX 5000 GPUs and 512 GB RAM.
- A centralized Slurm workload manager for job scheduling.
- Shared NFS filesystem for isolated per-user file storage.
- Secure remote access through a two-hop SSH flow.
- A standard web-based portal for supporting Jupyter notebooks.
- A large shared file system for used datasets.

## Compute Services

AIRL provides a basic level of high performance research computing resources for members of Cairo University's Faculty of Engineering (CUFE) at no cost.
AIRL adopts a priority-based quota system. Default quotas may be adjusted by the lab administrator depending on resource availability and approved research requirements.

| User Category          | Slurm Priority | Max Running Jobs | Max GPUs per Job | Max GPUs Concurrently | Max Job Duration |
| ---------------------- | -------------- | ---------------: | ---------------: | --------------------: | ---------------: |
| Faculty / PI           | High           |               10 |                4 |                     8 |           4 days |
| Researchers            | Medium         |                5 |                2 |                     4 |           4 days |
| Graduate Students      | Medium-Low     |                2 |                2 |                     3 |           2 days |
| Undergraduate Students | Lowest         |                1 |                1 |                     1 |           1 day  |

In addition to Slurm batch jobs, Slurm interactive sessions and Jupyter Notebook are allowed for:
- Code development
- Small experiments
- Debugging
- Visualization

Default limits:
- Maximum duration: 2 hours
- Maximum GPUs: 1
- Maximum RAM memory: 16 GB

## Data Storage and Transfer

AIRL provides 40 TB of shared storage.
Storage is divided into three logical areas:

| Storage Area | Purpose                                  | Backup | Auto Cleanup |
| ------------ | ---------------------------------------- | ------ | ------------ |
| Home         | Source code, scripts, configuration      | Yes    | No           |
| Project      | Research datasets and trained models     | No     | No           |
| Scratch      | Temporary files and intermediate results | No     | Yes          |

#### Home Directory Quota

Every user receives 10 GB upon account creation.
User's Home directories should contain:
- Source code
- Notebooks
- Scripts
- Configuration files
- Documents

#### Project Storage

Project storage is allocated per approved project.
Recommended defaults:
| User Type                | Default Project Storage |
| ------------------------ | ----------------------: |
| Funded Research Projects |                  400 GB |
| Research Project         |                  200 GB |
| Graduate Thesis          |                  100 GB |
| Undergraduate Project    |                   50 GB |

Additional storage may be requested with justification.

#### Scratch Storage

Temporary storage of 50 GB is assigned per active job
Scratch space is intended for
- Temporary datasets
- Checkpoints
- Intermediate outputs

Scratch files older than 7 days may be automatically deleted.
No backup is provided.

### Large Dataset Policy

Datasets larger than 100 GB require approval from the lab administrator before upload.

Duplicate copies of publicly available datasets should be avoided whenever possible. Users working on similar projects are encouraged to share a common read-only copy of large datasets to conserve storage space.

### Model Checkpoint Policy

Users should periodically remove obsolete checkpoints.

For deep learning training jobs:
- Keep only the best-performing checkpoints.
- Compress archived models where practical.
- Delete failed experiment outputs.

Excessive accumulation of checkpoints may result in a request from the lab administrator to reclaim storage.

## Data Policies

All AIRL current systems are only suitable for storing data with low-level security requirements. This means that they are not to be used to store sensitive data, such as personal information, financial information, or intellectual property. Additionally, they are not to be used to store data that is subject to use agreements that require security controls or audit tracking.

Datasets on AIRL must have been obtained legitimately and AIRL is not to be used for working with unanonymized data or data subject to NDAs or national security restrictions.

AIRL respects users' research confidentiality.
Administrative access to user files will occur only when necessary for:
- System maintenance
- Security investigations
- Storage recovery
- Technical support
- Compliance with institutional regulations
