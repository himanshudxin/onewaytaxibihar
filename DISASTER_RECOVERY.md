# OneWayTaxiBihar — Enterprise Disaster Recovery & Business Continuity Procedure

**Document Version:** 1.0 (Production Release)  
**Platform:** OneWayTaxiBihar (onewaytaxibihar.com)  
**Emergency Central Dispatch Desk:** +91 80021 41816  
**Emergency WhatsApp Hotline:** +91 72818 51011  

---

## 1. Objectives & Metrics (RTO & RPO)

| Metric | Target | Rationale |
|---|---|---|
| **RPO (Recovery Point Objective)** | **< 15 minutes** | Real-time multi-tier persistence (in-memory write-through cache + MongoDB Atlas replica sets + local JSON mirror snapshot). |
| **RTO (Recovery Time Objective)** | **< 5 minutes** | Automated failover to in-memory local persistence if Atlas is unreachable; immediate point-in-time restore script execution. |
| **Data Loss Tolerance** | **Zero confirmed bookings** | All bookings recorded with cryptographic idempotency keys and immutable status logs. |

---

## 2. Architecture & Redundancy

```
+-------------------------------------------------------------+
|           OneWayTaxiBihar Passenger & Admin Frontends       |
+-------------------------------------------------------------+
                              │
                              ▼
+-------------------------------------------------------------+
|    Node.js Unified REST Engine (Native HTTP + Gzip + Caching)|
+-------------------------------------------------------------+
           │                                      │
           ▼                                      ▼
+-----------------------+              +-----------------------+
|  In-Memory L1 Cache   |              | Emergency Local Disk  |
|  (Microsecond reads)  |              | Mirror (data/db.json) |
+-----------------------+              +-----------------------+
           │                                      │
           +──────────────────┬───────────────────+
                              │
                              ▼
+-------------------------------------------------------------+
|    MongoDB Atlas Cloud Cluster (Cluster0 / 3-Node Replica)  |
|    - Automatic automated failover across availability zones |
|    - Point-in-time oplog backups                            |
+-------------------------------------------------------------+
```

---

## 3. Disaster Scenarios & Immediate Protocols

### Scenario A: MongoDB Atlas Cloud Outage / Network Partition
1. **Automated Behavior:**
   - `services/db.js` catches connection timeout or partition error.
   - Automatically switches `activeEngine` to in-memory cache with synchronous local JSON mirror (`data/db.json`).
   - No customer requests fail; API continues processing bookings and dispatch assignments.
2. **Recovery Procedure:**
   - Atlas health check runs continuously in background.
   - Upon network reconnection, `syncLocalWithRemoteCloud()` reconciles new local records with cloud cluster.

### Scenario B: Accidental Data Corruption or Malicious Deletion
1. **Emergency Isolation:**
   - Execute emergency booking pause to prevent new conflicting writes:
     ```bash
     curl -X POST http://localhost:8080/api/admin/emergency-pause \
       -H "Content-Type: application/json" \
       -H "Authorization: Basic YWRtaW46aGFyaGFybWFoYWRldkA4" \
       -d '{"paused": true, "reason": "Incident recovery in progress"}'
     ```
2. **Execute Point-in-Time Restore:**
   ```bash
   node scripts/restore-db.js
   ```
   - Verifies SHA-256 cryptographic checksum against `checksum.sha256`.
   - Restores all 15 collections into memory, disk mirror, and MongoDB Atlas.
3. **Deactivate Emergency Pause:**
   ```bash
   curl -X POST http://localhost:8080/api/admin/emergency-pause \
     -H "Content-Type: application/json" \
     -H "Authorization: Basic YWRtaW46aGFyaGFybWFoYWRldkA4" \
     -d '{"paused": false}'
   ```

### Scenario C: Server / VM Crash During Active Trips
1. **Automated Crash State Flush:**
   - `server.js` catches `uncaughtException` and `unhandledRejection`.
   - Synchronously flushes in-memory DB state to `data/db.json` before exit.
2. **Process Restart:**
   - Process manager (PM2 / systemd / Docker daemon) automatically respawns `server.js`.
   - Server rehydrates from `data/db.json` and MongoDB Atlas.
   - All active trips, driver assignments, and OTPs remain intact.

---

## 4. Backup Policy & Automated Schedule

| Backup Type | Frequency | Storage Location | Retention |
|---|---|---|---|
| **Local Snapshot** | Hourly / On-Demand | `data/backups/snapshot-<timestamp>/` | 30 Days |
| **Atlas Cloud Snapshot** | Continuous Continuous Oplog | MongoDB Cloud Global Backup | 35 Days |
| **SHA-256 Manifest** | Generated per snapshot | `data/backups/snapshot-<timestamp>/checksum.sha256` | Permanent |

**Manual Backup Trigger:**
```bash
node scripts/backup-db.js
```

**Manual Restore Trigger:**
```bash
node scripts/restore-db.js [optional_folder_name]
```

---

## 5. Contact Escalation Matrix

1. **Patna Central Operations Desk (24x7):** +91 80021 41816
2. **Lead Platform Engineer / Admin:** +91 6206494214
3. **WhatsApp Incident Management Group:** +91 72818 51011
