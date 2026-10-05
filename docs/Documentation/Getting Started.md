# Getting Started Tutorial

This section contains the most common steps for setting up and getting started with your account. We provide this section as a convenient reference to get started. Each system has its own in-depth documentation which can be found on the Documentation page.

## Getting an Account

Computing access is authorized through submitting an application request to the lab administration.

Access is granted only after approval by the lab administration. The request process consists of two steps: Application submission, and Faculty supervisor confirmation.

Two type of application requests are available:
1. Research application
2. Graduation project application

Both application types are submitted through filling an [online form](https://docs.google.com/forms/d/e/1FAIpQLSfcj4_gxCsko5JgmpFrYiexLq7R8z6JppibpctTS_cW6XUzzA/viewform?usp=header).

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

After submitting the request, the faculty supervisor or PI must send us a short confirmation email, verifying the researcher's project/research work. This email should be sent to ```info-airl@eng.cu.edu.eg```.

## Logging In

The first thing you should do when you get a new account is verify that you can log in. AIRL provides multiple ways to log in, including both ssh and web portal.

### Terminal with SSH

Log into AIRL with the following command in a terminal window. Replace ```USERNAME``` below with your created username:
```ssh -p 2222 USERNAME@193.227.38.179```
You will be prompted for your password.

See [Logging in with SSH via Terminal](./Accessing%20HPC%20Cluster/Login%20SSH.md) section for more information.

### Web Portal - Jupyter Notebook

You can log into the web portal for [JupyterHub portal](https://airlws02.tailf6a96c.ts.net/hub). For full detailed instructions please see the [Logging in with web portal](./Accessing%20HPC%20Cluster/Login%20Web%20Portal.md) section for more information.

### Shared HPC Clusters

AIRL is a shared HPC cluster. You are sharing this resources with a number of other researchers, staff, and students, so it is important that you read this page and use the system as intended.

Being a cluster, there are several machines connected together with a network. We refer to these as **nodes**. Most nodes in the cluster are referred to as **compute nodes**, this is where the computation is done on the system (where you will run your code). When you ssh into the system you are on a special purpose node called the **login node**. The **login node**, as its name suggests, is where you log in and is for editing code and files, downloading data, and starting jobs to run your code on one of the compute nodes.

Each job is started using a piece of software called the **scheduler**, which you can think of as a resource manager. You let it know what resources you need and what you want to run, and the scheduler will find those resources and start your job on them. When your job completes those resources are relinquished. The scheduler is what ensures that no two jobs are using the same resources, so it is very important not to run anything unless it is submitted properly through the scheduler.

### Software and Packages

The first thing you may want to do is make sure the system has the software and packages you need. We have installed a lot of software and packages on the system already, even though it may not be immediately obvious that it is there.

If you are ever unsure if we have a particular software, and you cannot find it, please send us an email and ask before you spend a lot of time trying to install it. If we have it, we can point you to it, provide advice on how to use it, and if we don't have it we can often give pointers on how to install it. Further, if a lot of people request the same software, we may consider adding it to the system image.

### Linux Command Line

The HPC cluster runs Linux, so much of what you do on the cluster involves the Linux command line. That doesn't mean you have to be a Linux expert to use the system! However the more you can get comfortable with the Linux command line and a handful of basic commands, the easier using the system will be. If you are already familiar with Linux, feel free to skip this section, or skim as a refresher.

Most Linux commands deal with **directories** and **files**. A **directory**, synonymous to a folder, contains files and other directories. The list of directories that lead to a particular directory or file is called its **path**. In Linux, directories on a path are separated by forward slashes /. It is also important to note that everything in Linux is case sensitive, so a file myScript.sh is not the same as the file myscript.sh. When you first log in, you are in your **home directory**. Your home directory is where you can put all the code and data you need to run your job. Your home directory is not accessible to other users, so if you need a space to share files with other users, let us know and we can make a shared **group directory** for you.

The path to your home directory on the HPC cluster is ```/home/USERNAME```, where ```USERNAME``` is your username. The character ```~``` is also shorthand for your home directory in any Linux commands.

Anytime after you start typing a Linux command you can press the "Tab" button your your keyboard. This called tab-complete, and will try to autocomplete what you are typing. This is particularly helpful when typing out long directory paths and file names. Pressing "Tab" once will complete if there is a single completion, pressing it twice will list all potential completions. It is a bit difficult to explain in text, but you can try it out yourself and watch the short demonstration here.

### Filesystems

Everyone on the HPC cluster gets three spaces to store files: home, project, and scratch. Each of these have a different purpose, size, and characteristics.

| Storage Area | Purpose                                  | Backup | Auto Cleanup |
| ------------ | ---------------------------------------- | ------ | ------------ |
| Home         | Source code, scripts, configuration      | Yes    | No           |
| Project      | Research datasets and trained models     | No     | No           |
| Scratch      | Temporary files and intermediate results | No     | Yes          |

- **Home**: Your Home Directory is meant for your most important files, as it is backed up with snapshots. We recommend keeping your software and code in your home directory. Home is located on fast flash storage.

- **Pool**: Pool is a larger space meant as a staging area for larger datasets. It is a place to keep files that still need to be on the HPC cluster, but aren't currently being used for computation. Pool is located on disk storage. Pool is **not backed up**.

- **Scratch**: Scratch space is meant for data used in actively running jobs. It will be faster to access Scratch during your job for the majority of workloads, but it is not backed up and should not be used for long term storage.

Both Pool and Scratch are **not backed up**. Any files that cannot be easily replaced should either be stored in Home, or backed up outside of the HPC cluster.

### Transferring Files

One of the first tasks is to get your code, data, and any other files you need into your home directory on the system. If your code is in GitHub you can use git commands on the system to clone your repository to your home directory. You can also use VS Code to upload files using a graphical interface. See [VS Code Remote SSH](./Accessing%20HPC%20Cluster/VSCode%20Remote%20SSH.md) section for more information.

### Running your First Job

At this point you may want to do a test-run of your code. You always want to start small in your test runs, so you should choose a small example that tests the functionality of what you would ultimately like to run on the system.
You are provided with three starter files inside ```/workspace``` directory. 
- train.py          # your training code (edit this)
- train.sh          # Bash script to submit a normal GPU Slurm Job
- train-burst.sh    # Bash script to submit an opportunistic (burst) Slurm Job

You can run the test code by running the following command: ```sbatch /workspace/train.sh```

Review the [Running Jobs](./Running%20Jobs.md) section.