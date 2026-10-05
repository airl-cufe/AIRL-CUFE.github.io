# Logging in with SSH via Terminal
You can log into the HPC cluster through your local terminal using SSH (Secure Shell). This method offers the most flexibility, allowing you to start interactive and batch jobs to run your code.

Once you initiate the SSH command, the shell in your terminal will no longer run on your computer but on the remote system. Authentication is required, either using a password or SSH keys. To set up SSH keys, please refer to the SSH Key Setup section.

To log in, follow the directions below:

1. Open a terminal (command prompt "CMD" if you are using Windows)

2. Use SSH to access AIRL via the command line with the command: ```ssh -p 2222 USERNAME@193.227.38.179```

    Replace ```USERNAME``` with your created username.

3. You will be prompted to add the host's fingerprint to our list of known hosts. Type yes to add the host's fingerprint

4. Connecting for the first time requires a password to be entered. Enter the password sent to you on email with the account credintials (Username & Password).

5. Once logged in, you can execute commands on the SSH Host using the remote terminal.