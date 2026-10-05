# SSH Key Setup
An SSH key is a secure access credential used in the SSH protocol and establishes a secure and encrypted connection to the HPC cluster. This approach is used to connect applications such as VS Code automatically to the HPC system.

SSH keys consist of a pair: a public key and a private key.

- Public Key: This key can be shared freely and is used to encrypt data that only the corresponding private key can decrypt.
- Private Key: This key must be kept secure and private. It is used to decrypt data encrypted with the corresponding public key and to prove the identity of the user during the SSH authentication process.

When you attempt to connect to the HPC system using SSH key authentication, the system uses your public key to initiate a challenge that can only be answered correctly using your private key. If the correct response is received, the system verifies your identity and grants access.

> [!WARNING]
> Your private key should never be shared with anyone. If someone else obtains your private key, they could potentially gain unauthorized access to any system your key is associated with.

## Checking for Existing SSH Keys

Before you generate an SSH key, you should check for existing SSH keys.

1. Open your local terminal.
2. Run the following command to view all existing SSH keys: ```ls -al ~/.ssh```
3. If you see a list of files, you have existing SSH keys. If you receive an error that ~/.ssh doesn't exist, you do not have an existing SSH key pair in the default location. You can create a new SSH key pair in the next step.

## Generating SSH Keys

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

## Uploading SSH Key on AIRL

To upload your SSH key to the HPC system, you must update the ```authorized_keys``` file on the HPC system via terminal.

If your system is a MAC or Linux machine, you can use the ```ssh-copy-id``` command to get your key onto the ```authorized_keys``` file on the HPC system. Windows users can try using git bash or WSL to access the ```ssh-copy-id``` command.

This method reduces the risk of typos in your ```authorized_keys``` file. It also correctly sets the permissions of the ```authorized_keys``` file in your ```authorized_keys``` file on the HPC system.

To add your SSH key with the Terminal and ```ssh-copy-id```, please follow the steps outlined below (replace username with your account username):

1. Open your local terminal on your MAC or Linux machine (use git bash or WSL on Windows)
2. type
```ssh-copy-id -p 2222 [username]@193.227.38.179```
3. enter password.
4. If successful, you will get a message indicating that your key has been copied and you should now be able to use your ssh key.
5. Test SSH access with the newly created SSH Key.