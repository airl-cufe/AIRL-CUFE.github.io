# VS Code Remote SSH

VSCode is a convenient IDE for development, and one of its nicest features is its ability to run on a remote system using its [RemoteSSH extension](https://code.visualstudio.com/docs/remote/ssh). This means you can have the VSCode window on your computer, while the files and anything you run will be on the remote system you are connected to.

Once you've installed the [RemoteSSH extension](https://code.visualstudio.com/docs/remote/ssh) this is fairly easy to set up. However, it is also very easy to set up in such a way that it is not only slow for you, but it also puts excess load on the login nodes and in turn slows things down for others on that node. Luckily, with a few extra steps you can run VSCode on a compute node where it can have more resources to run and won't impact others as much.

## Adjust the RemoteSSH Extension Settings

Before you start, it is helpful to adjust VSCode's RemoteSSH Extension settings. Sometimes VS Code may cause you to be locked out of your AIRL account because it makes repeated authentication attempts. To mitigate this behavior, edit a few of the VS Code settings:

- Remote.SSH: Connect Timeout: Set to 60 seconds. Making this longer gives you more time to accept the authentication before the RemoteSSH extension tries again.

- Remote.SSH: Max Reconnection Attempts: Set to 0. This prevents RemoteSSH from trying to reconnect automatically over and over. This is what usually causes the lockout. When you set this to 0 VSCode will ask you before trying to reconnect. You can also safely set this to 1 to allow it to make a single reconnection attempt.

## Setting up your Config File

Click the "Open a Remote Window" button in the bottom left corner of your VSCode window (It is a small blue rectangle labeled with ><). In the bar at the top of the page select "Connect to Host...", then "Configure SSH Hosts", and select first option, which will differ depending on your operating system. This will open your config file in a VSCode tab.

To run on a compute node you will need at least 2 entries in this file. The first will be a login node that you'll "jump" through and the second will be the compute node that is your final destination.

```YAML
Host airl-login
  HostName 193.227.38.179
  Port 2222
  User USERNAME

Host airl-compute
  User USERNAME
  HostName nodename
  ProxyJump airl-login
```

Replace ```USERNAME``` with your username on the system you are connecting to. We will fill in "nodename" later.

## Starting your VSCode Session on a Compute Node

Each time you sit down to do remote work through VSCode you will have three steps:

1. Start an interactive job on the target system and note the name of the node your job is running on
2. Update your config file with the node name
3. Connect to the compute node using your updated config

We go through these steps in detail below.

### Start an Interactive Job

Open a terminal window and ssh into the login node. If you are not used to doing this you can open a terminal in VSCode and run: ```ssh airl-login```

Use the name you have used for the login **Host** in your config file if different than the one above. The example screenshot below shows logging into one of the HPC login nodes with ssh in a VSCode terminal window.

Once you are logged in start an interactive session. If you are planning to only edit files a single core may be sufficient, but if you plan to run code or Jupyter Notebooks you may want to allocate more resources accordingly. Refer to the documentation for your system on how to request an interactive job: [Running Jobs](/docs/Documentation/Running%20Jobs.md).

### Update your Config File

Update the ```HostName``` of your compute node entry in your config file. If your config file is not open, follow the instructions [above](#setting-up-your-config-file) to open it again. Then replace whatever you have for ```HostName``` in your config file with the output of the hostname command you ran in your interactive session, or got from ```squeue --me```.

### Connect to the Compute Node

You are ready to connect to the compute node you have allocated through your interactive job from VSCode. Select the "Open a Remote Window" button in the bottom left corner of your VSCode window. In the bar at the top of the page select "Connect to Host..." and select the Host for the compute node that you have created.

## Other VSCode Best Practices, Tips, and Tricks

- Avoid running VSCode through RemoteSSH on the login nodes. If you are only editing files this might be okay, although it is not encouraged. Beyond editing files please use a compute node for VSCode, as described on this page.
- Add only the specific directories you need to your workspace. VSCode constantly scans all the files files and runs git commands on any local git repositories in your workspace, and it does this recursively. For this reason adding high-level directories to your workspace can slow things down quite a bit. For example, avoid adding your entire home directory or group storage to your VSCode session workspace.
- If VSCode is slow to start up on the HPC cluster, check to see whether you are activating a conda environment at login. If you are, run the command ```conda config --set auto_activate_base false``` to prevent this. You will only have to do this once.
- Sometimes, VS Code may cause you to be locked out of your account because it makes repeated authentication attempts. To mitigate this behavior, edit a few of the VS Code settings:
    - Remote.SSH: Connect Timeout: Set to 60 seconds. Making this longer gives you more time to accept the authentication push before the RemoteSSH extension tries again.
    - Remote.SSH: Max Reconnection Attempts: Set to 0. This prevents RemoteSSH from trying to reconnect automatically over and over, sending you authentication pushes when you aren't expecting them. This is what usually causes the lockout. When you set this to 0 VSCode will ask before trying to reconnect. You can also safely set this to 1 to allow it to make a single reconnection attempt.
    - Remote.SSH: Show Login Terminal: Checking this box would let you see useful debugging information while VS Code is starting up.