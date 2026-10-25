# JupyterHub Admin Access and Control

Admin guide for the AI Lab JupyterHub on ws02. It covers who can administer the hub, what an admin can do, and how to operate, monitor and troubleshoot it. For adding users, see the separate guide *Adding New Users Through JupyterHub*.

## 1. How the hub is built

```
Browser ─► gateway 193.227.38.179:8443 ─► ws02 nginx :443 ─► proxy :8000 ─► hub :8081
                                                              │
                                                              └─► user notebook (Slurm job on ws03,
                                                                  Apptainer container, home /export/home/<user>)
```

| Item | Value |
|---|---|
| Public login page | `https://193.227.38.179:8443/hub/login` |
| Admin panel | `https://193.227.38.179:8443/hub/admin` |
| Service | `jupyterhub` (systemd, runs as **root**) on ws02 |
| Config | `/opt/ailab/jupyterhub/jupyterhub_config.py` (copy in git: `/opt/ailab/ansible/jupyterhub_config.py`) |
| Environment file | `/etc/ailab/jupyterhub.env` (GitHub client ID, secret and callback URL; mode `600`, root) |
| User and admin list | `/etc/ailab/jupyterhub-users.yaml` (git: `files/jupyterhub-users.yaml`) |
| Hub database | `/opt/ailab/jupyterhub/jupyterhub.sqlite` |
| Python environment | `/opt/ailab/jupyterhub-venv` |
| Proxy | `configurable-http-proxy` on `127.0.0.1:8000`, API on `127.0.0.1:8001` |
| Hub API | `0.0.0.0:8081`; notebooks call back to `172.28.128.192:8081` |
| Notebooks | Slurm jobs named `jhub-<user>` in the `interactive` partition, running the `ailab-base.sif` image |
| Idle culler | Stops servers idle for 3600 seconds |
| Login | GitHub OAuth only; no passwords |

Two facts shape everything below:

- **The hub runs as root.** Anyone who can edit its config file can run commands as root on ws02. Treat config edits like root access.
- **Logins come only from the list file.** A GitHub account that is not in `jupyterhub-users.yaml` is refused.

## 2. Who is an admin

Admins are the names under `admins:` in `/etc/ailab/jupyterhub-users.yaml`. There is no `admin_users` setting in the config file any more.

```yaml
admins:
  - abdelrahman-emad0-0
  - ayman-aboelhassan
users:
  - some-student
```

- Names are **lowercase GitHub usernames**. Admins are automatically allowed to log in.
- Changes take effect at the person's **next login**. A person you remove from `admins:` keeps admin rights in their current browser session until they log in again, so also delete them from the admin panel and stop their server if the removal is urgent.
- To add or remove an admin: edit `files/jupyterhub-users.yaml` in the repo, run `ansible-playbook playbooks/97-jupyterhub-users.yml`, then commit. No hub restart is needed.

### Keep admin accounts safe

Admin access is only as strong as the GitHub account behind it.

- Turn on two-factor authentication on every admin's GitHub account.
- Keep the admin list short, and review it when people leave.
- Do not share admin accounts. Every action should map to one person.

### Admin on the hub is not admin on the cluster

JupyterHub admin rights do not give a person Linux sudo, SSH access or IPA admin rights. Those are separate:

| Right | Controlled by |
|---|---|
| JupyterHub admin | `admins:` in the user file |
| SSH to ws02 | IPA group `ailab-students` and the HBAC rule |
| sudo | Local group `sudo` on ws02, or IPA sudo rules |
| IPA administration | IPA `admins` group |

## 3. The admin panel

Open `/hub/admin` while logged in as an admin. The panel lists every user with their last activity and server state.

| Action | How | Notes |
|---|---|---|
| See who is active | User table, "Last activity" column | Idle servers are culled after one hour |
| Start a user's server | **Start Server** | Starts a Slurm job as that user |
| Stop a user's server | **Stop Server** | Stops the notebook and ends the Slurm job |
| Add a user | **Add Users** | Prefer the list file. A user added only in the panel cannot log in unless they are also in the file |
| Delete a user | **Delete User** | Removes them from the hub database only. Does not touch IPA, Slurm or files |
| Make someone an admin | Edit user | Overridden at their next login by the list file, so use the file |
| Open a user's notebook | **Access Server** | Depends on role permissions; see the check in section 9 |

The list file is the source of truth. Anything you change only in the panel can be undone at the user's next login.

## 4. Daily operations

### Is the hub healthy?

```bash
systemctl is-active jupyterhub
curl -sk -o /dev/null -w '%{http_code}\n' https://localhost/hub/login      # expect 200
squeue                                                                      # running notebooks
sudo journalctl -u jupyterhub -n 30 --no-pager
```

