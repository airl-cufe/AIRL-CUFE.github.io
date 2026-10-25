# Adding a New Machine to the AI Lab HPC Cluster

Admin guide: install Ubuntu, bring the machine under Ansible, and connect it to FreeIPA, NFS, Slurm, containers and monitoring.

> **Status of this guide.** It follows the cluster as it is today (three workstations `airlws01` to `airlws03`, FreeIPA VM, everything on the LAN). I have not seen the contents of every playbook (for example `50`, `53`, `54`, `71` to `74`, `82`, `84`, `86`, `87`, `90-nfs-server`, `91-nfs-client`, `92`). So the playbook steps always use **`--check --diff --limit <new node>` first**, and you read what they would do before running them. Items marked **VERIFY** need a one-time check against a working node.

## 0. Conventions and ground rules

Placeholders used throughout:

| Placeholder | Meaning |
|---|---|
| `airlws04` | New node name. Pattern: `airlwsNN` |
| `airl-ws04` | Local admin account created at install. Pattern: `airl-wsNN` |
| `<NEW_IP>` | A free address in `172.28.128.0/21` |
| `<IFACE>` | The new machine's network interface (`ip -br link`) |
| `<GATEWAY>` | Default gateway, the same as on the other nodes (`ip route \| grep default` on ws02) |

**Choose the address carefully.** `172.28.128.191` to `.193` are the workstations. Pick an unused address and prove it is free before you use it:

```bash
ping -c2 <NEW_IP>            # must get no reply
sudo arping -c2 -I enp129s0 <NEW_IP>   # run on ws02; must get no reply
```

**How the cluster is wired** (each point matters later):

| Part | How it works today |
|---|---|
| Ansible | Runs from **ws02** in `/opt/ailab/ansible`, as `airl-ws02`. It connects to nodes as the `ansible` account (UID 1001, key `~/.ssh/ansible_ed25519`, passwordless sudo) |
| Inventory | `inventory.ini`, groups `workstations`, `storage_pool`, `freeipa_clients`, `freeipa_server` |
| FreeIPA | VM on ws02 at `192.168.122.148` (libvirt NAT). Other nodes reach it **through ws02** by a route to `192.168.122.0/24` via `172.28.128.192`, and a libvirt hook on ws02 that allows each node's source address |
| Names | `/etc/hosts` on every node. `playbooks/99-cluster-hosts.yml` writes the cluster nodes. IPA is `192.168.122.148 ipa.ailab.lan` |
| Home folders | `ws02:/export/home` over NFS, mounted at `/export/home` on every other node. Exported per client address with `root_squash` |
| Data pool | Optional. Each node exports `/mnt/data/nfsshare` to the others and runs its own mergerfs pool at `/mnt/pool` |
| Slurm | Controller and accounting on ws02. `slurm.conf` is kept **identical on all nodes**. Node addresses are LAN addresses |
| Containers | Docker, Apptainer, Enroot. The registry is `airlws02.ailab.lan:5000`, trusted through the IPA CA |
| Firewall | `ufw` with a `lab-peer` allow rule per node address on ws02 and ws03. ws01 runs Kubernetes and has no `ufw` |
| Monitoring | Prometheus on ws02 scrapes node exporter (9100) and GPU exporter (9835). Promtail ships logs to Loki on ws02 |

**Ground rules**

1. **Always add `--limit airlws04`** to playbooks. Without it, a playbook runs on every node.
2. **Run `--check --diff` first**, then read it. Check mode skips `command` and `shell` tasks, so a clean dry run proves less than it seems.
3. **Back up a shared file before editing it**, and keep a second SSH session open when you change network or firewall settings.
4. **Never type a password or key into a command line you want to keep**. Use `read -s` or an editor.
5. **Do not run these playbooks on the new node** (they are out of date or destructive): `51-slurm-config`, `52-slurm-accounting`, `56-notebook-slurm` as a whole, `80-users`, `90-freeipa-server`, `89-partition-data-disk` (it writes partitions), and the controller-only ones `58`, `72`, `75`, `76`, `77`, `85`.

Once the node is in the `workstations` group, every `ansible workstations ...` command, including the ones in other guides, also runs on it. Finish commissioning before you rely on that.

## 1. Plan the node

Fill this in before touching hardware.

| Question | Answer |
|---|---|
| Node name and address | `airlws04`, `<NEW_IP>` |
| Has a GPU? | Yes or no. Decides whether you need steps 6.3 and 11.4 |
| Joins the shared data pool? | Usually no. Skip section 9.5 unless you need extra shared storage |
| Accepts JupyterHub notebooks? | Decides whether it goes in the `interactive` partition |
| Data disk | Which disk, and mounted where (`/mnt/data` if it joins the pool) |
| Cable and switch port | On the `172.28.128.0/21` LAN, **not** the guest or Wi-Fi network |

Also decide on **Secure Boot**. The NVIDIA driver modules do not load under Secure Boot unless you sign them. The simple path is to turn Secure Boot off in the firmware before installing.

## 2. Install Ubuntu 24.04 LTS

The existing nodes run Ubuntu 24.04 LTS. Use the same release.

