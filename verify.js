// api/verify.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

const firebaseConfig = { /* Aapki Firebase Config */ };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { traderId } = req.body;

    try {
        const snapshot = await get(ref(db, 'users/' + traderId));
        
        if (snapshot.exists()) {
            const userData = snapshot.val();
            // Aap check kar sakte hain ke user ne deposit (ftd) kiya hai ya sirf registration
            if (userData.status === 'ftd' || userData.status === 'reg') {
                return res.status(200).json({ success: true, data: userData });
            }
        }
        
        return res.status(401).json({ success: false, message: "ID not found" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
}