### Who is running a notebook?

```bash
squeue -h -o "%i %u %j %T %M %N" | grep jhub-
```

### Stop one user's notebook

Use the panel, or from ws02:

```bash
sudo scancel -u <username>
```

### Stop every notebook (emergency only)

```bash
squeue -h -o "%i %j" | awk '$2 ~ /^jhub-/ {print $1}' | xargs -r sudo scancel
```

Warn users first when you can. Their unsaved work in the notebook is lost.

### Restart the hub

```bash
squeue                                   # check who is running
sudo systemctl restart jupyterhub
sleep 5
sudo journalctl -u jupyterhub -n 20 --no-pager
```

A restart may stop running notebooks, because the hub can shut down the servers it started. Do it in a quiet moment and tell users, or test the behaviour once with a spare account.

You do **not** need to restart for user-list changes. You do need to restart for any edit to `jupyterhub_config.py` or `jupyterhub.env`.

## 5. Seeing what users do

The hub keeps few records, so combine sources.

| Question | Where to look |
|---|---|
| Who logged in recently | `sudo journalctl -u jupyterhub --since today --no-pager \| grep -i "oauth\|login"` |
| Who is running a notebook now | `squeue` |
| What did a user run | `sacct -u <user> -S today --format=JobID,JobName,Partition,Elapsed,State,AllocCPUS` |
| Resource use per user | `sacct -a -X -S now-24hours -n -P --format=User,CPUTimeRAW` (the daily report totals this) |
| Notebook start problems | `/export/home/<user>/.jupyterhub-slurm-<jobid>.log` |
| Account provisioning problems | `journalctl -u jupyterhub` lines containing `slurm assoc` |
| Notebook container logs and Loki | Grafana, Explore, Loki, `{job="systemd-journal"}` |
| Admin actions on ws02 | `sudo ausearch -k root_cmds -ts today -i` |

Note the limits:

- Requests reach the hub through the gateway, so the hub log shows the **gateway's address**, not the user's real address. For the real source, ask the gateway admin to log it there.
- What users type inside their notebook is not logged by the hub. Slurm accounting shows that a job ran and for how long, not what it did.
- Look at users' files only when you have a reason, and follow your acceptable-use policy. A user's home folder is private data.

## 6. Resource control

Limits come from Slurm, not from JupyterHub.

| Control | Where |
|---|---|
| Partition and QOS for notebooks | Hub config (`interactive` partition, QOS `normal`) |
| Per-user limits, max jobs, time | `sacctmgr show qos` and `sacctmgr modify qos ...` |
| Which users may submit | Slurm association (account `lab`) |
| Idle shutdown | Idle culler service, 3600 seconds |
| Which nodes accept notebooks | `sinfo -N`; drained nodes do not accept jobs |

```bash
sacctmgr -n show assoc user=<username> format=user,account,qos,defaultqos
sacctmgr show qos format=name,maxwall,maxjobsperuser,maxtresperuser
sinfo -N -l
```

To block one user from starting notebooks without deleting anything, remove their Slurm association:

```bash
sudo sacctmgr -i delete user name=<username> account=lab
```

The hook adds the association again at their next login **only if** the name is still in the user file, so also remove them from the file.

## 7. Changing the hub configuration safely

Every edit follows the same steps.

```bash
sudo cp -a /opt/ailab/jupyterhub/jupyterhub_config.py /root/backups/jupyterhub_config.py.$(date +%F-%H%M)
sudo nano /opt/ailab/jupyterhub/jupyterhub_config.py
sudo /opt/ailab/jupyterhub-venv/bin/python -c "import ast,sys; ast.parse(open(sys.argv[1]).read()); print('syntax ok')" /opt/ailab/jupyterhub/jupyterhub_config.py
squeue
sudo systemctl restart jupyterhub
sudo journalctl -u jupyterhub -n 20 --no-pager
```

Then log in with a private browser window and start a notebook. Finally, store the working file in git:

```bash
sudo cp /opt/ailab/jupyterhub/jupyterhub_config.py /opt/ailab/ansible/jupyterhub_config.py
sudo chown $USER: /opt/ailab/ansible/jupyterhub_config.py
cd /opt/ailab/ansible && git add -A && git commit -m "JupyterHub config: <what and why>"
```

To roll back, copy the backup over the live file and restart. The playbooks do not deploy this file, so the repo copy is only a record. Update it after every change.

### Settings that matter

| Setting | Why it matters |
|---|---|
| `hub_connect_ip = "172.28.128.192"` | The address notebooks use to call back to the hub. If this is wrong, notebooks start but the hub reports a spawn failure |
| `c.JupyterHub.ip` / `port` | The proxy listens on `127.0.0.1:8000`. nginx must forward to **8000**, not to the hub on 8081 |
| `post_auth_hook` | Creates the IPA account and Slurm association for approved names |
| `pre_spawn_hook` (`prepare_home`) | Creates `/export/home/<user>` on first start |
| `c.Authenticator.allow_all = False` | Keeps the list file as the only gate. Do not change this |

