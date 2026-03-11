import React, { useState } from 'react';
import { User, MessageSquare, Mail, ChevronRight, Key } from 'lucide-react';

const WhatsAppIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

interface VerificationStepProps {
  userData: { id: number; email: string; phone: string };
  onBack: () => void;
  onSuccess: () => void;
  onForgotPassword: () => void;
}

export default function VerificationStep({ userData, onBack, onSuccess, onForgotPassword }: VerificationStepProps) {
  const [step, setStep] = useState<'select_method' | 'password' | 'dynamic_code' | 'security_code'>('select_method');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [dynamicCode, setDynamicCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const maskedEmail = userData.email.replace(/(.{2})(.*)(?=@)/, '$1***');
  const maskedPhone = userData.phone.slice(-4) || '****';

  const handleMethodSelect = async (method: string) => {
    if (method === 'password') {
      setStep('password');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id, method })
      });
      
      if (res.ok) {
        setSelectedMethod(method);
        setStep('dynamic_code');
      } else {
        const data = await res.json();
        setError(data.error || 'Falha ao enviar código');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDynamicCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dynamicCode.length !== 6) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id, code: dynamicCode })
      });
      
      if (res.ok) {
        setStep('security_code');
        setError('');
      } else {
        const data = await res.json();
        setError(data.error || 'Código inválido');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id, password })
      });
      
      if (res.ok) {
        setStep('security_code');
        setError('');
      } else {
        const data = await res.json();
        setError(data.error || 'Senha incorreta');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySecurityCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/verify-security-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id, code })
      });
      
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || 'Código inválido');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Left Column */}
      <div className="flex flex-col pt-4">
        <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-4">
          {step === 'select_method' ? 'INÍCIO DE SESSÃO' : step === 'security_code' ? 'ETAPA 2 DE 2' : 'ETAPA 1 DE 2'}
        </span>
        <h1 className="text-3xl md:text-4xl font-medium text-gray-900 leading-tight mb-8">
          {step === 'select_method'
            ? <>Escolha um método de<br />verificação para iniciar<br />sessão</>
            : step === 'password' 
              ? 'Digite sua senha' 
              : step === 'dynamic_code'
                ? 'Digite o código recebido'
                : 'Digite seu código de segurança'
          }
        </h1>

        <div className="flex items-center gap-4 mb-16">
          <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
            <User size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{userData.email}</span>
            <button onClick={onBack} className="text-sm text-blue-600 hover:underline text-left">
              Trocar conta
            </button>
          </div>
        </div>

        <div className="mt-auto md:mt-16">
          {step === 'password' ? (
            <button onClick={onForgotPassword} className="text-blue-600 text-sm font-medium hover:underline inline-block text-left">
              Esqueci minha senha
            </button>
          ) : (
            <a href="#" className="text-blue-600 text-sm font-medium hover:underline inline-block">
              Preciso de ajuda
            </a>
          )}
        </div>
      </div>

      {/* Right Column */}
      <div className="flex justify-center md:justify-end">
        {step === 'select_method' ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.04)] w-full max-w-md overflow-hidden flex flex-col">
            {error && <div className="bg-red-50 text-red-600 p-4 text-sm text-center border-b border-red-100">{error}</div>}
            
            <div className="flex flex-col">
              {/* Password Option */}
              <button 
                onClick={() => handleMethodSelect('password')}
                disabled={loading}
                className="flex items-center p-6 hover:bg-gray-50 transition-colors border-b border-gray-100 group text-left disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mr-4 shrink-0">
                  <Key size={20} />
                </div>
                <div className="flex-grow">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Senha</h3>
                  <p className="text-sm text-gray-500">Use sua senha cadastrada para entrar.</p>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-400 shrink-0 ml-4" />
              </button>

              {/* SMS Option */}
              <button 
                onClick={() => handleMethodSelect('sms')}
                disabled={loading}
                className="flex items-center p-6 hover:bg-gray-50 transition-colors border-b border-gray-100 group text-left disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mr-4 shrink-0">
                  <MessageSquare size={20} />
                </div>
                <div className="flex-grow">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">SMS</h3>
                  <p className="text-sm text-gray-500">Vamos enviar um código para o telefone terminado em {maskedPhone}.</p>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-400 shrink-0 ml-4" />
              </button>

              {/* WhatsApp Option */}
              <button 
                onClick={() => handleMethodSelect('whatsapp')}
                disabled={loading}
                className="flex items-center p-6 hover:bg-gray-50 transition-colors border-b border-gray-100 group text-left disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-4 shrink-0">
                  <WhatsAppIcon />
                </div>
                <div className="flex-grow">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">WhatsApp</h3>
                  <p className="text-sm text-gray-500">Vamos enviar um código para o telefone terminado em {maskedPhone}.</p>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-400 shrink-0 ml-4" />
              </button>

              {/* E-mail Option */}
              <button 
                onClick={() => handleMethodSelect('email')}
                disabled={loading}
                className="flex items-center p-6 hover:bg-gray-50 transition-colors border-b border-gray-100 group text-left disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mr-4 shrink-0">
                  <Mail size={20} />
                </div>
                <div className="flex-grow">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">E-mail</h3>
                  <p className="text-sm text-gray-500">Vamos enviar um código para {maskedEmail}.</p>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-400 shrink-0 ml-4" />
              </button>
            </div>
            
            <div className="p-6 text-center">
              <button onClick={onForgotPassword} className="text-sm font-medium text-blue-600 hover:underline">
                Redefinir senha
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-8 w-full max-w-md">
            <h2 className="text-xl font-medium mb-2">
              {step === 'password' ? 'Sua senha' : step === 'dynamic_code' ? 'Código de 6 dígitos' : 'Código de segurança'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {step === 'password' 
                ? 'Insira a senha que você cadastrou.' 
                : step === 'dynamic_code'
                  ? `Enviamos um código para o seu ${selectedMethod === 'email' ? 'e-mail' : selectedMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'}.`
                  : 'Insira o código de segurança de 6 dígitos que você escolheu no momento do cadastro.'
              }
            </p>
            
            <form onSubmit={step === 'password' ? handleVerifyPassword : step === 'dynamic_code' ? handleVerifyDynamicCode : handleVerifySecurityCode}>
              {step === 'password' ? (
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="border border-gray-300 rounded-lg px-4 py-3 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Sua senha"
                  required 
                />
              ) : step === 'dynamic_code' ? (
                <input 
                  type="text" 
                  maxLength={6} 
                  value={dynamicCode} 
                  onChange={e => setDynamicCode(e.target.value.replace(/\D/g, ''))} 
                  className="border border-gray-300 rounded-lg px-4 py-3 mb-2 w-full text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="0 0 0 0 0 0"
                  required 
                />
              ) : (
                <input 
                  type="text" 
                  maxLength={6} 
                  value={code} 
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))} 
                  className="border border-gray-300 rounded-lg px-4 py-3 mb-2 w-full text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="0 0 0 0 0 0"
                  required 
                />
              )}
              
              {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
              {!error && <div className="mb-4"></div>}
              
              <button 
                type="submit" 
                disabled={loading || (step === 'password' ? !password : step === 'dynamic_code' ? dynamicCode.length !== 6 : code.length !== 6)}
                className="w-full bg-[#82bdf8] hover:bg-[#6aaef7] disabled:bg-blue-300 text-white font-medium rounded-lg py-3 transition-colors"
              >
                {loading ? 'Aguarde...' : (step === 'password' ? 'Continuar' : 'Verificar')}
              </button>

              {(step === 'password' || step === 'dynamic_code') && (
                <button 
                  type="button" 
                  onClick={() => { setStep('select_method'); setSelectedMethod(null); setCode(''); setDynamicCode(''); setPassword(''); setError(''); }} 
                  className="w-full text-blue-600 font-medium py-3 mt-2 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Escolher outro método
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </>
  );
}
