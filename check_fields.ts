import { db } from './src/lib/firebase-admin';

async function main() {
  console.log("Checking rooms subcollection...");
  try {
    const hotelId = "0ujPkrlGEe9Uekf5wBSH";
    const snapshot = await db.collection("hotels").doc(hotelId).collection("rooms").limit(2).get();
    console.log(`Found ${snapshot.size} rooms under hotel ${hotelId}:`);
    snapshot.forEach(doc => {
      console.log(`- Room ID: ${doc.id}, Name:`, doc.data().name);
    });
  } catch (error) {
    console.error("Error reading rooms:", error);
  }
}

main();
