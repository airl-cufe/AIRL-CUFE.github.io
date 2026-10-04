# AIRL Docs

The Artificial Intelligence Research Lab (AIRL) provides high-performance computing (HPC) resources to support research, education, innovation, and student projects in artificial intelligence, machine learning, data science, and related fields. The following sections provide help material for hands-on working with AIRL supported services.

Help working with AIRL services is also available through email to AIRL2026@hotmail.com, please feel free to contact us with questions and suggestions. For more information on existing documentation, office hours, and other ways to get help, please see our Getting Help section.

## HPC Cluster

AIRL primarily operates and provides support and training for the HPC cluster, which is available to all researchers. The HPC cluster runs with a Slurm scheduler and has a web portal for interactive computing.

### Maintenance Schedule

The maintenance schedule for the HPC cluster is:

- Monthly maintenance on the 1st Monday of the month lasting about a day.
- Weekly restarts of login nodes Monday mornings starting at 9am for about 15 minutes. If Monday is a holiday this restart will occur on Tuesday.

### System Description

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

## Getting Started Tutorial

This section contains the most common steps for setting up and getting started with your account. We provide this section as a convenient reference to get started. Each system has its own in-depth documentation which can be found on the Documentation page.

### Getting an Account

Computing access is authorized through submitting an application request to the lab administration.

Access is granted only after approval by the lab administration. The request process consists of two steps: Application submission, and Faculty supervisor confirmation.

Two type of application requests are available:
1. Research application
2. Graduation project application

