# AI Lab Alerts: Admin Guide

How alerts are produced, where they arrive, how to read a message, and what to do about it.

> **Status of this document.** The pipeline, the access methods and the response procedures below match your setup. The **alert reference table** (section 4) must be generated from the live rules, because the rule file was not available when this guide was written. Run the script in section 4 and paste its output into the table so the guide lists exactly what your cluster can send.

## 1. How alerts work

```
exporters on each node ──► Prometheus ──► alert rules ──► Alertmanager ──► Slack + email
(node_exporter :9100        (ws02 :9090)   (evaluated      (ws02 :9093)     #ai-lab-alerts
 GPU exporter  :9835,                       every cycle)                     + alert address
 Slurm metrics, health checks)
```

| Component | Where | Notes |
|---|---|---|
| Prometheus | ws02, port 9090 | Scrapes the `node` job (port 9100) and the `gpu` job (port 9835) on ws01, ws02 and ws03 |
| Alert rules | Loaded by Prometheus | Deployed by `playbooks/75-alerting.yml` |
| Alertmanager | ws02, port 9093 | Groups alerts, suppresses duplicates, sends to Slack and email |
| Slack | `#ai-lab-alerts` | Fast notifications |
| Email | Address set in the secrets file used by `75-alerting.yml` | Needs working SMTP |
| Grafana | ws02, port 3000 | Dashboards for context |
| Loki | ws02, port 3100 | Logs, searched from Grafana Explore |

Two behaviours matter for reading messages:

- **A rule has a `for:` duration.** The condition must stay true for that long before the alert fires. A short blip does not alert.
- **Alertmanager groups and suppresses.** Related alerts arrive as one message, and a node-down alert can suppress the smaller alerts for the same host (inhibition). If you see only one alert for a dead machine, that is by design.

## 2. Reaching the dashboards

Prometheus, Alertmanager and Grafana are no longer reachable from outside the lab. Use an SSH tunnel through the gateway:

```bash
ssh -L 9090:localhost:9090 -L 9093:localhost:9093 -L 3000:localhost:3000 airl-ws02@<gateway>
```

Then open in your browser:

| What | URL |
|---|---|
| Firing alerts and silences | http://localhost:9093 |
| Rules and their state | http://localhost:9090/alerts |
| Scrape targets (up or down) | http://localhost:9090/targets |
| Dashboards and logs | http://localhost:3000 |

From a terminal on ws02, the same data is available without a tunnel:

```bash
# What is firing right now
curl -s http://localhost:9093/api/v2/alerts | python3 -c "import sys,json; [print(a['labels'].get('alertname'), a['labels'].get('instance',''), a['labels'].get('severity','')) for a in json.load(sys.stdin)]"

# Scrape targets that are down
curl -s http://localhost:9090/api/v1/targets | python3 -c "import sys,json; [print(t['scrapeUrl'], t['health'], t.get('lastError','')) for t in json.load(sys.stdin)['data']['activeTargets'] if t['health']!='up']"
```

An empty result from the first command means nothing is firing.

## 3. Anatomy of an alert message

A message has three parts. Read them in this order.

| Part | Where you see it | What it tells you |
|---|---|---|
| **Name** (`alertname`) | Title of the message | Which rule fired |
| **Labels** | `instance`, `job`, `severity`, `host` | Where it happened and how serious |
| **Annotations** | `summary` and `description` | A readable explanation, often with the measured value |

Useful fields:

- **`instance`** is the address that Prometheus scraped, for example `172.28.128.193:9100`. Map it to a node: `.191` is ws01, `.192` is ws02, `.193` is ws03.
- **`job`** is `node` (machine metrics) or `gpu` (GPU metrics), unless a rule adds its own.
- **`severity`** is set per rule. Check the values your rules use in the table in section 4, and decide which ones page you at night.
- A message with the status **RESOLVED** means the condition cleared. No action is needed, but note what happened.

To see the full rule behind a message, open http://localhost:9090/alerts and click the alert name. The expression shows exactly what is measured.

## 4. Alert reference

### Generate the table from your live rules

Run this on ws02. It reads the rules that Prometheus has actually loaded, so it is always correct.

