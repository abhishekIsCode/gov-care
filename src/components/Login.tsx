/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Stethoscope, User, LogIn, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Login() {
  const [role, setRole] = useState<'doctor' | 'admin'>('doctor');
  const [license, setLicense] = useState('');
  const [name, setName] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const navigate = useNavigate();

  // Generate light, realistic rain drops
  const rainDrops = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    duration: `${0.4 + Math.random() * 0.6}s`, // Faster, more realistic fall
    opacity: 0.05 + Math.random() * 0.15,      // More subtle transparency
    width: '1px',                              // Thinner streaks
    height: `${60 + Math.random() * 100}px`,  // Varying lengths
  }));

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        // Create initial profile if first time
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: name || user.displayName || 'Healthcare Professional',
          role: role,
          licenseNumber: license,
          specialty: role === 'doctor' ? 'General Practice' : 'Administration',
          createdAt: serverTimestamp(),
        });
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGoogleLogin();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 scale-100"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=2560")',
        }}
      />
      <div className="absolute inset-0 z-10 bg-black/30" />

      {/* Rain Effect Layer */}
      <div className="absolute inset-0 z-[15] pointer-events-none">
        {rainDrops.map((drop) => (
          <div
            key={drop.id}
            className="absolute top-0 bg-white/20 animate-rain"
            style={{
              left: drop.left,
              height: drop.height,
              animationDuration: drop.duration,
              opacity: drop.opacity,
              width: drop.width,
              filter: 'blur(0.5px)',
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-20 w-full max-w-[500px] h-[600px] flex flex-col justify-center bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl p-8 md:p-12 border border-white/50"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-emerald-800 rounded-2xl flex items-center justify-center shadow-lg mb-4"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="font-serif text-4xl font-bold text-slate-800 tracking-tight mb-1">MediVault</h1>
          <p className="text-emerald-800/60 font-semibold tracking-[0.2em] text-xs uppercase">Healthcare Management</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-slate-200/50 p-1 rounded-2xl mb-8">
          <button
            onClick={() => setRole('doctor')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300 font-medium text-sm",
              role === 'doctor' 
                ? "bg-white text-emerald-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-300/30"
            )}
          >
            <Stethoscope className="w-4 h-4" />
            Doctor
          </button>
          <button
            onClick={() => setRole('admin')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300 font-medium text-sm",
              role === 'admin' 
                ? "bg-emerald-800/10 text-emerald-800" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-300/30"
            )}
          >
            <Shield className="w-4 h-4" />
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              {role === 'doctor' ? 'License Number' : 'Admin ID'}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-800 transition-colors">
                <LogIn className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                placeholder={role === 'doctor' ? "e.g. DOC12345" : "e.g. ADM-998"}
                className="w-full bg-slate-100/50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-800/20 transition-all outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              {role === 'doctor' ? 'Full Name' : 'Access Key'}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-800 transition-colors">
                {role === 'doctor' ? <User className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <input
                type={role === 'doctor' ? 'text' : 'password'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'doctor' ? "Dr. John Smith" : "••••••••"}
                className="w-full bg-slate-100/50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-800/20 transition-all outline-none"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-emerald-800 text-white font-bold tracking-widest py-5 rounded-2xl shadow-xl shadow-emerald-800/20 hover:bg-emerald-900 transition-all flex items-center justify-center gap-2"
          >
            ENTER DASHBOARD
          </motion.button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-400 text-xs font-medium">
            Secure, encrypted healthcare data management
          </p>
        </div>
      </motion.div>
      
      {/* Decorative foliage accents similar to the image */}
      <motion.div 
        animate={{ 
          rotate: [12, 15, 12],
          y: [0, -5, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 left-0 w-32 h-32 opacity-20 pointer-events-none select-none"
      >
         <svg viewBox="0 0 100 100" fill="currentColor" className="text-emerald-900">
            <path d="M10,50 Q20,20 50,20 T90,50 T50,80 T10,50 M30,50 L70,50 M50,30 L50,70" />
         </svg>
      </motion.div>
      <motion.div 
        animate={{ 
          rotate: [-12, -15, -12],
          x: [40, 35, 40],
          y: [40, 45, 40]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
        className="absolute bottom-10 right-10 w-40 h-40 opacity-10 pointer-events-none select-none"
      >
         <svg viewBox="0 0 100 100" fill="currentColor" className="text-emerald-900">
            <path d="M10,50 Q20,20 50,20 T90,50 T50,80 T10,50 M30,50 L70,50 M50,30 L50,70" />
         </svg>
      </motion.div>
    </div>
  );
}
