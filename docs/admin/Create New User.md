# Creating New Users

SSH (Secure Shell) is a protocol used in Linux to access and manage servers remotely. This allows for the remote execution of commands, file transfers, and other tasks.

Creating new users with specific permissions is an important aspect of server management. It’s crucial to understand the risks of granting root access, which should only be given to trusted users and monitored to maintain security.

This tutorial covers creating a new user, granting superuser privileges, and setting up a home directory

## 1. Connect to the AIRL system with admin access

1. Open Tailscale application on your machine and connect to the ```airl2026@hotmail.com``` network.

2. Open terminal window on your machine

3. Connect using SSH to the AIRL admin account using the command ```ssh airl-ws02@airlws02```

## 2. Creating a New User

1. Run the following command to create the user with a home directory: ```sudo useradd -m -s /bin/bash [username]```

    ```-m```: Creates the home directory (/home/[username]).

    ```-s /bin/bash```: Sets /bin/bash as the default login shell for the user. (to be changed later to a reduced "constrained" access bash)

2. Create a default dummy password for the new user using the following command ```sudo passwd [username]```

3. Set-up the correct permissions for both the .ssh directory and the ```authorized_keys``` file:
```bash
chown -R [username]:[username] /home/[username]/.ssh
# make sure only the new user has permissions 
chmod 700 /home/[username]/.ssh 
chmod 600 /home/[username]/.ssh/authorized_keys
```

4. Create the default ```/workspace``` and copy the draft scripts to it
```bash
mkdir -p /home/[username]/workspace
cp -r /default_workspace /home/[username]/workspace
```

5. Send an Email to the new user with their created credintials (Username & Password).

## 3. Enforcing User to create SSH Key

To disable the password for an account, run the following command: ```sudo passwd -l [username]```
