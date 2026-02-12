# 🔗 MongoDB Atlas Connection Instructions

## Get Your Connection String

1. Go to https://cloud.mongodb.com and login
2. Select your cluster (or create a new one if you don't have one)
3. Click the "Connect" button
4. Choose "Connect your application"
5. Select "Node.js" as the driver
6. Copy the connection string

## Update .env File

Your connection string will look like:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
```

**Replace:**
- `<username>` - Your MongoDB Atlas username
- `<password>` - Your MongoDB Atlas password
- `<dbname>` - Database name (use `productivity-tracker`)

## Example

If your username is `john` and password is `mypass123`, it would be:
```
MONGODB_URI=mongodb+srv://john:mypass123@cluster0.xxxxx.mongodb.net/productivity-tracker?retryWrites=true&w=majority
```

## IMPORTANT: Whitelist Your IP

In MongoDB Atlas:
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0) for testing
   - Or add your specific IP address for security

## After Updating

1. Save the `.env` file with your connection string
2. Restart the server: `npm start`
3. You should see: ✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
