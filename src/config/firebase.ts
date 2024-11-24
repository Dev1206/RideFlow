import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAF38JHYhqn6OfWFT0rH1lgrLpwYtNX5FY",
    authDomain: "rideflow-1206.firebaseapp.com",
    projectId: "rideflow-1206",
    storageBucket: "rideflow-1206.firebasestorage.app",
    messagingSenderId: "862870717345",
    appId: "1:862870717345:web:519db3b6e9d17ed36281e0",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 