1. Write the **Ubuntu Server 24.04 LTS** image to a USB stick and boot from it.
2. Choose **Ubuntu Server (minimized is fine)**. Skip the third-party drivers and snaps. The NVIDIA driver is installed later by the playbook so that its version matches the other nodes.
3. Network: use the installer's static address screen if you can, or finish with DHCP and set the static address in section 3.
4. Storage: use the whole system disk with **ext4** (LVM is not needed). Leave the data disk alone for now.
5. Profile:
   - Your name: `airl-ws04`
   - Server name: `airlws04`
   - Username: `airl-ws04`, with a strong password (store it in your password manager)
6. Tick **Install OpenSSH server**. Do not import SSH keys from GitHub.
7. Finish, remove the USB stick and reboot.

If you prefer a desktop install (ws02 has a desktop session), the steps are the same, but the network is managed by NetworkManager and not netplan. Section 3 shows both.

## 3. First boot: network, name, time

Work on the console, or over SSH as `airl-ws04`.

### 3.1 Static address and route to IPA

The new node needs a route to the IPA VM through ws02. Put it in with the address now.

**Ubuntu Server (netplan, systemd-networkd):**

```bash
sudo nano /etc/netplan/60-ailab.yaml
sudo chmod 600 /etc/netplan/60-ailab.yaml
```

```yaml
network:
  version: 2
  ethernets:
    <IFACE>:
      dhcp4: false
      addresses: [<NEW_IP>/21]
      routes:
        - to: default
          via: <GATEWAY>
        - to: 192.168.122.0/24
          via: 172.28.128.192
      nameservers:
        addresses: [8.8.8.8, 2.2.2.2]
```

If the installer made another file in `/etc/netplan/` that also sets this interface (for example `50-cloud-init.yaml`), remove the duplicate `dhcp4` and addresses from it, or rename it out of the way. Then:

```bash
sudo netplan try
```

Press Enter within 120 seconds to keep the change. If you lose the connection, it rolls back by itself.

**Desktop install (NetworkManager):**

```bash
nmcli -t -f NAME,DEVICE con show --active
sudo nmcli con mod "<CONN>" ipv4.method manual ipv4.addresses <NEW_IP>/21 \
  ipv4.gateway <GATEWAY> ipv4.dns "8.8.8.8 2.2.2.2" +ipv4.routes "192.168.122.0/24 172.28.128.192"
sudo nmcli con up "<CONN>"
```

Use the console for this, because `con up` drops the connection for a moment.

Check the result:

```bash
ip -br addr
ip route
ping -c2 172.28.128.192
```

You should see `<NEW_IP>/21`, a default route, a `192.168.122.0/24 via 172.28.128.192` route, and replies from ws02. The IPA VM will not answer until section 7.3 is done.

### 3.2 Name and updates

```bash
sudo hostnamectl set-hostname airlws04
sudo apt update && sudo apt full-upgrade -y
sudo reboot
```

The IPA step sets the fully qualified name (`airlws04.ailab.lan`) later. Do not edit `/etc/hosts` for the IPA name by hand.

### 3.3 Time

Kerberos fails if the clock is off by more than about five minutes.

```bash
timedatectl
```

`System clock synchronized: yes` must be shown. If it is not, fix NTP before going on. If the node has no internet, point it at ws02 or another time source on the LAN.

### 3.4 Data disk (only if it joins the pool)

Identify the disk with `lsblk -f`. **The commands below erase it.** Check the device name twice and do this only on an empty disk. If you are not sure, stop and ask.

```bash
lsblk -f
sudo mkfs.ext4 -L ailabdata /dev/<DATA_DISK_PARTITION>
sudo mkdir -p /mnt/data
echo 'LABEL=ailabdata /mnt/data ext4 defaults,nofail 0 2' | sudo tee -a /etc/fstab
sudo systemctl daemon-reload && sudo mount /mnt/data
sudo mkdir -p /mnt/data/nfsshare && df -h /mnt/data
```

## 4. Give Ansible access

### 4.1 Create the `ansible` account on the new node

Get the public key on **ws02**:

```bash
cat ~/.ssh/ansible_ed25519.pub
```

Then, on the **new node** as `airl-ws04`, paste the key between the quotes. This matches how the other nodes are set up: UID 1001, no password, passwordless sudo.

```bash
sudo useradd -m -u 1001 -s /bin/bash ansible
sudo passwd -l ansible
sudo install -d -m 700 -o ansible -g ansible /home/ansible/.ssh
echo "<PASTE PUBLIC KEY HERE>" | sudo tee /home/ansible/.ssh/authorized_keys > /dev/null
sudo chown ansible:ansible /home/ansible/.ssh/authorized_keys
sudo chmod 600 /home/ansible/.ssh/authorized_keys
echo 'ansible ALL=(ALL) NOPASSWD:ALL' | sudo tee /etc/sudoers.d/ansible > /dev/null
sudo chmod 440 /etc/sudoers.d/ansible
sudo visudo -c
```

If UID 1001 is already taken, stop and check `getent passwd 1001`. The UID should match the other nodes.

### 4.2 Test from ws02

```bash
ssh -i ~/.ssh/ansible_ed25519 ansible@<NEW_IP> 'hostname; sudo -n true && echo sudo-ok'
```

