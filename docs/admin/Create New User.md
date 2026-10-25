# Adding New Users Through JupyterHub (GitHub OAuth + FreeIPA)

Admin guide for the AI Lab cluster. Follow it to onboard a person who will use JupyterHub, and optionally SSH.

## How it works

You add a person's GitHub username to one file. On their first login, JupyterHub creates everything else automatically.

```
GitHub login -> username checked against /etc/ailab/jupyterhub-users.yaml
             -> IPA account created   (ipa user-add, via the provision keytab)
             -> Slurm association     (sacctmgr add user ... account=lab)
             -> home folder created   (/export/home/<user>, on first notebook start)
             -> notebook starts as a Slurm job
```

| Item | Value |
|---|---|
| User list file (live) | `/etc/ailab/jupyterhub-users.yaml` on ws02 |
| User list file (git) | `/opt/ailab/ansible/files/jupyterhub-users.yaml` |
| Deploy playbook | `playbooks/97-jupyterhub-users.yml` |
| Hub config | `/opt/ailab/jupyterhub/jupyterhub_config.py` |
| IPA defaults for new users | home `/export/home/<user>`, shell `/bin/bash`, group `ailab-students` |
| Slurm account / QOS | `lab`, `normal,burst` |
| Public URL | `https://193.227.38.179:8443/hub/login` |

**Good to know**

- The hub re-reads the user file on every login, so **no restart is needed**.
- Users created this way have **no password and no SSH key**. They can use JupyterHub only. SSH is a separate step (see below).
- Only names listed in the file are provisioned. Anyone else is refused at login, and no IPA account is created for them.

## Before you start

You need:

- the person's **GitHub username**, written in **lowercase**
- admin access to ws02 as `airl-ws02`, with the repo at `/opt/ailab/ansible`
- a username of **32 characters or fewer**. IPA's limit is 32, and GitHub allows up to 39. Longer names cannot be created, so use the manual fallback with a different IPA name (not covered here; ask first).

Ask the person to check their GitHub username on their profile page. Typos here are the most common cause of failed logins.

## Step 1: Add the username to the list

```bash
cd /opt/ailab/ansible
nano files/jupyterhub-users.yaml
```

```yaml
# GitHub usernames, lowercase. Admins are automatically allowed too.
admins:
  - abdelrahman-emad0-0
  - ayman-aboelhassan
users:
  - rematchka
  - new-student-name        # <- add the new person here
```

- Put regular users under `users:` and JupyterHub administrators under `admins:`.
- Remove the `[]` if the list was empty.
- Keep the two-space indentation and the leading dash.

An **admin** can see `/hub/admin` and stop other people's servers. Add people there only when they need it.

## Step 2: Deploy the file

Check it first, then apply:

```bash
ansible-playbook playbooks/97-jupyterhub-users.yml --check --diff
ansible-playbook playbooks/97-jupyterhub-users.yml
```

The playbook validates that the file is valid YAML before installing it, so a typo cannot break the hub. Then record the change:

```bash
git add -A && git commit -m "JupyterHub: add <github-username>"
```

Git keeps the history of who was approved and when.

## Step 3: Tell the user to log in

Send them the URL and ask them to sign in with GitHub in a normal browser window:

```
https://193.227.38.179:8443/hub/login
```

On the first login the hub runs the provisioning hook. When they press **Start My Server**, it creates their home folder and starts the notebook as a Slurm job.

## Step 4: Verify

Run these on ws02 after their first login:

```bash
# IPA account exists, with the expected defaults
kinit admin
ipa user-show <username> | grep -iE "home|shell|member of groups"

# Slurm association exists
sacctmgr -n show assoc user=<username> format=user,account,qos,defaultqos

# The account resolves on every node
ansible workstations -m shell -a "id <username>"

# Hub log shows the provisioning
sudo journalctl -u jupyterhub --since "10 min ago" --no-pager | grep -iE "<username>|slurm assoc"

# Notebook job is running
squeue -u <username>
```

Expected results:

- home `/export/home/<username>`, shell `/bin/bash`, member of `ailab-students`
- one Slurm row with account `lab` and QOS `normal,burst`
- the same UID on ws01, ws02 and ws03
- a log line `slurm assoc: ensured <username> in account lab`