```bash
cat > /tmp/alert_table.py << 'PY'
import sys, json
d = json.load(sys.stdin)
print("| Alert | Severity | Fires when | For | Summary |")
print("|---|---|---|---|---|")
for g in d["data"]["groups"]:
    for r in g["rules"]:
        if r["type"] != "alerting":
            continue
        q = " ".join(r["query"].split()).replace("|", "\\|")
        a = r.get("annotations", {})
        s = (a.get("summary") or a.get("description") or "").replace("|", "\\|")
        sev = r.get("labels", {}).get("severity", "-")
        print(f'| `{r["name"]}` | {sev} | `{q}` | {int(r.get("duration", 0))}s | {s} |')
PY
curl -s http://localhost:9090/api/v1/rules | python3 /tmp/alert_table.py
```

Paste the output below this line, then add a **"What it means" and "First action"** note for each row using the response guide in section 5.

<!-- PASTE TABLE HERE -->

### Where the rules come from

| Source | What it adds |
|---|---|
| `playbooks/75-alerting.yml` | Alertmanager config and Prometheus alert rules |
| `playbooks/72-monitoring.yml` | Prometheus, Grafana and the scrape targets |
| `playbooks/71-gpu-exporter.yml`, `87-gpu-exporter-watchdog.yml` | GPU metrics and the watchdog that restarts the exporter |
| `playbooks/77-slurm-metrics.yml` | Slurm and shard metrics |
| `playbooks/78-service-health.yml` | TCP and HTTP checks for the registry, slurmd on each node, and NFS |

If you change a rule, change it in the playbook and re-run that playbook, so that git and the live system agree.

## 5. Response guide by type of alert

Alert names differ, so match your alert to the closest type. All commands run on ws02 unless noted.

### 5.1 A node or target is down (`up == 0`, node unreachable)

**Meaning.** Prometheus could not scrape a node, so the machine, its exporter container, or the network is down.

```bash
ansible all -m ping                                   # is the host reachable?
ansible airlws0N -b -m shell -a "docker ps --format '{{ '{{.Names}}' }}'; uptime"
curl -s -m 5 http://172.28.128.19N:9100/metrics | head -2
```

- Host unreachable: check power and the network, then the console.
- Host fine, exporter missing: restart the container, for example `docker start node-exporter` on that node.
- If this alert fires for ws02 itself, Prometheus may be affected too. Check Slack for a delayed or missing message.

### 5.2 High CPU load or memory pressure

**Meaning.** A node is overloaded. On ws02 this usually means someone is running heavy work on the SSH entry node instead of through Slurm.

```bash
ps -eo user,pcpu,pmem,etime,comm --sort=-pcpu | head -10
squeue
sacct -a -X -S now-1hours --format=User,JobID,JobName,State
```

- A user process outside Slurm: ask the user to submit it as a job. Kill it only if it threatens the node (`sudo kill <pid>`).
- Unusual process names or high CPU from an unfamiliar account: treat it as a security concern. Check `last`, the daily report and `sudo ausearch -k root_cmds -ts recent -i`.

### 5.3 Disk space low

**Meaning.** A filesystem is nearly full. The important ones are `/export/home` (student files, on ws02), the backup store (`/opt/ailab/backups`) and each node's root disk. ws01's root disk was at 83% when last checked.

```bash
df -h / /export/home /opt/ailab/backups /mnt/pool
sudo du -xh --max-depth=2 /export/home | sort -h | tail -10
docker system df
```

- Large student folders: contact the owner.
- Docker images and layers: `docker image prune` (review first).
- Never delete backup files to make space without checking that the replicas on the other nodes are good.

### 5.4 GPU alerts (utilisation, temperature, exporter stale)

**Meaning.** The GPU exporter reports a problem, or it stopped reporting.

```bash
nvidia-smi
curl -s http://172.28.128.19N:9835/metrics | grep -m3 nvidia_smi
docker ps | grep nvidia-gpu-exporter
```

- Exporter container stopped: the watchdog should restart it. If it did not, `docker restart nvidia-gpu-exporter` on that node.
- High temperature: check fans and airflow, then the job that is running (`squeue`).
- Compare with Grafana before assuming a hardware fault.

### 5.5 Slurm alerts (controller, node drained or down, queue stuck)

**Meaning.** Jobs cannot run or start.

```bash
scontrol ping
sinfo -N -l
scontrol show node airlws0N | grep -iE "state|reason"
sudo journalctl -u slurmctld --since "1 hour ago" --no-pager | tail -20
```

- A node is `drain`ed with a reason: read the reason. If the cause is fixed, `sudo scontrol update nodename=airlws0N state=resume`. Some drains are deliberate (ws01 and ws02 carry reasons), so do not resume a node without knowing why it was drained.
- Controller down: `sudo systemctl restart slurmctld`, then check `slurmdbd` and the database.
- Jobs rejected with `Invalid account`: the user has no association. See the JupyterHub user guide.