This also stores the host key. It should print `airlws04` and `sudo-ok`.

### 4.3 Add the node to the inventory

```bash
cd /opt/ailab/ansible
cp -a inventory.ini /root/backups/inventory.ini.$(date +%F) 2>/dev/null || sudo cp -a inventory.ini /root/backups/inventory.ini.$(date +%F)
nano inventory.ini
```

Add the node to the groups it needs:

```ini
[workstations]
airlws01 ansible_host=172.28.128.191
airlws02 ansible_host=172.28.128.192
airlws03 ansible_host=172.28.128.193
airlws04 ansible_host=<NEW_IP>

[freeipa_clients]
airlws02
airlws03
airlws01
airlws04

# only if the node joins the shared data pool:
[storage_pool]
airlws04
```

Use the hostname exactly as the IPA FQDN will be built from it (`airlws04.ailab.lan`). Then:

```bash
ansible-inventory --graph
ansible airlws04 -m ping
```

Expect `pong`. Then run the account playbook in check mode as a consistency test:

```bash
ansible-playbook playbooks/10-ansible-account.yml --check --diff --limit airlws04
```

It should show no important changes. If it wants to change the account, read the diff before you decide which side is right.

## 5. Base packages

```bash
ansible-playbook playbooks/00-baseline.yml --check --diff --limit airlws04
ansible-playbook playbooks/00-baseline.yml --limit airlws04
```

In check mode, the "Update the apt package cache" task always reports `changed`. That is normal.

## 6. Docker and GPU

### 6.1 Docker

```bash
ansible-playbook playbooks/20-docker.yml --check --diff --limit airlws04
ansible-playbook playbooks/20-docker.yml --limit airlws04
```

### 6.2 Docker settings

The correct `/etc/docker/daemon.json` has the NVIDIA runtime and **no** `insecure-registries`. Compare it with the copy in git:

```bash
ansible airlws04 -b -m shell -a "cat /etc/docker/daemon.json"
cat files/daemon.json
```

### 6.3 GPU nodes only

First note the driver and toolkit versions on a working GPU node. **VERIFY** the playbook installs the same version:

```bash
ansible airlws03 -b -m shell -a "nvidia-smi --query-gpu=driver_version,name --format=csv; dpkg -l | grep -E 'nvidia-(driver|container-toolkit)' | awk '{print \$2, \$3}'"
```

Then:

```bash
ansible-playbook playbooks/30-nvidia-toolkit.yml --check --diff --limit airlws04
ansible-playbook playbooks/40-nvidia-driver.yml --check --diff --limit airlws04
```

Read both. If the driver version in the plan differs from ws03's, fix the playbook variable first. Apply them, then reboot the node, and check:

```bash
ansible airlws04 -b -m shell -a "nvidia-smi | head -12; docker run --rm --gpus all ubuntu nvidia-smi -L"
```

The second command needs the base image or internet access. If it cannot pull, test again after section 11.

## 7. Network plumbing on the other machines

Do these in order. Section 7.3 must be finished before the IPA step.

### 7.1 Names

Add the new node to the list in `playbooks/99-cluster-hosts.yml`:

```yaml
    cluster_hosts:
      - { ip: 172.28.128.191, name: airlws01 }
      - { ip: 172.28.128.192, name: airlws02 }
      - { ip: 172.28.128.193, name: airlws03 }
      - { ip: <NEW_IP>,       name: airlws04 }
```

Then run it on **all** nodes (it only adds or corrects lines):

```bash
ansible-playbook playbooks/99-cluster-hosts.yml --check --diff
ansible-playbook playbooks/99-cluster-hosts.yml
ansible workstations -m shell -a "getent hosts airlws04"
```

Every node should print `<NEW_IP>`. Short names matter. JupyterHub reaches notebooks by node name, so a missing entry causes `Spawn failed: Server at http://airlws04:...`.

### 7.2 Firewall rules for the new peer

ws02 and ws03 have `ufw` active with a `lab-peer` rule per node. Add the new one:

```bash
ansible 'airlws02,airlws03' -b -m shell -a "ufw allow from <NEW_IP> comment 'lab-peer'; ufw status numbered | grep <NEW_IP>"
```

ws01 has no `ufw` (it runs Kubernetes), so it needs nothing.

### 7.3 Let the new node reach the IPA VM (ws02)

The libvirt hook on ws02 allows only listed source addresses. Add the new one in `playbooks/98-ipa-route.yml`, in the hook's loop:

```bash
            for src in 172.28.128.191 172.28.128.193 <NEW_IP>; do
```

Apply it and re-run the hook by hand. The hook checks before inserting, so repeating it is safe:

```bash
ansible-playbook playbooks/98-ipa-route.yml --check --diff --limit airlws02
ansible-playbook playbooks/98-ipa-route.yml --limit airlws02
sudo /etc/libvirt/hooks/network default started
sudo iptables -S FORWARD | grep <NEW_IP>
```

You should see two `ACCEPT` lines for the new address (TCP and UDP). **Do not** run `virsh net-destroy default` to test, because it cuts the IPA VM's network.

