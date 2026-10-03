# Artificial Intelligence Research Lab Governance

## 1. Introduction

The Artificial Intelligence (AI) Research Lab provides high-performance computing (HPC) resources to support research, education, innovation, and student projects in artificial intelligence, machine learning, data science, and related fields. The laboratory operates a shared computing infrastructure consisting of GPU workstations and GPU servers managed as a single Slurm cluster.

AI Lab provides a basic level of high performance research computing resources for members of Cairo University's Faculty of Engineering (CUFE) at no cost.

These regulations define the policies governing access, resource allocation, data management, security, and acceptable use of the laboratory resources.

## 2. Lab Infrastructure:

The laboratory consists of:
- 10 workstations equipped with Intel i9 and NVIDIA RTX 5090 GPUs.
- 3 servers equipped with AMD ThreadRipper and NVIDIA RTX 5000 GPUs and 512 GB RAM.
- A centralized Slurm workload manager for job scheduling.
- Shared NFS filesystem for isolated per-user file storage.
- Secure remote access through a two-hop SSH architecture.

## 3. User Categories

### 3.1. Lab Administrators

Lab administrators are responsible for:

- Managing lab hardware and software.
- User account administration.
- Resource allocation.
- Security management.
- Backup and maintenance.

### 3.2. Faculty Members and Principal Investigators

Faculty members supervising research projects receive high scheduling priority and larger resource quotas.
Faculty members may sponsor accounts for postgraduate students, research assistants, and senior students.

### 3.3. Researchers

Researchers include:

- Teacher assistants (TAs)
- Research assistants (RAs)
- Visiting researchers
- Postgraduate students

### 3.4. Students

Senior students could request access to the lab resources for training Machine Learning models their graduation projects.

## 4. Access Policy & Procedure

Computing access is authorized through submitting an application request to the lab administration.
Authorized users can then access computing resources remotely using SSH.

### 4.1. Request Procedure

Access is granted only after approval by the lab administration. The request process consists of two steps: Application submission, and Faculty supervisor confirmation.

Two type of application requests are available:
1. Research application
2. Graduation project application

Both application types are submitted through filling an online form (to be created).

Researcher applicants must submit:
- Full name
- Faculty email
- Engineering Department
- Supervisor
- Research experiment description
- Dataset description and estimate size

Graduation project applicants must submit:
- Team Members full names
- Faculty email
- Engineering Department
- Supervisor
- Graduation project description
- Project impact
- Data contribution
- Dataset description and estimate size

After submitting the request, the faculty supervisor or PI must send us a short confirmation email, verifying the researcher's project/research work. This email should be sent to ....@eng.cu.edu.eg.

### 4.2. Account Approval

Upon approval, an account will be created for the requested user.
Users will receive an email with their username and further instructions to set up their account.
New users receive:
- SSH username
- Temporary password
- 10 GB Storage quota
- Lab access training material:
  - Introduction to HPC
  - Walkthrough setting up your account, connecting to the lab, running first test job, submitting first batch job
  - How to use the resources efficiently and measure performance

The account creation process is manual and can take approximately 2~3 weeks. This process could be made smoother by making sure the request form is fully filled before submitting, and making sure the faculty supervisor or PI has sent the email confirmation.

### 4.3. Account Expiration

Accounts are temporary.
Accounts expire:
- at project completion for RAs,
- upon graduation for Senior Students, or
- after prolonged inactivity.

Unused accounts may be disabled without prior notice.

## 5. Remote Access & Computing Policy

The AI Lab uses secure two-hop SSH access.
Users shall:
1. Connect to the gateway server.
2. Authenticate using their assigned credentials.
3. Connect to the Slurm login node.
4. Submit jobs through Slurm.

All computational work must be submitted through Slurm.
Running programs directly (bypassing the scheduler) on compute nodes is prohibited unless explicitly authorized by the lab administrator.

GPU resources shall be used efficiently.
Users should:
- Request only the GPUs required.
- Release resources immediately after completion.
- Monitor job utilization.

Jobs showing prolonged idle GPU utilization may be terminated.

### 5.1. Default Quotas

The laboratory adopts a priority-based quota system. Default quotas may be adjusted by the laboratory administrator depending on resource availability and approved research requirements.

| User Category          | Slurm Priority | Max Running Jobs | Max GPUs per Job | Max GPUs Concurrently | Max Job Duration |
| ---------------------- | -------------- | ---------------: | ---------------: | --------------------: | ---------------: |
| Faculty / PI           | High           |               10 |                4 |                     8 |           4 days |
| Researchers            | Medium         |                5 |                2 |                     4 |           4 days |
| Graduate Students      | Medium-Low     |                2 |                2 |                     3 |           2 days |
| Undergraduate Students | Lowest         |                1 |                1 |                     1 |           1 day  |

The Nvidia RTX 5090 and 5000 do not support hardware-enforced Multi-Instance GPU (MIG) partitioning.

### 5.2. Interactive Sessions

Interactive GPU sessions are intended for:
- Debugging
- Visualization
- Code development
- Small experiments

Default limits:
- Maximum duration: 2 hours
- Maximum GPUs: 1
- Maximum RAM memory: 16 GB

Long experiments must be submitted as batch jobs.

### 5.3. Default Storage Quotas

The laboratory provides 40 TB of shared storage.
Storage is divided into three logical areas:

| Storage Area | Purpose                                  | Backup | Auto Cleanup |
| ------------ | ---------------------------------------- | ------ | ------------ |
| Home         | Source code, scripts, configuration      | Yes    | No           |
| Project      | Research datasets and trained models     | Yes    | No           |
| Scratch      | Temporary files and intermediate results | No     | Yes          |

