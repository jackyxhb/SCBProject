import getFirestoreStore from '../store-firestore.js';
import memoryStore from '../store-memory.js';

// Select Firestore store only if explicitly enabled and Firebase Admin is configured
const useFirestore = process.env.USE_FIRESTORE === '1';
const firestoreStore = useFirestore ? getFirestoreStore() : null;

const store = firestoreStore || memoryStore;

export default store;