The second play in `98-ipa-route.yml` (the persistent route) names the NetworkManager connection `netplan-enp129s0`. It will not match a new node, which is why the route went in at section 3.1.

Test from the new node:

```bash
ansible airlws04 -m shell -a 'for p in 88 389 636 443; do timeout 3 bash -c "</dev/tcp/192.168.122.148/$p" && echo "$p ok" || echo "$p BLOCKED"; done'
```

All four must say `ok`.

### 7.4 The new node's own firewall

Allow the three existing nodes and itself, deny everything else. Use a rollback timer, so a mistake cannot lock you out:

```bash
ansible airlws04 -b -m shell -a "systemd-run --on-active=5m --unit=ufw-rollback /usr/sbin/ufw disable; for ip in 172.28.128.191 172.28.128.192 172.28.128.193 <NEW_IP>; do ufw allow from \$ip comment 'lab-peer'; done; ufw default deny incoming; ufw --force enable; ufw status numbered"
ansible airlws04 -m ping
```

If the ping answers (it is a **new** connection), cancel the rollback:

```bash
ansible airlws04 -b -m shell -a "systemctl stop ufw-rollback.timer"
```

If it does not answer, wait five minutes and `ufw` turns itself off. Do **not** open port 22 to everyone: only the lab peers and the gateway-facing ws02 take SSH from outside.

Also lock down SSH on the new node in the same way as ws02:

```bash
ansible airlws04 -b -m copy -a "dest=/etc/ssh/sshd_config.d/10-ailab-hardening.conf mode=0644 content='MaxAuthTries 3\nLoginGraceTime 30\nPermitRootLogin no\n' validate='/usr/sbin/sshd -t -f %s'"
ansible airlws04 -b -m shell -a "systemctl reload ssh"
```

## 8. Join FreeIPA

Read the playbook once, so you know what it does:

```bash
sed -n '1,70p' playbooks/91-freeipa-client.yml
```

It must use `ipa_server_ip: "192.168.122.148"`. Then run it with the admin password supplied at the prompt:

```bash
read -rs -p "IPA admin password: " IPAPW; echo
ansible-playbook playbooks/91-freeipa-client.yml --limit airlws04 -e ipa_principal=admin -e "ipa_password=$IPAPW"
unset IPAPW
```

The password is briefly visible in the process list on ws02, which only trusted admins can use.

Check the result:

```bash
ansible airlws04 -b -m shell -a "sssctl domain-status ailab.lan | head -3; id ayman-aboelhassan; hostname -f; grep ipa /etc/hosts"
kinit admin
ipa host-show airlws04.ailab.lan | head -5
ipa hostgroup-add-member ailab-workstations --hosts=airlws04.ailab.lan
```

Expected: SSSD `Online`, the IPA user resolves with a UID near 1627600xxx, `hostname -f` prints `airlws04.ailab.lan`, and the hosts line is `192.168.122.148 ipa.ailab.lan ipa`.

Access rules to remember:

- IPA **admins** can SSH to every node (`allow_admins_everywhere`).
- IPA **students** can SSH to **ws02 only**. They never log in to compute nodes. Their notebooks and jobs run there through Slurm.
- Local accounts (`airl-wsNN`, `ansible`) ignore IPA rules.

## 9. NFS

### 9.1 Export the homes to the new node (ws02)

Back up the file and add the new client to the `/export/home` line:

```bash
sudo cp -a /etc/exports.d/ailab-home.exports /root/backups/ailab-home.exports.$(date +%F)
sudo sed -i 's#^\(/export/home .*[^ ]\) *$#\1 <NEW_IP>(rw,sync,no_subtree_check,root_squash)#' /etc/exports.d/ailab-home.exports
cat /etc/exports.d/ailab-home.exports
sudo exportfs -ra
sudo exportfs -v | grep -A1 export/home | tr -s ' \n' ' '; echo
```

The file should still be one line, now ending with the new address. Keep `root_squash`. Never export with `no_root_squash`.

### 9.2 Mount the homes on the new node

```bash
ansible airlws04 -b -m apt -a "name=nfs-common state=present"
ansible airlws04 -b -m ansible.posix.mount -a "path=/export/home src=172.28.128.192:/export/home fstype=nfs opts=rw,_netdev,nofail,x-systemd.automount,x-systemd.mount-timeout=30 state=mounted"
```

This writes the same `fstab` line the other nodes use.

### 9.3 Verify as a normal user

Do **not** test as root. Root becomes `nobody` on this export, so `ls /export/home` as root says `Permission denied`, which is normal and proves nothing.

```bash
ssh airl-ws04@airlws04
sudo -u ayman-aboelhassan ls /export/home/ayman-aboelhassan | head -3
findmnt /export/home -o TARGET,SOURCE
grep export/home /proc/mounts | grep -o 'addr=[0-9.]*'
exit
```

You should see the files, the source `172.28.128.192:/export/home`, and `addr=172.28.128.192`. An address starting with `100.` would be a leftover from the Tailscale days. It should not happen, and means something old is still cached.

### 9.4 Record the change

```bash
ansible airlws02 -b -m fetch -a "src=/etc/exports.d/ailab-home.exports dest=files/ailab-home.exports flat=yes"
ansible airlws04 -b -m fetch -a "src=/etc/fstab dest=files/fstab-ws04 flat=yes"
```