#### 5.3.1. Home Directory Quota

Every user receives 10 GB upon account creation.
User's Home directories should contain:
- Source code
- Notebooks
- Scripts
- Configuration files
- Documents

Large datasets are not permitted.

#### 5.3.2. Project Storage

Project storage is allocated per approved project.
Recommended defaults:
| User Type                | Default Project Storage |
| ------------------------ | ----------------------: |
| Funded Research Projects |                  400 GB |
| Research Project         |                  200 GB |
| Graduate Thesis          |                  100 GB |
| Undergraduate Project    |                   50 GB |

Additional storage may be requested with justification.

#### 5.3.3. Scratch Storage

Temporary storage of 50 GB is assigned per active job
Scratch space is intended for
- Temporary datasets
- Checkpoints
- Intermediate outputs

Scratch files older than 7 days may be automatically deleted.
No backup is provided.

### 5.4. Large Dataset Policy

Datasets larger than 100 GB require approval from the laboratory administrator before upload.

Duplicate copies of publicly available datasets should be avoided whenever possible. Users working on similar projects are encouraged to share a common read-only copy of large datasets to conserve storage space.

### 5.5. Model Checkpoint Policy

Users should periodically remove obsolete checkpoints.

For deep learning training jobs:
- Keep only the best-performing checkpoints.
- Compress archived models where practical.
- Delete failed experiment outputs.

Excessive accumulation of checkpoints may result in a request from the laboratory administrator to reclaim storage.

### 5.6. Additional Resource Requests

Users may request temporary increases in:
- GPU allocation
- CPU allocation
- Memory limits
- Storage quota
- Maximum job duration

Requests should include:
- Project title,
- Supervisor or principal investigator,
- Justification,
- Requested resources,
- Expected duration.

Approved temporary quotas automatically revert to the default allocation after the approved period unless renewed.

### 5.7. Scheduling Policy

Scheduling priority follows:

1. Laboratory maintenance
2. Funded research projects
3. Faculty members research
4. Postgraduate research
5. Graduation projects

Fair-share scheduling may reduce the priority of users consuming excessive resources.

## 6. Software Installation Policy

System-wide software installation is performed only by lab administrators.

Users may install software within their own directories using:
- Conda
- Virtual environments
- Containers
- User-space installations

Unauthorized system modifications are prohibited.

## 7. Data Management & Storage Policy

Shared storage is limited.
Each user receives an assigned storage quota.
Additional storage space could be requested from the lab administration.

Storage should contain only:
- Research datasets
- Source code
- Trained models
- Experimental outputs
- Documentation

The following are prohibited:
- Personal data
- Data unrelated to research
- Software unrelated to research
- Backup archives unrelated to laboratory work

Users retain ownership of their research data.
However:
- The laboratory does not guarantee permanent storage.
- Users are responsible for maintaining independent backups.
- Users are responsible for removing obsolete files.
- Temporary files may be deleted periodically.
- Scratch storage may be cleaned automatically.

Large datasets should only be stored when actively used.

## 8. Security & Authentication Policy

Users are responsible for protecting their credentials.

The following authentication risks are prohibited:
- Sharing passwords
- Sharing SSH keys
- Using another person's account
- Leaving sessions unattended on shared computers

Users must immediately report suspected credential compromise.

Users shall not:
- Attempt privilege escalation.
- Scan internal networks.
- Attack other systems.
- Install malware.
- Interfere with other users' jobs.
- Circumvent security controls.

Security incidents will result in immediate account suspension.

## 9. Acceptable Use Policy

Lab resources shall be used exclusively for:
- Academic research
- Approved collaborations
- Grant-funded projects

The following activities are prohibited:
- Cryptocurrency mining
- Commercial services without approval
- Illegal activities
- Copyright infringement
- Unauthorized penetration testing
- Excessive personal computing

## 10. Monitoring

Lab administrators may monitor:
- Resource utilization
- Storage consumption
- Scheduler activity
- Login records
- System logs

Monitoring is performed solely for operational, security, maintenance, and capacity-planning purposes.

## 11. Data Privacy

The laboratory respects users' research confidentiality.

Administrative access to user files will occur only when necessary for:
- System maintenance
- Security investigations
- Storage recovery
- Technical support
- Compliance with institutional regulations

## 12. Job Termination

Lab administrators may terminate jobs that:
- Exceed allocated limits.
- Consume excessive resources.
- Become unresponsive.
- Violate laboratory policies.
- Threaten system stability.

Whenever practical, users will be notified before termination.

## 13. Maintenance

Scheduled maintenance may temporarily interrupt services.

Users will be notified in advance whenever possible.

Emergency maintenance may occur without prior notice.

## 14. Publication Acknowledgment

Users are encouraged to acknowledge the Artificial Intelligence Research Lab in publications, theses, dissertations, and technical reports that benefited from the laboratory resources.

Suggested acknowledgment:

"The authors acknowledge the Cairo University's Artificial Intelligence Research Lab for providing (HPC, storage, consultation) resources that have contributed to the research results reported within this paper/report."

## 15. Violations

Violations of these regulations may result in one or more of the following:
- Warning
- Temporary suspension
- Reduction of computing quota
- Job cancellation
- Account termination
- Referral to the appropriate institutional authority for disciplinary action

## 16. Policy Updates

These regulations may be revised as laboratory resources, institutional policies, or operational requirements evolve.

Users are responsible for complying with the latest published version of the regulations.

## 17. Acceptance

By using the Artificial Intelligence Research Lab, users acknowledge that they have read, understood, and agreed to comply with these governance regulations and any future amendments.
