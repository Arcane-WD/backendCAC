# backend CAC

A repo aimed at learning MEN backend.

# MongoDB SRV DNS Issue Fix

If you encounter `querySrv ECONNREFUSED` errors when connecting to MongoDB Atlas, use this workaround to bypass DNS SRV lookup.

## Problem

```
Error: querySrv ECONNREFUSED _mongodb._tcp.cluster0.xxxxx.mongodb.net
```

## Solution: Extract Direct Connection String

### Step 1: Get Your SRV Connection String

From MongoDB Atlas:

- Click **Connect** → **Drivers**
- Copy the `mongodb+srv://` connection string

Example:

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 2: Extract Cluster Details

Run these commands in MongoDB Compass or Atlas connection string to find the actual hostnames:

**Using MongoDB Shell or Compass:**

```javascript
// Connect using your SRV string first, then run:
db.adminCommand({ getCmdLineOpts: 1 });
```

**Or use `nslookup` (if working):**

```bash
nslookup -type=SRV _mongodb._tcp.cluster0.xxxxx.mongodb.net
```

**Expected Output:**

```
xx-xxxxxxx-shard-xx-xx.xxxxx.mongodb.net:27017
xx-xxxxxxx-shard-xx-xx.xxxxx.mongodb.net:27017
xx-xxxxxxx-shard-xx-xx.xxxxx.mongodb.net:27017
Replica Set: atlas-drn1hb-shard-0
```

### Step 3: Construct Standard MongoDB URI

Format:

```
mongodb://username:password@host1:27017,host2:27017,host3:27017/?replicaSet=REPLICA_SET_NAME&authSource=admin&ssl=true
```

Example:

```
mongodb://username:password@xx-xxxxxxx-shard-xx-xx.xxxxx.mongodb.net:27017,xx-xxxxxxx-shard-xx-xx.xxxxx.mongodb.net:27017,axx-xxxxxxx-shard-xx-xx.xxxxx.mongodb.net:27017/?replicaSet=atlas-xxxxx-shard-0&authSource=admin&ssl=true
```

### Step 4: Update `.env`

```env
MONGODB_URI=mongodb://username:password@host1:27017,host2:27017,host3:27017/?replicaSet=REPLICA_SET_NAME&authSource=admin&ssl=true
```

### Step 5: Update Connection Code

Since the URI now contains query parameters, pass database name as an option:

**db/index.js:**

```javascript
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: DB_NAME, // Pass DB name as option, not in URI
    });

    console.log(
      `\n MongoDB connected! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB Connection error: ", error);
    process.exit(1);
  }
};

export default connectDB;
```

## Why This Works

- **Bypasses DNS SRV lookup**: Directly specifies all replica set members
- **Avoids IPv6 issues**: Uses standard `mongodb://` protocol instead of `mongodb+srv://`
- **More explicit**: Shows exactly which servers you're connecting to

## Alternative: Fix DNS Instead

If you prefer using `mongodb+srv://` format:

1. **Disable IPv6** on your network adapter, OR
2. **Set DNS servers** to `1.1.1.1` and `8.8.8.8`, OR
3. **Add to package.json**:
   ```json
   "scripts": {
     "dev": "cross-env NODE_OPTIONS=--dns-result-order=ipv4first nodemon src/index.js"
   }
   ```

---

**Note**: The standard connection string works perfectly in production and is a valid long-term solution.
