# Filesystem and File Transfer

Uploading and downloading files depend on how you logged in to your account.
JupyterHub has a graphical interface for file operations.
While Secure Copy Protocol (SCP) could be used to transfer files over SSH.

## File Transfer over Web Portal

1. Copy a Local File to your workspace (Upload) 

To send a file from your computer to your workspace on the HPC system, click on the highlighted upload button, which will ask you to select file(s) to upload to the current workspace.

![Upload Button](./Accessing%20HPC%20Cluster/JupyterHub%20Login/Upload.PNG)

2. Copy a File from the HPC System to Your Local Computer (Download)

To download a filed from the HPC system to your local machine, press right-click on the file you want to download, then select the download option. You can also click download from the "File" menu at the top-menu bar.

![Download Button](./Accessing%20HPC%20Cluster/JupyterHub%20Login/Download.PNG)

3. File Operations Inside your Workspace

you can perform file operations on your files in the workspace by pressing right-click on the target file then selecting the operation required (i.e.: duplicate, copy, rename, delete, ...)

## File Transfer over SSH

1. Copy a Local File to the HPC System (Upload)

To send a file from your computer to the HPC system, specify the file path first, followed by the remote connection details and the destination directory:

```Bash
scp -P 2222 /path/to/local/file.txt USERNAME@193.227.38.179:/path/to/remote/directory/
```

2. Copy a File from the HPC System to Your Local Computer (Download)

To download a file from the HPC system to your local machine, reverse the src/dst order. *Tip: Use a dot . at the end to represent your current working directory*:

```Bash
scp -P 2222 USERNAME@193.227.38.179:/path/to/remote/file.txt .
```

3. Copy a Entire Folder / Directory

To copy a folder and all of its contents (recursively), you must include the -r flag:

```Bash
scp -P 2222 -r /path/to/local/folder USERNAME@193.227.38.179:/path/to/remote/directory/
```

4. Specifying an SSH Key

If you disabled your password and use SSH Keys only, Use -i followed by the key path:

```Bash
scp -P 2222 -i ~/.ssh/id_rsa /path/to/local/file.txt USERNAME@193.227.38.179:/path/to/remote/directory/
```

5. File Operations Inside Remote SSH Session

You can also make file operations using bash commands inside your SSH session. Such as:

    - creating a folder mkdir
    - creating a file touch
    - copying files cp
    - deleting files rm 

## File Transfer via VSCode Remote SSH

Once you connect your workspace with [VSCode Remote SSH](./Accessing%20HPC%20Cluster/VSCode%20Remote%20SSH.md), you can make file operations from inside VSCode directly.

    - upload files: drag and drop the file to be uploaded
    - download files: press right-click on the target file, then select download
    - local changes: copy, duplicate, rename, delete, ...