Never paste a browser cookie or token into tickets or chat. Log excerpts from the hub can contain them.

## Optional: give the user SSH access

Without this step the user can use JupyterHub only. SSH is allowed on **ws02 only** (HBAC rule `allow_students_workstations`), and only for members of `ailab-students`, which every new user is.

Use an **SSH key**. The user generates a key pair on their own machine and sends you the `.pub` file only:

```bash
ssh-keygen -t ed25519 -C "<username>"
cat ~/.ssh/id_ed25519.pub
```

Then register it from ws02:

```bash
kinit admin
ipa user-mod <username> --sshpubkey="ssh-ed25519 AAAA... <username>"
sudo sss_cache -E
```

Notes:

- `--sshpubkey` **replaces** the whole key list. To add a second key, pass every key again.
- A one-time password also works (`ipa user-mod <username> --random`). The password is shown once on your screen, so read it privately and never paste it anywhere. The user must change it at first login.
- Password logins are open to guessing attacks from the internet, which is why keys are preferred.

## Removing or suspending a user

Removing a name from the file blocks **new** logins only. Do all of these for a full cutoff:

1. Delete the name from `files/jupyterhub-users.yaml`, run the playbook, commit.
2. Stop their running notebook job: `sudo scancel -u <username>`
3. Delete them in the hub at `/hub/admin` (so the hub forgets them).
4. Disable the IPA account: `ipa user-disable <username>`. This also blocks SSH and cannot be undone by the hub.

To delete the account permanently, use `ipa user-del <username>`. This keeps their files in `/export/home/<username>` but the files will belong to a UID that no longer exists. Move or archive the folder first if you need it.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Login says access denied | Name missing or misspelled in the file, or not lowercase | Fix the file, run the playbook, retry |
| `Invalid account or account/partition combination specified` when starting | No Slurm association | `sudo sacctmgr -i add user <username> account=lab defaultqos=normal qos=normal,burst`, then restart the server |
| User can log in but no IPA account exists | Provisioning failed (keytab, IPA unreachable) | Check the hub journal; verify `ipa ping` works from ws02; create manually: `ipa user-add <username> --first=<username> --last="(github)"` |
| `id <username>` fails on a node | SSSD cache | `sudo sss_cache -E` on that node and retry |
| Notebook spawn fails with a name that does not resolve | Node names missing from `/etc/hosts` | Run `playbooks/99-cluster-hosts.yml` |
| Spawn fails, no job in `squeue` | Partition drained or no resources | `sinfo -N`; only undrained nodes accept jobs |
| User cannot SSH | No key or password set, or HBAC | Add a key (above); check `ipa hbactest --user=<u> --host=airlws02.ailab.lan --service=sshd` |
| Unexpected UID change for a user | Account deleted and recreated | Files in `/export/home/<user>` keep the old owner; fix ownership with `chown -R` once, after confirming the new UID with `id` |

If the hub fails to start after you edit the config file (not the user list), restore the latest backup in `/root/backups/jupyterhub_config.py.bak*` and run `sudo systemctl restart jupyterhub`.

## Manual fallback (hub provisioning not working)

Use this only when the hook failed. Both commands are safe to repeat.

```bash
kinit admin
ipa user-add <username> --first=<username> --last="(github)" --displayname=<username>
sudo sacctmgr -i add user <username> account=lab defaultqos=normal qos=normal,burst
```

The name must still be in the user list, or the GitHub login is refused.

## Admin checklist for each new user

- [ ] Confirmed the lowercase GitHub username (32 characters or fewer)
- [ ] Added it to `files/jupyterhub-users.yaml`, ran `97-jupyterhub-users.yml`, committed
- [ ] User logged in and started a server
- [ ] `ipa user-show`, `sacctmgr show assoc` and `id` all look right
- [ ] SSH key added, if SSH is needed
- [ ] Told the user about the acceptable-use policy (activity is audited)

## Security reminders

- The provisioning keytab (`/etc/ailab-provision.keytab`) can create IPA accounts. Keep it `640 root:root`.
- Do not put secrets in the user file or in the repo. The GitHub OAuth secret lives only in `/etc/ailab/jupyterhub.env` (`600 root:root`).
- Every admin action here is recorded by `auditd` under your login name, and in the daily report.