### 9.5 Optional: join the shared data pool

Skip this for a plain compute node. The pool is a mergerfs mount of every node's `/mnt/data/nfsshare`. Every node mounts every other node's share, and every node lists all branches. So adding a member changes **every** node. I have not seen the full `90-nfs-server`, `91-nfs-client` and `92-mergerfs-pool` playbooks, so go step by step and read the dry runs.

1. **Exports on the old nodes (additive, nothing removed).** On each of ws01 to ws03, add the new address to the `/mnt/data/nfsshare` line, then `exportfs -ra`. Use the `lineinfile` pattern from the earlier export changes, keeping the existing clients.
2. **Export from the new node.** `ansible-playbook playbooks/90-nfs-server.yml --check --diff --limit airlws04`. It writes `/etc/exports` from `playbooks/templates/exports.j2`. Check that it lists the other three nodes' LAN addresses.
3. **Mounts.** `ansible-playbook playbooks/91-nfs-client.yml --check --diff` (all pool nodes), then run it. It uses `ansible_host`, so mounts use LAN addresses.
4. **Pool.** `ansible-playbook playbooks/92-mergerfs-pool.yml --check --diff`. Run it on the pool nodes only when the pool is idle: `squeue` empty and `lsof +D /mnt/pool` empty. The monitor timer should be 5 seconds (`group_vars/workstations.yml`).
5. **Verify.** On every node: `findmnt -t nfs4 -o TARGET,SOURCE | grep -c '100\.'` must be `0`, `getfattr --only-values -n user.mergerfs.branches /mnt/pool/.mergerfs` must list all four branches, and a test `touch` on `/mnt/pool` works.

## 10. Slurm

### 10.1 Install the packages

Read what the playbook does, then run it on the new node:

```bash
ansible-playbook playbooks/50-slurm-install.yml --check --diff --limit airlws04
ansible-playbook playbooks/50-slurm-install.yml --limit airlws04
ansible airlws03 -b -m shell -a "slurmd -V; dpkg -l | grep -E ' (slurm|munge)' | awk '{print \$2, \$3}'"
ansible airlws04 -b -m shell -a "slurmd -V; dpkg -l | grep -E ' (slurm|munge)' | awk '{print \$2, \$3}'"
```

**The Slurm versions must be identical on all nodes.** Do not run `51-slurm-config.yml` or `52-slurm-accounting.yml`. They are out of date (for example, `Gres=gpu:1` instead of the live `Gres=gpu:1,shard:8`) and would overwrite a working configuration.

If the install playbook starts `slurmd` before the configuration exists, it may fail. That is fine. We start it at 10.4.

### 10.2 Munge key

Every node uses the same Munge key. Copy it through a private folder, and never print it.

```bash
umask 077
mkdir -p ~/munge-tmp && chmod 700 ~/munge-tmp
ansible airlws03 -b -m fetch -a "src=/etc/munge/munge.key dest=$HOME/munge-tmp/munge.key flat=yes"
ansible airlws04 -b -m copy -a "src=$HOME/munge-tmp/munge.key dest=/etc/munge/munge.key owner=munge group=munge mode=0400"
shred -u ~/munge-tmp/munge.key && rmdir ~/munge-tmp
ansible airlws04 -b -m shell -a "systemctl enable munge; systemctl restart munge"
ansible workstations -b -m shell -a "sha256sum /etc/munge/munge.key"
```

All four checksums must match. Test that tokens work across nodes:

```bash
munge -n | ssh -i ~/.ssh/ansible_ed25519 ansible@<NEW_IP> unmunge | head -3
```

You should see `STATUS: Success (0)`. If it says `Rewound credential`, the clocks are out of sync. If it says `Invalid credential`, the keys differ.

### 10.3 Configuration files

On a working node, list everything Slurm uses:

```bash
ansible airlws03 -b -m shell -a "ls -l /etc/slurm /etc/slurm/plugstack.conf.d 2>/dev/null"
```

Read it. The usual files are `slurm.conf`, `cgroup.conf`, `gres.conf` and the Pyxis plugin settings. Copy **every** file that the other nodes have. Match the owner and mode shown by `ls -l`.

First get the node line from the new machine:

```bash
ansible airlws04 -b -m shell -a "slurmd -C"
```

Edit `slurm.conf` on ws02 (back it up first). Add the node and put it in the right partitions:

```bash
sudo cp -a /etc/slurm/slurm.conf /root/backups/slurm.conf.$(date +%F)
sudo grep -nE "^(NodeName|PartitionName)" /etc/slurm/slurm.conf | cut -c1-200
sudo nano /etc/slurm/slurm.conf
```

```
NodeName=airlws04 NodeAddr=<NEW_IP> CPUs=<n> Sockets=<n> CoresPerSocket=<n> ThreadsPerCore=<n> RealMemory=<a bit below slurmd -C> Gres=gpu:1,shard:8 State=UNKNOWN
```

