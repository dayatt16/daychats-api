const admin = require("../config/firebase");
const db = admin.firestore();

// Helper function to transform call data
const transformCallData = async (callDocs, userId) => {
  return await Promise.all(
    callDocs.map(async (doc) => {
      const data = doc.data();
      let otherPartyDoc;

      // Memeriksa siapa yang melakukan panggilan dan mendapatkan data pihak lain
      if (data.callerId === userId) {
        otherPartyDoc = await db.collection("users").doc(data.receiverId).get();
      } else {
        otherPartyDoc = await db.collection("users").doc(data.callerId).get();
      }

      const otherPartyData = otherPartyDoc.data();

      return {
        id: doc.id,
        duration: data.duration,
        callTime: data.callTime,
        callType: data.callType,
        otherParty: {
          id: otherPartyDoc.id,
          fullName: otherPartyData.fullName,
          profilePicture: otherPartyData.profilePicture,
        },
      };
    })
  );
};

const getLogCallsByUserIdAndType = async (userId, type = "all") => {
  try {
    console.log(`Fetching calls for user: ${userId} with type: ${type}`);

    // Base query
    let query;

    // Initialize counters
    let totalIncoming = 0;
    let totalOutgoing = 0;
    let totalMissed = 0;

    // Apply filters based on type
    switch (type.toLowerCase()) {
      case "incoming":
        query = db.collection("callLogs")
          .where("receiverId", "==", userId)
          .where("callType", "==", "incoming");
        
        const incomingSnapshot = await query.get();
        totalIncoming = incomingSnapshot.docs.length;
        console.log(`Total incoming calls: ${totalIncoming}`);
        return {
          success: true,
          data: await transformCallData(incomingSnapshot.docs, userId),
          totals: {
            incoming: totalIncoming,
            
          }
        };

      case "outgoing":
        query = db.collection("callLogs")
          .where("callerId", "==", userId)
          .where("callType", "==", "outgoing");
        
        const outgoingSnapshot = await query.get();
        totalOutgoing = outgoingSnapshot.docs.length;
        console.log(`Total outgoing calls: ${totalOutgoing}`);
        return {
          success: true,
          data: await transformCallData(outgoingSnapshot.docs, userId),
          totals: {
       
            outgoing: totalOutgoing,
            
          }
        };

      case "missed":
        query = db.collection("callLogs")
          .where("receiverId", "==", userId)
          .where("callType", "==", "missed");
        
        const missedSnapshot = await query.get();
        totalMissed = missedSnapshot.docs.length;
        console.log(`Total missed calls: ${totalMissed}`);
        return {
          success: true,
          data: await transformCallData(missedSnapshot.docs, userId),
          totals: {
            
            missed: totalMissed,
            
          }
        };

      default:
        const incomingCalls = await db.collection("callLogs")
          .where("receiverId", "==", userId)
          .where("callType", "==", "incoming")
          .get();

        const outgoingCalls = await db.collection("callLogs")
          .where("callerId", "==", userId)
          .where("callType", "==", "outgoing")
          .get();

        const missedCalls = await db.collection("callLogs")
          .where("receiverId", "==", userId)
          .where("callType", "==", "missed")
          .get(); // Menambahkan query untuk missed calls

        totalIncoming = incomingCalls.docs.length;
        totalOutgoing = outgoingCalls.docs.length;
        totalMissed = missedCalls.docs.length;

        console.log(`Total incoming calls: ${totalIncoming}`);
        console.log(`Total outgoing calls: ${totalOutgoing}`);
        console.log(`Total missed calls: ${totalMissed}`);

        const allCalls = [
          ...incomingCalls.docs,
          ...outgoingCalls.docs,
          ...missedCalls.docs // Menyertakan missed calls
        ];
        
        const totalAllCalls = totalIncoming + totalOutgoing + totalMissed; // Total semua panggilan
        console.log(`Total all calls: ${totalAllCalls}`);
        console.log(`All calls found: ${allCalls.length}`);
        return {
          
          data: await transformCallData(allCalls, userId),
          totals: {
            incoming: totalIncoming,
            outgoing: totalOutgoing,
            missed: totalMissed,
            all: totalAllCalls,
          }
        };
    }
  } catch (error) {
    console.error("Error getting call logs:", error);
    throw error;
  }
};

module.exports = {
  getLogCallsByUserIdAndType,
};