### 5.6 Service health checks (registry, slurmd, NFS)

**Meaning.** A TCP or HTTP probe failed, from `78-service-health.yml`.

```bash
curl -s https://airlws02.ailab.lan:5000/v2/_catalog          # registry
for n in 191 192 193; do timeout 3 bash -c "</dev/tcp/172.28.128.$n/6818" && echo "slurmd .$n ok"; done
timeout 3 bash -c "</dev/tcp/172.28.128.192/2049" && echo "nfs ok"
```

- Registry down: `docker ps | grep registry`, then `docker logs --tail 20 registry`. Certificate problems: `sudo getcert list`.
- NFS or pool: check `findmnt -t nfs4` on the affected node. A mount that has gone stale can be fixed with the remount procedure used in the migration (detach the branch from `/mnt/pool`, remount, add back).

### 5.7 Missing logs (Loki or promtail)

**Meaning.** Log shipping stopped.

```bash
curl -s http://localhost:3100/ready
ansible workstations -b -m shell -a "docker ps | grep promtail"
```

A `503` from Loki right after a restart is normal for a minute. If it continues, check `docker logs --tail 15 loki`.

### 5.8 Backup problems

**Meaning.** The nightly job did not produce fresh backups.

```bash
sudo tail -60 /var/log/ailab-backup.log | grep -E "PLAY RECAP|failed=|fatal"
sudo ls -la /opt/ailab/backups/*/ | grep "$(date +'%b %e')"
```

Backups run at 03:00 and replicate at 03:30. The log should end with `failed=0`. If it does not, re-run `playbooks/81-backups.yml` by hand and read the failing task.

## 6. Silencing, testing and tuning

### Silence an alert during planned work

In Alertmanager (http://localhost:9093), choose **Silence** on the alert, set a short duration, and write a reason. From the command line, if `amtool` is installed:

```bash
amtool --alertmanager.url=http://localhost:9093 silence add alertname="<name>" --duration=2h --comment="planned maintenance"
amtool --alertmanager.url=http://localhost:9093 silence query
```

Always set an expiry. A silence with no end hides real problems.

### Send a test alert

```bash
curl -s -XPOST http://localhost:9093/api/v2/alerts -H 'Content-Type: application/json' \
  -d '[{"labels":{"alertname":"TestAlert","severity":"info"},"annotations":{"summary":"Manual test"}}]'
```

The message should reach Slack within a minute or two, depending on the grouping delay. It tests the Slack path. Email needs a working SMTP relay.

### Reduce noise

- If the same alert fires and resolves repeatedly, raise its `for:` duration or its threshold in `75-alerting.yml`, then re-run the playbook.
- If a message arrives with a missing label or an empty summary, fix the rule's annotations rather than ignoring it.
- Do not disable a rule because it is annoying. First find out whether it is telling the truth.

## 7. Changing alerts safely

1. Edit the rule in `playbooks/75-alerting.yml`.
2. Dry run: `ansible-playbook playbooks/75-alerting.yml --check --diff -e @~/ailab-monitoring-secrets.yml`
3. Apply it, and confirm the rule loaded at http://localhost:9090/alerts.
4. Send a test alert if you changed routing or receivers.
5. Commit: `git add -A && git commit -m "Alert change: <what and why>"`

The secrets file (`~/ailab-monitoring-secrets.yml`) holds the Slack webhook and the SMTP password. Keep it `600`, edit it with an editor and never type its contents on a command line.

## 8. What these alerts do not cover

Prometheus alerts watch machine and service health. They do not watch what users do. For that, use:

- the **daily report** (`/var/log/ailab-reports/`), covering root commands by login identity, config changes, SSH logins, failed logins and Slurm jobs
- `auditd` searches such as `sudo ausearch -k sudoers -ts today -i`
- `last`, `lastb`, and `sacct -a -S today`

An alert for security events such as repeated failed logins for real accounts is not set up yet. It can be added as a rule once the report format is settled.

## Quick reference

| I need to... | Command |
|---|---|
| See what is firing | `curl -s http://localhost:9093/api/v2/alerts` |
| See down targets | `curl -s http://localhost:9090/api/v1/targets` and look for `health != up` |
| List every alert rule | Section 4 script |
| Check Slurm | `scontrol ping; sinfo -N -l; squeue` |
| Check disks | `df -h / /export/home /opt/ailab/backups /mnt/pool` |
| Check last backup | `sudo tail -60 /var/log/ailab-backup.log` |
| Send a test alert | Section 6 |