- Use `NodeAddr=<NEW_IP>`, the LAN address, never a name or another network.
- Leave out `Gres=` on a node without a GPU, and match `gres.conf`.
- Add `airlws04` to the `Nodes=` list of each `PartitionName` line the node should serve (`interactive` for notebooks, `gpu`, `shared`). **VERIFY** the partition lines before editing.

Then push the same file to all other nodes and copy the supporting files to the new node:

```bash
ansible airlws02 -b -m fetch -a "src=/etc/slurm/slurm.conf dest=/tmp/slurm.conf.new flat=yes"
ansible 'workstations:!airlws02' -b -m copy -a "src=/tmp/slurm.conf.new dest=/etc/slurm/slurm.conf owner=root group=root mode=0644 backup=yes"
rm /tmp/slurm.conf.new
ansible workstations -b -m shell -a "md5sum /etc/slurm/slurm.conf"
```

All four checksums must be the same. Do the same for `cgroup.conf`, `gres.conf` and any plugin files, using ws03 as the source. Adjust `gres.conf` if the new GPU or device names differ.

### 10.4 Restart in a quiet window

Adding a node requires restarting the controller and the node daemons so that everyone learns the new layout.

```bash
squeue                                    # should be empty, or warn users first
sinfo -N -l                               # note which nodes are drained, and keep it that way
sudo systemctl restart slurmctld
ansible 'workstations' -b -m shell -a "systemctl restart slurmd"
sleep 10
scontrol ping
sinfo -N -l
scontrol show node airlws04 | grep -E "State|NodeAddr|Reason|Gres|CPUTot|RealMemory"
```

Notes:

- ws01 and ws02 are drained on purpose (they show reasons such as `phase41` and a Kubernetes reservation). Their state is stored by the controller and stays after the restart, but **confirm it** in `sinfo`. Do not resume them to "fix" the output.
- Restarting `slurmd` does not normally kill running jobs. Still, do it when nothing important is running.

**Keep the new node out of service until it is verified:**

```bash
sudo scontrol update nodename=airlws04 state=drain reason="commissioning"
```

## 11. Containers and images

### 11.1 Trust the registry

Needs the IPA CA, which section 8 installed.

```bash
ansible-playbook playbooks/60-registry-trust.yml --check --diff --limit airlws04
ansible-playbook playbooks/60-registry-trust.yml --limit airlws04
ansible airlws04 -b -m shell -a "ls /etc/docker/certs.d; curl -s https://airlws02.ailab.lan:5000/v2/_catalog; docker info 2>/dev/null | grep -A3 -i 'insecure'"
```

You should see `{"repositories":["ailab/base"]}` and only loopback ranges as insecure registries.

### 11.2 Pull the base image

```bash
ansible-playbook playbooks/70-pull-base-image.yml --check --diff --limit airlws04
ansible-playbook playbooks/70-pull-base-image.yml --limit airlws04
```

The pull is large. Check free disk first: `ansible airlws04 -b -m shell -a "df -h /var/lib/docker"`.

### 11.3 Apptainer and Enroot

```bash
ansible-playbook playbooks/54-apptainer.yml --check --diff --limit airlws04
ansible-playbook playbooks/54-apptainer.yml --limit airlws04
ansible-playbook playbooks/53-enroot-pyxis.yml --check --diff --limit airlws04
ansible-playbook playbooks/62-enroot-image.yml --check --diff --limit airlws04
```

Apply `53` and `62` only if the other nodes use Enroot for jobs. Pyxis also needs its Slurm plugin line on the node (see 10.3), so apply 53 before the Slurm restart if you use it.

### 11.4 The notebook image

JupyterHub notebooks run as `apptainer exec ... /opt/ailab/images/ailab-base.sif`. A node without this file cannot start a notebook. **VERIFY** how it gets there on the existing nodes:

```bash
ansible workstations -b -m shell -a "ls -l /opt/ailab/images/; sha256sum /opt/ailab/images/ailab-base.sif | cut -c1-16"
grep -rn "ailab-base.sif" /opt/ailab/ansible --include=*.yml --include=*.py | cut -c1-140
```

If the file is copied or built by hand on each node, copy it from ws02. It is a large file, so use rsync:

```bash
ansible airlws04 -b -m file -a "path=/opt/ailab/images state=directory mode=0755"
rsync -av --rsync-path="sudo rsync" -e "ssh -i $HOME/.ssh/ansible_ed25519" /opt/ailab/images/ailab-base.sif ansible@<NEW_IP>:/opt/ailab/images/
ansible workstations -b -m shell -a "sha256sum /opt/ailab/images/ailab-base.sif | cut -c1-16"
```

The checksums should match. Also check anything else your job templates reference under `/opt/ailab` on compute nodes (for example `/opt/ailab/templates`).

## 12. Monitoring and logs

### 12.1 Exporters and Promtail on the new node

```bash
ansible-playbook playbooks/73-node-exporter.yml --check --diff --limit airlws04
ansible-playbook playbooks/73-node-exporter.yml --limit airlws04
ansible-playbook playbooks/71-gpu-exporter.yml --check --diff --limit airlws04   # GPU nodes only
ansible-playbook playbooks/79-loki.yml --check --diff --limit airlws04           # the Promtail play
```

Only run `79-loki.yml` with `--limit airlws04`, so it does not recreate Loki on ws02. Confirm that the Loki play is skipped in the output. Check the containers:

