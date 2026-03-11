/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginStep from './components/LoginStep';
import VerificationStep from './components/VerificationStep';
import RegisterStep from './components/RegisterStep';
import ForgotPasswordStep from './components/ForgotPasswordStep';

export default function App() {
  const [step, setStep] = useState<'login' | 'register' | 'verification' | 'authenticated' | 'forgot_password'>('login');
  const [userData, setUserData] = useState<any>(null);

  const handleContinue = (data: any) => {
    setUserData(data);
    setStep('verification');
  };

  const handleBack = () => {
    setStep('login');
  };

  const handleRegisterSuccess = (data: any) => {
    setUserData(data);
    setStep('verification');
  };

  const handleAuthSuccess = () => {
    setStep('authenticated');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start mt-10 md:mt-16 mb-10">
          {step === 'login' && (
            <LoginStep onContinue={handleContinue} onRegisterClick={() => setStep('register')} />
          )}
          
          {step === 'register' && (
            <RegisterStep onBack={handleBack} onSuccess={handleRegisterSuccess} />
          )}
          
          {step === 'verification' && (
            <VerificationStep 
              userData={userData} 
              onBack={handleBack} 
              onSuccess={handleAuthSuccess} 
              onForgotPassword={() => setStep('forgot_password')}
            />
          )}

          {step === 'forgot_password' && (
            <ForgotPasswordStep 
              userData={userData} 
              onBack={() => setStep('verification')} 
              onSuccess={() => {
                alert('Senha redefinida com sucesso!');
                setStep('login');
              }} 
            />
          )}

          {step === 'authenticated' && (
            <div className="col-span-1 md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-3xl font-medium text-gray-900 mb-4">Acesso Liberado</h2>
              <p className="text-gray-600 text-lg mb-8">
                Bem-vindo ao Portal Sigiloso de Documentos.
              </p>
              <button onClick={() => setStep('login')} className="text-blue-600 hover:underline font-medium">
                Sair
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