## 8. Credentials and the GitHub OAuth app

| Secret | Location | Rules |
|---|---|---|
| GitHub client ID, secret, callback URL | `/etc/ailab/jupyterhub.env` | `600 root:root`. Edit with `sudo nano`. Never type the secret on a command line, and never paste it into chat or tickets |
| Cookie secret | `/opt/ailab/jupyterhub/jupyterhub_cookie_secret` | `600`. Deleting it logs everyone out |
| Provisioning keytab | `/etc/ailab-provision.keytab` | `640 root:root`. It can create IPA accounts |
| TLS key | `/etc/ailab/tls/jupyterhub.key` | Readable only by root and nginx |

### Rotate the GitHub secret

1. In GitHub, open the OAuth app and generate a new client secret.
2. `sudo cp -a /etc/ailab/jupyterhub.env /root/backups/jupyterhub.env.bak`
3. `sudo nano /etc/ailab/jupyterhub.env` and replace the secret.
4. `sudo systemctl restart jupyterhub`
5. Log in with a private window. When it works, delete the old secret in GitHub.

The callback URL registered in GitHub must equal `OAUTH_CALLBACK_URL` exactly, currently `https://193.227.38.179:8443/hub/oauth_callback`. A mismatch gives "The redirect_uri is not associated with this application".

## 9. Verify these on your installation

I could not confirm these from the output available, so check them once and record the answers here.

```bash
/opt/ailab/jupyterhub-venv/bin/pip list 2>/dev/null | grep -iE "^(jupyterhub|oauthenticator|batchspawner) "
```

- **Hub version.** The guide assumes JupyterHub 5.x.
- **Can an admin open another user's notebook?** Log in as an admin, click **Access Server** for a spare test user whose server is running, and note the result. This depends on role scopes and decides your privacy policy. If it is allowed, make sure admins and users both know.
- **Does restarting the hub stop running notebooks?** Test with a spare account during a quiet period, using `squeue` before and after.

## 10. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| "The redirect_uri is not associated with this application" | Callback URL in GitHub differs from `jupyterhub.env`, or the service was not restarted after editing | Make them identical, restart |
| `500: Redirect loop detected` after login | nginx forwards to the hub (8081) instead of the proxy (8000) | In `/etc/nginx/sites-available/jupyterhub-https`, use `proxy_pass http://127.0.0.1:8000;`, then `nginx -t` and reload |
| `unknown "connection_upgrade" variable` from nginx | The `map` was removed from the site file | The map is in `/etc/nginx/conf.d/ailab-upgrade-map.conf`; restore it |
| `Invalid account or account/partition combination specified` | No Slurm association | `sudo sacctmgr -i add user <user> account=lab defaultqos=normal qos=normal,burst`; check the name is in the user file |
| `Spawn failed: Server at http://airlws03:PORT/...` | Node name does not resolve, or points at a dead address | `getent hosts airlws03` must return `172.28.128.193`; fix `/etc/hosts` with `playbooks/99-cluster-hosts.yml` |
| Login says access denied | Name missing, misspelled or not lowercase in the user file | Fix the file and run `97-jupyterhub-users.yml` |
| Notebook starts but never loads | Hub address wrong for the notebook, or firewall blocks port 8081 | Check `hub_connect_ip`; check ws02 firewall allows the lab peers |
| Server pending for a long time | No node accepts jobs (drained), or the account is over its limits | `sinfo -N`, `squeue -u <user>`, `scontrol show job <id>` |
| Hub will not start after a config edit | Syntax or import error | `journalctl -u jupyterhub -n 40`; restore the backup |
| Everyone is logged out | Cookie secret changed or the hub database was reset | Restore the secret file; users log in again |
| User account disappeared in IPA, files have a different owner | Account was deleted and recreated, so the UID changed | `id <user>`, then `chown -R` the home folder once |

## 11. Admin checklist

Before a change:

- [ ] `squeue` checked; users warned if a restart is needed
- [ ] Backup of the file you will edit

After a change:

- [ ] `journalctl -u jupyterhub` shows no errors
- [ ] Login page returns 200, a private-window login works, a notebook starts
- [ ] Working config copied to the repo and committed

Regularly:

- [ ] Review the `admins:` list and GitHub 2FA
- [ ] Read the daily report for unusual sudo use, failed logins and large jobs
- [ ] Check disk space on `/export/home`
- [ ] Rotate the GitHub OAuth secret after any suspected exposure