```bash
ansible airlws04 -b -m shell -a "docker ps --format '{{ '{{.Names}}' }}'"
```

You should see `node-exporter`, `promtail`, and `nvidia-gpu-exporter` on a GPU node. These containers must restart on boot (`--restart=always`).

### 12.2 Tell Prometheus about it (ws02)

Find where the targets are listed:

```bash
sudo grep -rn "172.28.128.193" /opt/ailab/monitoring --include=*.yml --exclude-dir=prometheus-data --exclude-dir=grafana-data --exclude-dir=loki-data | cut -c1-160
```

Add `<NEW_IP>:9100` to the `node` job and `<NEW_IP>:9835` to the `gpu` job (GPU nodes only). Reload Prometheus, either through its reload endpoint if enabled, or by restarting its container:

```bash
curl -s -X POST http://localhost:9090/-/reload || sudo docker restart prometheus
sleep 10
curl -s http://localhost:9090/api/v1/targets | python3 -c "import sys,json; [print(t['scrapeUrl'], t['health']) for t in json.load(sys.stdin)['data']['activeTargets'] if '<NEW_IP>' in t['scrapeUrl']]"
```

Both targets must be `up`. Also update the target lists in `playbooks/72-monitoring.yml` (around lines 21 to 25), so that the repo matches the running system. **Do not** run `72-monitoring.yml`: it recreates Grafana and Prometheus and needs the Grafana admin password.

### 12.3 Prove an alert works

```bash
ansible airlws04 -b -m shell -a "docker stop node-exporter"
```

Wait for the alert's `for:` time. A "target down" alert for the new node should reach Slack. Then restore it:

```bash
ansible airlws04 -b -m shell -a "docker start node-exporter"
```

Use the alerts guide to read the message. Logs: in Grafana, Explore, Loki, run `{job="systemd-journal"}` and look for the new host.

### 12.4 Optional hardening for audit logs

Copy the `auditd` setup if the node will hold sensitive data. `94-auditd.yml` targets `airlws02` only. To reuse it, change its `hosts:` line to `airlws02,airlws04`, run it with `--check --diff --limit airlws04` first, and note that the daily report reads only ws02's audit log.

## 13. Acceptance checks

Run all of these before the node takes real work. Replace the node name as needed.

| Check | Command | Expected |
|---|---|---|
| Ansible | `ansible airlws04 -m ping` | `pong` |
| Names | `ansible workstations -m shell -a "getent hosts airlws04"` | Same `<NEW_IP>` everywhere |
| Time | `ansible airlws04 -b -m shell -a "timedatectl show -p NTPSynchronized"` | `yes` |
| IPA | `ansible airlws04 -b -m shell -a "sssctl domain-status ailab.lan \| head -1; id ayman-aboelhassan"` | `Online`, UID resolves |
| NFS homes | Section 9.3 | Files visible as a normal user, `addr=172.28.128.192` |
| No Tailscale left | `ansible airlws04 -b -m shell -a "grep -c ' 100\\.' /proc/mounts; ip -br link \| grep -c tailscale"` | `0` and `0` |
| Munge | Section 10.2 | `Success` |
| Slurm | `scontrol show node airlws04` | `NodeAddr=<NEW_IP>`, `Reason=commissioning` |
| Registry | `curl -s https://airlws02.ailab.lan:5000/v2/_catalog` from the node | `ailab/base` |
| Notebook image | `ls -l /opt/ailab/images/ailab-base.sif` | Present, same checksum |
| Metrics | Prometheus targets | `up` |
| Firewall | `ufw status` on the node | Active, only lab peers |

### The reboot test

Nothing proves the setup until the node has rebooted. Do it **before** the node takes work:

```bash
ansible airlws04 -b -m shell -a "systemctl reboot"
sleep 90
ansible airlws04 -m ping
ansible airlws04 -b -m shell -a "uptime -p; ip route | grep 192.168.122; findmnt /export/home -o TARGET,SOURCE; sssctl domain-status ailab.lan | head -1; systemctl is-active munge slurmd docker; docker ps --format '{{ '{{.Names}}' }}'; ufw status | head -1"
sinfo -N | grep airlws04
```

Expected: the route to `192.168.122.0/24`, the NFS mount, SSSD `Online`, services `active`, the exporter containers running, `ufw` active, and the node back in `sinfo` as `drained` (not `down`). A `down` node usually means Munge or `slurmd` did not start. Check `journalctl -u slurmd -n 30`.

## 14. Put the node into service

Test with a short job as an approved user (the node is still drained, so resume it for the test, in a quiet period):

```bash
sudo scontrol update nodename=airlws04 state=resume
sudo -u ayman-aboelhassan srun -p interactive -w airlws04 hostname
sudo -u ayman-aboelhassan srun -p interactive -w airlws04 bash -c 'id; ls /export/home | head -2'
```

For a GPU node, also run `srun -p gpu -w airlws04 nvidia-smi -L`.

Then start a notebook through JupyterHub and watch where it lands:

```bash
squeue -o "%i %u %j %T %N"
```

