const admin = require("../config/firebase");
const { Community, SubGroup } = require("../models/communitiesModel");

const getAllCommunities = async () => {
  try {
    const communitiesRef = admin.firestore().collection("communities");
    const snapshot = await communitiesRef.get();
    
    const communities = [];
    for (const doc of snapshot.docs) {
      const communityData = doc.data();
      
      // Ambil subGroups untuk setiap komunitas
      const subGroupsRef = await communitiesRef.doc(doc.id).collection("subGroups").get();
      const subGroups = {};
      
      subGroupsRef.forEach(subGroupDoc => {
        subGroups[subGroupDoc.id] = new SubGroup({
          id: subGroupDoc.id,
          ...subGroupDoc.data()
        });
      });

      communities.push(new Community({
        id: doc.id,
        ...communityData,
        subGroups
      }));
    }

    return communities;
  } catch (error) {
    throw new Error(`Gagal mengambil data communities: ${error.message}`);
  }
};

const getCommunityById = async (communityId) => {
  try {
    const communityRef = admin.firestore().collection("communities").doc(communityId);
    const communityDoc = await communityRef.get();

    if (!communityDoc.exists) {
      throw new Error('Community tidak ditemukan');
    }

    // Ambil subGroups untuk komunitas ini
    const subGroupsRef = await communityRef.collection("subGroups").get();
    const subGroups = {};
    
    subGroupsRef.forEach(subGroupDoc => {
      subGroups[subGroupDoc.id] = new SubGroup({
        id: subGroupDoc.id,
        ...subGroupDoc.data()
      });
    });

    return new Community({
      id: communityDoc.id,
      ...communityDoc.data(),
      subGroups
    });
  } catch (error) {
    throw new Error(`Gagal mengambil data community: ${error.message}`);
  }
};

module.exports = {
  getAllCommunities,
  getCommunityById
}; 