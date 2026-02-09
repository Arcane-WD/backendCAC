import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "./.env" });

const DB_NAME = "videotube";

async function testConnection() {
    console.log("=".repeat(60));
    console.log("MongoDB Connection Test");
    console.log("=".repeat(60));
    
    // Display connection details (hiding password)
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("❌ ERROR: MONGODB_URI is not defined in .env file");
        process.exit(1);
    }
    
    const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
    console.log("\n📋 Connection String (masked):", maskedUri);
    console.log("📋 Database Name:", DB_NAME);
    console.log("📋 Full URI:", `${uri}/${DB_NAME}`);
    
    console.log("\n🔄 Attempting to connect...\n");
    
    try {
        // Set connection options
        const options = {
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000,
        };
        
        // Attempt connection
        const connectionInstance = await mongoose.connect(
            `${uri}/${DB_NAME}`,
            options
        );
        
        console.log("✅ SUCCESS! MongoDB Connected!");
        console.log("=".repeat(60));
        console.log("📍 Host:", connectionInstance.connection.host);
        console.log("📍 Database:", connectionInstance.connection.name);
        console.log("📍 Port:", connectionInstance.connection.port);
        console.log("📍 Ready State:", connectionInstance.connection.readyState);
        console.log("=".repeat(60));
        
        // Test a simple operation
        console.log("\n🧪 Testing database operation...");
        const collections = await connectionInstance.connection.db.listCollections().toArray();
        console.log(`✅ Found ${collections.length} collection(s) in database`);
        
        if (collections.length > 0) {
            console.log("📦 Collections:", collections.map(c => c.name).join(", "));
        } else {
            console.log("📦 No collections yet (database is empty)");
        }
        
        // Close connection
        await mongoose.connection.close();
        console.log("\n✅ Connection closed successfully");
        console.log("=".repeat(60));
        console.log("🎉 All tests passed! Your MongoDB setup is working correctly.");
        console.log("=".repeat(60));
        
        process.exit(0);
        
    } catch (error) {
        console.error("\n❌ CONNECTION FAILED!");
        console.error("=".repeat(60));
        console.error("Error Type:", error.name);
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        console.error("\n📋 Full Error:");
        console.error(error);
        console.error("=".repeat(60));
        
        // Provide troubleshooting hints
        console.log("\n💡 Troubleshooting Tips:");
        
        if (error.code === 'ECONNREFUSED') {
            console.log("  • DNS/Network Issue: Run with NODE_OPTIONS=--dns-result-order=ipv4first");
            console.log("  • Check if your cluster hostname is correct");
            console.log("  • Try: node --dns-result-order=ipv4first test-mongodb-connection.js");
        }
        
        if (error.message.includes('authentication')) {
            console.log("  • Check your username and password in .env");
            console.log("  • Verify database user exists in MongoDB Atlas");
        }
        
        if (error.message.includes('network') || error.message.includes('timeout')) {
            console.log("  • Check your internet connection");
            console.log("  • Verify IP whitelist in MongoDB Atlas (0.0.0.0/0)");
            console.log("  • Check if VPN/firewall is blocking the connection");
        }
        
        console.log("=".repeat(60));
        
        process.exit(1);
    }
}

// Run the test
testConnection();