If you want to keep the notebook on other nodes during a gradual rollout, leave `airlws04` out of the `interactive` partition until you are ready. Watch the first day: Slack alerts, the daily report, and `sudo tail -60 /var/log/ailab-backup.log`.

## 15. Record everything in git

```bash
cd /opt/ailab/ansible
git status
git add -A && git commit -m "Add airlws04 to the cluster"
```

Make sure the commit contains:

- [ ] `inventory.ini` with the node in the right groups
- [ ] `playbooks/99-cluster-hosts.yml` with the new entry
- [ ] `playbooks/98-ipa-route.yml` with the new source address in the libvirt hook
- [ ] `playbooks/72-monitoring.yml` with the new scrape targets
- [ ] `files/ailab-home.exports`, `files/fstab-ws04`
- [ ] a copy of `/etc/slurm/slurm.conf` (and `gres.conf`, `cgroup.conf`) if you keep them in git
- [ ] `playbooks/83-backup-replicate.yml` only if the node should hold backup copies
- [ ] the pool playbooks and group variables, if the node joined the data pool

Update the admin documentation with the node's name, address and role.

## 16. Removing a node

1. Drain it: `sudo scontrol update nodename=airlws04 state=drain reason="decommission"`, and wait until `squeue -w airlws04` is empty.
2. Remove it from `slurm.conf` and the partitions on **all** nodes, then restart `slurmctld` and every `slurmd`.
3. Remove it from the `/export/home` export on ws02 (`exportfs -ra`), and from the data-pool exports if it was a member.
4. Remove the IPA host: `ipa host-del airlws04.ailab.lan`.
5. Remove the `lab-peer` rule on ws02 and ws03 (`ufw delete allow from <NEW_IP>`), the libvirt hook entry, the Prometheus targets, and the inventory, hosts and playbook entries.
6. Commit, and wipe the disks if the machine leaves the lab.

## 17. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `ansible airlws04 -m ping` fails with `Permission denied` | Key not in `authorized_keys`, or wrong permissions | Redo 4.1. `.ssh` must be `700`, `authorized_keys` `600`, both owned by `ansible` |
| `UNREACHABLE` / timeout | Wrong IP, node's `ufw` blocks ws02, or no route | Check `ip -br addr`; allow `172.28.128.192` in the node's `ufw` |
| IPA enroll fails with a timeout | Hook rules missing for the new address, or no route to `192.168.122.0/24` | Sections 3.1 and 7.3; the `/dev/tcp` test must pass |
| `Clock skew too great` or Munge `Rewound credential` | Time not synchronised | Fix NTP (3.3) |
| `id <ipa-user>` fails | SSSD cache or no IPA connection | `sudo sss_cache -E; sudo systemctl restart sssd`; check `sssctl domain-status` |
| `ls /export/home` says `Permission denied` as root | `root_squash` (normal) | Test as a normal user (9.3) |
| `mount.nfs: access denied` | New address not in the export | Redo 9.1 and `exportfs -ra` |
| Node `down` or `inval` in `sinfo` | Munge key or `slurm.conf` mismatch, or `slurmd` stopped | Compare checksums (10.2, 10.3); `journalctl -u slurmd -n 30` |
| `slurmctld` refuses a job to the node | Node missing in the partition | Add it to the `Nodes=` list, `scontrol reconfigure` |
| Notebook spawn: `Server at http://airlws04:PORT` fails | Name does not resolve, or the image is missing | `getent hosts airlws04` on ws02; `ls /opt/ailab/images` on the node |
| `docker pull` TLS error | CA not trusted, or `airlws02.ailab.lan` does not resolve | Run 60 again; `getent hosts airlws02.ailab.lan` |
| Prometheus target `down` | Exporter not running, or `ufw` blocks ws02 | `docker ps` on the node; check the `lab-peer` rule |
| Lost SSH after enabling `ufw` | Rule missing | Wait for the rollback timer, or use the console and `sudo ufw disable` |

## Appendix: playbook order for a typical GPU compute node

| Step | Playbook or action | Notes |
|---|---|---|
| 1 | Install Ubuntu, network, time | Sections 2 and 3 |
| 2 | `ansible` account, inventory | Section 4 |
| 3 | `00-baseline.yml` | |
| 4 | `20-docker.yml` | |
| 5 | `30-nvidia-toolkit.yml`, `40-nvidia-driver.yml` | GPU only; match driver version; reboot |
| 6 | `99-cluster-hosts.yml` (all), `ufw` rules, `98-ipa-route.yml` (ws02) | Section 7 |
| 7 | `91-freeipa-client.yml` | Section 8 |
| 8 | NFS exports and mount | Section 9 |
| 9 | `50-slurm-install.yml`, Munge key, `slurm.conf`, restart | Section 10 |
| 10 | `60-registry-trust.yml`, `70-pull-base-image.yml`, `54-apptainer.yml`, images | Section 11 |
| 11 | `73-node-exporter.yml`, `71-gpu-exporter.yml`, `79-loki.yml` (promtail), Prometheus targets | Section 12 |
| 12 | Acceptance checks, reboot test | Section 13 |
| 13 | Resume the node, test jobs and a notebook | Section 14 |
| 14 | Commit to git | Section 15 |