Both application types are submitted through filling an [online form](https://forms.gle/TnATP4Q6JZa8Nb2M7).

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

After submitting the request, the faculty supervisor or PI must send us a short confirmation email, verifying the researcher's project/research work. This email should be sent to AIRL2026@hotmail.com.

### Logging In

The first thing you should do when you get a new account is verify that you can log in. AIRL provides multiple ways to log in, including both ssh and web portal.

#### Terminal with SSH

Log into AIRL with the following command in a terminal window. Replace [username] below with your created username:
```ssh [username]@airlws02.tailf6a96c.ts.net```
You will be prompted for your password.

See [Logging in with SSH via Terminal](#logging-in-with-ssh-via-terminal) section for more information.

#### Web Portal - Jupyter Notebook

You can log into the web portal for [JupyterHub portal](https://airlws02.tailf6a96c.ts.net/hub). For full detailed instructions please see the [Logging in with web portal](#logging-in-with-web-portal) section for more information.

#### Shared HPC Clusters

AIRL is a shared HPC cluster. You are sharing this resources with a number of other researchers, staff, and students, so it is important that you read this page and use the system as intended.

Being a cluster, there are several machines connected together with a network. We refer to these as **nodes**. Most nodes in the cluster are referred to as **compute nodes**, this is where the computation is done on the system (where you will run your code). When you ssh into the system you are on a special purpose node called the **login node**. The **login node**, as its name suggests, is where you log in and is for editing code and files, downloading data, and starting jobs to run your code on one of the compute nodes.

Each job is started using a piece of software called the **scheduler**, which you can think of as a resource manager. You let it know what resources you need and what you want to run, and the scheduler will find those resources and start your job on them. When your job completes those resources are relinquished. The scheduler is what ensures that no two jobs are using the same resources, so it is very important not to run anything unless it is submitted properly through the scheduler.

#### Software and Packages

The first thing you may want to do is make sure the system has the software and packages you need. We have installed a lot of software and packages on the system already, even though it may not be immediately obvious that it is there.

If you are ever unsure if we have a particular software, and you cannot find it, please send us an email and ask before you spend a lot of time trying to install it. If we have it, we can point you to it, provide advice on how to use it, and if we don't have it we can often give pointers on how to install it. Further, if a lot of people request the same software, we may consider adding it to the system image.

#### Linux Command Line

The HPC cluster runs Linux, so much of what you do on the cluster involves the Linux command line. That doesn't mean you have to be a Linux expert to use the system! However the more you can get comfortable with the Linux command line and a handful of basic commands, the easier using the system will be. If you are already familiar with Linux, feel free to skip this section, or skim as a refresher.

Most Linux commands deal with **directories** and **files**. A **directory**, synonymous to a folder, contains files and other directories. The list of directories that lead to a particular directory or file is called its **path**. In Linux, directories on a path are separated by forward slashes /. It is also important to note that everything in Linux is case sensitive, so a file myScript.sh is not the same as the file myscript.sh. When you first log in, you are in your **home directory**. Your home directory is where you can put all the code and data you need to run your job. Your home directory is not accessible to other users, so if you need a space to share files with other users, let us know and we can make a shared **group directory** for you.

The path to your home directory on the HPC cluster is ```/home/[username]```, where ```[username]``` is your username. The character ```~``` is also shorthand for your home directory in any Linux commands.

Anytime after you start typing a Linux command you can press the "Tab" button your your keyboard. This called tab-complete, and will try to autocomplete what you are typing. This is particularly helpful when typing out long directory paths and file names. Pressing "Tab" once will complete if there is a single completion, pressing it twice will list all potential completions. It is a bit difficult to explain in text, but you can try it out yourself and watch the short demonstration here.

#### Filesystems

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

#### Transferring Files

One of the first tasks is to get your code, data, and any other files you need into your home directory on the system. If your code is in GitHub you can use git commands on the system to clone your repository to your home directory. You can also use VS Code to upload files using a graphical interface. See [VS Code Remote SSH](#vs-code-remote-ssh) section for more information.

#### Running your First Job

At this point you may want to do a test-run of your code. You always want to start small in your test runs, so you should choose a small example that tests the functionality of what you would ultimately like to run on the system.
You are provided with three starter files inside ```/workspace``` directory. 
- train.py          # your training code (edit this)
- train.sh          # Bash script to submit a normal GPU Slurm Job
- train-burst.sh    # Bash script to submit an opportunistic (burst) Slurm Job

You can run the test code by running the following command: ```sbatch /workspace/train.sh```

Review the [Running Jobs](#running-jobs) section.

## Accessing HPC cluster

### Logging in with web portal
AIRL provides a web portal to access the HPC cluster. This section provides instructions on how to log in using the web portal.

#### Accessing the Web Portal

1. Navigate to the AIRL [JupyterHub portal URL](https://airlws02.tailf6a96c.ts.net/hub) on your web browser.

2. You will be asked to Log in using GitHub Account
![Log In Page](./Portal%20Login%20Page.PNG)

3. When you click on Log in, you will be redirected to sign in with GitHub using your Faculty Email.
![Authentication Page](./Auth%20Page.PNG)

4. After successful authentication, you should see the JupyterHub page.
[To Add Screenshot]

Note: If you don't have an account or trying to login with a different GitHub account, you will be redirected to a different page.
![Login Fail Page](./Login%20Fail.PNG)

### Logging in with SSH via Terminal
You can log into the HPC cluster through your local terminal using SSH (Secure Shell). This method offers the most flexibility, allowing you to start interactive and batch jobs to run your code.

Once you initiate the SSH command, the shell in your terminal will no longer run on your computer but on the remote system. Authentication is required, either using a password or SSH keys. To set up SSH keys, please refer to the SSH Key Setup section.

To log in, follow the directions below:

1. Open a terminal (command prompt "CMD" if you are using Windows)

2. Use SSH to access AIRL via the command line with the command: ```ssh [username]@airlws02.tailf6a96c.ts.net```
Replace [username] with your created username.

3. You will be prompted to add the host's fingerprint to our list of known hosts. Type yes to add the host's fingerprint

4. Connecting for the first time requires a password to be entered. Enter the password sent to you on email with the account credintials (Username & Password).

5. Once logged in, you can execute commands on the SSH Host using the remote terminal.

### SSH Key Setup
An SSH key is a secure access credential used in the SSH protocol and establishes a secure and encrypted connection to the HPC cluster. This approach is used to connect applications such as VS Code automatically to the HPC system.

SSH keys consist of a pair: a public key and a private key.

- Public Key: This key can be shared freely and is used to encrypt data that only the corresponding private key can decrypt.
- Private Key: This key must be kept secure and private. It is used to decrypt data encrypted with the corresponding public key and to prove the identity of the user during the SSH authentication process.

When you attempt to connect to the HPC system using SSH key authentication, the system uses your public key to initiate a challenge that can only be answered correctly using your private key. If the correct response is received, the system verifies your identity and grants access.

> [!WARNING]
> Your private key should never be shared with anyone. If someone else obtains your private key, they could potentially gain unauthorized access to any system your key is associated with.

#### Checking for Existing SSH Keys

Before you generate an SSH key, you should check for existing SSH keys.

1. Open your local terminal.
2. Run the following command to view all existing SSH keys: ```ls -al ~/.ssh```
3. If you see a list of files, you have existing SSH keys. If you receive an error that ~/.ssh doesn't exist, you do not have an existing SSH key pair in the default location. You can create a new SSH key pair in the next step.

#### Generating SSH Keys

If you do not have an existing SSH key, follow these steps.

1. Open your local Terminal.
2. Run the following command to generate an RSA key:
```ssh-keygen -t rsa```
3. Save the key pair: You will be prompted to enter a file path to save the key. Press Enter to accept the default location:
```Enter a file in which to save the key (/home/your_username/.ssh/id_rsa):```
4. Passphrase: You will be asked to enter a passphrase for additional security. You can either enter a passphrase or leave it empty and press Enter:
```Enter passphrase (empty for no passphrase):```

>[!Note]
>The passphrase is optional- you can choose to skip it. However, it adds an extra layer of security for your private key by encrypting it on the disk. If you choose to use a passphrase, you will have to enter it correctly every time you attempt to log in using this SSH key pair

#### Uploading SSH Key on AIRL

To upload your SSH key to the HPC system, you must update the ```authorized_keys``` file on the HPC system via terminal.

If your system is a MAC or Linux machine, you can use the ```ssh-copy-id``` command to get your key onto the ```authorized_keys``` file on the HPC system. Windows users can try using git bash or WSL to access the ```ssh-copy-id``` command.

This method reduces the risk of typos in your ```authorized_keys``` file. It also correctly sets the permissions of the ```authorized_keys``` file in your ```authorized_keys``` file on the HPC system.

To add your SSH key with the Terminal and ```ssh-copy-id```, please follow the steps outlined below (replace username with your account username):

1. Open your local terminal on your MAC or Linux machine (use git bash or WSL on Windows)
2. type
```ssh-copy-id [username]@airlws02.tailf6a96c.ts.net```
3. enter password.
4. If successful, you will get a message indicating that your key has been copied and you should now be able to use your ssh key.
5. Test SSH access with the newly created SSH Key.

### VS Code Remote SSH

VSCode is a convenient IDE for development, and one of its nicest features is its ability to run on a remote system using its [RemoteSSH extension](https://code.visualstudio.com/docs/remote/ssh). This means you can have the VSCode window on your computer, while the files and anything you run will be on the remote system you are connected to.

Once you've installed the [RemoteSSH extension](https://code.visualstudio.com/docs/remote/ssh) this is fairly easy to set up. However, it is also very easy to set up in such a way that it is not only slow for you, but it also puts excess load on the login nodes and in turn slows things down for others on that node. Luckily, with a few extra steps you can run VSCode on a compute node where it can have more resources to run and won't impact others as much.

#### Adjust the RemoteSSH Extension Settings

Before you start, it is helpful to adjust VSCode's RemoteSSH Extension settings. Sometimes VS Code may cause you to be locked out of your AIRL account because it makes repeated authentication attempts. To mitigate this behavior, edit a few of the VS Code settings:

- Remote.SSH: Connect Timeout: Set to 60 seconds. Making this longer gives you more time to accept the authentication before the RemoteSSH extension tries again.

- Remote.SSH: Max Reconnection Attempts: Set to 0. This prevents RemoteSSH from trying to reconnect automatically over and over. This is what usually causes the lockout. When you set this to 0 VSCode will ask you before trying to reconnect. You can also safely set this to 1 to allow it to make a single reconnection attempt.

#### Setting up your Config File

Click the "Open a Remote Window" button in the bottom left corner of your VSCode window (It is a small blue rectangle labeled with ><). In the bar at the top of the page select "Connect to Host...", then "Configure SSH Hosts", and select first option, which will differ depending on your operating system. This will open your config file in a VSCode tab.

To run on a compute node you will need at least 2 entries in this file. The first will be a login node that you'll "jump" through and the second will be the compute node that is your final destination.

```YAML
Host airl-login
  HostName airlws02.tailf6a96c.ts.net
  User USERNAME

Host airl-compute
  User USERNAME
  HostName nodename
  ProxyJump airl-login
```

Replace ```USERNAME``` with your username on the system you are connecting to. We will fill in "nodename" later.

#### Starting your VSCode Session on a Compute Node

Each time you sit down to do remote work through VSCode you will have three steps:

1. Start an interactive job on the target system and note the name of the node your job is running on
2. Update your config file with the node name
3. Connect to the compute node using your updated config

We go through these steps in detail below.

##### Start an Interactive Job

Open a terminal window and ssh into the login node. If you are not used to doing this you can open a terminal in VSCode and run: ```ssh airl-login```

Use the name you have used for the login **Host** in your config file if different than the one above. The example screenshot below shows logging into one of the HPC login nodes with ssh in a VSCode terminal window.

Once you are logged in start an interactive session. If you are planning to only edit files a single core may be sufficient, but if you plan to run code or Jupyter Notebooks you may want to allocate more resources accordingly. Refer to the documentation for your system on how to request an interactive job: [Running Jobs](#running-jobs).

##### Update your Config File

Update the ```HostName``` of your compute node entry in your config file. If your config file is not open, follow the instructions [above](#setting-up-your-config-file) to open it again. Then replace whatever you have for ```HostName``` in your config file with the output of the hostname command you ran in your interactive session, or got from ```squeue --me```.

##### Connect to the Compute Node

You are ready to connect to the compute node you have allocated through your interactive job from VSCode. Select the "Open a Remote Window" button in the bottom left corner of your VSCode window. In the bar at the top of the page select "Connect to Host..." and select the Host for the compute node that you have created.

#### Other VSCode Best Practices, Tips, and Tricks

- Avoid running VSCode through RemoteSSH on the login nodes. If you are only editing files this might be okay, although it is not encouraged. Beyond editing files please use a compute node for VSCode, as described on this page.
- Add only the specific directories you need to your workspace. VSCode constantly scans all the files files and runs git commands on any local git repositories in your workspace, and it does this recursively. For this reason adding high-level directories to your workspace can slow things down quite a bit. For example, avoid adding your entire home directory or group storage to your VSCode session workspace.
- If VSCode is slow to start up on the HPC cluster, check to see whether you are activating a conda environment at login. If you are, run the command ```conda config --set auto_activate_base false``` to prevent this. You will only have to do this once.
- Sometimes, VS Code may cause you to be locked out of your account because it makes repeated authentication attempts. To mitigate this behavior, edit a few of the VS Code settings:
    - Remote.SSH: Connect Timeout: Set to 60 seconds. Making this longer gives you more time to accept the authentication push before the RemoteSSH extension tries again.
    - Remote.SSH: Max Reconnection Attempts: Set to 0. This prevents RemoteSSH from trying to reconnect automatically over and over, sending you authentication pushes when you aren't expecting them. This is what usually causes the lockout. When you set this to 0 VSCode will ask before trying to reconnect. You can also safely set this to 1 to allow it to make a single reconnection attempt.
    - Remote.SSH: Show Login Terminal: Checking this box would let you see useful debugging information while VS Code is starting up.

## Filesystem and File Transfer
TBD

## Running Jobs
TBD

## Slurm Job Recipes
TBD

## Publication Acknowledgment

If have used AIRL system or consultation services and you would like to acknowledge AIRL in your paper, we recommend adding the following to your Acknowledgments section (be sure to select the applicable resource(s) from among those in the brackets below):

"The authors acknowledge the Cairo University's Artificial Intelligence Research Lab for providing (High-Performace Computing, storage, consultation) resources that have contributed to the research results reported within this (paper, thesis, report)."

Thank you for acknowledging us – we appreciate it.


## Acceptable Use and Code of Conduct

The AIRL systems are operated by the Cairo University's Faculty of Engineering and certain appropriate common sense rules apply to working on it.

### Acceptable Use Guidelines

Lab resources shall be used exclusively for:
- Academic research
- Approved collaborations
- Grant-funded projects

The following activities are prohibited:
- Non-CUFE activities
- Commercial activities
- Illegal activities
- Cryptocurrency mining
- Copyright infringement
- Unauthorized penetration testing
- Excessive personal computing

### Data Security and Privacy

All AIRL current systems are only suitable for storing data with low-level security requirements. This means that they are not to be used to store sensitive data, such as personal information, financial information, or intellectual property. Additionally, they are not to be used to store data that is subject to use agreements that require security controls or audit tracking.

Datasets on AIRL must have been obtained legitimately and AIRL is not to be used for working with unanonymized data or data subject to NDAs or national security restrictions.

AIRL respects users' research confidentiality.
Administrative access to user files will occur only when necessary for:
- System maintenance
- Security investigations
- Storage recovery
- Technical support
- Compliance with institutional regulations

### Account Security & Authentication Policy

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

All account holders agree to respect requests from support staff around how they use the system. The support staff may, as needed, impose whatever policies are required to ensure the system runs well for all projects on the system.

### Code of Conduct

AIRL system is shared resource used by a wide community. 
All people involved in its use and operations should try their utmost to be courteous and kind at all times. 
Members of the AIRL community should be respectful toward one another and endeavor to ensure a welcoming and collegial environment for all. 
Account holders are also expected to respect privacy of others activities on the system, and not to try to gain access to parts of the system they are not explicitly authorized to access.

## Getting Help

The documentation sections contain a lot of information and may answer your question. You may want to check out the FAQ section to find what you are looking for.

### Email
If you can't find your answer in the documentation, please use our email AIRL2026@hotmail.com to contact us. It will create a ticket that our team can assign and track. In all cases the mailing list includes the entire team, so the best available person to answer your question will respond. Please do not send email directly to individual team members.

In this email, please provide, where applicable:

- Description of your issue or request
- The command that you used to launch your job
- Slurm Job ID(s)
- What you tried
- The full error message you are receiving
- Any supporting files (code, submission scripts, screenshots, etc)

### Office Hours
We host HPC Help and Office Hours several times each week. HPC Help and Office Hours are times when you can drop in and ask us questions. It is a great time to discuss or troubleshoot something that is difficult over email.


## Frequently Asked Questions (FAQs)

